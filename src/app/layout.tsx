import type { Metadata, Viewport } from "next";
import { Gaegu, Gowun_Dodum } from "next/font/google";
import "./globals.css";

const display = Gaegu({ weight: "700", subsets: ["latin"], variable: "--font-display", preload: false, display: "swap" });
const gowun = Gowun_Dodum({ weight: "400", subsets: ["latin"], variable: "--font-gowun", preload: false, display: "swap" });

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
