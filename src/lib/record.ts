import { atTime } from "./date";

type Day = { date: string; inT: string; doneAt?: number };

/** 출근 시각부터 완성 순간까지 걸린 시간(ms). 출근 전에 완성했으면 0. 미완성이면 null. */
export function recordMs(rock: Day): number | null {
  if (rock.doneAt == null) return null;
  return Math.max(0, rock.doneAt - atTime(rock.date, rock.inT).getTime());
}

/** 출근 후 지금까지 흐른 시간(ms). 출근 전이면 0. */
export function sinceClockIn(rock: Day, now: Date): number {
  return Math.max(0, now.getTime() - atTime(rock.date, rock.inT).getTime());
}

/** 3시간 12분 / 42분 / 1분 미만 */
export function formatRecord(ms: number): string {
  const mins = Math.floor(ms / 60_000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h && !m) return "1분 미만";
  if (!h) return `${m}분`;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

/** "출근 3시간 12분 만에" / "출근 전에" */
export function recordPhrase(ms: number): string {
  return ms <= 0 ? "출근 전에" : `출근 ${formatRecord(ms)} 만에`;
}

/** 진행 중 스톱워치: 2:41:05 */
export function stopwatch(ms: number): string {
  const s = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
