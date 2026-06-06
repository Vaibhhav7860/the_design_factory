"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardSection } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import { INSTAGRAM_DEFAULT_CARDS } from "@/data/instagramDefaults";

const ACCEPTED_IMAGE = "image/jpeg,image/jpg,image/png,image/webp";

// A card backed by local disk (no R2 configured) has a relative /uploads/ URL.
// These vanish after a Docker build/redeploy and won't appear in production.
const isLocalCard = (c) =>
  c.isLocal === true || (typeof c.url === "string" && c.url.startsWith("/uploads/"));

export default function InstagramEditor() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // File input used both for adding new cards and for replacing a card's
  // cover. When `replaceIndex` is null we're adding; otherwise we replace
  // the card at that index.
  const fileRef = useRef(null);
  const [replaceIndex, setReplaceIndex] = useState(null);

  useEffect(() => {
    fetch("/api/admin/content/instagram")
      .then((r) => r.json())
      .then(({ block }) => {
        // Seed the editor with the cards that are currently live: the
        // saved DB cards if they exist, otherwise the bundled defaults
        // (which is what the storefront falls back to). This way the
        // admin can always see and edit the existing cards.
        if (block?.data?.cards?.length) {
          setCards(block.data.cards);
        } else {
          setCards(INSTAGRAM_DEFAULT_CARDS.map((c) => ({ ...c, key: "" })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Upload one file and return its { url, key, isLocal } payload.
  const uploadOne = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/admin/content/instagram", {
      method: "POST",
      body: fd,
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Upload failed");
    return { url: data.url, key: data.key, isLocal: data.isLocal, name: file.name };
  };

  // Add one or more new cards from selected files.
  const addCards = async (files) => {
    const fileArr = Array.from(files || []);
    if (!fileArr.length) return;
    setUploading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const added = [];
      for (const file of fileArr) {
        const up = await uploadOne(file);
        added.push({ ...up, href: "" });
      }
      setCards((prev) => [...prev, ...added]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Replace the cover image of an existing card.
  const replaceCover = async (index, file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const up = await uploadOne(file);
      setCards((prev) =>
        prev.map((c, i) =>
          i === index ? { ...c, url: up.url, key: up.key, isLocal: up.isLocal } : c
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onFilePicked = (files) => {
    if (replaceIndex === null) {
      addCards(files);
    } else {
      replaceCover(replaceIndex, files?.[0]);
      setReplaceIndex(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setReplaceIndex(null);
    addCards(e.dataTransfer.files);
  };

  const updateHref = (index, href) => {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, href } : c)));
    setSuccessMsg(null);
  };

  const removeCard = (index) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
    setSuccessMsg(null);
  };

  const moveCard = (index, dir) => {
    setCards((prev) => {
      const arr = [...prev];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const triggerReplace = (index) => {
    setReplaceIndex(index);
    fileRef.current?.click();
  };

  const triggerAdd = () => {
    setReplaceIndex(null);
    fileRef.current?.click();
  };

  const handleSave = async () => {
    // Warn if any card is missing a link — it'll still scroll, but the
    // card simply won't be clickable.
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const r = await fetch("/api/admin/content/instagram", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Save failed");
      setSuccessMsg("Instagram community saved. Changes are live on the homepage.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <p style={{ margin: 0, color: "var(--admin-ink-muted)", fontSize: 14 }}>
          Loading Instagram community…
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Instagram Community"
        subtitle="Cards shown in the “Join Our Growing Instagram Community” strip. Each card links to an Instagram post or reel."
      />

      {/* ── Current cards ── */}
      {cards.length > 0 && (
        <CardSection>
          <p
            style={{
              margin: "0 0 12px",
              fontWeight: 600,
              fontSize: 13,
              color: "var(--admin-ink)",
            }}
          >
            Current cards{" "}
            <span style={{ fontWeight: 400, color: "var(--admin-ink-muted)" }}>
              ({cards.length})
            </span>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {cards.map((card, i) => (
              <InstaCard
                key={card.key || i}
                card={card}
                index={i}
                total={cards.length}
                uploading={uploading}
                onHrefChange={(v) => updateHref(i, v)}
                onReplace={() => triggerReplace(i)}
                onRemove={() => removeCard(i)}
                onMoveLeft={() => moveCard(i, -1)}
                onMoveRight={() => moveCard(i, 1)}
              />
            ))}
          </div>
        </CardSection>
      )}

      {/* ── Add area ── */}
      <CardSection>
        <p
          style={{
            margin: "0 0 10px",
            fontWeight: 600,
            fontSize: 13,
            color: "var(--admin-ink)",
          }}
        >
          {cards.length > 0 ? "Add more cards" : "Add cards"}
        </p>
        <div
          onDragEnter={() => setIsDragOver(true)}
          onDragLeave={() => setIsDragOver(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !uploading && triggerAdd()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && !uploading && triggerAdd()}
          aria-label="Add Instagram cards"
          style={{
            border: `2px dashed ${isDragOver ? "var(--admin-ink)" : "var(--admin-border)"}`,
            borderRadius: 10,
            padding: "36px 24px",
            textAlign: "center",
            cursor: uploading ? "default" : "pointer",
            background: isDragOver ? "var(--admin-surface-elevated)" : "transparent",
            transition: "border-color 0.15s, background 0.15s",
            outline: "none",
          }}
        >
          {uploading ? (
            <p style={{ margin: 0, color: "var(--admin-ink-muted)", fontSize: 14 }}>
              Uploading…
            </p>
          ) : (
            <>
              <p
                style={{
                  margin: "0 0 6px",
                  fontWeight: 500,
                  fontSize: 14,
                  color: "var(--admin-ink)",
                }}
              >
                Drag &amp; drop cover images here, or{" "}
                <span style={{ textDecoration: "underline" }}>click to browse</span>
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--admin-ink-muted)" }}>
                JPEG, PNG, WebP · Square 1:1 ratio recommended · Max 25 MB per file.
                Add the Instagram link to each card after uploading.
              </p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={ACCEPTED_IMAGE}
          style={{ display: "none" }}
          onChange={(e) => {
            onFilePicked(e.target.files);
            e.target.value = "";
          }}
        />
      </CardSection>

      {/* ── Local-storage warning ── */}
      {cards.some(isLocalCard) && (
        <div
          style={{
            margin: "0 24px 4px",
            padding: "10px 14px",
            background: "#fff8e1",
            border: "1px solid #f9a825",
            borderRadius: 8,
            fontSize: 13,
            color: "#795548",
            lineHeight: 1.5,
          }}
        >
          <strong>⚠ Local storage detected.</strong> One or more cover images are
          saved to local disk instead of Cloudflare CDN. They will{" "}
          <strong>not appear</strong> on the deployed site. Configure R2 in your
          environment, then remove and re-upload these covers.
        </div>
      )}

      {/* ── Feedback ── */}
      {error && (
        <p style={{ margin: 0, padding: "0 24px 4px", fontSize: 13, color: "#c0392b" }}>
          {error}
        </p>
      )}
      {successMsg && (
        <p style={{ margin: 0, padding: "0 24px 4px", fontSize: 13, color: "#27ae60" }}>
          {successMsg}
        </p>
      )}

      {/* ── Save ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "16px 24px 24px",
        }}
      >
        <Button onClick={handleSave} disabled={saving || uploading}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </Card>
  );
}

function InstaCard({
  card,
  index,
  total,
  uploading,
  onHrefChange,
  onReplace,
  onRemove,
  onMoveLeft,
  onMoveRight,
}) {
  return (
    <div
      style={{
        width: 200,
        borderRadius: 8,
        border: "1px solid var(--admin-border)",
        overflow: "hidden",
        background: "var(--admin-surface-elevated)",
        flexShrink: 0,
      }}
    >
      {/* Cover */}
      <div
        style={{
          aspectRatio: "1 / 1",
          background: "#111",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.url}
          alt={card.name || `Instagram card ${index + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <span
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 6px",
            borderRadius: 4,
            lineHeight: 1.4,
          }}
        >
          {index + 1}
        </span>
        <button
          onClick={onReplace}
          disabled={uploading}
          title="Replace cover image"
          style={{
            position: "absolute",
            bottom: 6,
            right: 6,
            padding: "3px 8px",
            fontSize: 11,
            border: "none",
            borderRadius: 4,
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            cursor: uploading ? "default" : "pointer",
            lineHeight: 1.5,
          }}
        >
          Replace
        </button>
      </div>

      {/* Link + controls */}
      <div style={{ padding: "8px", borderTop: "1px solid var(--admin-border)" }}>
        <input
          type="url"
          value={card.href || ""}
          onChange={(e) => onHrefChange(e.target.value)}
          placeholder="https://instagram.com/reel/…"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "6px 8px",
            fontSize: 12,
            border: "1px solid var(--admin-border)",
            borderRadius: 4,
            marginBottom: 8,
            background: "var(--admin-surface)",
            color: "var(--admin-ink)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <div style={{ display: "flex", gap: 3 }}>
            <IconBtn onClick={onMoveLeft} disabled={index === 0} title="Move left">
              ←
            </IconBtn>
            <IconBtn onClick={onMoveRight} disabled={index === total - 1} title="Move right">
              →
            </IconBtn>
          </div>
          <button
            onClick={onRemove}
            title="Remove card"
            style={{
              padding: "2px 7px",
              fontSize: 11,
              border: "1px solid #f5a0a0",
              borderRadius: 4,
              background: "#fff5f5",
              color: "#c0392b",
              cursor: "pointer",
              lineHeight: 1.5,
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: "2px 7px",
        fontSize: 12,
        border: "1px solid var(--admin-border)",
        borderRadius: 4,
        background: "var(--admin-surface)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.35 : 1,
        lineHeight: 1.5,
      }}
    >
      {children}
    </button>
  );
}
