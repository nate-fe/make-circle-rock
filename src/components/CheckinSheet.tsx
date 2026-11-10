"use client";

import { useState } from "react";
import Sheet from "./Sheet";
import { formatDuration, maxLevel, workMinutes } from "@/lib/checkin";
import { isWeekend, longDate } from "@/lib/date";
import { DEFAULT_COLOR, colorById } from "@/lib/colors";
import ColorPicker from "./ColorPicker";

type Props = {
  open: boolean;
  dateKey: string;
  initialIn: string;
  initialOut: string;
  initialColor?: string;
  editing: boolean; // 이미 체크인한 뒤 시간 수정
  canTakeOff: boolean;
  onSubmit: (inT: string, outT: string, color: string) => void;
  onOff: () => void;
  onClose?: () => void;
};

export default function CheckinSheet({ open, dateKey, initialIn, initialOut, initialColor, editing, canTakeOff, onSubmit, onOff, onClose }: Props) {
  const [inT, setIn] = useState(initialIn);
  const [outT, setOut] = useState(initialOut);
  const [color, setColor] = useState(initialColor ?? DEFAULT_COLOR);
  const weekend = isWeekend(dateKey);
  const [working, setWorking] = useState(editing || !weekend);
  const lv = maxLevel(inT, outT);
  const valid = lv > 0;

  return (
    <Sheet open={open} onClose={onClose} className="checkin">
      <p className="checkin__date">{longDate(dateKey)}</p>
      <h2 className="checkin__q">{editing ? "오늘 돌을 바꿀까요?" : working ? "출근했어요?" : "주말이에요. 오늘은 쉬죠?"}</h2>

      {working ? (
        <>
          <div className="timecard">
            <label className="timecard__slot">
              <span>출근</span>
              <input type="time" value={inT} onChange={(e) => setIn(e.target.value || inT)} />
            </label>
            <span className="timecard__dash" aria-hidden>
              ―
            </span>
            <label className="timecard__slot">
              <span>퇴근</span>
              <input type="time" value={outT} onChange={(e) => setOut(e.target.value || outT)} />
            </label>
          </div>
          <div className="checkin__color">
            <p className="checkin__label">
              오늘 돌 색깔 · <b>{colorById(color).name}</b>
            </p>
            <ColorPicker value={color} onChange={setColor} compact />
          </div>
          <p className={`checkin__calc ${valid ? "" : "is-error"}`}>
            {valid ? (
              <>
                <span>
                  회사에서 {formatDuration(workMinutes(inT, outT))} → 최대 <b>Lv.{lv}</b>
                </span>
              </>
            ) : (
              "퇴근 시간은 출근 시간보다 늦어야 해요"
            )}
          </p>
          <button className="btn btn--primary btn--block" disabled={!valid} onClick={() => onSubmit(inT, outT, color)}>
            {editing ? "이대로 바꾸기" : "출근 완료"}
          </button>
          {canTakeOff && (
            <button className="text-btn" onClick={onOff}>
              오늘은 쉬어요
            </button>
          )}
        </>
      ) : (
        <>
          <p className="checkin__calc">쉬는 날엔 돌도 쉬어요. 진열장엔 &lsquo;휴무&rsquo;로 남아요.</p>
          <button className="btn btn--primary btn--block" onClick={onOff}>
            오늘은 쉬어요
          </button>
          <button className="text-btn" onClick={() => setWorking(true)}>
            주말 출근했어요
          </button>
        </>
      )}
    </Sheet>
  );
}
