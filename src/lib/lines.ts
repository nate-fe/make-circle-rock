import { clockInfo } from "./clock";
import { roundness } from "./checkin";
import { fillName, itemById } from "./items";
import type { SaveData } from "./types";

// 상황 키 → 대사 배열. 여기만 고치면 대사가 늘어난다.
export const LINES = {
  newRock: ["오늘의 돌이에요. 아직 많이 각졌죠?"],
  before: ["출근 전부터 저를 찾다니… 감동이에요."],
  workLong: ["오전엔 원래 시간이 안 가요.", "점심 메뉴는 정했어요?", "회의 중에 문지르는 거 아니죠?"],
  workMid: ["반 넘게 왔어요!", "오후 3시의 졸음, 돌도 압니다."],
  workShort: ["퇴근 한 시간 전. 마음은 이미 지하철.", "가방 슬쩍 챙겨둬요."],
  rubbing: ["모서리가 깎이는 느낌…", "닳는다 닳아~", "퇴근 기운 충전 중"],
  earlyDone: ["벌써요? 오늘 많이 힘들었구나…"],
  done: ["다 동그래졌어요. 이제 퇴근만 남았네요."],
  doneRub: ["이미 동그래요. 퇴근하세요."],
  over: ["퇴근하세요. 진심으로.", "야근이에요…? 저도 같이 있을게요."],
  stamped: ["내일 또 문질러 줘요. 조심히 들어가요!"],
  off: ["오늘은 쉬는 날. 돌도 쉬어요.", "푹 쉬세요."],
  fullSet: ["풀착장 완료. 오늘 회의 저 혼자 가도 될 것 같아요."],
  promote: ["저희 승진했어요! 이제 {직급}이에요. 상점에 신상 들어왔대요."],
  noCheckin: ["오늘 몇 시에 퇴근해요?"],
} satisfies Record<string, string[]>;

export type LineKey = keyof typeof LINES;

export function pick<T>(arr: readonly T[], rnd = Math.random): T {
  return arr[Math.floor(rnd() * arr.length)];
}

export function lineOf(key: LineKey, vars: Record<string, string> = {}): string {
  let s = pick(LINES[key]);
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

/** 20초마다 바뀌는 상황 대사 */
export function ambientLine(save: SaveData, now: Date, rnd = Math.random): string {
  const today = save.today;
  if (!today) return lineOf("noCheckin");
  if (today.off) return lineOf("off");

  const worn = save.wear.map(itemById).filter(Boolean);
  const slots = new Set(worn.map((i) => i!.slot));
  if (slots.size >= 6 && rnd() < 0.2) return lineOf("fullSet");
  if (worn.length && rnd() < 0.2) return fillName(pick(worn, rnd)!.line, today.name);

  const info = clockInfo(today, now);
  const t = roundness(today.rub, today.maxLv);
  if (info.phase === "stamped") return lineOf("stamped");
  if (info.phase === "over") return lineOf("over");
  if (t >= 1) {
    return info.msLeft >= 3 * 3600_000 ? lineOf("earlyDone") : lineOf("done");
  }
  if (info.phase === "before") return lineOf("before");
  if (today.rub === 0 && rnd() < 0.5) return lineOf("newRock");
  const h = info.msLeft / 3600_000;
  if (h >= 4) return lineOf("workLong");
  if (h >= 1) return lineOf("workMid");
  return lineOf("workShort");
}
