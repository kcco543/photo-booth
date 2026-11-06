"use client";

import { IconClose } from "./Icons";

export type Pace = "quick" | "normal" | "slow";
export type Settings = { mirror: boolean; pace: Pace };

export const PACE_MS: Record<Pace, number> = { quick: 800, normal: 1300, slow: 2200 };

export default function SettingsSheet({
  settings,
  onChange,
  onClose,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
}) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet paper" role="dialog" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-bar">
          <div className="window-dots" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <h2>settings</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close settings">
            <IconClose size={18} />
          </button>
        </div>

        <label className="setting-row">
          <span>
            <strong>Mirror photos</strong>
            <small>Save photos the way the preview looks</small>
          </span>
          <input
            type="checkbox"
            className="toggle"
            checked={settings.mirror}
            onChange={(e) => onChange({ ...settings, mirror: e.target.checked })}
          />
        </label>

        <div className="setting-row column">
          <span>
            <strong>Time between photos</strong>
            <small>How long you get to change your pose</small>
          </span>
          <div className="segmented" role="radiogroup" aria-label="Time between photos">
            {(["quick", "normal", "slow"] as Pace[]).map((p) => (
              <button
                key={p}
                role="radio"
                aria-checked={settings.pace === p}
                className={settings.pace === p ? "on" : ""}
                onClick={() => onChange({ ...settings, pace: p })}
              >
                {p === "quick" ? "Quick" : p === "normal" ? "Normal" : "Relaxed"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
