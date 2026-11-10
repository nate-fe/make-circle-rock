"use client";

import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "./Icons";

type Props = {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  full?: boolean;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
};

export default function Sheet({ open, onClose, title, full, children, className = "", headerRight }: Props) {
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={`sheet-backdrop ${full ? "is-full" : ""}`} onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <section className={`sheet ${full ? "sheet--full" : ""} ${className}`} role="dialog" aria-modal="true">
        {!full && <div className="sheet__grip" aria-hidden />}
        {(title || onClose) && (
          <header className="sheet__head">
            <h2 className="sheet__title">{title}</h2>
            <div className="sheet__head-right">
              {headerRight}
              {onClose && (
                <button className="icon-btn" onClick={onClose} aria-label="닫기">
                  <CloseIcon />
                </button>
              )}
            </div>
          </header>
        )}
        <div className="sheet__body">{children}</div>
      </section>
    </div>
  );
}
