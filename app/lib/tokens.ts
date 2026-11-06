// Design tokens shared by CSS (see globals.css) and the canvas renderer.
export const C = {
  dusty: "#D9B4C3",
  baby: "#F6DCEB",
  taupe: "#B5A69E",
  brown: "#75645F",
  cream: "#FFF9F7",
  gray: "#E5E3E2",
  white: "#FFFFFF",
} as const;

export type StyleId = "sweet" | "mp3" | "diary";

export const STYLES: { id: StyleId; name: string; blurb: string }[] = [
  { id: "sweet", name: "Sweet Hearts", blurb: "pink, hearts & bows" },
  { id: "mp3", name: "Retro MP3", blurb: "stripes & playback" },
  { id: "diary", name: "Star Diary", blurb: "stamps & stars" },
];

export function formatDate(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}
