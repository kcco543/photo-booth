"use client";

import type { ReactNode } from "react";

/** Early-2000s window title bar: three dots, editable title, date, actions. */
export default function WindowBar({
  title,
  onTitleChange,
  date,
  actions,
  disabled,
}: {
  title: string;
  onTitleChange: (t: string) => void;
  date: string;
  actions?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <header className="window-bar">
      <div className="window-dots" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="window-title">
        <input
          className="title-input"
          value={title}
          maxLength={28}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          aria-label="Photo session title"
          placeholder="my photo diary"
          disabled={disabled}
          enterKeyHint="done"
          spellCheck={false}
        />
        <span className="window-date">{date}</span>
      </div>
      {actions && <div className="window-actions">{actions}</div>}
    </header>
  );
}
