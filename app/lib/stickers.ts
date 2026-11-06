// Original sticker illustrations, drawn as small SVGs.
// Every sticker resolves to an image `src` + aspect ratio, so the editor
// preview and the exported canvas use exactly the same pixels.

import { C } from "./tokens";

export type StickerDef = {
  id: string;
  label: string;
  src: string;
  /** height / width */
  aspect: number;
};

const ink = C.brown;

export function starPath(cx: number, cy: number, outer: number, inner: number, points = 5) {
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    d += `${i === 0 ? "M" : "L"}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)} `;
  }
  return d + "Z";
}

const HEART = "M50 86 C22 66 6 48 13 30 C20 13 41 12 50 28 C59 12 80 13 87 30 C94 48 78 66 50 86 Z";
const SPARKLE = "M50 4 C54 38 62 46 96 50 C62 54 54 62 50 96 C46 62 38 54 4 50 C38 46 46 38 50 4 Z";

const svg = (body: string, w = 100, h = 100) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w * 2}" height="${h * 2}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

const RAW: { id: string; label: string; w?: number; h?: number; body: string }[] = [
  {
    id: "heart",
    label: "Pink heart",
    body: `<path d="${HEART}" fill="${C.dusty}" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
      <ellipse cx="32" cy="34" rx="7" ry="4.5" fill="${C.cream}" transform="rotate(-35 32 34)"/>`,
  },
  {
    id: "star",
    label: "Brown star",
    body: `<path d="${starPath(50, 54, 46, 21)}" fill="${C.brown}" stroke="${C.brown}" stroke-width="6" stroke-linejoin="round"/>
      <path d="${starPath(50, 54, 46, 21)}" fill="none" stroke="${C.cream}" stroke-width="2" stroke-dasharray="4 5" stroke-linejoin="round" transform="translate(50 54) scale(.78) translate(-50 -54)"/>`,
  },
  {
    id: "sparkle",
    label: "Sparkle",
    body: `<path d="${SPARKLE}" fill="${C.cream}" stroke="${C.dusty}" stroke-width="4" stroke-linejoin="round"/>
      <path d="${SPARKLE}" fill="${C.baby}" transform="translate(74 12) scale(.22)"/>
      <circle cx="20" cy="80" r="5" fill="${C.dusty}"/>`,
  },
  {
    id: "bow",
    label: "Ribbon bow",
    w: 120,
    h: 90,
    body: `<path d="M56 38 C40 10 10 8 8 30 C6 50 34 54 56 44 Z" fill="${C.dusty}" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M64 38 C80 10 110 8 112 30 C114 50 86 54 64 44 Z" fill="${C.dusty}" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M54 46 L36 84 L46 80 L52 88 L58 50 Z" fill="${C.baby}" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M66 46 L84 84 L74 80 L68 88 L62 50 Z" fill="${C.baby}" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
      <rect x="50" y="30" width="20" height="20" rx="7" fill="${C.baby}" stroke="${ink}" stroke-width="3.5"/>
      <path d="M22 26 C28 22 36 24 42 30" stroke="${C.cream}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: "ribbon",
    label: "Ribbon banner",
    w: 140,
    h: 56,
    body: `<path d="M4 18 L26 18 L26 50 L4 50 L14 34 Z" fill="${C.taupe}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M136 18 L114 18 L114 50 L136 50 L126 34 Z" fill="${C.taupe}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M20 8 C50 2 90 2 120 8 L120 40 C90 34 50 34 20 40 Z" fill="${C.dusty}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <path d="${HEART}" fill="${C.cream}" transform="translate(58 10) scale(.24)"/>
      <circle cx="40" cy="22" r="3" fill="${C.cream}"/><circle cx="100" cy="22" r="3" fill="${C.cream}"/>`,
  },
  {
    id: "butterfly",
    label: "Butterfly",
    body: `<g stroke="${ink}" stroke-width="3" stroke-linejoin="round">
        <path d="M48 46 C34 18 8 14 10 34 C12 50 30 54 48 50 Z" fill="${C.baby}"/>
        <path d="M52 46 C66 18 92 14 90 34 C88 50 70 54 52 50 Z" fill="${C.baby}"/>
        <path d="M48 54 C30 56 18 72 28 82 C38 90 46 74 48 60 Z" fill="${C.dusty}"/>
        <path d="M52 54 C70 56 82 72 72 82 C62 90 54 74 52 60 Z" fill="${C.dusty}"/>
      </g>
      <rect x="46" y="38" width="8" height="40" rx="4" fill="${ink}"/>
      <path d="M48 40 C44 30 40 26 34 24 M52 40 C56 30 60 26 66 24" stroke="${ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="26" cy="34" r="4" fill="${C.cream}"/><circle cx="74" cy="34" r="4" fill="${C.cream}"/>`,
  },
  {
    id: "flower",
    label: "Flower",
    body: `<g stroke="${ink}" stroke-width="3" fill="${C.cream}">
        <ellipse cx="50" cy="24" rx="15" ry="19"/>
        <ellipse cx="50" cy="24" rx="15" ry="19" transform="rotate(72 50 52)"/>
        <ellipse cx="50" cy="24" rx="15" ry="19" transform="rotate(144 50 52)"/>
        <ellipse cx="50" cy="24" rx="15" ry="19" transform="rotate(216 50 52)"/>
        <ellipse cx="50" cy="24" rx="15" ry="19" transform="rotate(288 50 52)"/>
      </g>
      <circle cx="50" cy="52" r="13" fill="${C.dusty}" stroke="${ink}" stroke-width="3"/>
      <circle cx="46" cy="49" r="2.5" fill="${ink}"/><circle cx="55" cy="51" r="2" fill="${ink}"/><circle cx="49" cy="57" r="2" fill="${ink}"/>`,
  },
  {
    id: "player",
    label: "Music player",
    w: 72,
    h: 110,
    body: `<rect x="4" y="4" width="64" height="102" rx="14" fill="${C.gray}" stroke="${ink}" stroke-width="3.5"/>
      <rect x="12" y="12" width="48" height="36" rx="5" fill="${C.baby}" stroke="${ink}" stroke-width="3"/>
      <path d="M22 22 L22 38 M22 22 L34 19 L34 35" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="20" cy="38" r="3.5" fill="${ink}"/><circle cx="32" cy="35" r="3.5" fill="${ink}"/>
      <rect x="40" y="36" width="14" height="4" rx="2" fill="${C.dusty}"/>
      <circle cx="36" cy="76" r="22" fill="${C.cream}" stroke="${ink}" stroke-width="3"/>
      <circle cx="36" cy="76" r="8" fill="${C.dusty}" stroke="${ink}" stroke-width="3"/>
      <path d="M33 59 L33 64 M39 59 L39 64 M33 93 L41 89 L33 85 Z" stroke="${ink}" stroke-width="2" fill="${ink}"/>`,
  },
  {
    id: "camera",
    label: "Camera",
    w: 110,
    h: 80,
    body: `<rect x="14" y="8" width="26" height="14" rx="4" fill="${C.taupe}" stroke="${ink}" stroke-width="3"/>
      <rect x="4" y="18" width="102" height="58" rx="14" fill="${C.dusty}" stroke="${ink}" stroke-width="3.5"/>
      <rect x="4" y="34" width="102" height="10" fill="${C.baby}" stroke="${ink}" stroke-width="3"/>
      <circle cx="55" cy="47" r="20" fill="${C.cream}" stroke="${ink}" stroke-width="3.5"/>
      <circle cx="55" cy="47" r="11" fill="${ink}"/>
      <circle cx="51" cy="43" r="3.5" fill="${C.cream}"/>
      <rect x="84" y="24" width="14" height="7" rx="3" fill="${C.cream}" stroke="${ink}" stroke-width="2.5"/>
      <path d="${HEART}" fill="${C.cream}" transform="translate(12 52) scale(.16)"/>`,
  },
];

const toDataUrl = (s: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`;

export const SVG_STICKERS: StickerDef[] = RAW.map((r) => {
  const w = r.w ?? 100;
  const h = r.h ?? 100;
  return { id: r.id, label: r.label, src: toDataUrl(svg(r.body, w, h)), aspect: h / w };
});

export const TEXT_STICKERS: { id: string; text: string; bg: string; fg: string }[] = [
  { id: "t-love", text: "LOVE ♡", bg: C.dusty, fg: C.cream },
  { id: "t-bff", text: "BFF", bg: C.baby, fg: C.brown },
  { id: "t-cutie", text: "cutie", bg: C.cream, fg: C.brown },
  { id: "t-xoxo", text: "xoxo", bg: C.brown, fg: C.baby },
  { id: "t-best", text: "best day ever", bg: C.baby, fg: C.brown },
  { id: "t-smile", text: "say cheese!", bg: C.gray, fg: C.brown },
];

/** Render text stickers to PNG data URLs using the loaded display font. */
export function buildTextStickers(fontFamily: string): StickerDef[] {
  return TEXT_STICKERS.map((t) => {
    const scale = 3;
    const fontPx = 30 * scale;
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d")!;
    ctx.font = `${fontPx}px ${fontFamily}`;
    const tw = ctx.measureText(t.text).width;
    const padX = 26 * scale;
    const h = 64 * scale;
    const w = Math.ceil(tw + padX * 2);
    const m = 6 * scale; // room for stroke + shadow
    c.width = w + m * 2;
    c.height = h + m * 2;
    const g = c.getContext("2d")!;
    // offset "printed sticker" shadow
    g.fillStyle = "rgba(117,100,95,0.35)";
    g.beginPath();
    g.roundRect(m + 3 * scale, m + 4 * scale, w - 2 * scale, h - 2 * scale, h / 2);
    g.fill();
    g.fillStyle = t.bg;
    g.strokeStyle = C.brown;
    g.lineWidth = 3 * scale;
    g.beginPath();
    g.roundRect(m, m, w - 2 * scale, h - 2 * scale, h / 2);
    g.fill();
    g.stroke();
    g.font = `${fontPx}px ${fontFamily}`;
    g.fillStyle = t.fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(t.text, m + (w - 2 * scale) / 2, m + (h - 2 * scale) / 2 + 2 * scale);
    return { id: t.id, label: t.text, src: c.toDataURL("image/png"), aspect: c.height / c.width };
  });
}

// ---- image cache (shared by editor + exporter) ----

const cache = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  let p = cache.get(src);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("image failed to load"));
      img.src = src;
    }).then(async (img) => {
      await img.decode?.().catch(() => {});
      return img;
    });
    cache.set(src, p);
  }
  return p;
}

export function stickerById(id: string, all: StickerDef[]) {
  return all.find((s) => s.id === id);
}
