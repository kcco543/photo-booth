"use client";

/** Shutter styled like a retro MP3 player's click wheel with a star center. */
export default function ShutterWheel({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  return (
    <div className="wheel" aria-hidden={false}>
      <span className="wheel-label top" aria-hidden>
        MENU
      </span>
      <span className="wheel-label left" aria-hidden>
        ◀◀
      </span>
      <span className="wheel-label right" aria-hidden>
        ▶▶
      </span>
      <span className="wheel-label bottom" aria-hidden>
        ▶❚❚
      </span>
      <button className="wheel-center" onClick={onPress} disabled={disabled} aria-label="Take 4 photos">
        <svg viewBox="0 0 100 100" width="54" height="54" aria-hidden>
          <path
            d="M50 9 L61 37 L91 38 L67 57 L76 87 L50 70 L24 87 L33 57 L9 38 L39 37 Z"
            fill="var(--pink)"
            stroke="var(--brown)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <ellipse cx="40" cy="40" rx="6" ry="3.5" fill="var(--cream)" transform="rotate(-30 40 40)" />
        </svg>
      </button>
    </div>
  );
}
