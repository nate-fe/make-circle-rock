"use client";

import { useState } from "react";
import Sheet from "./Sheet";
import RockSvg from "./RockSvg";
import { ArrowIcon, CameraIcon } from "./Icons";
import { monthGrid } from "@/lib/shelf";
import { dotDate, longDate, parseDateKey, isWeekend } from "@/lib/date";
import { formatDuration, roundness, workMinutes } from "@/lib/checkin";
import { stageName } from "@/lib/config";
import { recordMs, recordPhrase } from "@/lib/record";
import type { Rock } from "@/lib/types";

type Props = {
  open: boolean;
  rocks: Rock[];
  todayKey: string;
  totalDone: number;
  streak: number;
  onClose: () => void;
  onPhoto: (year: number, month: number) => void;
};

const DOW = ["월", "화", "수", "목", "금", "토", "일"];

export function doneIn(rocks: Rock[], year: number, month: number) {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  return rocks.filter((r) => r.date.startsWith(prefix) && r.done && !r.off).length;
}

export default function ShelfSheet({ open, rocks, todayKey, totalDone, streak, onClose, onPhoto }: Props) {
  const base = parseDateKey(todayKey);
  const [ym, setYm] = useState({ y: base.getFullYear(), m: base.getMonth() });
  const [picked, setPicked] = useState<Rock | null>(null);
  const byDate = new Map(rocks.map((r) => [r.date, r]));
  const weeks = monthGrid(ym.y, ym.m);
  const monthDone = doneIn(rocks, ym.y, ym.m);

  const move = (d: number) => {
    const dt = new Date(ym.y, ym.m + d, 1);
    setYm({ y: dt.getFullYear(), m: dt.getMonth() });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      full
      className="shelf"
      title="진열장"
      headerRight={
        <button className="icon-btn" onClick={() => onPhoto(ym.y, ym.m)} aria-label="이번 달 진열장 사진">
          <CameraIcon />
        </button>
      }
    >
      <div className="shelf__month">
        <button className="icon-btn" onClick={() => move(-1)} aria-label="이전 달">
          <ArrowIcon dir="left" />
        </button>
        <strong>
          {ym.y}년 {ym.m + 1}월
        </strong>
        <button className="icon-btn" onClick={() => move(1)} aria-label="다음 달">
          <ArrowIcon dir="right" />
        </button>
      </div>
      <p className="shelf__summary">
        이번 달 완성 <b>{monthDone}</b>개 · 총 <b>{totalDone}</b>개{streak > 1 && <> · 연속 출근 {streak}일</>}
      </p>

      <div className="cabinet">
        <div className="cabinet__dow">
          {DOW.map((d, i) => (
            <span key={d} className={i >= 5 ? "is-weekend" : ""}>
              {d}
            </span>
          ))}
        </div>
        {weeks.map((w, wi) => (
          <div className="cabinet__row" key={wi}>
            {w.map((key, di) => {
              if (!key) return <span key={di} className="cell is-empty" />;
              const rock = byDate.get(key);
              const day = parseDateKey(key).getDate();
              const isToday = key === todayKey;
              if (!rock) {
                return (
                  <span key={key} className={`cell ${isToday ? "is-today" : ""}`}>
                    <i className="cell__day">{day}</i>
                    {isWeekend(key) && <span className="cell__dot">·</span>}
                  </span>
                );
              }
              if (rock.off) {
                return (
                  <span key={key} className={`cell is-off ${isToday ? "is-today" : ""}`}>
                    <i className="cell__day">{day}</i>
                    <span className="cell__off">휴무</span>
                  </span>
                );
              }
              const t = roundness(rock.rub, rock.maxLv);
              return (
                <button key={key} className={`cell is-rock ${isToday ? "is-today" : ""}`} onClick={() => setPicked(rock)}>
                  <i className="cell__day">{day}</i>
                  {rock.stamp && <span className="cell__stamp" aria-label="퇴근 도장" />}
                  <RockSvg seed={rock.date} t={t} wear={rock.wear} color={rock.color} thumb className="cell__rock" />
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <p className="shelf__legend">덜 문지른 날의 네모난 돌도 그날의 기록이에요.</p>

      {picked && <RockDetail rock={picked} onClose={() => setPicked(null)} />}
    </Sheet>
  );
}

function RockDetail({ rock, onClose }: { rock: Rock; onClose: () => void }) {
  const t = roundness(rock.rub, rock.maxLv);
  return (
    <div className="detail-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="detail" role="dialog" aria-modal="true">
        <div className="detail__tag">
          {rock.name} {rock.no}호
        </div>
        <RockSvg seed={rock.date} t={t} name={rock.name} wear={rock.wear} color={rock.color} face={t >= 1 ? "done" : "idle"} className="detail__rock" />
        {rock.stamp && <div className="detail__seal">퇴근</div>}
        <dl className="ledger">
          <div>
            <dt>날짜</dt>
            <dd>
              {dotDate(rock.date)} <small>{longDate(rock.date).split(" ").pop()}</small>
            </dd>
          </div>
          <div>
            <dt>회사에서</dt>
            <dd>
              {rock.inT}–{rock.outT} <small>{formatDuration(workMinutes(rock.inT, rock.outT))}</small>
            </dd>
          </div>
          <div>
            <dt>문지름</dt>
            <dd>{rock.rub.toLocaleString()}번</dd>
          </div>
          <div>
            <dt>둥글기</dt>
            <dd>
              {Math.round(t * 100)}% <small>{stageName(t)}</small>
            </dd>
          </div>
          {rock.done && recordMs(rock) !== null ? (
            <div>
              <dt>완성 기록</dt>
              <dd className="ledger__record">
                {recordPhrase(recordMs(rock)!)}
                {rock.cheats ? <small> · 치트</small> : null}
              </dd>
            </div>
          ) : null}
          <div>
            <dt>퇴근 도장</dt>
            <dd>{rock.stamp ? "쾅" : "—"}</dd>
          </div>
        </dl>
        <button className="btn btn--block" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
