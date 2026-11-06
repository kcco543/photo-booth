import { Gaegu, Mochiy_Pop_One, Nunito } from "next/font/google";

// Display: rounded, chunky, playful (titles, countdown, strip titles).
export const displayFont = Mochiy_Pop_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Handwriting: used for Star Diary labels.
export const handFont = Gaegu({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

// UI: clean rounded sans for buttons, settings, dates.
export const uiFont = Nunito({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const fontVariables = `${displayFont.variable} ${handFont.variable} ${uiFont.variable}`;

/** Font-family strings usable in canvas `ctx.font`. */
export const canvasFonts = {
  display: displayFont.style.fontFamily,
  hand: handFont.style.fontFamily,
  ui: uiFont.style.fontFamily,
};

/** Wait until the fonts the canvas renderer needs are ready. */
export async function loadCanvasFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all([
    document.fonts.load(`80px ${canvasFonts.display}`),
    document.fonts.load(`700 80px ${canvasFonts.hand}`),
    document.fonts.load(`400 80px ${canvasFonts.hand}`),
    document.fonts.load(`700 40px ${canvasFonts.ui}`),
    document.fonts.load(`800 40px ${canvasFonts.ui}`),
  ]).catch(() => {});
}
