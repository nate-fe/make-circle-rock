"use client";

import { useState } from "react";
import RockSvg from "./RockSvg";
import { ROCK_COLORS, isCustomColor } from "@/lib/colors";

type Props = {
  value: string;
  onChange: (id: string) => void;
  /** 한 줄로 (체크인 시트용) */
  compact?: boolean;
};

/** 돌 색깔 고르기. 기본 8색 + 마지막 칸은 아무 색이나 직접. */
export default function ColorPicker({ value, onChange, compact }: Props) {
  const custom = isCustomColor(value);
  // 기본 색으로 갔다가 돌아와도 마지막에 고른 내 색이 남아 있게
  const [mine, setMine] = useState(custom ? value : "#d98a6a");

  return (
    <div className={`swatches ${compact ? "is-compact" : ""}`} role="radiogroup" aria-label="돌 색깔">
      {ROCK_COLORS.map((c) => (
        <button
          key={c.id}
          type="button"
          role="radio"
          aria-checked={value === c.id}
          aria-label={c.name}
          title={c.name}
          className={`swatch ${value === c.id ? "is-on" : ""}`}
          onClick={() => onChange(c.id)}
        >
          <RockSvg seed="swatch" t={0.75} color={c.id} thumb className="swatch__rock" />
        </button>
      ))}
      <label
        className={`swatch swatch--custom ${custom ? "is-on" : ""}`}
        title="직접 고르기"
        style={{ ["--mine" as string]: custom ? value : mine }}
      >
        {custom ? (
          <RockSvg seed="swatch" t={0.75} color={value} thumb className="swatch__rock" />
        ) : (
          <span className="swatch__wheel" aria-hidden />
        )}
        <span className="swatch__pen" aria-hidden>
          ✎
        </span>
        <input
          type="color"
          aria-label="돌 색깔 직접 고르기"
          value={custom ? value : mine}
          onClick={() => {
            // 이미 고른 내 색이 있으면 누르는 순간 그 색으로
            if (!custom) onChange(mine);
          }}
          onChange={(e) => {
            setMine(e.target.value);
            onChange(e.target.value);
          }}
        />
      </label>
    </div>
  );
}
