"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import styles from "./product.module.css";

const FONT_OPTIONS = [
  { value: "garamond", label: "AGaramond Italic", className: styles.fontGaramond },
  { value: "bickham", label: "Bickam Script One", className: styles.fontBickham },
  { value: "candlescript", label: "Candlescript Pro", className: styles.fontCandlescript },
  { value: "cataneo", label: "Cataneo BT", className: styles.fontCataneo },
  { value: "signet", label: "Signet Roundhand Italic", className: styles.fontSignet },
  { value: "trajan", label: "Trajan Pro", className: styles.fontTrajan },
];

const PERSONALISATION_FEE = 500;
const AUTO_SCROLL_INTERVAL = 4000;
const IDLE_RESUME_DELAY = 6000;
const MAX_NAME_LENGTH = 150;

export default function ProductDetail({ product }) {
  const { addToCart } = useCart();

  /* ── Core State ── */
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  /* ── Personalisation State ── */
  const [personalisationName, setPersonalisationName] = useState("");
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
  const isPersonalised = personalisationName.trim().length > 0;

  /* ── Gallery State ── */
  const gallery =
    product.images?.filter(Boolean).length > 0
      ? product.images.filter(Boolean)
      : product.image
      ? [product.image]
      : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailsRef = useRef(null);
  const autoScrollRef = useRef(null);
  const idleTimerRef = useRef(null);
  const isPausedRef = useRef(false);

  /* ── Pricing ── */
  const basePrice = product.price;
  const baseOriginal = product.originalPrice;
  const displayPrice = isPersonalised ? basePrice + PERSONALISATION_FEE : basePrice;
  const displayOriginal = baseOriginal
    ? (isPersonalised ? baseOriginal + PERSONALISATION_FEE : baseOriginal)
    : null;
  const discount = calculateDiscount(displayOriginal, displayPrice);

  /* ── Formatting Description ── */
  const decodeHTML = (html) => {
    if (!html) return "";
    return html
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  const rawDesc = product.description || "Beautifully crafted to elevate your daily routine.";
  const decodedDesc = decodeHTML(rawDesc);

  // Intelligent Parser: Extract key-value specs vs narrative story
  const extractSpecsAndStory = (text) => {
    const normalizedText = text
      .replace(/✨/g, '')
      .replace(/•/g, '\n')
      .replace(/Features\s*\n/i, 'Features:\n')
      .replace(/Product Specifications\s*\n/i, 'Specifications:\n');

    const lines = normalizedText.split(/\r?\n/);
    const narrativeLines = [];
    const specsList = [];

    const specRegex = /^([a-zA-Z\s&]{2,25})\s*:\s*(.+)$/i;
    const bulletSpecRegex = /^[-•*]\s*(Size|Paper|Material|Dimensions)\s*:\s*(.+)$/i;
    const listKeyRegex = /^([a-zA-Z\s&]{2,25})\s*:$/i;

    let currentListKey = null;
    let currentListValues = [];
    let hasSeenSpec = false;
    let orphanKey = "Features";

    const commitList = () => {
      if (currentListKey && currentListValues.length > 0) {
        specsList.push({
          key: currentListKey,
          value: currentListValues.map(v => v.replace(/^[-•]\s*/, '')).join('\n'),
          isList: true,
        });
      }
      currentListKey = null;
      currentListValues = [];
    };

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) return;

      const bulletSpecMatch = line.match(bulletSpecRegex);
      const match = line.match(specRegex);
      const listMatch = line.match(listKeyRegex);
      const isNote = (m) => m[1].toLowerCase().includes("please note");

      if (bulletSpecMatch && !isNote(bulletSpecMatch)) {
        commitList();
        specsList.push({ key: bulletSpecMatch[1].trim(), value: bulletSpecMatch[2].trim(), isList: false });
        hasSeenSpec = true;
      } else if (match && !isNote(match)) {
        commitList();
        specsList.push({ key: match[1].trim(), value: match[2].trim(), isList: false });
        hasSeenSpec = true;
      } else if (listMatch && !isNote(listMatch)) {
        commitList();
        currentListKey = listMatch[1].trim();
        hasSeenSpec = true;
      } else {
        if (hasSeenSpec) {
          if (!currentListKey) {
            currentListKey = orphanKey;
          }
          currentListValues.push(line);
        } else {
          narrativeLines.push(line);
        }
      }
    });

    commitList();

    return {
      narrative: narrativeLines.join('\n').trim(),
      specs: specsList,
    };
  };

  const { narrative, specs } = extractSpecsAndStory(decodedDesc);

  const dropCapLetter = narrative ? narrative.charAt(0) : "";
  const restOfDesc = narrative ? narrative.slice(1) : "";

  const DESC_LIMIT = 240;
  const isLongDesc = restOfDesc.length > DESC_LIMIT;
  const displayDesc = (isLongDesc && !isDescExpanded)
    ? restOfDesc.slice(0, DESC_LIMIT) + "..."
    : restOfDesc;

  /* ── Brand color rotation for spec cards ── */
  const BRAND_COLORS = ['#FCD589', '#FBC9BC', '#d7e4e4'];

  /* ── Gallery Navigation ── */
  const goTo = useCallback(
    (index) => {
      setActiveIndex(index);
      if (thumbnailsRef.current) {
        const thumb = thumbnailsRef.current.children[index];
        if (thumb)
          thumb.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
          });
      }
    },
    []
  );

  const goPrev = useCallback(
    () => goTo((activeIndex - 1 + gallery.length) % gallery.length),
    [activeIndex, gallery.length, goTo]
  );

  const goNext = useCallback(
    () => goTo((activeIndex + 1) % gallery.length),
    [activeIndex, gallery.length, goTo]
  );

  /* ── Auto-Scroll Logic ── */
  const startAutoScroll = useCallback(() => {
    if (gallery.length <= 1) return;
    clearInterval(autoScrollRef.current);
    autoScrollRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setActiveIndex((prev) => {
          const next = (prev + 1) % gallery.length;
          if (thumbnailsRef.current) {
            const thumb = thumbnailsRef.current.children[next];
            if (thumb)
              thumb.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
              });
          }
          return next;
        });
      }
    }, AUTO_SCROLL_INTERVAL);
  }, [gallery.length]);

  const pauseAutoScroll = useCallback(() => {
    isPausedRef.current = true;
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, IDLE_RESUME_DELAY);
  }, []);

  const handleManualNav = useCallback(
    (navFn) => {
      pauseAutoScroll();
      navFn();
    },
    [pauseAutoScroll]
  );

  useEffect(() => {
    startAutoScroll();
    return () => {
      clearInterval(autoScrollRef.current);
      clearTimeout(idleTimerRef.current);
    };
  }, [startAutoScroll]);

  /* ── Mouse hover pause ── */
  const handleGalleryMouseEnter = () => {
    isPausedRef.current = true;
  };

  const handleGalleryMouseLeave = () => {
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, 1500);
  };

  /* ── Add to Cart ── */
  const handleAdd = () => {
    const cartProduct = {
      ...product,
      price: displayPrice,
      originalPrice: displayOriginal,
      slug: isPersonalised
        ? `${product.slug}__p__${selectedFont}__${personalisationName.trim().toLowerCase().replace(/\s+/g, "-")}`
        : product.slug,
      personalisation: isPersonalised
        ? {
            isPersonalised: true,
            name: personalisationName.trim(),
            font: FONT_OPTIONS.find((f) => f.value === selectedFont)?.label || selectedFont,
          }
        : null,
    };

    for (let i = 0; i < qty; i++) addToCart(cartProduct);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  /* ── Selected Font Class ── */
  const activeFontOption = FONT_OPTIONS.find((f) => f.value === selectedFont);

  return (
    <div className={styles.detail}>
      {/* ═══════ Gallery Column ═══════ */}
      <div
        className={styles.gallery}
        onMouseEnter={handleGalleryMouseEnter}
        onMouseLeave={handleGalleryMouseLeave}
      >
        {/* Main Image — Double-Bezel Shell */}
        <div className={styles.mainImageShell}>
          <div className={styles.mainImageCore}>
            {gallery.length > 0 && (
              <Image
                key={activeIndex}
                src={gallery[activeIndex]}
                alt={`${product.title} — view ${activeIndex + 1}`}
                width={500}
                height={500}
                className={styles.mainImg}
                priority
              />
            )}
          </div>

          {/* Prev / Next arrows */}
          {gallery.length > 1 && (
            <>
              <button
                className={`${styles.galleryArrow} ${styles.galleryArrowPrev}`}
                onClick={() => handleManualNav(goPrev)}
                aria-label="Previous image"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className={`${styles.galleryArrow} ${styles.galleryArrowNext}`}
                onClick={() => handleManualNav(goNext)}
                aria-label="Next image"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Dot indicators */}
              <div className={styles.galleryDots}>
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.galleryDot} ${
                      i === activeIndex ? styles.galleryDotActive : ""
                    }`}
                    onClick={() => handleManualNav(() => goTo(i))}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {gallery.length > 1 && (
          <div className={styles.thumbnailStrip} ref={thumbnailsRef}>
            {gallery.map((src, i) => (
              <button
                key={i}
                className={`${styles.thumbnail} ${
                  i === activeIndex ? styles.thumbnailActive : ""
                }`}
                onClick={() => handleManualNav(() => goTo(i))}
                aria-label={`Image ${i + 1}`}
              >
                <Image
                  src={src}
                  alt={`Thumbnail ${i + 1}`}
                  width={80}
                  height={80}
                  className={styles.thumbnailImg}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ═══════ Info Column ═══════ */}
      <div className={styles.info}>
        {product.badge && (
          <span
            className={`${styles.infoBadge} ${
              product.badge === "New"
                ? styles.infoBadgeSalmon
                : styles.infoBadgeGold
            }`}
          >
            {product.badge}
          </span>
        )}

        <h1 className={styles.title}>{product.title}</h1>

        <div className={styles.pricing}>
          <span className={styles.price}>{formatPrice(displayPrice)}</span>
          {displayOriginal && (
            <span className={styles.original}>
              {formatPrice(displayOriginal)}
            </span>
          )}
          {discount > 0 && (
            <span className={styles.discountBadge}>{discount}% OFF</span>
          )}
        </div>

        {/* ═══════ The Story (Description) ═══════ */}
        <div className={styles.storySection}>
          <p className={styles.sectionLabel}>The Story</p>
          <div className={styles.descTextWrapper}>
            {dropCapLetter && <span className={styles.dropCap}>{dropCapLetter}</span>}
            <span className={styles.descText}>{displayDesc}</span>
          </div>
          {isLongDesc && (
            <button
              className={styles.readMoreBtn}
              onClick={() => setIsDescExpanded(!isDescExpanded)}
            >
              {isDescExpanded ? "Read Less" : "Read More"}
            </button>
          )}
        </div>

        {/* ═══════ Product Details (Specifications) — Inline Below Description ═══════ */}
        {specs.length > 0 && (
          <div className={styles.detailsSection}>
            <p className={styles.sectionLabel}>Product Details</p>
            <div className={styles.detailsGrid}>
              {specs.map((spec, idx) => {
                const accent = BRAND_COLORS[idx % BRAND_COLORS.length];
                return (
                  <div
                    key={idx}
                    className={styles.detailCard}
                    style={{ '--accent': accent }}
                  >
                    <div className={styles.detailCardAccent} />
                    <div className={styles.detailCardContent}>
                      <p className={styles.detailKey}>{spec.key}</p>
                      {spec.isList ? (
                        <ul className={styles.detailList}>
                          {spec.value.split('\n').map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.detailValue}>{spec.value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {product.features && (
          <div className={styles.features}>
            {product.features.map((f) => (
              <span key={f} className={styles.feature}>
                {f}
              </span>
            ))}
          </div>
        )}

        {/* ── Divider ── */}
        <div className={styles.divider} />

        {/* ═══════ Personalisation Section ═══════ */}
        <div className={styles.personalisationSection}>
          <div className={styles.personalisationHeadingRow}>
            <p className={styles.sectionLabel}>Personalisation</p>
          </div>

          <div className={styles.personalisationCard}>
            {/* Decorative ribbons in brand colors */}
            <span className={styles.ribbonYellow} aria-hidden="true" />
            <span className={styles.ribbonPeach} aria-hidden="true" />
            <span className={styles.ribbonMint} aria-hidden="true" />

            <div className={styles.personalisationCardInner}>
              <p className={styles.personalisationIntro}>
                Make it yours — enter a name and choose a font
              </p>

              {/* Name Input */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  Name <span className={styles.required}>*</span>
                </label>
                <div className={styles.formInputWrap}>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={personalisationName}
                    onChange={(e) =>
                      setPersonalisationName(
                        e.target.value.slice(0, MAX_NAME_LENGTH)
                      )
                    }
                    placeholder="Enter the name to personalise"
                    maxLength={MAX_NAME_LENGTH}
                  />
                  <span className={styles.charCounter}>
                    {personalisationName.length}/{MAX_NAME_LENGTH}
                  </span>
                </div>
              </div>

              {/* Font Selector */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  Font <span className={styles.required}>*</span>
                </label>
                <select
                  className={styles.formSelect}
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Preview */}
              <div className={styles.fontPreview}>
                <span className={styles.fontPreviewLabel}>Preview</span>
                <span
                  className={`${styles.fontPreviewText} ${
                    activeFontOption?.className || ""
                  }`}
                >
                  {personalisationName.trim() || "Your Name Here"}
                </span>
              </div>

              {/* Delivery info */}
              <div className={styles.deliveryInline}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>
                  Dispatch: {isPersonalised ? "3-4 days" : "1-2 days"}  •  Delivery: 2-5 days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className={styles.divider} />

        {/* Quantity */}
        <div className={styles.qtyRow}>
          <span className={styles.qtyLabel}>Quantity</span>
          <div className={styles.qtyControl}>
            <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>
        </div>

        <div className={styles.actionsContainer}>
          <button
            className={styles.addBtn}
            onClick={handleAdd}
          >
            {added
              ? "✓ Added to Cart!"
              : `Add to Cart — ${formatPrice(displayPrice * qty)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
