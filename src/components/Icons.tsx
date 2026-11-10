// 손으로 그린 느낌의 작은 아이콘들. 이모지 대신 쓴다.
type P = { size?: number; className?: string };
const ink = "#2b2824";

export function CoinIcon({ size = 20, className }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12.6" r="9.4" fill="#b8861a" />
      <circle cx="12" cy="11.4" r="9.4" fill="#e2b43a" stroke={ink} strokeWidth="1.6" />
      <circle cx="12" cy="11.4" r="6.2" fill="none" stroke="#a87e1a" strokeWidth="1.2" />
      <path d="M9.2 9.2h5.6M12 9.2v5.2M9.6 14.4h4.8" stroke="#7a5a10" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ShelfIcon({ size = 22, className }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="3" width="17" height="18" rx="2" />
      <path d="M3.5 12h17" />
      <ellipse cx="9" cy="9.4" rx="2.6" ry="2.1" fill="#b9ad98" />
      <path d="M13.5 10.6c.4-2 2.8-2.6 4-.8" />
      <ellipse cx="15" cy="18.2" rx="2.8" ry="2" fill="#b9ad98" />
      <path d="M6.5 18.6h2.6" />
    </svg>
  );
}

export function GearIcon({ size = 22, className }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5" />
      <circle cx="12" cy="12" r="5.2" />
      <circle cx="12" cy="12" r="1.8" fill={ink} />
    </svg>
  );
}

export function SealIcon({ size = 22, className }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M9 3.5h6v6.5H9z" fill="#6b4630" stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 10h12v4H6z" fill="#8a5a3a" stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M5 17.5h14" stroke="#fffdf8" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M7 14v3.5h10V14" fill="none" stroke={ink} strokeWidth="1.6" />
    </svg>
  );
}

export function HangerIcon({ size = 22, className }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 6.2a2.2 2.2 0 1 1 3 2c-.7.3-1 .9-1 1.6v.8" />
      <path d="M12 10.6 3.4 16.4c-.8.6-.4 1.8.6 1.8h16c1 0 1.4-1.2.6-1.8z" fill="#ffe27a" />
    </svg>
  );
}

export function CameraIcon({ size = 22, className }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 8.2c0-1 .8-1.7 1.7-1.7h2.2l1.4-2h6.4l1.4 2h2.2c1 0 1.7.8 1.7 1.7v9.6c0 1-.8 1.7-1.7 1.7H5.2c-1 0-1.7-.8-1.7-1.7z" fill="#fffdf8" />
      <circle cx="12" cy="13" r="3.6" fill="#cfe3dc" />
      <path d="M17.6 9.4h.01" strokeWidth="2.4" />
    </svg>
  );
}

export function CloseIcon({ size = 20, className }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M6 6.5 18 17.5M18 6.5 6 17.5" />
    </svg>
  );
}

export function ArrowIcon({ dir = "left", size = 18 }: { dir?: "left" | "right"; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === "left" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}
