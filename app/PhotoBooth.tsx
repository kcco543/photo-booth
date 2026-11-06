"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CameraMessage, { type CameraError } from "./components/CameraMessage";
import { FrameDecor, ResultDecor, SparkleBurst } from "./components/Decor";
import EditTray from "./components/EditTray";
import { HeartGlyph, IconRetake, IconSave, IconSettings, IconShare, IconTheme, IconWand } from "./components/Icons";
import SettingsSheet, { PACE_MS, type Settings } from "./components/SettingsSheet";
import ShutterWheel from "./components/ShutterWheel";
import StripEditor from "./components/StripEditor";
import WindowBar from "./components/WindowBar";
import { canvasFonts, loadCanvasFonts } from "./lib/fonts";
import { SVG_STICKERS, buildTextStickers, loadImage, type StickerDef } from "./lib/stickers";
import { exportStrip, renderBase, type PlacedSticker } from "./lib/strip";
import { STYLES, formatDate, type StyleId } from "./lib/tokens";

const SHOTS = 4;

type Screen = "camera" | "shooting" | "result";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// localStorage can throw (private mode, blocked storage), so wrap it.
function readStore<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const baseRef = useRef<HTMLCanvasElement | null>(null);

  const [screen, setScreen] = useState<Screen>("camera");
  const [cameraError, setCameraError] = useState<CameraError | null>(null);
  const [streamOn, setStreamOn] = useState(0);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [shotsTaken, setShotsTaken] = useState(0);
  const [flash, setFlash] = useState(false);
  const [burst, setBurst] = useState(0);

  const [title, setTitle] = useState("my photo diary");
  const [theme, setTheme] = useState<StyleId>("sweet");
  const [settings, setSettings] = useState<Settings>({ mirror: true, pace: "normal" });
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [frames, setFrames] = useState<HTMLCanvasElement[]>([]);
  const [style, setStyle] = useState<StyleId>("sweet");
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [textDefs, setTextDefs] = useState<StickerDef[]>([]);

  // Read the clock after mount (not during prerender).
  const [date, setDate] = useState("");
  useEffect(() => setDate(formatDate()), []);
  const defs = useMemo(() => [...SVG_STICKERS, ...textDefs], [textDefs]);

  // ---- restore saved preferences ----
  useEffect(() => {
    setTitle(readStore("pb-title", "my photo diary"));
    const t = readStore<StyleId>("pb-theme", "sweet");
    setTheme(t);
    setStyle(t);
    setSettings(readStore("pb-settings", { mirror: true, pace: "normal" }));
  }, []);
  useEffect(() => writeStore("pb-title", title), [title]);
  useEffect(() => writeStore("pb-theme", theme), [theme]);
  useEffect(() => writeStore("pb-settings", settings), [settings]);

  // Text stickers are drawn with the display font, so wait for it.
  useEffect(() => {
    let alive = true;
    loadCanvasFonts().then(() => {
      if (!alive) return;
      const t = buildTextStickers(canvasFonts.display);
      setTextDefs(t);
      SVG_STICKERS.forEach((s) => loadImage(s.src));
    });
    return () => {
      alive = false;
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2200);
  }, []);

  // ---- camera ----
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
        video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = stream;
      setStreamOn((n) => n + 1);
    } catch (err) {
      const name = (err as DOMException)?.name;
      setCameraError(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable");
    }
  }, []);

  // Attach the stream whenever both it and the <video> exist.
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (video && stream && video.srcObject !== stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    }
  }, [streamOn, screen]);

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
    if (settings.mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    return canvas;
  };

  const takePhotos = async () => {
    if (screen !== "camera" || !ready) return;
    setScreen("shooting");
    setShotsTaken(0);

    for (const n of [3, 2, 1]) {
      setCountdown(n);
      await wait(1000);
    }
    setCountdown(null);

    const shots: HTMLCanvasElement[] = [];
    for (let i = 0; i < SHOTS; i++) {
      if (i > 0) {
        // short "get ready" beat between shots
        setCountdown(-1);
        await wait(PACE_MS[settings.pace]);
        setCountdown(null);
      }
      const frame = grabFrame();
      if (frame) shots.push(frame);
      setShotsTaken(i + 1);
      setFlash(true);
      setBurst((b) => b + 1);
      navigator.vibrate?.(30);
      await wait(prefersReducedMotion() ? 120 : 160);
      setFlash(false);
      await wait(250);
    }

    if (shots.length === 0) {
      setScreen("camera");
      return;
    }
    setFrames(shots);
    setStyle(theme);
    setStickers([]);
    setSelected(null);
    setEditing(false);
    setScreen("result");
    stopCamera();
  };

  const retake = () => {
    setFrames([]);
    setStickers([]);
    setSelected(null);
    setEditing(false);
    setBaseUrl(null);
    setFile(null);
    baseRef.current = null;
    setShotsTaken(0);
    setScreen("camera");
    startCamera();
  };

  // ---- strip rendering (frame + photos + title + date) ----
  useEffect(() => {
    if (frames.length === 0 || !date) return;
    let alive = true;
    const t = window.setTimeout(async () => {
      const canvas = await renderBase(frames, style, title, date);
      if (!alive) return;
      baseRef.current = canvas;
      setFile(null);
      setBaseUrl(canvas.toDataURL("image/jpeg", 0.9));
    }, 200);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [frames, style, title, date]);

  // ---- final export (base + stickers) — prepared ahead of time so the
  // iPhone share sheet can open straight from the tap ----
  useEffect(() => {
    if (!baseUrl || editing || !baseRef.current) return;
    let alive = true;
    setFile(null);
    exportStrip(baseRef.current, stickers, defs).then((f) => alive && setFile(f));
    return () => {
      alive = false;
    };
  }, [baseUrl, editing, stickers, defs]);

  const download = (f: File) => {
    const url = URL.createObjectURL(f);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const save = async () => {
    if (!file) return;
    const isPhone = window.matchMedia("(pointer: coarse)").matches;
    if (isPhone && navigator.canShare?.({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    download(file);
    showToast("Saved to your downloads ♡");
  };

  const share = async () => {
    if (!file) return;
    if (navigator.canShare?.({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({ files: [file], title: title || "Photo Booth" });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    download(file);
    showToast("Sharing isn't available here, so it was downloaded");
  };

  // ---- stickers ----
  const addSticker = (def: StickerDef) => {
    const uid = `${def.id}-${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    const isText = def.id.startsWith("t-");
    const s: PlacedSticker = {
      uid,
      id: def.id,
      x: 0.5 + (Math.random() - 0.5) * 0.3,
      y: 0.4 + (Math.random() - 0.5) * 0.3,
      size: isText ? 0.42 : 0.24,
      rot: Math.round((Math.random() - 0.5) * 20),
    };
    setStickers((prev) => [...prev, s]);
    setSelected(uid);
  };

  const cycleTheme = () => {
    const i = STYLES.findIndex((s) => s.id === theme);
    const next = STYLES[(i + 1) % STYLES.length];
    setTheme(next.id);
    setStyle(next.id);
    showToast(`${next.name} theme`);
  };

  const shooting = screen === "shooting";

  return (
    <main className="app" data-theme={screen === "result" ? style : theme}>
      <div className="paper-bg" aria-hidden />

      {screen !== "result" && (
        <section className="camera-screen">
          <WindowBar
            title={title}
            onTitleChange={setTitle}
            date={date}
            disabled={shooting}
            actions={
              <>
                <button className="icon-btn" onClick={cycleTheme} disabled={shooting} aria-label="Change theme">
                  <IconTheme />
                </button>
                <button className="icon-btn" onClick={() => setShowSettings(true)} disabled={shooting} aria-label="Settings">
                  <IconSettings />
                </button>
              </>
            }
          />

          <div className="viewfinder">
            <div className="viewfinder-inner">
              <video
                ref={videoRef}
                className={`preview${ready ? " live" : ""}`}
                playsInline
                muted
                autoPlay
                onLoadedData={() => setReady(true)}
              />
              {!ready && !cameraError && <div className="preview-wait">warming up the camera…</div>}
              <div className="vf-tag" aria-hidden>
                <span className="rec-dot" /> 4 CUTS
              </div>
              {countdown !== null && countdown > 0 && (
                <div className="countdown" key={countdown} aria-live="assertive">
                  {countdown}
                </div>
              )}
              {countdown === -1 && <div className="pose-cue">next pose ♡</div>}
              {burst > 0 && shooting && <SparkleBurst key={burst} />}
            </div>
            <FrameDecor />
            {cameraError && <CameraMessage error={cameraError} onRetry={startCamera} />}
          </div>

          {!cameraError && (
            <div className="camera-bottom">
              <div className="shot-hearts" aria-label={`${shotsTaken} of ${SHOTS} photos taken`}>
                {Array.from({ length: SHOTS }, (_, i) => (
                  <HeartGlyph key={i} filled={i < shotsTaken} size={20} />
                ))}
              </div>
              <p className="hint">{shooting ? "smile! ☺" : ready ? "tap the star to start" : " "}</p>
              <ShutterWheel onPress={takePhotos} disabled={!ready || shooting} />
            </div>
          )}
        </section>
      )}

      {screen === "result" && (
        <section className={`result-screen${editing ? " is-editing" : ""}`}>
          <WindowBar title={title} onTitleChange={setTitle} date={date} />
          <div className="result-stage">
            {!editing && <ResultDecor />}
            <StripEditor
              baseUrl={baseUrl}
              stickers={stickers}
              defs={defs}
              editing={editing}
              selected={selected}
              onSelect={setSelected}
              onChange={setStickers}
              tilt
            />
          </div>

          {editing ? (
            <EditTray
              style={style}
              onStyle={setStyle}
              defs={defs}
              onAdd={addSticker}
              onReset={() => {
                setStickers([]);
                setSelected(null);
              }}
              onDone={() => {
                setEditing(false);
                setSelected(null);
              }}
              hasStickers={stickers.length > 0}
            />
          ) : (
            <nav className="result-actions" aria-label="Photo strip actions">
              <button className="action" onClick={() => setEditing(true)} disabled={!baseUrl}>
                <IconWand />
                <span>Customize</span>
              </button>
              <button className="action action-pink" onClick={save} disabled={!file}>
                <IconSave />
                <span>{file ? "Save" : "…"}</span>
              </button>
              <button className="action" onClick={share} disabled={!file}>
                <IconShare />
                <span>Share</span>
              </button>
              <button className="action" onClick={retake}>
                <IconRetake />
                <span>Retake</span>
              </button>
            </nav>
          )}
        </section>
      )}

      {showSettings && <SettingsSheet settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      <div className={`flash${flash ? " on" : ""}`} aria-hidden />
    </main>
  );
}
