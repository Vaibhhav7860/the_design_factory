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

  /* ── Personalisation State ── */
  const [isPersonalised, setIsPersonalised] = useState(false);
  const [personalisationName, setPersonalisationName] = useState("");
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);

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

        <p className={styles.desc}>{product.description}</p>

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
          <p className={styles.personalisationHeader}>Personalisation</p>

          {/* Segmented Toggle & Delivery Time */}
          <div className={styles.toggleRow}>
            <div className={styles.segmentedToggle}>
              <button
                className={`${styles.segmentBtn} ${
                  !isPersonalised ? styles.segmentBtnActive : ""
                }`}
                onClick={() => setIsPersonalised(false)}
              >
                Non-Personalised
              </button>
              <button
                className={`${styles.segmentBtn} ${
                  isPersonalised ? styles.segmentBtnActive : ""
                }`}
                onClick={() => setIsPersonalised(true)}
              >
                Personalised
              </button>
            </div>

            <div className={styles.deliveryEstimate}>
              <span className={styles.deliveryEstimateLabel}>Estimated Dispatch & Delivery</span>
              <span className={styles.deliveryEstimateValue}>
                Dispatch: {isPersonalised ? "3-4 days" : "1-2 days"}  •  Delivery: 2-5 days
              </span>
            </div>
          </div>

          {/* Personalisation Card — Double-Bezel */}
          {isPersonalised && (
            <div className={styles.personalisationCard}>
              <div className={styles.personalisationCardInner}>
                <p className={styles.personalisationFee}>
                  Name Personalisation{" "}
                  <span>(+₹{PERSONALISATION_FEE})</span>
                </p>

                {/* Name / Content */}
                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Name/Content<span className={styles.required}>*</span>
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
                      placeholder="Enter name or text to personalise"
                      maxLength={MAX_NAME_LENGTH}
                    />
                    <span className={styles.charCounter}>
                      {personalisationName.length}/{MAX_NAME_LENGTH}
                    </span>
                  </div>
                </div>

                {/* Select Font */}
                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Select Font (for Name/Main Content only)
                    <span className={styles.required}>*</span>
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

                {/* Font Preview */}
                {personalisationName.trim() && (
                  <div className={styles.fontPreview}>
                    <span className={styles.fontPreviewLabel}>Preview</span>
                    <span
                      className={`${styles.fontPreviewText} ${
                        activeFontOption?.className || ""
                      }`}
                    >
                      {personalisationName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
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

        <button
          className={styles.addBtn}
          onClick={handleAdd}
          disabled={isPersonalised && !personalisationName.trim()}
        >
          {added
            ? "✓ Added to Cart!"
            : `Add to Cart — ${formatPrice(displayPrice * qty)}`}
        </button>

        <a
          href="https://wa.me/919981133225"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsapp}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.625-1.469A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.487 0-4.78-.809-6.643-2.177l-.463-.348-2.738.87.907-2.677-.381-.489A9.945 9.945 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
          </svg>
          Order via WhatsApp
        </a>
      </div>
    </div>
  );
}
