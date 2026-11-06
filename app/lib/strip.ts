// Draws the decorated photo strip on a canvas.
// The same canvas is shown on screen and used for the saved image,
// so what you see is exactly what gets exported.

import { canvasFonts, loadCanvasFonts } from "./fonts";
import { SVG_STICKERS, loadImage, type StickerDef } from "./stickers";
import { C, type StyleId } from "./tokens";

export const STRIP_W = 1200;
const PAD_X = 80;
const PAD_TOP = 96;
const PHOTO_W = STRIP_W - PAD_X * 2;
const PHOTO_H = Math.round((PHOTO_W * 3) / 4);
const GAP = 48;
const FOOTER = 340;
export const STRIP_H = PAD_TOP + 4 * PHOTO_H + 3 * GAP + FOOTER;

export type PlacedSticker = {
  uid: string;
  id: string;
  /** center, as a fraction of strip width / height */
  x: number;
  y: number;
  /** width as a fraction of strip width */
  size: number;
  /** degrees */
  rot: number;
};

type Ctx = CanvasRenderingContext2D;

const photoRect = (i: number) => ({
  x: PAD_X,
  y: PAD_TOP + i * (PHOTO_H + GAP),
  w: PHOTO_W,
  h: PHOTO_H,
});
const footerTop = () => PAD_TOP + 4 * PHOTO_H + 3 * GAP;

// Small deterministic RNG so decorations don't jump around between renders.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawCover(ctx: Ctx, src: CanvasImageSource & { width: number; height: number }, x: number, y: number, w: number, h: number) {
  const target = w / h;
  let sw = src.width;
  let sh = src.height;
  if (sw / sh > target) sw = sh * target;
  else sh = sw / target;
  ctx.drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, x, y, w, h);
}

function heart(ctx: Ctx, cx: number, cy: number, s: number) {
  // s = overall width
  const k = s / 100;
  ctx.save();
  ctx.translate(cx - 50 * k, cy - 50 * k);
  ctx.scale(k, k);
  ctx.beginPath();
  ctx.moveTo(50, 86);
  ctx.bezierCurveTo(22, 66, 6, 48, 13, 30);
  ctx.bezierCurveTo(20, 13, 41, 12, 50, 28);
  ctx.bezierCurveTo(59, 12, 80, 13, 87, 30);
  ctx.bezierCurveTo(94, 48, 78, 66, 50, 86);
  ctx.closePath();
  ctx.restore();
}

function star(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const px = cx + rr * Math.cos(a);
    const py = cy + rr * Math.sin(a);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function sparkle(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + r * 0.12, cy - r * 0.12, cx + r, cy);
  ctx.quadraticCurveTo(cx + r * 0.12, cy + r * 0.12, cx, cy + r);
  ctx.quadraticCurveTo(cx - r * 0.12, cy + r * 0.12, cx - r, cy);
  ctx.quadraticCurveTo(cx - r * 0.12, cy - r * 0.12, cx, cy - r);
  ctx.closePath();
}

async function drawSticker(ctx: Ctx, def: StickerDef, cx: number, cy: number, w: number, rotDeg = 0) {
  const img = await loadImage(def.src);
  const h = w * def.aspect;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotDeg * Math.PI) / 180);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

const svgSticker = (id: string) => SVG_STICKERS.find((s) => s.id === id)!;

function softShadow(ctx: Ctx, blur = 22, y = 8, alpha = 0.28) {
  ctx.shadowColor = `rgba(117,100,95,${alpha})`;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = y;
}
function noShadow(ctx: Ctx) {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function fitFont(ctx: Ctx, text: string, family: string, start: number, maxW: number, weight = "") {
  let size = start;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxW && size > 24) {
    size -= 4;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

// ---------------- Style A: Sweet Hearts ----------------

async function drawSweet(ctx: Ctx, frames: HTMLCanvasElement[], title: string, date: string) {
  ctx.fillStyle = C.baby;
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);

  // tiny brown heart pattern
  ctx.fillStyle = "rgba(117,100,95,0.16)";
  for (let row = 0, y = 30; y < STRIP_H; row++, y += 74) {
    for (let x = row % 2 ? 66 : 29; x < STRIP_W; x += 74) {
      heart(ctx, x, y, 26);
      ctx.fill();
    }
  }

  // cream lace scallops on the left and right edges
  ctx.fillStyle = C.cream;
  for (let y = 0; y < STRIP_H + 30; y += 40) {
    ctx.beginPath();
    ctx.arc(0, y, 26, 0, Math.PI * 2);
    ctx.arc(STRIP_W, y, 26, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = C.dusty;
  for (let y = 20; y < STRIP_H; y += 40) {
    ctx.beginPath();
    ctx.arc(14, y, 4, 0, Math.PI * 2);
    ctx.arc(STRIP_W - 14, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  frames.forEach((f, i) => {
    const r = photoRect(i);
    ctx.save();
    softShadow(ctx);
    ctx.fillStyle = C.cream;
    ctx.beginPath();
    ctx.roundRect(r.x - 18, r.y - 18, r.w + 36, r.h + 36, 30);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(r.x, r.y, r.w, r.h, 16);
    ctx.clip();
    drawCover(ctx, f, r.x, r.y, r.w, r.h);
    ctx.restore();
  });

  // romantic decorations
  const corners = [
    [0.94, 0.06],
    [0.05, 0.92],
    [0.95, 0.9],
    [0.06, 0.08],
  ];
  for (let i = 0; i < frames.length; i++) {
    const r = photoRect(i);
    const [fx, fy] = corners[i % 4];
    await drawSticker(ctx, svgSticker("heart"), r.x + r.w * fx, r.y + r.h * fy, 110, i % 2 ? -14 : 12);
  }
  await drawSticker(ctx, svgSticker("bow"), STRIP_W / 2, PAD_TOP - 6, 220, -3);
  await drawSticker(ctx, svgSticker("sparkle"), PAD_X + 40, photoRect(2).y - GAP / 2, 70);
  await drawSticker(ctx, svgSticker("sparkle"), STRIP_W - PAD_X - 50, photoRect(1).y - GAP / 2, 56);

  // footer: title + date
  const ft = footerTop();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const size = fitFont(ctx, title, canvasFonts.display, 86, STRIP_W - 260);
  ctx.lineJoin = "round";
  ctx.lineWidth = 14;
  ctx.strokeStyle = C.cream;
  ctx.font = `${size}px ${canvasFonts.display}`;
  ctx.strokeText(title, STRIP_W / 2, ft + 130);
  ctx.fillStyle = C.brown;
  ctx.fillText(title, STRIP_W / 2, ft + 130);

  ctx.fillStyle = C.dusty;
  for (const dx of [-90, -45, 0, 45, 90]) {
    heart(ctx, STRIP_W / 2 + dx, ft + 210, dx === 0 ? 34 : 22);
    ctx.fill();
  }
  ctx.fillStyle = C.brown;
  ctx.font = `800 38px ${canvasFonts.ui}`;
  ctx.fillText(date, STRIP_W / 2, ft + 270);
  await drawSticker(ctx, svgSticker("heart"), 130, ft + 150, 90, -16);
  await drawSticker(ctx, svgSticker("heart"), STRIP_W - 130, ft + 150, 90, 16);
}

// ---------------- Style B: Retro MP3 ----------------

function playIcon(ctx: Ctx, kind: "prev" | "play" | "next" | "pause", cx: number, cy: number, s: number) {
  ctx.beginPath();
  if (kind === "play") {
    ctx.moveTo(cx - s * 0.4, cy - s * 0.5);
    ctx.lineTo(cx + s * 0.5, cy);
    ctx.lineTo(cx - s * 0.4, cy + s * 0.5);
    ctx.closePath();
    ctx.fill();
  } else if (kind === "pause") {
    ctx.roundRect(cx - s * 0.4, cy - s * 0.5, s * 0.28, s, 3);
    ctx.roundRect(cx + s * 0.12, cy - s * 0.5, s * 0.28, s, 3);
    ctx.fill();
  } else {
    const d = kind === "next" ? 1 : -1;
    for (const off of [-0.25, 0.2]) {
      const ox = cx + off * s * d;
      ctx.beginPath();
      ctx.moveTo(ox - s * 0.25 * d, cy - s * 0.4);
      ctx.lineTo(ox + s * 0.25 * d, cy);
      ctx.lineTo(ox - s * 0.25 * d, cy + s * 0.4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillRect(cx + (d > 0 ? s * 0.45 : -s * 0.55), cy - s * 0.4, s * 0.1, s * 0.8);
  }
}

function silver(ctx: Ctx, y: number, h: number) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#F4F2F1");
  g.addColorStop(0.5, C.gray);
  g.addColorStop(1, "#CFC9C6");
  return g;
}

async function drawMp3(ctx: Ctx, frames: HTMLCanvasElement[], title: string, date: string) {
  // pink-and-white vertical stripes
  for (let x = 0, i = 0; x < STRIP_W; x += 40, i++) {
    ctx.fillStyle = i % 2 ? C.cream : C.baby;
    ctx.fillRect(x, 0, 40, STRIP_H);
  }
  ctx.fillStyle = "rgba(217,180,195,0.6)";
  for (let x = 38; x < STRIP_W; x += 80) ctx.fillRect(x, 0, 4, STRIP_H);

  frames.forEach((f, i) => {
    const r = photoRect(i);
    ctx.save();
    softShadow(ctx, 20, 8, 0.3);
    ctx.fillStyle = silver(ctx, r.y - 24, r.h + 48);
    ctx.beginPath();
    ctx.roundRect(r.x - 24, r.y - 24, r.w + 48, r.h + 48, 36);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = C.white;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(r.x - 18, r.y - 18, r.w + 36, r.h + 36, 30);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(r.x, r.y, r.w, r.h, 14);
    ctx.clip();
    drawCover(ctx, f, r.x, r.y, r.w, r.h);
    ctx.restore();

    // "now playing" chip on each photo
    const label = `TRACK 0${i + 1}`;
    ctx.font = `800 30px ${canvasFonts.ui}`;
    const lw = ctx.measureText(label).width + 90;
    ctx.fillStyle = "rgba(255,249,247,0.92)";
    ctx.beginPath();
    ctx.roundRect(r.x + 24, r.y + r.h - 74, lw, 50, 25);
    ctx.fill();
    ctx.fillStyle = C.brown;
    playIcon(ctx, "play", r.x + 54, r.y + r.h - 49, 22);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, r.x + 76, r.y + r.h - 48);

    // REC dot
    ctx.fillStyle = "rgba(255,249,247,0.92)";
    ctx.beginPath();
    ctx.roundRect(r.x + r.w - 140, r.y + 24, 116, 44, 22);
    ctx.fill();
    ctx.fillStyle = C.dusty;
    ctx.beginPath();
    ctx.arc(r.x + r.w - 114, r.y + 46, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.brown;
    ctx.font = `800 26px ${canvasFonts.ui}`;
    ctx.fillText("REC", r.x + r.w - 96, r.y + 47);
  });

  // little transport symbols between photos
  ctx.fillStyle = C.brown;
  for (let i = 0; i < 3; i++) {
    const y = photoRect(i).y + PHOTO_H + GAP / 2;
    const kinds = ["prev", "pause", "next"] as const;
    kinds.forEach((k, j) => playIcon(ctx, k, STRIP_W / 2 - 50 + j * 50, y, 20));
  }

  // footer: a mini MP3 player
  const ft = footerTop();
  const px = PAD_X - 10;
  const py = ft + 50;
  const pw = PHOTO_W + 20;
  const ph = 250;
  ctx.save();
  softShadow(ctx, 18, 8, 0.3);
  ctx.fillStyle = silver(ctx, py, ph);
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 60);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = C.white;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(px + 8, py + 8, pw - 16, ph - 16, 52);
  ctx.stroke();

  // LCD screen
  const sx = px + 34;
  const sy = py + 34;
  const sw = pw - 330;
  const sh = ph - 68;
  ctx.fillStyle = C.baby;
  ctx.strokeStyle = C.brown;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw, sh, 22);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(117,100,95,0.08)";
  for (let y = sy + 6; y < sy + sh; y += 8) ctx.fillRect(sx + 4, y, sw - 8, 3);

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = C.brown;
  ctx.font = `800 26px ${canvasFonts.ui}`;
  ctx.fillText("♪ NOW PLAYING", sx + 28, sy + 36);
  const size = fitFont(ctx, title, canvasFonts.display, 58, sw - 56);
  ctx.font = `${size}px ${canvasFonts.display}`;
  ctx.lineJoin = "round";
  ctx.lineWidth = 10;
  ctx.strokeStyle = C.cream;
  ctx.strokeText(title, sx + 28, sy + 88);
  ctx.fillStyle = C.brown;
  ctx.fillText(title, sx + 28, sy + 88);
  // progress bar
  ctx.fillStyle = C.cream;
  ctx.beginPath();
  ctx.roundRect(sx + 28, sy + 128, sw - 56, 14, 7);
  ctx.fill();
  ctx.fillStyle = C.dusty;
  ctx.beginPath();
  ctx.roundRect(sx + 28, sy + 128, (sw - 56) * 0.72, 14, 7);
  ctx.fill();
  ctx.fillStyle = C.brown;
  ctx.font = `800 24px ${canvasFonts.ui}`;
  ctx.fillText(date, sx + 28, sy + 160);
  ctx.textAlign = "right";
  ctx.fillText("04 / 04", sx + sw - 28, sy + 160);

  // click wheel
  const wx = px + pw - 150;
  const wy = py + ph / 2;
  ctx.fillStyle = C.cream;
  ctx.strokeStyle = C.brown;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(wx, wy, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.dusty;
  ctx.beginPath();
  ctx.arc(wx, wy, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.cream;
  star(ctx, wx, wy + 2, 24);
  ctx.fill();
  ctx.fillStyle = C.brown;
  playIcon(ctx, "prev", wx - 70, wy, 24);
  playIcon(ctx, "next", wx + 70, wy, 24);
  playIcon(ctx, "pause", wx, wy + 70, 22);
  ctx.textAlign = "center";
  ctx.font = `800 22px ${canvasFonts.ui}`;
  ctx.fillText("MENU", wx, wy - 70);

  await drawSticker(ctx, svgSticker("sparkle"), STRIP_W - 70, PAD_TOP - 40, 70, 10);
  await drawSticker(ctx, svgSticker("star"), 60, ft + 40, 70, -12);
}

// ---------------- Style C: Star Diary ----------------

function stampCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = C.white;
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = "destination-out";
  const step = 34;
  const r = 11;
  for (let x = step / 2; x < w; x += step) {
    g.beginPath();
    g.arc(x, 0, r, 0, Math.PI * 2);
    g.arc(x, h, r, 0, Math.PI * 2);
    g.fill();
  }
  for (let y = step / 2; y < h; y += step) {
    g.beginPath();
    g.arc(0, y, r, 0, Math.PI * 2);
    g.arc(w, y, r, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

async function drawDiary(ctx: Ctx, frames: HTMLCanvasElement[], title: string, date: string) {
  const rand = rng(7);
  ctx.fillStyle = C.cream;
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);

  // dotted paper
  ctx.fillStyle = "rgba(181,166,158,0.35)";
  for (let y = 18; y < STRIP_H; y += 30) {
    for (let x = 18; x < STRIP_W; x += 30) {
      ctx.beginPath();
      ctx.arc(x, y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // paper fibres
  ctx.fillStyle = "rgba(181,166,158,0.12)";
  for (let i = 0; i < 260; i++) {
    ctx.fillRect(rand() * STRIP_W, rand() * STRIP_H, 2 + rand() * 6, 1.5);
  }
  // scattered stars
  for (let i = 0; i < 46; i++) {
    const x = rand() * STRIP_W;
    const y = rand() * (footerTop() + 20); // keep the title area clear
    ctx.fillStyle = rand() > 0.5 ? "rgba(117,100,95,0.55)" : "rgba(217,180,195,0.85)";
    if (rand() > 0.3) star(ctx, x, y, 10 + rand() * 16);
    else sparkle(ctx, x, y, 12 + rand() * 12);
    ctx.fill();
  }

  const labels = ["no.1 ☆", "no.2 ♡", "no.3 ☆", "no.4 ♡"];
  const tilts: number[] = [];
  for (let i = 0; i < frames.length; i++) {
    const r = photoRect(i);
    const tilt = ((i % 2 ? 1 : -1) * (0.6 + rand() * 0.8) * Math.PI) / 180;
    const stamp = stampCanvas(r.w + 60, r.h + 60);
    ctx.save();
    ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
    ctx.rotate(tilt);
    softShadow(ctx, 16, 6, 0.25);
    ctx.drawImage(stamp, -r.w / 2 - 30, -r.h / 2 - 30);
    noShadow(ctx);
    drawCover(ctx, frames[i], -r.w / 2, -r.h / 2, r.w, r.h);
    ctx.strokeStyle = C.taupe;
    ctx.lineWidth = 3;
    ctx.strokeRect(-r.w / 2, -r.h / 2, r.w, r.h);
    ctx.restore();
    tilts.push(tilt);
  }

  // Tape and tags go on after every stamp, so the next stamp can't cover them.
  for (let i = 0; i < frames.length; i++) {
    const r = photoRect(i);
    ctx.save();
    ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
    ctx.rotate(tilts[i]);

    // washi tape
    ctx.save();
    ctx.translate((i % 2 ? -1 : 1) * r.w * 0.28, -r.h / 2 - 8);
    ctx.rotate(((i % 2 ? 8 : -6) * Math.PI) / 180);
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = C.baby;
    ctx.fillRect(-90, -24, 180, 48);
    ctx.fillStyle = C.dusty;
    for (let x = -90; x < 90; x += 24) ctx.fillRect(x, -24, 10, 48);
    ctx.restore();

    // handwritten tag
    ctx.save();
    ctx.translate(r.w / 2 - 110, r.h / 2 - 10);
    ctx.rotate(((i % 2 ? 4 : -5) * Math.PI) / 180);
    softShadow(ctx, 8, 3, 0.25);
    ctx.fillStyle = C.cream;
    ctx.beginPath();
    ctx.roundRect(-90, -34, 180, 68, 12);
    ctx.fill();
    noShadow(ctx);
    ctx.strokeStyle = C.taupe;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = C.brown;
    ctx.font = `700 46px ${canvasFonts.hand}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(labels[i], 0, 2);
    ctx.restore();
    ctx.restore();
  }

  await drawSticker(ctx, svgSticker("butterfly"), STRIP_W - 110, photoRect(1).y + 40, 130, 14);
  await drawSticker(ctx, svgSticker("star"), 100, photoRect(3).y - 10, 90, -10);
  await drawSticker(ctx, svgSticker("flower"), 110, photoRect(0).y + 30, 100, 0);

  // footer
  const ft = footerTop();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const size = fitFont(ctx, title, canvasFonts.hand, 108, STRIP_W - 220, "700");
  ctx.font = `700 ${size}px ${canvasFonts.hand}`;
  ctx.fillStyle = C.brown;
  ctx.fillText(title, STRIP_W / 2, ft + 120);
  // wavy underline
  const tw = Math.min(ctx.measureText(title).width + 40, STRIP_W - 200);
  ctx.strokeStyle = C.dusty;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let x = -tw / 2; x <= tw / 2; x += 4) {
    const y = ft + 185 + Math.sin(x / 18) * 7;
    if (x === -tw / 2) ctx.moveTo(STRIP_W / 2 + x, y);
    else ctx.lineTo(STRIP_W / 2 + x, y);
  }
  ctx.stroke();
  ctx.font = `700 50px ${canvasFonts.hand}`;
  ctx.fillStyle = C.taupe;
  ctx.fillText(`☆ star diary · ${date} ☆`, STRIP_W / 2, ft + 260);
}

const DRAWERS: Record<StyleId, typeof drawSweet> = {
  sweet: drawSweet,
  mp3: drawMp3,
  diary: drawDiary,
};

/** Draw frame, photos, labels, title and date (no user stickers). */
export async function renderBase(frames: HTMLCanvasElement[], style: StyleId, title: string, date: string) {
  await loadCanvasFonts();
  const canvas = document.createElement("canvas");
  canvas.width = STRIP_W;
  canvas.height = STRIP_H;
  const ctx = canvas.getContext("2d")!;
  await DRAWERS[style](ctx, frames, title.trim() || "my photo diary", date);
  return canvas;
}

/** Base strip + user stickers → final image file. */
export async function exportStrip(base: HTMLCanvasElement, stickers: PlacedSticker[], defs: StickerDef[]) {
  const canvas = document.createElement("canvas");
  canvas.width = STRIP_W;
  canvas.height = STRIP_H;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(base, 0, 0);
  for (const s of stickers) {
    const def = defs.find((d) => d.id === s.id);
    if (!def) continue;
    await drawSticker(ctx, def, s.x * STRIP_W, s.y * STRIP_H, s.size * STRIP_W, s.rot);
  }
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.94),
  );
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return new File([blob], `photo-booth-${stamp}.jpg`, { type: "image/jpeg" });
}

