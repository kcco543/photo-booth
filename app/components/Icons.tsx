// Small original line icons, drawn to match the scrapbook ink style.
type P = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const IconSettings = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
  </svg>
);

export const IconTheme = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M12 20.5c-4.5-3-8-5.8-8-9.6 0-2.5 2-4.4 4.3-4.4 1.6 0 2.9.8 3.7 2.1.8-1.3 2.1-2.1 3.7-2.1 2.3 0 4.3 1.9 4.3 4.4 0 3.8-3.5 6.6-8 9.6z" />
    <path d="M8 10.5c.3-1 1-1.6 1.9-1.8" />
  </svg>
);

export const IconSave = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" />
    <path d="M5 17.5v1.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-1.5" />
  </svg>
);

export const IconShare = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="M12 15V4M8 7.5 12 3.5l4 4" />
    <path d="M8.5 10.5H7a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5h-1.5" />
  </svg>
);

export const IconRetake = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
    <path d="M4 4.5v4h4" />
  </svg>
);

export const IconWand = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="M5 19 15.5 8.5" />
    <path d="M17 3.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z" fill="currentColor" />
    <path d="M9 4.5v2M8 5.5h2M19 13v2M18 14h2" />
  </svg>
);

export const IconClose = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconRotate = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M19 12a7 7 0 1 1-2-4.9" />
    <path d="M19 4.5V8h-3.5" />
  </svg>
);

export const IconCheck = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <path d="M5 12.5 10 17 19 7.5" />
  </svg>
);

export const IconReset = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 12.5h9l1-12.5" />
  </svg>
);

export const HeartGlyph = ({ filled, size = 16 }: { filled?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
    <path
      d="M50 86 C22 66 6 48 13 30 C20 13 41 12 50 28 C59 12 80 13 87 30 C94 48 78 66 50 86 Z"
      fill={filled ? "var(--pink)" : "var(--cream)"}
      stroke="var(--brown)"
      strokeWidth="8"
      strokeLinejoin="round"
    />
  </svg>
);
