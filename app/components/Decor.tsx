"use client";

import { SVG_STICKERS } from "../lib/stickers";

const src = (id: string) => SVG_STICKERS.find((s) => s.id === id)!.src;

/** Hand-arranged paper scraps and floating stickers behind the strip. */
export function ResultDecor() {
  return (
    <div className="decor" aria-hidden>
      <div className="scrap scrap-stripes" />
      <div className="scrap scrap-hearts" />
      <div className="scrap scrap-dots torn" />
      <div className="scrap scrap-stamp" />
      {/* eslint-disable @next/next/no-img-element */}
      <img className="float f1" src={src("heart")} alt="" />
      <img className="float f2" src={src("star")} alt="" />
      <img className="float f3" src={src("sparkle")} alt="" />
      <img className="float f4" src={src("butterfly")} alt="" />
      <img className="float f5" src={src("flower")} alt="" />
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  );
}

/** Little stickers stuck on the camera frame. */
export function FrameDecor() {
  return (
    <div className="frame-decor" aria-hidden>
      {/* eslint-disable @next/next/no-img-element */}
      <img className="fd fd-bow" src={src("bow")} alt="" />
      <img className="fd fd-heart" src={src("heart")} alt="" />
      <img className="fd fd-star" src={src("star")} alt="" />
      <img className="fd fd-sparkle" src={src("sparkle")} alt="" />
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  );
}

/** Burst of sparkles when a photo is taken. */
export function SparkleBurst() {
  const spots = [
    [12, 18, 0],
    [82, 14, 60],
    [88, 70, 120],
    [16, 78, 30],
    [50, 8, 90],
    [50, 90, 150],
  ];
  return (
    <div className="burst" aria-hidden>
      {spots.map(([x, y, d], i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={src(i % 2 ? "sparkle" : "star")} alt="" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d / 3}ms` }} />
      ))}
    </div>
  );
}
