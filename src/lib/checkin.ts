import { MAX_LEVEL_CAP, RUB_PER_LEVEL } from "./config";
import { toMinutes } from "./date";

/** 근무 시간(시간 단위 올림) = 오늘 최대 레벨. 퇴근이 출근보다 이르거나 같으면 0. */
export function maxLevel(inT: string, outT: string): number {
  const diff = toMinutes(outT) - toMinutes(inT);
  if (diff <= 0) return 0;
  return Math.min(MAX_LEVEL_CAP, Math.max(1, Math.ceil(diff / 60)));
}

export function workMinutes(inT: string, outT: string): number {
  return Math.max(0, toMinutes(outT) - toMinutes(inT));
}

export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}분`;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

export function roundness(rub: number, maxLv: number): number {
  if (maxLv <= 0) return 0;
  return Math.min(1, rub / (maxLv * RUB_PER_LEVEL));
}

export function levelOf(rub: number, maxLv: number): number {
  return Math.min(maxLv, Math.floor(rub / RUB_PER_LEVEL));
}

export function rubsToNextLevel(rub: number, maxLv: number): number {
  const lv = levelOf(rub, maxLv);
  if (lv >= maxLv) return 0;
  return (lv + 1) * RUB_PER_LEVEL - rub;
}

