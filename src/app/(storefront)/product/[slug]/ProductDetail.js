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

const PERSONALISATION_FEE = 0;
const AUTO_SCROLL_INTERVAL = 4000;
const IDLE_RESUME_DELAY = 6000;
const MAX_NAME_LENGTH = 150;

export default function ProductDetail({ product }) {
  const { addToCart } = useCart();

  /* ── Core State ── */
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  /* ── Personalisation State ── */
  const [personalisationName, setPersonalisationName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
  const isPersonalised = personalisationName.trim().length > 0;

  /* ── Mount check for iOS ── */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* ── Detect if this product needs a School input (school book labels & back-to-school label sets) ── */
  const SCHOOL_INPUT_SUBCATEGORIES = ["school-book-labels", "back-to-school-label-set"];
  const requiresSchool = (product.subcategories || []).some((sc) =>
    SCHOOL_INPUT_SUBCATEGORIES.includes(sc)
  );

  /* ── Personalisation: every product on the storefront requires a
     name to be entered before Add to Cart fires. The catalog's
     "hidden / optional / required" rule is ignored on the storefront —
     we always render the form and always require the name. */
  const isPersonalisableProduct = true;
  const personalisationRequired = true;

  /* ── Validate the personalisation block.
     A required-name product blocks Add to Cart until the customer
     enters a non-empty name. Optional-name products allow either
     state. */
  const trimmedName = personalisationName.trim();
  const personalisationIsValid = personalisationRequired
    ? trimmedName.length > 0
    : true;
  const [nameTouched, setNameTouched] = useState(false);
  const nameError =
    personalisationRequired && nameTouched && !trimmedName
      ? "Please enter the name to personalise."
      : null;

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
  const activeIndexRef = useRef(0);
  const galleryLengthRef = useRef(gallery.length);

  /* Keep refs in sync with state */
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    galleryLengthRef.current = gallery.length;
  }, [gallery.length]);

  /* ── Pricing ── */
  const basePrice = product.price;
  const baseOriginal = product.originalPrice;
  const displayPrice = isPersonalised ? basePrice + PERSONALISATION_FEE : basePrice;
  const displayOriginal = baseOriginal
    ? (isPersonalised ? baseOriginal + PERSONALISATION_FEE : baseOriginal)
    : null;
  const discount = calculateDiscount(displayOriginal, displayPrice);

  /* ── Formatting Description ──
     Descriptions arrive as raw HTML (<p>, <ul>, <li>, <span> …).
     Convert to clean plain text the spec parser can read:
       1. block-close tags  → newline    (paragraph / list-item breaks)
       2. <li> open tags     → "• "       (bullet markers the parser splits on)
       3. strip every other tag
       4. decode HTML entities
       5. collapse runaway whitespace */
  const decodeEntities = (s) =>
    s
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#0*39;/g, "'")
      .replace(/&apos;/gi, "'");

  const htmlToText = (html) => {
    if (!html) return "";
    // Decode FIRST so entity-encoded markup (&lt;p&gt;) becomes real tags,
    // then the tag pipeline strips both real and previously-encoded HTML.
    let text = decodeEntities(html)
      // <br> and closing block tags become line breaks
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|ul|ol|h[1-6])>/gi, "\n")
      // list items get a bullet so the spec parser can split them
      .replace(/<li[^>]*>/gi, "• ")
      // drop every remaining tag
      .replace(/<[^>]+>/g, "");
    return text
      // squash 3+ blank lines, trim trailing spaces per line
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const rawDesc = product.description || "Beautifully crafted to elevate your daily routine.";
  const decodedDesc = htmlToText(rawDesc);

  // Intelligent Parser: Extract key-value specs vs narrative story.
  // Descriptions across the catalog are inconsistent — separators vary
  // (":", "-", "–", "—"), some specs have no separator at all ("Pack of
  // 48 Labels"). This parser normalises all of those into spec cards.
  const extractSpecsAndStory = (text) => {
    const normalizedText = text
      .replace(/✨/g, '')
      .replace(/•/g, '\n')
      .replace(/Features\s*\n/i, 'Features:\n')
      .replace(/Product Specifications\s*\n/i, 'Specifications:\n');

    const lines = normalizedText.split(/\r?\n/);
    const narrativeLines = [];
    const specsList = [];

    // Known spec keywords — a "key <sep> value" line becomes a card when its
    // key is one of these, no matter which separator is used.
    const SPEC_KEYS = /^(materials?|fabric|filling|fill|sizes?|dimensions?|paper|quantity|qty|weights?|colou?rs?|finish|pack|sets?|contains?|contents?|includes?|care|wash|print(?:ing)?|type|shape|sheets?|gsm|thickness|ink|theme|age|capacity|made\s+of|made\s+from|width|height|length)\b/i;
    // key  <sep>  value   (sep = colon / hyphen / en-dash / em-dash)
    const kvRegex = /^([a-zA-Z][a-zA-Z\s&/]{1,24}?)\s*[:\-–—]\s*(.+)$/;
    // "Pack of 48 Labels" / "Set of 5 …" — separator-less spec phrases
    const packRegex = /^((?:pack|set)\s+of)\s+(.+)$/i;
    // list header e.g. "Features:" with nothing after it
    const listKeyRegex = /^([a-zA-Z\s&]{2,25})\s*:$/i;

    let currentListKey = null;
    let currentListValues = [];
    let hasSeenSpec = false;
    const orphanKey = "Features";

    const isNote = (s) => /please\s+note/i.test(s);

    const commitList = () => {
      if (currentListKey && currentListValues.length > 0) {
        const cleanedValues = currentListValues.map(v => v.replace(/^[-•]\s*/, ''));
        const existing = specsList.find(
          s => s.key.toLowerCase() === currentListKey.toLowerCase()
        );
        if (existing) {
          // Merge into the existing card so we never render duplicates
          const mergedValues = [
            ...(existing.isList
              ? existing.value.split('\n').filter(Boolean)
              : [existing.value]),
            ...cleanedValues,
          ];
          existing.value = mergedValues.join('\n');
          existing.isList = true;
        } else {
          specsList.push({
            key: currentListKey,
            value: cleanedValues.join('\n'),
            isList: true,
          });
        }
      }
      currentListKey = null;
      currentListValues = [];
    };

    const pushSpec = (key, value) => {
      commitList();
      specsList.push({ key: key.trim(), value: value.trim(), isList: false });
      hasSeenSpec = true;
    };

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) return;

      // Notes are advisory prose — keep them in the story, never a card.
      if (isNote(line)) {
        narrativeLines.push(line);
        return;
      }

      const listMatch = line.match(listKeyRegex);
      const packMatch = line.match(packRegex);
      const kvMatch = line.match(kvRegex);
      // A spec keyword sitting alone on a line ("Material") is a header for
      // the sub-specs that follow it ("Bag tag : MDF", etc.).
      const bareHeader =
        SPEC_KEYS.test(line) &&
        !/[:\-–—]/.test(line) &&
        line.split(/\s+/).length <= 2;

      if (listMatch) {
        commitList();
        currentListKey = listMatch[1].trim();
        hasSeenSpec = true;
      } else if (bareHeader) {
        commitList();
        currentListKey = line.trim();
        hasSeenSpec = true;
      } else if (packMatch) {
        const label = /^pack/i.test(packMatch[1]) ? "Pack" : "Set";
        pushSpec(label, packMatch[2]);
      } else if (
        kvMatch &&
        // Treat as a spec when the key is a known spec word, OR (once we're
        // already inside the spec block) any short 1–3 word key.
        (SPEC_KEYS.test(line) ||
          (hasSeenSpec && kvMatch[1].trim().split(/\s+/).length <= 3))
      ) {
        pushSpec(kvMatch[1], kvMatch[2]);
      } else {
        if (hasSeenSpec) {
          if (!currentListKey) currentListKey = orphanKey;
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
  const scrollThumbIntoView = useCallback((index) => {
    if (thumbnailsRef.current) {
      const thumb = thumbnailsRef.current.children[index];
      if (thumb) {
        const container = thumbnailsRef.current;
        const thumbLeft = thumb.offsetLeft;
        const thumbWidth = thumb.offsetWidth;
        const containerWidth = container.offsetWidth;
        container.scrollTo({
          left: thumbLeft - containerWidth / 2 + thumbWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, []);

  const goTo = useCallback(
    (index) => {
      setActiveIndex(index);
      scrollThumbIntoView(index);
    },
    [scrollThumbIntoView]
  );

  const goPrev = useCallback(
    () => goTo((activeIndex - 1 + gallery.length) % gallery.length),
    [activeIndex, gallery.length, goTo]
  );

  const goNext = useCallback(
    () => goTo((activeIndex + 1) % gallery.length),
    [activeIndex, gallery.length, goTo]
  );

  /* ── Auto-Scroll Logic (uses refs to avoid stale closures) ── */
  const startAutoScroll = useCallback(() => {
    if (galleryLengthRef.current <= 1 || isPausedRef.current) return;
    clearInterval(autoScrollRef.current);
    autoScrollRef.current = setInterval(() => {
      const len = galleryLengthRef.current;
      if (len <= 1) return;
      const nextIdx = (activeIndexRef.current + 1) % len;
      setActiveIndex(nextIdx);
      // Scroll thumbnail strip horizontally (without moving the page)
      if (thumbnailsRef.current) {
        const thumb = thumbnailsRef.current.children[nextIdx];
        if (thumb) {
          const container = thumbnailsRef.current;
          const thumbLeft = thumb.offsetLeft;
          const thumbWidth = thumb.offsetWidth;
          const containerWidth = container.offsetWidth;
          container.scrollTo({
            left: thumbLeft - containerWidth / 2 + thumbWidth / 2,
            behavior: "smooth",
          });
        }
      }
    }, 3000);
  }, []);

  const pauseAutoScroll = useCallback(() => {
    clearInterval(autoScrollRef.current);
    clearTimeout(idleTimerRef.current);
  }, []);

  const handleManualNav = useCallback(
    (navFn) => {
      navFn();
      pauseAutoScroll();
      idleTimerRef.current = setTimeout(() => {
        if (!isPausedRef.current) {
          startAutoScroll();
        }
      }, IDLE_RESUME_DELAY);
    },
    [pauseAutoScroll, startAutoScroll]
  );

  useEffect(() => {
    startAutoScroll();
    return () => {
      clearInterval(autoScrollRef.current);
      clearTimeout(idleTimerRef.current);
    };
  }, [startAutoScroll]);

  /* ── Mouse hover ── */
  const handleGalleryMouseEnter = () => {
    isPausedRef.current = true;
    pauseAutoScroll();
  };

  const handleGalleryMouseLeave = () => {
    isPausedRef.current = false;
    startAutoScroll();
  };

  /* ── Add to Cart ── */
  const handleAdd = () => {
    if (personalisationRequired && !trimmedName) {
      setNameTouched(true);
      // Bring the name input into view + focus it
      const el =
        typeof document !== "undefined"
          ? document.getElementById("personalisation-name")
          : null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // small delay so the smooth-scroll completes before focus jumps
        setTimeout(() => el.focus(), 250);
      }
      return;
    }

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
            ...(requiresSchool && schoolName.trim()
              ? { school: schoolName.trim() }
              : {}),
          }
        : null,
    };

    for (let i = 0; i < qty; i++) addToCart(cartProduct);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  /* ── Selected Font Class ── */
  const activeFontOption = FONT_OPTIONS.find((f) => f.value === selectedFont);

  // Don't render until mounted (helps with iOS hydration issues)
  if (!isMounted) {
    return (
      <div className={styles.detail}>
        <div className={styles.gallery}>
          <div className={styles.mainImageShell}>
            <div className={styles.mainImageCore} style={{ minHeight: '400px' }} />
          </div>
        </div>
        <div className={styles.info}>
          <h1 className={styles.title}>{product.title}</h1>
        </div>
      </div>
    );
  }

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

          {/* Dot indicators */}
          {gallery.length > 1 && (
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
          <p className={styles.sectionLabel}>Description</p>
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
        {specs.length > 0 && (() => {
          // Identify the longest spec so it gets a dedicated tall column on the left.
          // The remaining specs stack densely on the right.
          let longestIdx = 0;
          let longestSize = 0;
          specs.forEach((s, i) => {
            const size = s.isList
              ? s.value.split('\n').filter(Boolean).length * 2
              : (s.value || '').length / 30;
            if (size > longestSize) {
              longestSize = size;
              longestIdx = i;
            }
          });
          const useTwoColumnLayout = specs.length > 2 && longestSize >= 6;
          const longest = specs[longestIdx];
          const others = specs.filter((_, i) => i !== longestIdx);

          const renderCard = (spec, idx) => {
            const accent = BRAND_COLORS[idx % BRAND_COLORS.length];
            return (
              <div
                key={`${spec.key}-${idx}`}
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
          };

          return (
            <div className={styles.detailsSection}>
              <p className={styles.sectionLabel}>Product Details</p>
              {useTwoColumnLayout ? (
                <div className={styles.detailsSplit}>
                  <div className={styles.detailsSplitLeft}>
                    {renderCard(longest, longestIdx)}
                  </div>
                  <div className={styles.detailsSplitRight}>
                    {others.map((spec, i) => renderCard(spec, i + 1))}
                  </div>
                </div>
              ) : (
                <div className={styles.detailsGrid}>
                  {specs.map((spec, idx) => renderCard(spec, idx))}
                </div>
              )}
            </div>
          );
        })()}

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
        {isPersonalisableProduct ? (
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
              {/* Name Input */}
              <div className={styles.formField}>
                <label className={styles.formLabel} htmlFor="personalisation-name">
                  Name {personalisationRequired ? <span className={styles.required}>*</span> : null}
                </label>
                <div className={styles.formInputWrap}>
                  <input
                    id="personalisation-name"
                    type="text"
                    className={`${styles.formInput} ${nameError ? styles.formInputError : ""}`}
                    value={personalisationName}
                    onChange={(e) =>
                      setPersonalisationName(
                        e.target.value.slice(0, MAX_NAME_LENGTH)
                      )
                    }
                    onBlur={() => setNameTouched(true)}
                    placeholder="Enter the name to personalise"
                    maxLength={MAX_NAME_LENGTH}
                    aria-invalid={Boolean(nameError) || undefined}
                    aria-describedby={nameError ? "personalisation-name-error" : undefined}
                    required={personalisationRequired}
                  />
                  <span className={styles.charCounter}>
                    {personalisationName.length}/{MAX_NAME_LENGTH}
                  </span>
                </div>
                {nameError ? (
                  <p id="personalisation-name-error" className={styles.fieldError}>
                    {nameError}
                  </p>
                ) : null}
              </div>

              {/* School Input — only for School Book Labels & Back to School Label Sets */}
              {requiresSchool && (
                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    School <span className={styles.optional}>(Optional)</span>
                  </label>
                  <div className={styles.formInputWrap}>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={schoolName}
                      onChange={(e) =>
                        setSchoolName(e.target.value.slice(0, MAX_NAME_LENGTH))
                      }
                      placeholder="Enter your child’s school name"
                      maxLength={MAX_NAME_LENGTH}
                    />
                    <span className={styles.charCounter}>
                      {schoolName.length}/{MAX_NAME_LENGTH}
                    </span>
                  </div>
                </div>
              )}

              {/* Font Selector */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  Font <span className={styles.optional}>(Optional)</span>
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
            </div>
          </div>
        </div>
        ) : null}

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
            className={`${styles.addBtn} ${
              personalisationRequired && !personalisationIsValid
                ? styles.addBtnDisabled
                : ""
            }`}
            onClick={handleAdd}
            aria-disabled={
              personalisationRequired && !personalisationIsValid
                ? "true"
                : undefined
            }
            title={
              personalisationRequired && !personalisationIsValid
                ? "Enter the name to personalise to continue"
                : undefined
            }
          >
            {added
              ? "✓ Added to Cart!"
              : `Add to Cart — ${formatPrice(displayPrice * qty)}`}
          </button>

          {/* WhatsApp assistance */}
          <a
            href="https://wa.me/919981133225"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.deliveryInline}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.625-1.469A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.487 0-4.78-.809-6.643-2.177l-.463-.348-2.738.87.907-2.677-.381-.489A9.945 9.945 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
            </svg>
            <span className={styles.desktopText}>For further assistance, please connect on WhatsApp</span>
            <span className={styles.mobileText}>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
