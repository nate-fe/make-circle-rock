"use client";

import { useEffect, useRef, useState } from "react";
import Sheet from "./Sheet";
import { NAME_MAX } from "@/lib/config";
import { maxLevel } from "@/lib/checkin";
import { DEFAULT_COLOR, colorById } from "@/lib/colors";
import ColorPicker from "./ColorPicker";
import type { SaveData } from "@/lib/types";

type Props = {
  open: boolean;
  save: SaveData;
  storageOk: boolean;
  onClose: () => void;
  onSave: (patch: { name: string; defIn: string; defOut: string; color: string }) => void;
  onReset: () => void;
};

export default function SettingsSheet({ open, save, storageOk, onClose, onSave, onReset }: Props) {
  const [name, setName] = useState(save.name);
  // 출근한 날엔 오늘 시간을 보여주고, 바꾸면 오늘 돌에도 바로 적용된다 (Game의 onSave)
  const working = !!save.today && !save.today.off;
  const [defIn, setIn] = useState(working ? save.today!.inT : save.defIn);
  const [defOut, setOut] = useState(working ? save.today!.outT : save.defOut);
  const [color, setColor] = useState(save.color ?? DEFAULT_COLOR);
  const [armed, setArmed] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const valid = name.trim() && maxLevel(defIn, defOut) > 0;

  const reset = () => {
    if (armed) {
      window.clearTimeout(timer.current);
      setArmed(false);
      onReset();
      return;
    }
    setArmed(true);
    timer.current = window.setTimeout(() => setArmed(false), 3000);
  };

  return (
    <Sheet open={open} onClose={onClose} title="설정" className="settings">
      {!storageOk && <p className="notice">이 브라우저에선 기록을 저장할 수 없어요. 창을 닫으면 사라져요.</p>}
      <label className="form-row">
        <span>돌 이름</span>
        <input className="field" value={name} onChange={(e) => setName(Array.from(e.target.value).slice(0, NAME_MAX).join(""))} />
      </label>
      <div className="form-row">
        <span>
          돌 색깔 · <b className="swatch-name">{colorById(color).name}</b>
        </span>
        <ColorPicker value={color} onChange={setColor} />
      </div>
      <div className="form-row">
        <span>출퇴근 시간{working && <small className="form-row__note"> · 오늘부터 적용</small>}</span>
        <div className="form-row__times">
          <input className="field" type="time" value={defIn} onChange={(e) => setIn(e.target.value || defIn)} />
          <span aria-hidden>―</span>
          <input className="field" type="time" value={defOut} onChange={(e) => setOut(e.target.value || defOut)} />
        </div>
      </div>
      <button className="btn btn--primary btn--block" disabled={!valid} onClick={() => onSave({ name: name.trim(), defIn, defOut, color })}>
        저장
      </button>

      <hr className="rule" />
      <button className={`btn btn--block btn--danger ${armed ? "is-armed" : ""}`} onClick={reset}>
        {armed ? "한 번 더 누르면 전부 지워져요" : "처음부터 다시 하기"}
      </button>
      <p className="settings__fine">진열장, 퇴근포인트, 꾸밈까지 모두 사라져요.</p>
    </Sheet>
  );
}
