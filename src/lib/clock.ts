import type { Rock } from "./types";
import { atTime, hms } from "./date";

export type WorkPhase = "none" | "before" | "working" | "over" | "stamped" | "off";

export type ClockInfo = {
  phase: WorkPhase;
  label: string;
  value: string;
  progress: number; // 0~1 근무 진행
  msLeft: number; // 퇴근까지 남은 ms (음수면 초과)
};

export function clockInfo(today: Rock | null, now: Date): ClockInfo {
  if (!today) return { phase: "none", label: "", value: "출근 체크인", progress: 0, msLeft: 0 };
  if (today.off) return { phase: "off", label: "", value: "오늘은 쉬는 날", progress: 0, msLeft: 0 };
  const start = atTime(today.date, today.inT).getTime();
  const end = atTime(today.date, today.outT).getTime();
  const t = now.getTime();
  const msLeft = end - t;
  if (today.stamp) return { phase: "stamped", label: "", value: "수고했어요", progress: 1, msLeft };
  if (t < start) return { phase: "before", label: "출근까지", value: hms(start - t), progress: 0, msLeft };
  if (t < end) {
    return {
      phase: "working",
      label: "퇴근까지",
      value: hms(end - t),
      progress: (t - start) / (end - start),
      msLeft,
    };
  }
  return { phase: "over", label: "초과", value: "+" + hms(t - end), progress: 1, msLeft };
}

export function canStamp(today: Rock | null, now: Date): boolean {
  if (!today || today.off || today.stamp) return false;
  return now.getTime() >= atTime(today.date, today.outT).getTime();
}
