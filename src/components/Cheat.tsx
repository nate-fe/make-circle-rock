"use client";

import { useEffect, useState } from "react";
import { CHEAT } from "@/lib/config";
import { CloseIcon } from "./Icons";

/** 옆에서 빼꼼 나오는 치트키 제안 쪽지 */
export function CheatOffer({ onWatch, onClose }: { onWatch: () => void; onClose: () => void }) {
  return (
    <aside className="cheat-offer" role="dialog" aria-label="치트키 제안">
      <button className="cheat-offer__x" onClick={onClose} aria-label="오늘은 그만 보기">
        <CloseIcon size={14} />
      </button>
      <p className="cheat-offer__kicker">비밀 치트키</p>
      <p className="cheat-offer__title">
        {CHEAT.boostMs / 1000}초간
        <br />
        문지름 <b>{CHEAT.multiplier}배</b>
      </p>
      <button className="cheat-offer__go" onClick={onWatch}>
        광고 {CHEAT.adSeconds}초 보기
      </button>
    </aside>
  );
}

/**
 * 광고 자리. 지금은 가짜 화면이고, 실제 보상형 광고(AdSense H5 / Ad Manager)를 붙일 때
 * 이 컴포넌트 안만 바꾸면 된다. 끝까지 보면 onReward.
 */
export function AdModal({ onReward, onClose }: { onReward: () => void; onClose: () => void }) {
  const [left, setLeft] = useState<number>(CHEAT.adSeconds);
  const done = left <= 0;

  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => {
      const remain = CHEAT.adSeconds - Math.floor((Date.now() - started) / 1000);
      setLeft(Math.max(0, remain));
      if (remain <= 0) window.clearInterval(id);
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  const progress = 1 - left / CHEAT.adSeconds;

  return (
    <div className="ad-backdrop">
      <div className="ad" role="dialog" aria-modal="true" aria-label="광고">
        <div className="ad__bar">
          <span className="ad__tag">광고</span>
          <span className="ad__count">{done ? "다 봤어요" : `${left}초 남음`}</span>
          <button className="icon-btn ad__x" onClick={onClose} aria-label="광고 닫기">
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="ad__screen">
          <p className="ad__placeholder">광고가 들어갈 자리</p>
          <p className="ad__sub">소리 없이 재생돼요 · 테스트 화면</p>
        </div>
        <div className="ad__progress" aria-hidden>
          <i style={{ width: `${progress * 100}%` }} />
        </div>
        {done ? (
          <button className="btn btn--primary btn--block" onClick={onReward}>
            치트키 받기 · {CHEAT.boostMs / 1000}초간 {CHEAT.multiplier}배
          </button>
        ) : (
          <p className="ad__hint">끝까지 보면 치트키를 받아요. 지금 닫으면 못 받아요.</p>
        )}
      </div>
    </div>
  );
}
