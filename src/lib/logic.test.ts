import type { SaveData } from "./types";
import { describe, expect, it } from "vitest";
import { maxLevel, roundness, levelOf } from "./checkin";
import { formatRecord, recordMs, recordPhrase } from "./record";
import { atTime } from "./date";
import { CHEAT, RUB_PER_LEVEL } from "./config";
import { newBucket, takeRubs } from "./input";
import { dateKey } from "./date";
import { rockColors, rockShape } from "./shape";
import { setColor, applyCheat, canOfferCheat, markOffer, bestRecord, checkIn, defaultSave, rollover, rub, stamp, editTimes, buy, wearItem, type GameEvent } from "./state";
import { clockInfo, canStamp } from "./clock";

describe("maxLevel", () => {
  it("올림으로 계산한다", () => {
    expect(maxLevel("09:00", "18:00")).toBe(9);
    expect(maxLevel("09:00", "17:30")).toBe(9);
    expect(maxLevel("13:00", "18:00")).toBe(5);
    expect(maxLevel("09:00", "08:00")).toBe(0);
    expect(maxLevel("00:00", "23:59")).toBe(16);
  });
});

describe("초당 문지름 제한", () => {
  it("1초에 12번까지만 인정, 시간이 지나면 다시 찬다", () => {
    const b = newBucket(0);
    let got = 0;
    for (let i = 0; i < 20; i++) got += takeRubs(b, 4, i * 10); // 0.2초 동안 80번 시도
    expect(got).toBe(14); // 처음 모아둔 12 + 0.2초 동안 찬 2
    expect(takeRubs(b, 4, 200)).toBe(0);
    expect(takeRubs(b, 20, 1200)).toBe(12);
  });
});

describe("shape", () => {
  it("같은 날은 같은 돌, 다른 날은 다른 돌", () => {
    expect(rockShape("2026-11-06", 0).path).toBe(rockShape("2026-11-06", 0).path);
    expect(rockShape("2026-11-06", 0).path).not.toBe(rockShape("2026-11-07", 0).path);
  });
  it("t=1이면 시드와 상관없이 같은 원", () => {
    expect(rockShape("2026-11-06", 1).path).toBe(rockShape("2026-01-01", 1).path);
    expect(rockShape("2026-11-06", 1).tilt).toBe(0);
  });
  it("t=0이면 각진 직선", () => {
    expect(rockShape("2026-11-06", 0).path).not.toContain("C");
  });
});

describe("state", () => {
  const morning = new Date(2026, 10, 6, 8, 30);
  const evening = new Date(2026, 10, 6, 18, 5);

  it("로컬 날짜 키", () => {
    expect(dateKey(new Date(2026, 10, 6, 0, 30))).toBe("2026-11-06");
  });

  const L = RUB_PER_LEVEL;

  const at = (h: number, m = 0) => new Date(2026, 10, 6, h, m);

  it("시간 제한 없이 문지르기로 레벨업·완성·보상", () => {
    let s = checkIn(defaultSave(), morning, "09:00", "18:00");
    expect(s.today!.maxLv).toBe(9);
    const ev: GameEvent[] = [];
    s = rub(s, L, ev, at(8, 40));
    expect(levelOf(s.today!.rub, 9)).toBe(1);
    expect(s.coins).toBe(21);
    s = rub(s, 8 * L, ev, at(9, 5));
    expect(roundness(s.today!.rub, 9)).toBe(1);
    expect(s.today!.done).toBe(true);
    expect(s.coins).toBe(20 + 9 + 5);
    expect(ev.filter((e) => e.type === "done")).toHaveLength(1);
  });

  it("완성 기록 = 출근 시각부터 완성 순간까지", () => {
    let s = checkIn(defaultSave(), morning, "09:00", "18:00");
    const ev: GameEvent[] = [];
    s = rub(s, 4 * L, ev, at(10));
    s = rub(s, 5 * L, ev, at(12, 12));
    expect(recordMs(s.today!)).toBe((3 * 60 + 12) * 60_000);
    expect(recordPhrase(recordMs(s.today!)!)).toBe("출근 3시간 12분 만에");
    s = rub(s, 10, ev, at(15)); // 완성 뒤에 문질러도 기록은 그대로
    expect(recordMs(s.today!)).toBe((3 * 60 + 12) * 60_000);
  });

  it("출근 전에 완성하면 0", () => {
    let s = checkIn(defaultSave(), morning, "09:00", "10:00");
    s = rub(s, L, [], at(8, 50));
    expect(recordMs(s.today!)).toBe(0);
    expect(recordPhrase(0)).toBe("출근 전에");
  });

  it("개인 최고 기록은 같은 레벨끼리 비교", () => {
    const rock = (date: string, maxLv: number, h: number, m: number) => ({
      date, no: 1, name: "a", inT: "09:00", outT: "18:00", maxLv, rub: 0, done: true, stamp: false, wear: [],
      doneAt: atTime(date, "09:00").getTime() + (h * 60 + m) * 60_000,
    });
    const rocks = [rock("2026-11-02", 9, 5, 0), rock("2026-11-03", 9, 3, 30), rock("2026-11-04", 5, 0, 20)];
    expect(bestRecord(rocks, 9)).toBe(210 * 60_000);
    expect(bestRecord(rocks, 9, "2026-11-03")).toBe(300 * 60_000);
    expect(bestRecord(rocks, 8)).toBeNull();
    expect(formatRecord(192 * 60_000)).toBe("3시간 12분");
    expect(formatRecord(42 * 60_000 + 5000)).toBe("42분");
    expect(formatRecord(20_000)).toBe("1분 미만");
  });

  it("시간을 줄이면 바로 완성, 늘리면 미완성 (보너스 재지급 없음)", () => {
    let s = checkIn(defaultSave(), morning, "09:00", "18:00");
    const ev: GameEvent[] = [];
    s = rub(s, 5 * L, ev, at(10));
    s = editTimes(s, morning, "13:00", "18:00", ev);
    expect(s.today!.done).toBe(true);
    const coins = s.coins;
    s = editTimes(s, morning, "09:00", "18:00", ev);
    expect(s.today!.done).toBe(false);
    s = rub(s, 4 * L, ev, at(11));
    expect(s.today!.done).toBe(true);
    expect(s.coins).toBe(coins + 4); // Lv.6~9 레벨 보상만, 완성 보너스 없음
  });

  it("줄였다가 늘리면 문지른 만큼의 모양으로 돌아간다 (완성 뒤 더 문지른 건 안 셈)", () => {
    let s = checkIn(defaultSave(), morning, "09:00", "18:00"); // Lv.9
    const ev: GameEvent[] = [];
    s = rub(s, 5 * L, ev, at(10));
    s = editTimes(s, at(10), "09:00", "14:00", ev); // Lv.5 → 바로 완성
    expect(s.today!.done).toBe(true);
    expect(s.today!.doneAt).toBeDefined();
    s = rub(s, 3 * L, ev, at(11)); // 완성 뒤에 더 문질러도
    expect(s.today!.rub).toBe(5 * L); // 세지 않는다
    s = editTimes(s, at(11), "09:00", "18:00", ev); // 다시 Lv.9
    expect(s.today!.done).toBe(false);
    expect(s.today!.doneAt).toBeUndefined(); // 완성 기록도 지움
    expect(roundness(s.today!.rub, s.today!.maxLv)).toBeCloseTo(5 / 9);
    expect(levelOf(s.today!.rub, s.today!.maxLv)).toBe(5);
  });

  it("도장은 퇴근 시간 이후 1회", () => {
    let s = checkIn(defaultSave(), morning, "09:00", "18:00");
    expect(canStamp(s.today, morning)).toBe(false);
    expect(clockInfo(s.today, morning).phase).toBe("before");
    const ev: GameEvent[] = [];
    s = stamp(s, evening, ev);
    expect(s.today!.stamp).toBe(true);
    expect(s.coins).toBe(40);
    s = stamp(s, evening, ev);
    expect(s.coins).toBe(40);
  });

  it("자정이 지나면 어제 돌이 진열장으로", () => {
    let s = checkIn(defaultSave(), morning, "09:00", "18:00");
    s = rub(s, 10, []);
    s = rollover(s, new Date(2026, 10, 7, 0, 0, 1));
    expect(s.today).toBeNull();
    expect(s.shelf).toHaveLength(1);
    expect(s.shelf[0].rub).toBe(10);
  });

  it("5개 완성하면 사원 승진", () => {
    let s = defaultSave();
    const ev: GameEvent[] = [];
    for (let d = 2; d <= 6; d++) {
      s = rollover(s, new Date(2026, 10, d, 9));
      s = checkIn(s, new Date(2026, 10, d, 9), "09:00", "10:00");
      s = rub(s, L, ev);
    }
    expect(s.rank).toBe(1);
    expect(ev.some((e) => e.type === "promote")).toBe(true);
    expect(s.streak).toBe(5);
  });

  it("같은 부위는 하나만", () => {
    let s = { ...defaultSave(), coins: 1000 };
    s = buy(s, "hardhat");
    s = buy(s, "crown");
    expect(s.wear).toEqual(["crown"]);
    s = wearItem(s, "hardhat");
    expect(s.wear).toEqual(["hardhat"]);
  });
});

describe("광고 치트키", () => {
  const base = { date: "2026-11-06", no: 1, name: "a", inT: "09:00", outT: "18:00", maxLv: 9, done: false, stamp: false, wear: [] };

  it("Lv.1 넘긴 뒤, 하루 정해진 횟수까지, 닫으면 그날은 끝", () => {
    expect(canOfferCheat({ ...base, rub: 10 })).toBe(false);
    expect(canOfferCheat({ ...base, rub: RUB_PER_LEVEL })).toBe(true);
    expect(canOfferCheat({ ...base, rub: RUB_PER_LEVEL, offers: CHEAT.offersPerDay })).toBe(false);
    expect(canOfferCheat({ ...base, rub: RUB_PER_LEVEL, offerOff: true })).toBe(false);
    let s: SaveData = { ...defaultSave(), today: { ...base, rub: RUB_PER_LEVEL } };
    for (let i = 0; i < CHEAT.offersPerDay - 1; i++) s = markOffer(s, false);
    expect(canOfferCheat(s.today)).toBe(true);
    s = markOffer(s, false);
    expect(canOfferCheat(s.today)).toBe(false);
  });

  it("치트 쓴 날은 개인 최고에서 빠진다", () => {
    const at = (h: number) => atTime("2026-11-06", "09:00").getTime() + h * 3_600_000;
    const rocks = [
      { ...base, date: "2026-11-05", rub: 0, done: true, doneAt: atTime("2026-11-05", "09:00").getTime() + 4 * 3_600_000 },
      { ...base, rub: 0, done: true, doneAt: at(1), cheats: 1 },
    ];
    expect(bestRecord(rocks, 9)).toBe(4 * 3_600_000);
    expect(applyCheat({ ...defaultSave(), today: { ...base, rub: 0 } }).today!.cheats).toBe(1);
  });
});

describe("돌 색깔", () => {
  it("고른 색은 오늘 돌과 내일 새 돌에 적용, 진열장엔 그날 색으로 남는다", () => {
    const day1 = new Date(2026, 10, 5, 9);
    let s = checkIn(defaultSave(), day1, "09:00", "18:00");
    expect(s.today!.color).toBeUndefined(); // 기본 회색
    s = setColor(s, "jade");
    expect(s.today!.color).toBe("jade");
    s = rollover(s, new Date(2026, 10, 6, 9));
    s = setColor(s, "rose");
    s = checkIn(s, new Date(2026, 10, 6, 9), "09:00", "18:00");
    expect(s.today!.color).toBe("rose");
    expect(s.shelf[0].color).toBe("jade");
  });

  it("색에 따라 돌 색이 달라지고, 모르는 색은 회색", () => {
    expect(rockColors(0, "jade").light).not.toBe(rockColors(0).light);
    expect(rockColors(1, "nope").light).toBe(rockColors(1, "gray").light);
  });

  it("직접 고른 색: 다 문지르면 그 색 그대로, 처음엔 더 칙칙하고 어둡게", () => {
    expect(rockColors(1, "#3366FF").light).toBe("#3366ff");
    const rough = rockColors(0, "#3366ff").light;
    expect(rough).not.toBe("#3366ff");
    const lum = (h: string) => [1, 3, 5].reduce((a, i) => a + parseInt(h.slice(i, i + 2), 16), 0);
    expect(lum(rough)).toBeLessThan(lum("#3366ff"));
    expect(rockColors(1, "#33f").light).toBe(rockColors(1, "gray").light); // 잘못된 값은 회색
  });
});
