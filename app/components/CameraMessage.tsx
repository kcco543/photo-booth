"use client";

export type CameraError = "denied" | "unavailable" | "insecure";

export default function CameraMessage({ error, onRetry }: { error: CameraError; onRetry: () => void }) {
  return (
    <div className="message" role="alert">
      <div className="message-card paper">
        <svg className="message-art" viewBox="0 0 110 80" width="110" height="80" aria-hidden>
          <rect x="14" y="8" width="26" height="14" rx="4" fill="var(--taupe)" stroke="var(--brown)" strokeWidth="3" />
          <rect x="4" y="18" width="102" height="58" rx="14" fill="var(--pink)" stroke="var(--brown)" strokeWidth="3.5" />
          <circle cx="55" cy="47" r="20" fill="var(--cream)" stroke="var(--brown)" strokeWidth="3.5" />
          <path d="M44 47c3-4 8-4 11 0M56 47c3-4 8-4 11 0" stroke="var(--brown)" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
        {error === "denied" && (
          <>
            <h1>camera is sleeping…</h1>
            <p>Photo Booth needs your camera to take pictures. Here&apos;s how to wake it up:</p>
            <ul>
              <li>
                <strong>iPhone Safari:</strong> tap <strong>aA</strong> in the address bar →{" "}
                <strong>Website Settings → Camera → Allow</strong>.
              </li>
              <li>
                <strong>Home screen app:</strong> open <strong>Settings → Apps → Safari → Camera</strong> and choose{" "}
                <strong>Allow</strong> or <strong>Ask</strong>.
              </li>
              <li>
                <strong>Computer:</strong> click the camera or lock icon in the address bar and allow the camera.
              </li>
            </ul>
          </>
        )}
        {error === "insecure" && (
          <>
            <h1>needs a secure link</h1>
            <p>
              Browsers only allow the camera on <strong>https://</strong> pages or on localhost. Open this app from a
              secure address to use it.
            </p>
          </>
        )}
        {error === "unavailable" && (
          <>
            <h1>no camera found</h1>
            <p>We couldn&apos;t start a camera. Make sure no other app is using it, then try again.</p>
          </>
        )}
        <button className="btn btn-pink" onClick={onRetry}>
          Try again
        </button>
      </div>
    </div>
  );
}
