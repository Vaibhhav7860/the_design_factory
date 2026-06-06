"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardSection } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";

const ACCEPTED_VIDEO = "video/mp4,video/webm,video/quicktime";
const ACCEPTED_IMAGE = "image/jpeg,image/jpg,image/png,image/webp";

// A slide backed by local disk (no R2 configured) has a relative /uploads/ URL.
// These vanish after a Docker build/redeploy and won't appear in production.
const isLocalSlide = (s) =>
  s.isLocal === true || (typeof s.url === "string" && s.url.startsWith("/uploads/"));

export default function CarouselEditor() {
  const [mediaType, setMediaType] = useState("video");
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/admin/content/carousel")
      .then((r) => r.json())
      .then(({ block }) => {
        if (block?.data) {
          setMediaType(block.data.mediaType || "video");
          setSlides(block.data.slides || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMediaTypeChange = (newType) => {
    if (newType === mediaType) return;
    if (slides.length > 0) {
      const ok = window.confirm(
        `Switching to ${newType === "video" ? "Videos" : "Images"} will remove all current slides. Continue?`
      );
      if (!ok) return;
    }
    setMediaType(newType);
    setSlides([]);
    setError(null);
    setSuccessMsg(null);
  };

  const uploadFiles = async (files) => {
    const fileArr = Array.from(files || []);
    if (!fileArr.length) return;

    setUploading(true);
    setError(null);
    setSuccessMsg(null);
    setUploadProgress({ done: 0, total: fileArr.length });

    const uploaded = [];
    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      const fd = new FormData();
      fd.append("file", file);
      try {
        const r = await fetch("/api/admin/content/carousel", {
          method: "POST",
          body: fd,
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Upload failed");
        uploaded.push({ url: data.url, key: data.key, name: file.name, isLocal: data.isLocal });
        setUploadProgress({ done: i + 1, total: fileArr.length });
      } catch (err) {
        setError(`Failed to upload "${file.name}": ${err.message}`);
        setUploading(false);
        if (uploaded.length) setSlides((prev) => [...prev, ...uploaded]);
        return;
      }
    }

    setSlides((prev) => [...prev, ...uploaded]);
    setUploading(false);
    setUploadProgress({ done: 0, total: 0 });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const removeSlide = (index) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setSuccessMsg(null);
  };

  const moveSlide = (index, dir) => {
    setSlides((prev) => {
      const arr = [...prev];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const r = await fetch("/api/admin/content/carousel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaType, slides }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Save failed");
      setSuccessMsg("Carousel saved. Changes are live on the homepage.");
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
          Loading carousel settings…
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Hero Carousel"
        subtitle="Upload videos or images that cycle through the homepage hero section."
      />

      {/* ── Carousel type ── */}
      <CardSection>
        <p
          style={{
            margin: "0 0 10px",
            fontWeight: 600,
            fontSize: 13,
            color: "var(--admin-ink)",
          }}
        >
          Carousel type
        </p>
        <div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
          {[
            { value: "video", label: "Videos" },
            { value: "image", label: "Images" },
          ].map(({ value, label }) => (
            <label
              key={value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              <input
                type="radio"
                name="mediaType"
                value={value}
                checked={mediaType === value}
                onChange={() => handleMediaTypeChange(value)}
              />
              {label}
            </label>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "var(--admin-ink-muted)" }}>
          {mediaType === "video"
            ? "A single video loops infinitely. Multiple videos play one after another."
            : "Images auto-advance every 3 seconds. Visitors can also navigate manually."}
        </p>
      </CardSection>

      {/* ── Current slides ── */}
      {slides.length > 0 && (
        <CardSection>
          <p
            style={{
              margin: "0 0 12px",
              fontWeight: 600,
              fontSize: 13,
              color: "var(--admin-ink)",
            }}
          >
            Current slides{" "}
            <span style={{ fontWeight: 400, color: "var(--admin-ink-muted)" }}>
              ({slides.length})
            </span>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {slides.map((slide, i) => (
              <SlideCard
                key={slide.key || i}
                slide={slide}
                mediaType={mediaType}
                index={i}
                total={slides.length}
                onRemove={() => removeSlide(i)}
                onMoveLeft={() => moveSlide(i, -1)}
                onMoveRight={() => moveSlide(i, 1)}
              />
            ))}
          </div>
        </CardSection>
      )}

      {/* ── Upload area ── */}
      <CardSection>
        <p
          style={{
            margin: "0 0 10px",
            fontWeight: 600,
            fontSize: 13,
            color: "var(--admin-ink)",
          }}
        >
          {slides.length > 0 ? "Add more slides" : "Upload slides"}
        </p>
        <div
          onDragEnter={() => setIsDragOver(true)}
          onDragLeave={() => setIsDragOver(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && !uploading && fileRef.current?.click()}
          aria-label="Upload files"
          style={{
            border: `2px dashed ${isDragOver ? "var(--admin-ink)" : "var(--admin-border)"}`,
            borderRadius: 10,
            padding: "36px 24px",
            textAlign: "center",
            cursor: uploading ? "default" : "pointer",
            background: isDragOver
              ? "var(--admin-surface-elevated)"
              : "transparent",
            transition: "border-color 0.15s, background 0.15s",
            outline: "none",
          }}
        >
          {uploading ? (
            <p style={{ margin: 0, color: "var(--admin-ink-muted)", fontSize: 14 }}>
              Uploading {uploadProgress.done} / {uploadProgress.total}…
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
                Drag &amp; drop{" "}
                {mediaType === "video" ? "video" : "image"} files here, or{" "}
                <span style={{ textDecoration: "underline" }}>click to browse</span>
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--admin-ink-muted)" }}>
                {mediaType === "video"
                  ? "MP4, WebM, MOV · Landscape 720 × 478 ratio · Max 200 MB per file"
                  : "JPEG, PNG, WebP · Landscape 720 × 478 ratio · Max 25 MB per file"}
              </p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={mediaType === "video" ? ACCEPTED_VIDEO : ACCEPTED_IMAGE}
          style={{ display: "none" }}
          onChange={(e) => {
            uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </CardSection>

      {/* ── Local-storage warning ── */}
      {slides.some(isLocalSlide) && (
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
          <strong>⚠ Local storage detected.</strong> One or more slides are
          saved to local disk instead of Cloudflare CDN. They will{" "}
          <strong>not appear</strong> on the deployed site.{" "}
          Add <code>R2_ACCOUNT_ID</code>, <code>R2_ACCESS_KEY_ID</code>,{" "}
          <code>R2_SECRET_ACCESS_KEY</code>, <code>R2_BUCKET</code>, and{" "}
          <code>MEDIA_CDN_URL</code> to your <code>.env.local</code>, remove
          these slides, then re-upload them.
        </div>
      )}

      {/* ── Feedback ── */}
      {error && (
        <p
          style={{
            margin: "0 0 0",
            padding: "0 24px 4px",
            fontSize: 13,
            color: "#c0392b",
          }}
        >
          {error}
        </p>
      )}
      {successMsg && (
        <p
          style={{
            margin: "0 0 0",
            padding: "0 24px 4px",
            fontSize: 13,
            color: "#27ae60",
          }}
        >
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
        <Button
          onClick={handleSave}
          disabled={saving || uploading || slides.length === 0}
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </Card>
  );
}

function SlideCard({ slide, mediaType, index, total, onRemove, onMoveLeft, onMoveRight }) {
  return (
    <div
      style={{
        width: 172,
        borderRadius: 8,
        border: "1px solid var(--admin-border)",
        overflow: "hidden",
        background: "var(--admin-surface-elevated)",
        flexShrink: 0,
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          aspectRatio: "720 / 478",
          background: "#111",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {mediaType === "video" ? (
          <video
            src={slide.url}
            muted
            preload="metadata"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.url}
            alt={slide.name || `Slide ${index + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}

        {/* Slide number badge */}
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
      </div>

      {/* Controls */}
      <div
        style={{
          padding: "6px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
          borderTop: "1px solid var(--admin-border)",
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
          title="Remove slide"
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
