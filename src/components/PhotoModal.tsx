"use client";

import { useEffect, useMemo, useState } from "react";
import { CloseIcon } from "./Icons";

type Props = {
  blob: Blob | null;
  loading: boolean;
  filename: string;
  onClose: () => void;
};

/** 사진 저장: 다운로드, 막힌 환경(인앱 브라우저 등)이면 길게 눌러 저장 안내. */
export default function PhotoModal({ blob, loading, filename, onClose }: Props) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  const [msg, setMsg] = useState("");

  const download = () => {
    if (!url) return;
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setMsg("저장했어요.");
    } catch {
      // 저장 실패 안내도 기기에 맞게: 터치는 길게 누르기, PC는 오른쪽 클릭
      const touch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
      setMsg(touch ? "저장이 막혀 있어요. 사진을 길게 눌러 저장하세요." : "저장이 막혀 있어요. 사진을 오른쪽 클릭해서 저장하세요.");
    }
  };

  return (
    <div className="photo-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="photo" role="dialog" aria-modal="true" aria-label="사진 저장">
        <button className="icon-btn photo__close" onClick={onClose} aria-label="닫기">
          <CloseIcon />
        </button>
        <div className="photo__frame">
          {loading || !url ? <div className="photo__loading">현상 중…</div> : <img src={url} alt="저장할 사진" />}
        </div>
        <button className="btn btn--primary btn--block" disabled={!url} onClick={download}>
          사진 저장
        </button>
        {msg ? (
          <p className="photo__hint">{msg}</p>
        ) : (
          <p className="photo__hint photo__hint--touch">안 되면 사진을 길게 눌러 저장하세요.</p>
        )}
      </div>
    </div>
  );
}
