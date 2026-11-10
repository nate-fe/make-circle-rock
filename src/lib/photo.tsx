"use client";

import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import type { ReactElement } from "react";
import RockSvg from "@/components/RockSvg";
import { roundness } from "./checkin";
import { dotDate, parseDateKey } from "./date";
import { stageName } from "./config";
import { formatRecord, recordMs, recordPhrase } from "./record";
import { monthGrid } from "./shelf";
import type { Rock } from "./types";

const W = 1080;
const H = 1350;
const PAPER = "#f2ede3";
const INK = "#2b2824";

function renderToString(el: ReactElement): string {
  const host = document.createElement("div");
  const root = createRoot(host);
  flushSync(() => root.render(el));
  const html = host.innerHTML;
  root.unmount();
  return html;
}

const fontCache = new Map<string, string>();

/** 이미지로 그린 SVG는 웹폰트를 못 쓰므로, 필요한 글자만 담은 제목 폰트를 base64로 심는다. */
async function displayFontFace(text: string): Promise<string> {
  const chars = Array.from(new Set(Array.from(text))).join("");
  if (!chars.trim()) return "";
  if (fontCache.has(chars)) return fontCache.get(chars)!;
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=Gaegu:wght@700&text=${encodeURIComponent(chars)}`).then((r) => r.text());
    const url = css.match(/url\((https:[^)]+)\)/)?.[1];
    if (!url) return "";
    const buf = await fetch(url).then((r) => r.arrayBuffer());
    let bin = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const face = `@font-face{font-family:'Gaegu';font-weight:700;src:url(data:font/woff2;base64,${btoa(bin)}) format('woff2');}`;
    fontCache.set(chars, face);
    return face;
  } catch {
    return "";
  }
}

async function svgImage(svg: string, fontText = ""): Promise<HTMLImageElement> {
  let markup = svg;
  const face = fontText ? await displayFontFace(fontText) : "";
  if (face) markup = markup.replace(/<defs>/, `<defs><style>${face}</style>`);
  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

function fontVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

async function prepareCanvas() {
  const display = fontVar("--font-display", "Gaegu, sans-serif");
  const gowun = fontVar("--font-gowun", "'Gowun Dodum', sans-serif");
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  // 종이 결
  for (let i = 0; i < 2200; i++) {
    ctx.fillStyle = `rgba(90,70,40,${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  return { canvas, ctx, display, gowun };
}

async function ensureFonts(display: string, gowun: string, text: string) {
  try {
    await Promise.all([document.fonts.load(`bold 46px ${display}`, text), document.fonts.load(`40px ${gowun}`, text)]);
    await document.fonts.ready;
  } catch {
    /* 폰트 로드 실패해도 그린다 */
  }
}

function seal(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, display: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.22);
  ctx.strokeStyle = "#d4442a";
  ctx.fillStyle = "#d4442a";
  ctx.globalAlpha = 0.88;
  ctx.lineWidth = r * 0.09;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = r * 0.035;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = `bold ${r * 0.72}px ${display}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("퇴근", 0, r * 0.04);
  ctx.restore();
}

/** 배틀용 기록 딱지: 주황 종이에 "완성 기록 / 1분 52.3초" */
function recordTag(ctx: CanvasRenderingContext2D, x: number, y: number, lv: string, record: string, display: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.06);
  ctx.font = `bold 66px ${display}`;
  const w = Math.max(340, ctx.measureText(record).width + 70);
  const h = 168;
  ctx.fillStyle = "rgba(43,40,36,.18)";
  ctx.fillRect(6, 8, w, h);
  ctx.fillStyle = "#e0643a";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#2b2824";
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, w, h);
  ctx.fillStyle = "#fffaf0";
  ctx.textAlign = "left";
  ctx.font = `bold 36px ${display}`;
  ctx.fillText(`출근 후 완성까지 · ${lv}`, 34, 58);
  ctx.font = `bold 66px ${display}`;
  ctx.fillText(record, 34, 132);
  ctx.restore();
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/png"));
}

export async function todayPhoto(rock: Rock): Promise<Blob> {
  const { canvas, ctx, display, gowun } = await prepareCanvas();
  const t = roundness(rock.rub, rock.maxLv);
  const title = `${rock.name} ${rock.no}호 · ${stageName(t)}`;
  const ms = rock.done ? recordMs(rock) : null;
  const record = ms === null ? null : ms <= 0 ? "출근 전" : formatRecord(ms);
  const cheat = (rock.cheats ?? 0) > 0;
  const sub = ms !== null ? `${recordPhrase(ms)} 동그랗게 만들었다${cheat ? " (치트 사용)" : ""}` : `오늘 ${rock.rub.toLocaleString()}번 문질렀다`;
  const foot = `${dotDate(rock.date)}  퇴근돌 키우기`;
  await ensureFonts(display, gowun, title + sub + foot + "완성 기록Lv." + (record ?? ""));

  const svg = renderToString(<RockSvg seed={rock.date} t={t} name={rock.name} wear={rock.wear} color={rock.color} face={t >= 1 ? "done" : "idle"} ghost />);
  const img = await svgImage(svg, rock.name + "상무 " + rock.name);
  const iw = 860;
  const ih = (iw * 320) / 300;
  ctx.drawImage(img, (W - iw) / 2, 90, iw, ih);

  if (rock.stamp) seal(ctx, W - 210, 210, 92, display);
  if (record) recordTag(ctx, 70, 70, `Lv.${rock.maxLv}${cheat ? " · 치트" : ""}`, record, display);

  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.font = `bold 78px ${display}`;
  ctx.fillText(title, W / 2, 1090);
  ctx.font = `42px ${gowun}`;
  ctx.fillStyle = "#5f584f";
  ctx.fillText(sub, W / 2, 1160);

  ctx.strokeStyle = "rgba(43,40,36,.25)";
  ctx.setLineDash([10, 10]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 1226);
  ctx.lineTo(W - 120, 1226);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = `bold 37px ${display}`;
  ctx.fillStyle = "#8a8378";
  ctx.fillText(foot, W / 2, 1284);
  return toBlob(canvas);
}

export async function shelfPhoto(
  year: number,
  month: number,
  rocks: Rock[],
  doneThisMonth: number,
  rankLabel: string,
): Promise<Blob> {
  const { canvas, ctx, display, gowun } = await prepareCanvas();
  const title = `${year}년 ${month + 1}월의 돌들`;
  const foot = `완성 ${doneThisMonth}개 · ${rankLabel}`;
  await ensureFonts(display, gowun, title + foot + "월화수목금토일휴무퇴근돌키우기0123456789");

  ctx.textAlign = "center";
  ctx.fillStyle = INK;
  ctx.font = `bold 87px ${display}`;
  ctx.fillText(title, W / 2, 150);

  const byDate = new Map(rocks.map((r) => [r.date, r]));
  const weeks = monthGrid(year, month);
  const gx = 70;
  const cw = (W - gx * 2) / 7;
  const top = 250;
  const rh = Math.min(150, 860 / weeks.length);

  ctx.font = `30px ${gowun}`;
  ctx.fillStyle = "#8a8378";
  ["월", "화", "수", "목", "금", "토", "일"].forEach((d, i) => ctx.fillText(d, gx + cw * i + cw / 2, top - 20));

  for (let w = 0; w < weeks.length; w++) {
    const y = top + w * rh;
    // 진열대 선반
    ctx.fillStyle = "#c9b79a";
    ctx.fillRect(gx - 10, y + rh - 14, W - gx * 2 + 20, 8);
    ctx.fillStyle = "rgba(90,70,40,.15)";
    ctx.fillRect(gx - 10, y + rh - 6, W - gx * 2 + 20, 4);
    for (let d = 0; d < 7; d++) {
      const key = weeks[w][d];
      if (!key) continue;
      const x = gx + cw * d;
      const rock = byDate.get(key);
      const day = parseDateKey(key).getDate();
      ctx.font = `22px ${gowun}`;
      ctx.fillStyle = "#a59c8e";
      ctx.textAlign = "left";
      ctx.fillText(String(day), x + 8, y + 26);
      ctx.textAlign = "center";
      if (!rock) continue;
      if (rock.off) {
        ctx.font = `bold 32px ${display}`;
        ctx.fillStyle = "#a59c8e";
        ctx.fillText("휴무", x + cw / 2, y + rh / 2 + 10);
        continue;
      }
      const t = roundness(rock.rub, rock.maxLv);
      const img = await svgImage(renderToString(<RockSvg seed={rock.date} t={t} wear={rock.wear} color={rock.color} thumb />));
      const s = rh - 16;
      ctx.drawImage(img, x + (cw - s * (236 / 286)) / 2, y - 2, s * (236 / 286), s);
      if (rock.stamp) {
        ctx.fillStyle = "#d4442a";
        ctx.beginPath();
        ctx.arc(x + cw - 16, y + 20, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.fillStyle = INK;
  ctx.font = `bold 60px ${display}`;
  ctx.fillText(foot, W / 2, H - 150);
  ctx.font = `bold 37px ${display}`;
  ctx.fillStyle = "#8a8378";
  ctx.fillText("퇴근돌 키우기", W / 2, H - 80);
  return toBlob(canvas);
}
