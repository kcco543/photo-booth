"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SHOTS = 4;
const SHOT_GAP_MS = 1200;

type Screen = "camera" | "shooting" | "result";
type CameraError = "denied" | "unavailable" | "insecure" | null;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [screen, setScreen] = useState<Screen>("camera");
  const [cameraError, setCameraError] = useState<CameraError>(null);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [shotIndex, setShotIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const [strip, setStrip] = useState<{ url: string; file: File } | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(window.isSecureContext ? "unavailable" : "insecure");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1920 },
          height: { ideal: 1920 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => {});
      }
    } catch (err) {
      const name = (err as DOMException)?.name;
      setCameraError(
        name === "NotAllowedError" || name === "SecurityError"
          ? "denied"
          : "unavailable",
      );
    }
  }, []);

  useEffect(() => {
    startCamera();
    return stopCamera;
  }, [startCamera, stopCamera]);

  const grabFrame = (): HTMLCanvasElement | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    // Mirror so the photo matches what you saw in the preview.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    return canvas;
  };

  const takePhotos = async () => {
    if (screen !== "camera" || !ready) return;
    setScreen("shooting");

    for (const n of [3, 2, 1]) {
      setCountdown(n);
      await wait(1000);
    }
    setCountdown(null);

    const frames: HTMLCanvasElement[] = [];
    for (let i = 0; i < SHOTS; i++) {
      setShotIndex(i + 1);
      const frame = grabFrame();
      if (frame) frames.push(frame);
      setFlash(true);
      navigator.vibrate?.(30);
      await wait(180);
      setFlash(false);
      if (i < SHOTS - 1) await wait(SHOT_GAP_MS);
    }
    setShotIndex(0);

    if (frames.length === 0) {
      setScreen("camera");
      return;
    }
    const result = await buildStrip(frames);
    setStrip(result);
    setScreen("result");
    stopCamera();
  };

  const retake = () => {
    if (strip) URL.revokeObjectURL(strip.url);
    setStrip(null);
    setScreen("camera");
    startCamera();
  };

  const save = async () => {
    if (!strip) return;
    const isPhone = window.matchMedia("(pointer: coarse)").matches;
    if (
      isPhone &&
      navigator.canShare?.({ files: [strip.file] }) &&
      navigator.share
    ) {
      try {
        await navigator.share({ files: [strip.file] });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    const a = document.createElement("a");
    a.href = strip.url;
    a.download = strip.file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <main className="app">
      {screen !== "result" && (
        <section className="camera">
          <video
            ref={videoRef}
            className="preview"
            playsInline
            muted
            autoPlay
            onLoadedData={() => setReady(true)}
          />

          {cameraError && <CameraMessage error={cameraError} onRetry={startCamera} />}

          {countdown !== null && (
            <div className="countdown" key={countdown}>
              {countdown}
            </div>
          )}

          {shotIndex > 0 && (
            <div className="shot-counter">
              {shotIndex} / {SHOTS}
            </div>
          )}

          {!cameraError && (
            <div className="controls">
              <button
                className="shutter"
                aria-label="Take photos"
                onClick={takePhotos}
                disabled={!ready || screen === "shooting"}
              >
                <span className="shutter-inner" />
              </button>
            </div>
          )}
        </section>
      )}

      {screen === "result" && strip && (
        <section className="result">
          <div className="strip-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={strip.url} alt="Your photo strip" className="strip" />
          </div>
          <div className="result-actions">
            <button className="btn secondary" onClick={retake}>
              Retake
            </button>
            <button className="btn primary" onClick={save}>
              Save
            </button>
          </div>
        </section>
      )}

      <div className={`flash${flash ? " on" : ""}`} aria-hidden />
    </main>
  );
}

function CameraMessage({
  error,
  onRetry,
}: {
  error: Exclude<CameraError, null>;
  onRetry: () => void;
}) {
  return (
    <div className="message">
      <div className="message-icon" aria-hidden>
        📷
      </div>
      {error === "denied" && (
        <>
          <h1>Camera access is off</h1>
          <p>Photo Booth needs your camera to take pictures. You can turn it back on:</p>
          <ul>
            <li>
              <strong>iPhone Safari:</strong> tap <strong>aA</strong> in the address bar, then{" "}
              <strong>Website Settings → Camera → Allow</strong>.
            </li>
            <li>
              <strong>Home screen app:</strong> open <strong>Settings → Apps → Safari → Camera</strong>{" "}
              and choose <strong>Allow</strong> or <strong>Ask</strong>.
            </li>
            <li>
              <strong>Computer:</strong> click the camera or lock icon in the address bar and allow the
              camera.
            </li>
          </ul>
        </>
      )}
      {error === "insecure" && (
        <>
          <h1>Camera needs a secure link</h1>
          <p>
            Browsers only allow the camera on <strong>https://</strong> pages or on localhost. Open
            this app from a secure address to use it.
          </p>
        </>
      )}
      {error === "unavailable" && (
        <>
          <h1>No camera found</h1>
          <p>We couldn&apos;t start a camera. Make sure no other app is using it, then try again.</p>
        </>
      )}
      <button className="btn primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

async function buildStrip(frames: HTMLCanvasElement[]) {
  const W = 1000;
  const border = 50;
  const gap = 30;
  const footer = 140;
  const photoW = W - border * 2;
  const photoH = Math.round((photoW * 3) / 4);
  const H = border + frames.length * photoH + (frames.length - 1) * gap + footer;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  frames.forEach((frame, i) => {
    // Center-crop each frame to 4:3 so portrait and landscape cameras both fit.
    const target = photoW / photoH;
    let sw = frame.width;
    let sh = frame.height;
    if (sw / sh > target) sw = sh * target;
    else sh = sw / target;
    const sx = (frame.width - sw) / 2;
    const sy = (frame.height - sh) / 2;
    const y = border + i * (photoH + gap);
    ctx.drawImage(frame, sx, sy, sw, sh, border, y, photoW, photoH);
  });

  const date = new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  ctx.fillStyle = "#1c1c1e";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 40px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";
  ctx.fillText(`Photo Booth · ${date}`, W / 2, H - footer / 2);

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92),
  );
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const file = new File([blob], `photo-booth-${stamp}.jpg`, { type: "image/jpeg" });
  return { url: URL.createObjectURL(blob), file };
}
