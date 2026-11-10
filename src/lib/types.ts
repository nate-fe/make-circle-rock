export type Rock = {
  date: string; // 'YYYY-MM-DD' (로컬)
  no: number; // 몇 호 (출근한 날 순서). 휴무는 0
  name: string; // 그날 새긴 이름
  inT: string; // 'HH:MM'
  outT: string;
  maxLv: number; // 1~16
  rub: number; // 그날 문지름
  done: boolean; // 둥글기 100% 도달
  stamp: boolean; // 퇴근 도장
  wear: string[]; // 그날 착용한 꾸밈
  color?: string; // 그날 돌 색깔 (ROCK_COLORS id 또는 직접 고른 "#rrggbb")
  off?: boolean; // 휴무
  paidLv?: number; // 레벨업 보상을 준 최고 레벨
  doneBonus?: boolean; // 완성 보너스 지급 여부
  doneAt?: number; // 완성한 순간 (epoch ms). 기록 = doneAt - 출근 시각
  cheats?: number; // 광고 보고 쓴 치트키 횟수. 1 이상이면 기록에 "치트" 표시, 개인 최고에서 제외
  offers?: number; // 오늘 치트키 제안 카드가 뜬 횟수
  offerOff?: boolean; // 오늘 제안을 닫음 → 다시 안 띄움
};

export type SaveData = {
  name: string;
  coins: number;
  owned: string[];
  wear: string[];
  seen: string[];
  defIn: string;
  defOut: string;
  streak: number;
  best: number;
  doneCount: number;
  rank: number; // 도달한 최고 직급 (승진 보상 1회용)
  named: boolean;
  color?: string; // 돌 색깔. 매일 새 돌에 적용
  today: Rock | null;
  shelf: Rock[];
};

export type Slot = "head" | "face" | "body" | "left" | "right" | "floor";
