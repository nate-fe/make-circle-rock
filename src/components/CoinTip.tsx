"use client";

import { useEffect, useRef } from "react";
import { REWARD } from "@/lib/config";

/** 코인 칩을 누르면 아래로 펼쳐지는 "퇴근포인트 모으는 법" 쪽지. 바깥을 누르거나 Esc면 닫힌다. */
export default function CoinTip({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const down = (e: PointerEvent) => {
      const el = ref.current;
      // 칩 자체를 누른 건 칩의 onClick(토글)이 처리한다
      if (el && !el.contains(e.target as Node) && !(e.target as Element).closest?.(".coin-chip")) onClose();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [onClose]);

  const rows: [string, number][] = [
    ["레벨이 오를 때마다", REWARD.levelUp],
    ["돌을 다 동그랗게 만들면", REWARD.done],
    ["퇴근 시간 지나 도장 찍으면", REWARD.stamp],
    ["승진하면", REWARD.promote],
  ];

  return (
    <div ref={ref} className="coin-tip" role="dialog" aria-label="퇴근포인트 모으는 법">
      <p className="coin-tip__title">퇴근포인트 모으는 법</p>
      <ul className="coin-tip__list">
        {rows.map(([label, n]) => (
          <li key={label}>
            <span>{label}</span>
            <b>+{n}</b>
          </li>
        ))}
      </ul>
      <p className="coin-tip__foot">모은 포인트는 꾸미기 상점에서 써요.</p>
    </div>
  );
}
