import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// 폰트는 src/app/fonts에 들어 있다 (Google Fonts 원본에서 앱에 쓰는 글자만 남긴 woff2, OFL).
// 다시 만들려면 README "폰트" 참고.
const display = localFont({
  src: "./fonts/Gaegu-Bold.woff2",
  weight: "700",
  variable: "--font-display",
  display: "swap",
  fallback: ["sans-serif"],
});
const gowun = localFont({
  src: "./fonts/GowunDodum-Regular.woff2",
  weight: "400",
  variable: "--font-gowun",
  display: "swap",
  fallback: ["sans-serif"],
});

export const metadata: Metadata = {
  title: "퇴근돌 키우기",
  description: "퇴근하고 싶을 때마다 문지르는 돌. 오늘 근무 시간만큼 문지르면 동그래져요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f2ede3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${display.variable} ${gowun.variable}`}>
      <body>{children}</body>
    </html>
  );
}
