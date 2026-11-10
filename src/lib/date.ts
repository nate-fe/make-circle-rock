// 날짜는 항상 로컬 시간 기준. toISOString() 금지 (UTC라 아침 9시 전에 날짜가 밀림).

const pad = (n: number) => String(n).padStart(2, "0");

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

export function isWeekend(key: string): boolean {
  const day = parseDateKey(key).getDay();
  return day === 0 || day === 6;
}

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

export function weekdayName(key: string): string {
  return WEEKDAY[parseDateKey(key).getDay()];
}

/** 11월 6일 금요일 */
export function longDate(key: string): string {
  const d = parseDateKey(key);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAY[d.getDay()]}요일`;
}

/** 2026.11.06 */
export function dotDate(key: string): string {
  return key.replace(/-/g, ".");
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** 그 날짜의 HH:MM 시각 */
export function atTime(key: string, hhmm: string): Date {
  const d = parseDateKey(key);
  const mins = toMinutes(hhmm);
  d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
  return d;
}

export function hms(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
