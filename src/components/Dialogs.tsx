"use client";

import { useState } from "react";
import Sheet from "./Sheet";
import { DEFAULT_NAME, NAME_MAX } from "@/lib/config";

function clamp(v: string) {
  return Array.from(v).slice(0, NAME_MAX).join("");
}

export function NameDialog({ open, onDone }: { open: boolean; onDone: (name: string) => void }) {
  const [v, setV] = useState("");
  const submit = () => onDone(v.trim() || DEFAULT_NAME);
  return (
    <Sheet open={open} className="namecard">
      <p className="namecard__kicker">신규 입사 안내</p>
      <h2 className="namecard__q">돌의 이름을 지어주세요</h2>
      <p className="namecard__hint">최대 {NAME_MAX}자.</p>
      <input
        className="field field--big"
        value={v}
        placeholder={DEFAULT_NAME}
        autoFocus
        onChange={(e) => setV(clamp(e.target.value))}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button className="btn btn--primary btn--block" onClick={submit}>
        이 이름으로 할게요
      </button>
      <button className="text-btn" onClick={() => onDone(DEFAULT_NAME)}>
        건너뛰기 · {DEFAULT_NAME}
      </button>
    </Sheet>
  );
}

export function RenameDialog({
  open,
  current,
  onClose,
  onSave,
}: {
  open: boolean;
  current: string;
  onClose: () => void;
  onSave: (name: string, scope: "today" | "always") => void;
}) {
  const [v, setV] = useState(current);
  const name = v.trim();
  return (
    <Sheet open={open} onClose={onClose} title="이름 다시 새기기">
      <input className="field field--big" value={v} autoFocus onChange={(e) => setV(clamp(e.target.value))} />
      <div className="btn-row">
        <button className="btn" disabled={!name} onClick={() => onSave(name, "today")}>
          오늘 돌만
        </button>
        <button className="btn btn--primary" disabled={!name} onClick={() => onSave(name, "always")}>
          앞으로 계속
        </button>
      </div>
    </Sheet>
  );
}
