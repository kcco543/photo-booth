"use client";

import { useState } from "react";
import type { StickerDef } from "../lib/stickers";
import { STYLES, type StyleId } from "../lib/tokens";
import { IconCheck, IconReset } from "./Icons";

export default function EditTray({
  style,
  onStyle,
  defs,
  onAdd,
  onReset,
  onDone,
  hasStickers,
}: {
  style: StyleId;
  onStyle: (s: StyleId) => void;
  defs: StickerDef[];
  onAdd: (def: StickerDef) => void;
  onReset: () => void;
  onDone: () => void;
  hasStickers: boolean;
}) {
  const [tab, setTab] = useState<"stickers" | "frames">("stickers");

  return (
    <div className="tray paper">
      <div className="tray-top">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "stickers"} className={tab === "stickers" ? "on" : ""} onClick={() => setTab("stickers")}>
            Stickers
          </button>
          <button role="tab" aria-selected={tab === "frames"} className={tab === "frames" ? "on" : ""} onClick={() => setTab("frames")}>
            Frames
          </button>
        </div>
        <div className="tray-actions">
          <button className="chip" onClick={onReset} disabled={!hasStickers}>
            <IconReset size={16} /> Reset
          </button>
          <button className="chip chip-brown" onClick={onDone}>
            <IconCheck size={16} /> Done
          </button>
        </div>
      </div>

      {tab === "stickers" ? (
        <div className="sticker-grid" role="tabpanel" aria-label="Stickers">
          {defs.map((d) => (
            <button key={d.id} className={`sticker-pick${d.id.startsWith("t-") ? " wide" : ""}`} onClick={() => onAdd(d)} aria-label={`Add ${d.label} sticker`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.src} alt="" draggable={false} />
            </button>
          ))}
        </div>
      ) : (
        <div className="frame-grid" role="tabpanel" aria-label="Frame styles">
          {STYLES.map((s) => (
            <button
              key={s.id}
              className={`frame-pick${style === s.id ? " on" : ""}`}
              onClick={() => onStyle(s.id)}
              aria-pressed={style === s.id}
            >
              <span className={`frame-swatch swatch-${s.id}`} aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <strong>{s.name}</strong>
              <small>{s.blurb}</small>
            </button>
          ))}
        </div>
      )}
      <p className="tray-hint">
        {tab === "stickers"
          ? "Tap to add · drag to move · pull the ↻ dot to resize & rotate"
          : "Your photos and stickers stay put when you switch frames"}
      </p>
    </div>
  );
}
