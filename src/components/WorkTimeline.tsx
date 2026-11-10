"use client";

import { atTime, hms } from "@/lib/date";
import { recordMs, stopwatch } from "@/lib/record";
import type { Rock } from "@/lib/types";

type Props = { today: Rock | null; now: Date; onEdit: () => void };

/**
 * 출근 후 경과 시간과 퇴근까지 남은 시간을 한 줄 타임라인으로.
 * 돌을 완성하면 왼쪽 시계가 그 순간에 멈추고, 바 위에 완성 지점이 별로 남는다.
 */
export default function WorkTimeline({ today, now, onEdit }: Props) {
  if (!today) {
    return (
      <div className="timeline is-empty">
        <span className="timeline__label">오늘 출퇴근 시간을 정하면 시계가 돌아가요</span>
      </div>
    );
  }
  if (today.off) {
    return (
      <button className="timeline is-empty" onClick={onEdit} aria-label="출퇴근 시간 수정">
        <span className="timeline__value is-green">오늘은 쉬는 날</span>
      </button>
    );
  }

  const start = atTime(today.date, today.inT).getTime();
  const end = atTime(today.date, today.outT).getTime();
  const t = now.getTime();
  const span = Math.max(1, end - start);
  const frac = Math.max(0, Math.min(1, (t - start) / span));
  const rec = today.done ? recordMs(today) : null; // 퇴근 시간을 늘려 다시 미완성이면 시계도 다시 돈다
  const doneFrac = rec === null ? null : Math.max(0, Math.min(1, rec / span));

  // 왼쪽: 출근 기준 (완성하면 멈춘다)
  let left: { label: string; value: string; tone?: string };
  if (rec !== null) left = { label: "완성", value: rec <= 0 ? "출근 전" : stopwatch(rec), tone: "is-gold" };
  else if (t < start) left = { label: "출근까지", value: hms(start - t) };
  else left = { label: "출근 후", value: stopwatch(t - start), tone: "is-live" };

  // 오른쪽: 퇴근 기준
  let right: { label: string; value: string; tone?: string };
  if (today.stamp) right = { label: "퇴근 완료", value: "수고했어요", tone: "is-green" };
  else if (t >= end) right = { label: "초과", value: "+" + hms(t - end), tone: "is-orange" };
  else right = { label: "퇴근까지", value: hms(end - t) };

  return (
    <button className="timeline" onClick={onEdit} aria-label="출퇴근 시간 수정">
      <span className="timeline__row">
        <span className="timeline__side">
          <span className="timeline__label">{left.label}</span>
          <span className={`timeline__value ${left.tone ?? ""}`}>{left.value}</span>
        </span>
        <span className="timeline__side is-right">
          <span className="timeline__label">{right.label}</span>
          <span className={`timeline__value ${right.tone ?? ""}`}>{right.value}</span>
        </span>
      </span>
      <span className="timeline__track-row">
        <span className="timeline__time">{today.inT}</span>
        <span className="timeline__track">
          <i style={{ width: `${frac * 100}%` }} />
          {doneFrac !== null && (
            <b className="timeline__star" style={{ left: `${doneFrac * 100}%` }} aria-label="완성 지점">
              ✦
            </b>
          )}
          {doneFrac === null && t >= start && t < end && <em className="timeline__now" style={{ left: `${frac * 100}%` }} />}
        </span>
        <span className="timeline__time">{today.outT}</span>
      </span>
    </button>
  );
}
