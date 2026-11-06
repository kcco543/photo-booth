"use client";

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { STRIP_H, STRIP_W, type PlacedSticker } from "../lib/strip";
import type { StickerDef } from "../lib/stickers";
import { IconClose, IconRotate } from "./Icons";

type Drag =
  | { kind: "move"; uid: string; px: number; py: number; x: number; y: number }
  | { kind: "transform"; uid: string; cx: number; cy: number; dist: number; angle: number; size: number; rot: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Shows the rendered strip with stickers layered on top. Sticker positions are
 * stored as fractions of the strip size, so they map 1:1 onto the export canvas.
 */
export default function StripEditor({
  baseUrl,
  stickers,
  defs,
  editing,
  selected,
  onSelect,
  onChange,
  tilt,
}: {
  baseUrl: string | null;
  stickers: PlacedSticker[];
  defs: StickerDef[];
  editing: boolean;
  selected: string | null;
  onSelect: (uid: string | null) => void;
  onChange: (next: PlacedSticker[]) => void;
  tilt: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Fit the strip (fixed aspect ratio) inside whatever space the stage has.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      const ratio = STRIP_W / STRIP_H;
      let h = height;
      let w = h * ratio;
      if (w > width) {
        w = width;
        h = w / ratio;
      }
      setBox({ w: Math.floor(w), h: Math.floor(h) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Delete / Backspace removes the selected sticker on desktop.
  useEffect(() => {
    if (!editing || !selected) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "Delete" || e.key === "Backspace") {
        onChange(stickers.filter((s) => s.uid !== selected));
        onSelect(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, selected, stickers, onChange, onSelect]);

  const update = (uid: string, patch: Partial<PlacedSticker>) =>
    onChange(stickers.map((s) => (s.uid === uid ? { ...s, ...patch } : s)));

  const startMove = (e: RPointerEvent, s: PlacedSticker) => {
    if (!editing) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onSelect(s.uid);
    // bring to front
    if (stickers[stickers.length - 1]?.uid !== s.uid) {
      onChange([...stickers.filter((x) => x.uid !== s.uid), s]);
    }
    drag.current = { kind: "move", uid: s.uid, px: e.clientX, py: e.clientY, x: s.x, y: s.y };
  };

  const startTransform = (e: RPointerEvent, s: PlacedSticker) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const rect = boxRef.current!.getBoundingClientRect();
    const cx = rect.left + s.x * rect.width;
    const cy = rect.top + s.y * rect.height;
    drag.current = {
      kind: "transform",
      uid: s.uid,
      cx,
      cy,
      dist: Math.hypot(e.clientX - cx, e.clientY - cy) || 1,
      angle: Math.atan2(e.clientY - cy, e.clientX - cx),
      size: s.size,
      rot: s.rot,
    };
  };

  const onMove = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    if (d.kind === "move") {
      update(d.uid, {
        x: clamp(d.x + (e.clientX - d.px) / rect.width, 0, 1),
        y: clamp(d.y + (e.clientY - d.py) / rect.height, 0, 1),
      });
    } else {
      const dist = Math.hypot(e.clientX - d.cx, e.clientY - d.cy);
      const angle = Math.atan2(e.clientY - d.cy, e.clientX - d.cx);
      update(d.uid, {
        size: clamp((d.size * dist) / d.dist, 0.08, 1.2),
        rot: d.rot + ((angle - d.angle) * 180) / Math.PI,
      });
    }
  };

  const endDrag = () => {
    drag.current = null;
  };

  const remove = (uid: string) => {
    onChange(stickers.filter((s) => s.uid !== uid));
    onSelect(null);
  };

  return (
    <div className="strip-stage" ref={stageRef} onPointerDown={() => editing && onSelect(null)}>
      <div
        ref={boxRef}
        className={`strip-box${editing ? " editing" : ""}${tilt && !editing ? " tilted" : ""}`}
        style={{ width: box.w, height: box.h }}
      >
        {baseUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={baseUrl} alt="Your decorated photo strip" className="strip-img" draggable={false} />
        ) : (
          <div className="strip-loading">developing…</div>
        )}

        {stickers.map((s) => {
          const def = defs.find((d) => d.id === s.id);
          if (!def) return null;
          const isSel = editing && selected === s.uid;
          return (
            <div
              key={s.uid}
              className={`placed${isSel ? " selected" : ""}`}
              style={{
                left: `${s.x * 100}%`,
                top: `${s.y * 100}%`,
                width: `${s.size * 100}%`,
                transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
              }}
              onPointerDown={(e) => startMove(e, s)}
              onPointerMove={onMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={def.src} alt={def.label} draggable={false} className="placed-img" />
              {isSel && (
                <>
                  <button
                    className="handle handle-delete"
                    aria-label="Remove sticker"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(s.uid);
                    }}
                  >
                    <IconClose size={14} />
                  </button>
                  <span
                    className="handle handle-transform"
                    role="button"
                    aria-label="Drag to resize and rotate"
                    onPointerDown={(e) => startTransform(e, s)}
                    onPointerMove={onMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                  >
                    <IconRotate size={14} />
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
