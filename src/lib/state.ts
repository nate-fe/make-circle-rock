import { CHEAT, DEFAULT_NAME, NAME_MAX, RANKS, REWARD, STORAGE_KEY, rankIndexFor } from "./config";
import { maxLevel, levelOf, roundness } from "./checkin";
import { addDays, atTime, dateKey, isWeekend } from "./date";
import { ITEMS, itemById } from "./items";
import { recordMs } from "./record";
import type { Rock, SaveData } from "./types";

export type GameEvent =
  | { type: "level"; lv: number }
  | { type: "done" }
  | { type: "promote"; rank: number }
  | { type: "stamp" }
  | { type: "coins"; amount: number };

export function defaultSave(): SaveData {
  return {
    name: DEFAULT_NAME,
    coins: REWARD.start,
    owned: [],
    wear: [],
    seen: ITEMS.filter((i) => i.rank === 0).map((i) => i.id),
    defIn: "09:00",
    defOut: "18:00",
    streak: 0,
    best: 0,
    doneCount: 0,
    rank: 0,
    named: false,
    today: null,
    shelf: [],
  };
}

export function mergeSave(raw: unknown): SaveData {
  const base = defaultSave();
  if (!raw || typeof raw !== "object") return base;
  const merged = { ...base, ...(raw as Partial<SaveData>) };
  if (!Array.isArray(merged.shelf)) merged.shelf = [];
  if (!Array.isArray(merged.owned)) merged.owned = [];
  if (!Array.isArray(merged.wear)) merged.wear = [];
  if (!Array.isArray(merged.seen)) merged.seen = base.seen;
  return merged;
}

// ---------- 저장소 ----------

export function storageAvailable(): boolean {
  try {
    const k = "__dol_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadSave(): SaveData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return mergeSave(raw ? JSON.parse(raw) : null);
  } catch {
    return defaultSave();
  }
}

export function writeSave(save: SaveData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch {
    /* 메모리로만 동작 */
  }
}

export function clearSave(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

// ---------- 공통 ----------

export function allRocks(save: SaveData): Rock[] {
  return save.today ? [...save.shelf, save.today] : save.shelf;
}

export function countDone(save: SaveData): number {
  return allRocks(save).filter((r) => r.done && !r.off).length;
}

export function clampName(name: string): string {
  return Array.from(name.trim()).slice(0, NAME_MAX).join("");
}

/** 레벨업·완성·승진 보상을 정산한다. 같은 보상은 두 번 주지 않는다. */
function settle(save: SaveData, events: GameEvent[], now: Date): SaveData {
  const today = save.today;
  if (!today || today.off) return save;
  let coins = save.coins;
  const r: Rock = { ...today };
  const lv = levelOf(r.rub, r.maxLv);
  const paid = r.paidLv ?? 0;
  if (lv > paid) {
    for (let l = paid + 1; l <= lv; l++) events.push({ type: "level", lv: l });
    coins += (lv - paid) * REWARD.levelUp;
    r.paidLv = lv;
  }
  const isDone = roundness(r.rub, r.maxLv) >= 1;
  if (isDone && !r.done) {
    r.done = true;
    r.doneAt = now.getTime();
    if (!r.doneBonus) {
      r.doneBonus = true;
      coins += REWARD.done;
      events.push({ type: "done" });
    }
  } else if (!isDone && r.done) {
    r.done = false;
  }
  let next: SaveData = { ...save, coins, today: r };
  const doneCount = countDone(next);
  const reached = rankIndexFor(doneCount);
  let rank = next.rank;
  if (reached > rank) {
    for (let k = rank + 1; k <= reached; k++) {
      coins += REWARD.promote;
      events.push({ type: "promote", rank: k });
    }
    rank = reached;
  }
  next = { ...next, coins, doneCount, rank };
  return next;
}

// ---------- 날짜 변경 ----------

/** 날짜가 바뀌었으면 어제 돌을 진열장에 넣고 today를 비운다. */
export function rollover(save: SaveData, now: Date): SaveData {
  const key = dateKey(now);
  if (!save.today || save.today.date === key) return save;
  const shelf = save.shelf.filter((r) => r.date !== save.today!.date);
  shelf.push(save.today);
  shelf.sort((a, b) => a.date.localeCompare(b.date));
  return { ...save, shelf, today: null };
}

function nextStreak(save: SaveData, key: string): number {
  const work = save.shelf.filter((r) => !r.off && r.date < key);
  if (!work.length) return 1;
  const last = work[work.length - 1].date;
  const recorded = new Set(save.shelf.map((r) => r.date));
  for (let d = addDays(last, 1); d < key; d = addDays(d, 1)) {
    if (!isWeekend(d) && !recorded.has(d)) return 1;
  }
  return save.streak + 1;
}

export function checkIn(save: SaveData, now: Date, inT: string, outT: string): SaveData {
  const key = dateKey(now);
  const lv = maxLevel(inT, outT);
  if (lv <= 0) return save;
  const no = save.shelf.filter((r) => !r.off).length + 1;
  const streak = nextStreak(save, key);
  const today: Rock = {
    date: key,
    no,
    name: save.name,
    inT,
    outT,
    maxLv: lv,
    rub: 0,
    done: false,
    stamp: false,
    wear: [...save.wear],
    color: save.color,
    paidLv: 0,
  };
  return { ...save, today, defIn: inT, defOut: outT, streak, best: Math.max(save.best, streak) };
}

export function takeDayOff(save: SaveData, now: Date): SaveData {
  const key = dateKey(now);
  const today: Rock = {
    date: key,
    no: 0,
    name: save.name,
    inT: save.defIn,
    outT: save.defOut,
    maxLv: 0,
    rub: 0,
    done: false,
    stamp: false,
    wear: [...save.wear],
    color: save.color,
    off: true,
  };
  return { ...save, today };
}

/** 체크인 후 시간 수정. 문지른 횟수는 유지. */
export function editTimes(save: SaveData, now: Date, inT: string, outT: string, events: GameEvent[]): SaveData {
  const today = save.today;
  if (!today) return checkIn(save, now, inT, outT);
  if (today.off) return checkIn({ ...save, today: null }, now, inT, outT);
  const lv = maxLevel(inT, outT);
  if (lv <= 0) return save;
  const next: SaveData = {
    ...save,
    defIn: inT,
    defOut: outT,
    // paidLv는 그대로 둔다: 시간을 줄였다 늘려도 같은 레벨 보상을 두 번 주지 않는다
    today: { ...today, inT, outT, maxLv: lv },
  };
  return settle(next, events, now);
}

// ---------- 문지르기 / 도장 ----------

export function rub(save: SaveData, count: number, events: GameEvent[], now: Date = new Date()): SaveData {
  const today = save.today;
  if (!today || today.off || count <= 0) return save;
  return settle({ ...save, today: { ...today, rub: today.rub + count } }, events, now);
}

// ---------- 광고 치트키 ----------

/** 치트키 제안 카드를 띄울 수 있는지 */
export function canOfferCheat(today: Rock | null): boolean {
  if (!today || today.off || today.done || today.offerOff) return false;
  if ((today.offers ?? 0) >= CHEAT.offersPerDay) return false;
  return levelOf(today.rub, today.maxLv) >= CHEAT.minLevel;
}

export function markOffer(save: SaveData, closed: boolean): SaveData {
  const t = save.today;
  if (!t) return save;
  return closed ? { ...save, today: { ...t, offerOff: true } } : { ...save, today: { ...t, offers: (t.offers ?? 0) + 1 } };
}

export function applyCheat(save: SaveData): SaveData {
  const t = save.today;
  if (!t || t.off) return save;
  return { ...save, today: { ...t, cheats: (t.cheats ?? 0) + 1 } };
}

/** 같은 레벨(근무 시간) 돌 중 가장 빠른 완성 기록. 치트 쓴 날과 exclude 날짜는 뺀다. */
export function bestRecord(rocks: Rock[], maxLv: number, exclude?: string): number | null {
  let best: number | null = null;
  for (const r of rocks) {
    if (r.date === exclude || r.off || !r.done || r.maxLv !== maxLv || (r.cheats ?? 0) > 0) continue;
    const ms = recordMs(r);
    if (ms !== null && (best === null || ms < best)) best = ms;
  }
  return best;
}

export function stamp(save: SaveData, now: Date, events: GameEvent[]): SaveData {
  const today = save.today;
  if (!today || today.off || today.stamp) return save;
  if (now.getTime() < atTime(today.date, today.outT).getTime()) return save;
  events.push({ type: "stamp" });
  return { ...save, coins: save.coins + REWARD.stamp, today: { ...today, stamp: true } };
}

// ---------- 이름 ----------

export function setName(save: SaveData, name: string, scope: "today" | "always"): SaveData {
  const clean = clampName(name) || save.name || DEFAULT_NAME;
  const today = save.today ? { ...save.today, name: clean } : null;
  if (scope === "today") return { ...save, today };
  return { ...save, name: clean, named: true, today };
}

// ---------- 색깔 ----------

/** 돌 색깔 바꾸기. 오늘 돌에도 바로 적용 */
export function setColor(save: SaveData, color: string): SaveData {
  const today = save.today ? { ...save.today, color } : null;
  return { ...save, color, today };
}

// ---------- 상점 ----------

export function isUnlocked(save: SaveData, id: string): boolean {
  const item = itemById(id);
  return !!item && item.rank <= save.rank;
}

export function buy(save: SaveData, id: string): SaveData {
  const item = itemById(id);
  if (!item || save.owned.includes(id) || !isUnlocked(save, id) || save.coins < item.price) return save;
  return wearItem({ ...save, coins: save.coins - item.price, owned: [...save.owned, id] }, id);
}

export function wearItem(save: SaveData, id: string): SaveData {
  const item = itemById(id);
  if (!item || !save.owned.includes(id)) return save;
  const wear = save.wear.filter((w) => itemById(w)?.slot !== item.slot);
  wear.push(id);
  return withWear(save, wear);
}

export function unwearItem(save: SaveData, id: string): SaveData {
  return withWear(
    save,
    save.wear.filter((w) => w !== id),
  );
}

function withWear(save: SaveData, wear: string[]): SaveData {
  const today = save.today ? { ...save.today, wear: [...wear] } : null;
  return { ...save, wear, today };
}

export function unseenUnlocked(save: SaveData): string[] {
  return ITEMS.filter((i) => i.rank <= save.rank && !save.seen.includes(i.id)).map((i) => i.id);
}

export function rankName(idx: number): string {
  return RANKS[Math.max(0, Math.min(RANKS.length - 1, idx))].name;
}
