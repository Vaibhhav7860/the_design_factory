"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HiOutlineCalendar, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineChevronDown } from "react-icons/hi";
import {
  PRESETS,
  PRESET_GROUPS,
  rangeFromPreset,
  parseRangeFromParams,
  isoDate,
  parseIsoDate,
  startOfDay,
  endOfDay,
  sameDay,
  formatRangeLabel,
  formatRangeDates,
} from "@/lib/dateRange";
import styles from "./DateRangePicker.module.css";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Decode the current range from URL
  const paramsObj = useMemo(() => {
    const o = {};
    searchParams.forEach((v, k) => (o[k] = v));
    return o;
  }, [searchParams]);

  const current = useMemo(() => parseRangeFromParams(paramsObj), [paramsObj]);

  const [isOpen, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  // Draft state — only applied when user clicks "Apply"
  const [draftPreset, setDraftPreset] = useState(current.presetId);
  const [draftFrom, setDraftFrom] = useState(current.from);
  const [draftTo, setDraftTo] = useState(current.to);
  const [pickingEnd, setPickingEnd] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(current.from);
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return d;
  });

  useEffect(() => {
    if (!isOpen) {
      setDraftPreset(current.presetId);
      setDraftFrom(current.from);
      setDraftTo(current.to);
      setPickingEnd(false);
      const m = new Date(current.from);
      m.setDate(1);
      m.setMonth(m.getMonth() - 1);
      setViewMonth(m);
    }
  }, [isOpen, current.presetId, current.from, current.to]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isOpen]);

  const triggerLabel = formatRangeLabel(current);

  // Side-rail preset click
  const handlePresetClick = (presetId) => {
    const r = rangeFromPreset(presetId);
    if (!r) return;
    setDraftPreset(presetId);
    setDraftFrom(r.from);
    setDraftTo(r.to);
    setPickingEnd(false);
    const m = new Date(r.from);
    m.setDate(1);
    m.setMonth(m.getMonth() - 1);
    setViewMonth(m);
  };

  // Calendar day click — sets start, then end
  const handleDayClick = (d) => {
    const dStart = startOfDay(d);
    if (!pickingEnd) {
      setDraftFrom(dStart);
      setDraftTo(endOfDay(d));
      setPickingEnd(true);
      setDraftPreset("custom");
    } else {
      if (dStart < draftFrom) {
        setDraftFrom(dStart);
        setDraftTo(endOfDay(draftFrom));
      } else {
        setDraftTo(endOfDay(d));
      }
      setPickingEnd(false);
      setDraftPreset("custom");
    }
  };

  // Editable date inputs
  const onFromInput = (e) => {
    const v = parseIsoDate(e.target.value);
    if (v) {
      setDraftFrom(startOfDay(v));
      if (v > draftTo) setDraftTo(endOfDay(v));
      setDraftPreset("custom");
    }
  };
  const onToInput = (e) => {
    const v = parseIsoDate(e.target.value);
    if (v) {
      const t = endOfDay(v);
      if (t < draftFrom) {
        setDraftFrom(startOfDay(v));
        setDraftTo(endOfDay(draftFrom));
      } else {
        setDraftTo(t);
      }
      setDraftPreset("custom");
    }
  };

  const handleApply = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("range");
    url.searchParams.delete("from");
    url.searchParams.delete("to");

    if (draftPreset && draftPreset !== "custom") {
      url.searchParams.set("range", draftPreset);
    } else {
      url.searchParams.set("range", "custom");
      url.searchParams.set("from", isoDate(draftFrom));
      url.searchParams.set("to", isoDate(draftTo));
    }
    setOpen(false);
    router.push(url.pathname + url.search);
  };

  const handleCancel = () => setOpen(false);

  const leftMonth = viewMonth;
  const rightMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);

  const goPrevMonth = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const goNextMonth = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  return (
    <div className={styles.wrap}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <HiOutlineCalendar className={styles.triggerIcon} aria-hidden="true" />
        <span>{triggerLabel}</span>
        <HiOutlineChevronDown className={styles.triggerChevron} aria-hidden="true" />
      </button>

      {isOpen && (
        <div ref={popoverRef} className={styles.popover} role="dialog" aria-label="Choose date range">
          <div className={styles.body}>
            <aside className={styles.rail}>
              {PRESET_GROUPS.map((group) => (
                <div key={group} className={styles.railGroup}>
                  {PRESETS.filter((p) => p.group === group).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`${styles.railItem} ${draftPreset === p.id ? styles.railItemActive : ""}`}
                      onClick={() => handlePresetClick(p.id)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              ))}
              <div className={styles.railGroup}>
                <button
                  type="button"
                  className={`${styles.railItem} ${draftPreset === "custom" ? styles.railItemActive : ""}`}
                  onClick={() => setDraftPreset("custom")}
                >
                  Custom range
                </button>
              </div>
            </aside>

            <div className={styles.calendar}>
              <div className={styles.inputs}>
                <div className={styles.dateInput}>
                  <input
                    type="date"
                    value={isoDate(draftFrom)}
                    onChange={onFromInput}
                    aria-label="Start date"
                  />
                </div>
                <span className={styles.arrow} aria-hidden="true">→</span>
                <div className={styles.dateInput}>
                  <input
                    type="date"
                    value={isoDate(draftTo)}
                    onChange={onToInput}
                    aria-label="End date"
                  />
                </div>
              </div>

              <div className={styles.monthsHeader}>
                <button
                  type="button"
                  className={styles.monthNav}
                  onClick={goPrevMonth}
                  aria-label="Previous month"
                >
                  <HiOutlineChevronLeft />
                </button>
                <div className={styles.monthLabel}>{formatMonth(leftMonth)}</div>
                <div className={styles.monthLabel}>{formatMonth(rightMonth)}</div>
                <button
                  type="button"
                  className={styles.monthNav}
                  onClick={goNextMonth}
                  aria-label="Next month"
                >
                  <HiOutlineChevronRight />
                </button>
              </div>

              <div className={styles.monthsGrid}>
                <MonthGrid
                  month={leftMonth}
                  from={draftFrom}
                  to={draftTo}
                  onDayClick={handleDayClick}
                />
                <MonthGrid
                  month={rightMonth}
                  from={draftFrom}
                  to={draftTo}
                  onDayClick={handleDayClick}
                />
              </div>
            </div>
          </div>

          <footer className={styles.footer}>
            <span className={styles.summary}>{formatRangeDates(draftFrom, draftTo)}</span>
            <div className={styles.footerActions}>
              <button type="button" className={styles.btnGhost} onClick={handleCancel}>
                Cancel
              </button>
              <button type="button" className={styles.btnPrimary} onClick={handleApply}>
                Apply
              </button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}

function formatMonth(d) {
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function MonthGrid({ month, from, to, onDayClick }) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(year, m, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className={styles.monthGrid}>
      <div className={styles.weekdayRow}>
        {WEEKDAYS.map((w) => (
          <span key={w} className={styles.weekday}>{w}</span>
        ))}
      </div>
      <div className={styles.daysGrid}>
        {cells.map((d, i) => {
          if (!d) return <span key={i} className={styles.dayEmpty} />;
          const dStart = startOfDay(d);
          const isStart = sameDay(d, from);
          const isEnd = sameDay(d, to);
          const inRange = dStart >= from && dStart <= to;
          const isToday = sameDay(d, today);
          const isFuture = dStart > today;
          const cls = [
            styles.day,
            inRange ? styles.dayInRange : "",
            isStart ? styles.dayStart : "",
            isEnd ? styles.dayEnd : "",
            isToday ? styles.dayToday : "",
            isFuture ? styles.dayDisabled : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={() => !isFuture && onDayClick(d)}
              disabled={isFuture}
              aria-pressed={isStart || isEnd}
              aria-label={d.toLocaleDateString()}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
