"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import RockSvg, { type Face } from "./RockSvg";
import CheckinSheet from "./CheckinSheet";
import ShopSheet from "./ShopSheet";
import ShelfSheet, { doneIn } from "./ShelfSheet";
import SettingsSheet from "./SettingsSheet";
import PhotoModal from "./PhotoModal";
import { NameDialog, RenameDialog } from "./Dialogs";
import { CameraIcon, CoinIcon, GearIcon, HangerIcon, SealIcon, ShelfIcon } from "./Icons";
import { AdModal, CheatOffer } from "./Cheat";
import { CHEAT, CREDIT, MAX_RUB_PER_MOVE, RANKS, RUB_DISTANCE, RUB_PER_LEVEL, stageName } from "@/lib/config";
import { levelOf, roundness, rubsToNextLevel } from "@/lib/checkin";
import { formatRecord, recordMs, recordPhrase } from "@/lib/record";
import WorkTimeline from "./WorkTimeline";
import CoinTip from "./CoinTip";
import { newBucket, takeRubs, type RubBucket } from "@/lib/input";
import { canStamp, clockInfo } from "@/lib/clock";
import { dateKey } from "@/lib/date";
import { ITEMS } from "@/lib/items";
import { ambientLine, lineOf } from "@/lib/lines";
import {
  allRocks,
  bestRecord,
  buy,
  checkIn,
  clearSave,
  defaultSave,
  editTimes,
  loadSave,
  rankName,
  applyCheat,
  canOfferCheat,
  markOffer,
  rollover,
  rub,
  setColor,
  setName,
  stamp,
  storageAvailable,
  takeDayOff,
  unseenUnlocked,
  unwearItem,
  wearItem,
  writeSave,
  type GameEvent,
} from "@/lib/state";
import type { SaveData } from "@/lib/types";

type SheetKind = "edit" | "shop" | "shelf" | "settings" | "rename" | null;
type Toast = { id: number; text: string; tone?: "gold" | "green" | "red" };
type Photo = { blob: Blob | null; loading: boolean; filename: string };

const TAP_MOVE = 8;
const TAP_MS = 300;

export default function Game() {
  const [save, setSave] = useState<SaveData | null>(null);
  const saveRef = useRef<SaveData | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [storageOk, setStorageOk] = useState(true);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [fresh, setFresh] = useState<string[]>([]);
  const [bubble, setBubble] = useState<{ text: string; n: number; cheat?: boolean }>({ text: "", n: 0 });
  const bubbleLock = useRef(0);
  const [faceFlash, setFaceFlash] = useState<Face | null>(null);
  const faceTimer = useRef<number | undefined>(undefined);
  const [rubbing, setRubbing] = useState(false);
  const rubTimer = useRef<number | undefined>(undefined);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [stampAnim, setStampAnim] = useState(0);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [coinTip, setCoinTip] = useState(false);
  const closeCoinTip = useCallback(() => setCoinTip(false), []);
  // 광고 치트키
  const [offer, setOffer] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const [boostUntil, setBoostUntil] = useState(0);
  const [boostTick, setBoostTick] = useState(0);
  const boostRef = useRef(0);
  const offerFrom = useRef<number | null>(null); // 제안 카드가 뜬 순간의 문지름 수

  const stageRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const bucket = useRef<RubBucket>(newBucket(0));
  const ptr = useRef<{ id: number; x: number; y: number; sx: number; sy: number; t0: number; moved: number; acc: number; onName: boolean } | null>(null);

  // ---------- 불러오기 / 저장 ----------
  useEffect(() => {
    const ok = storageAvailable();
    setStorageOk(ok);
    const s = rollover(ok ? loadSave() : defaultSave(), new Date());
    saveRef.current = s;
    setSave(s);
    setBubble({ text: ambientLine(s, new Date()), n: 1 });
  }, []);

  useEffect(() => {
    if (!save) return;
    const id = window.setTimeout(() => writeSave(save), 250);
    return () => window.clearTimeout(id);
  }, [save]);

  // ---------- 1초 루프: 시계 + 날짜 변경 ----------
  useEffect(() => {
    const id = window.setInterval(() => {
      const n = new Date();
      setNow(n);
      const s = saveRef.current;
      if (s?.today && s.today.date !== dateKey(n)) {
        const next = rollover(s, n);
        saveRef.current = next;
        setSave(next);
        setSheet(null);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // ---------- 말풍선 ----------
  /** cheat: 치트키 동안만 보여야 하는 대사 (2배가 끝나면 바로 내린다) */
  const say = useCallback((text: string, holdMs = 4000, cheat = false) => {
    bubbleLock.current = Date.now() + holdMs;
    setBubble((b) => ({ text, n: b.n + 1, cheat }));
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const s = saveRef.current;
      if (!s || Date.now() < bubbleLock.current) return;
      setBubble((b) => ({ text: ambientLine(s, new Date()), n: b.n + 1 }));
    }, 20000);
    return () => window.clearInterval(id);
  }, []);

  // ---------- 연출 ----------
  const toast = useCallback((text: string, tone?: Toast["tone"]) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const flashFace = useCallback((f: Face, ms: number) => {
    window.clearTimeout(faceTimer.current);
    setFaceFlash(f);
    faceTimer.current = window.setTimeout(() => setFaceFlash(null), ms);
  }, []);

  const animateStage = useCallback((kind: "squash" | "hop" | "glow") => {
    const el = stageRef.current;
    if (!el || typeof el.animate !== "function") return;
    if (kind === "squash") {
      el.animate(
        [{ transform: "scale(1,1)" }, { transform: "scale(1.035,0.965) translateY(3px)" }, { transform: "scale(1,1)" }],
        { duration: 160, easing: "ease-out" },
      );
    } else if (kind === "hop") {
      el.animate(
        [
          { transform: "translateY(0)" },
          { transform: "translateY(-18px) scale(0.98,1.03)", offset: 0.4 },
          { transform: "translateY(0) scale(1.04,0.96)", offset: 0.8 },
          { transform: "translateY(0)" },
        ],
        { duration: 420, easing: "cubic-bezier(.3,.7,.4,1)" },
      );
    } else {
      el.animate([{ filter: "brightness(1)" }, { filter: "brightness(1.25) drop-shadow(0 0 18px #ffe7a0)" }, { filter: "brightness(1)" }], {
        duration: 600,
      });
    }
  }, []);

  const spawnDust = useCallback((x: number, y: number, n: number) => {
    const fx = fxRef.current;
    if (!fx) return;
    const rect = fx.getBoundingClientRect();
    for (let i = 0; i < n + 1; i++) {
      const sparkle = Math.random() < 0.07;
      const el = document.createElement("span");
      el.className = sparkle ? "fx-spark" : "fx-dust";
      if (sparkle) el.textContent = "✦";
      el.style.left = `${x - rect.left + (Math.random() * 24 - 12)}px`;
      el.style.top = `${y - rect.top + (Math.random() * 10 - 5)}px`;
      el.style.setProperty("--dx", `${Math.random() * 40 - 20}px`);
      el.style.setProperty("--s", `${0.6 + Math.random() * 0.9}`);
      el.addEventListener("animationend", () => el.remove());
      fx.appendChild(el);
    }
  }, []);

  const burst = useCallback(() => {
    const fx = fxRef.current;
    if (!fx) return;
    const w = fx.clientWidth;
    const h = fx.clientHeight;
    for (let i = 0; i < 14; i++) {
      const el = document.createElement("span");
      el.className = "fx-burst";
      el.textContent = i % 3 ? "✦" : "✧";
      const a = (Math.PI * 2 * i) / 14;
      el.style.left = `${w / 2}px`;
      el.style.top = `${h * 0.52}px`;
      el.style.setProperty("--tx", `${Math.cos(a) * (110 + Math.random() * 40)}px`);
      el.style.setProperty("--ty", `${Math.sin(a) * (110 + Math.random() * 40)}px`);
      el.style.animationDelay = `${Math.random() * 120}ms`;
      el.addEventListener("animationend", () => el.remove());
      fx.appendChild(el);
    }
  }, []);

  // ---------- 상태 변경 + 이벤트 처리 ----------
  const commit = useCallback(
    (fn: (s: SaveData, ev: GameEvent[]) => SaveData) => {
      const cur = saveRef.current;
      if (!cur) return;
      const ev: GameEvent[] = [];
      const next = fn(cur, ev);
      if (next === cur) return;
      saveRef.current = next;
      setSave(next);

      const levels = ev.filter((e) => e.type === "level");
      const done = ev.some((e) => e.type === "done");
      if (levels.length && !done) {
        const lv = (levels[levels.length - 1] as { lv: number }).lv;
        flashFace("level", 600);
        animateStage("hop");
        toast(`Lv.${lv} 달성 · +${levels.length}`, "green");
      }
      if (done && next.today) {
        flashFace("done", 1600);
        animateStage("glow");
        burst();
        const ms = recordMs(next.today) ?? 0;
        const prev = bestRecord(allRocks(next), next.today.maxLv, next.today.date);
        const isBest = prev !== null && ms < prev && !next.today.cheats;
        say(`다 동그래졌어요! ${recordPhrase(ms)}.${isBest ? " 개인 최고예요!" : ""}`, 9000);
        toast(`완성 · ${recordPhrase(ms)} · +5`, "gold");
        if (isBest) window.setTimeout(() => toast(`개인 최고 기록 · ${formatRecord(prev - ms)} 단축`, "red"), 700);
      }
      for (const e of ev) {
        if (e.type === "promote") {
          const rn = rankName(e.rank);
          toast(`${rn} 승진 · +30`, "green");
          const n = ITEMS.filter((i) => i.rank === e.rank).length;
          if (n) window.setTimeout(() => toast(`신상 입고! ${rn} 전용 아이템 ${n}개`, "red"), 700);
          say(lineOf("promote", { 직급: rn }), 7000);
        }
        if (e.type === "stamp") {
          setStampAnim((k) => k + 1);
          say(lineOf("stamped"), 8000);
          toast("퇴근 도장 · +20", "red");
        }
      }
    },
    [animateStage, burst, flashFace, say, toast],
  );

  // ---------- 문지르기 ----------
  const doRub = useCallback(
    (n: number, x: number, y: number) => {
      const s = saveRef.current;
      if (!s?.today || s.today.off) return;
      const wasDone = roundness(s.today.rub, s.today.maxLv) >= 1;
      // 초당 12번까지만 인정. 너무 빨리 흔들면 나머지는 버린다.
      n = takeRubs(bucket.current, n, performance.now());
      if (n <= 0) return;
      // 치트키 사용 중이면 2배
      if (Date.now() < boostRef.current) n *= CHEAT.multiplier;
      if (!rubbing && !wasDone && Math.random() < 0.3 && Date.now() > bubbleLock.current) say(lineOf("rubbing"), 2500);
      if (wasDone && Date.now() > bubbleLock.current) say(lineOf("doneRub"), 3000);
      setRubbing(true);
      window.clearTimeout(rubTimer.current);
      rubTimer.current = window.setTimeout(() => setRubbing(false), 900);
      animateStage("squash");
      if (!wasDone) spawnDust(x, y, n);
      commit((cur, ev) => rub(cur, n, ev, new Date()));
    },
    [animateStage, commit, rubbing, say, spawnDust],
  );

  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    const s = saveRef.current;
    if (!s?.today || s.today.off) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const onName = !!(e.target as Element).closest?.("[data-name-hit]");
    ptr.current = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t0: performance.now(), moved: 0, acc: 0, onName };
  };

  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    const p = ptr.current;
    if (!p || p.id !== e.pointerId) return;
    const d = Math.hypot(e.clientX - p.x, e.clientY - p.y);
    p.x = e.clientX;
    p.y = e.clientY;
    p.moved += d;
    p.acc += d;
    const n = Math.min(MAX_RUB_PER_MOVE, Math.floor(p.acc / RUB_DISTANCE));
    if (n > 0) {
      // 한 이벤트에서 4회 넘게 쌓인 거리는 버린다
      p.acc = Math.min(p.acc - n * RUB_DISTANCE, RUB_DISTANCE - 1);
      doRub(n, e.clientX, e.clientY);
    }
  };

  const onPointerUp = (e: RPointerEvent<HTMLDivElement>) => {
    const p = ptr.current;
    ptr.current = null;
    if (!p || p.id !== e.pointerId) return;
    const quick = performance.now() - p.t0 < TAP_MS;
    if (p.onName && quick && p.moved < TAP_MOVE) setSheet("rename");
  };

  // ---------- 광고 치트키 ----------
  // 가끔 옆에서 제안 카드가 나온다 (하루 최대 2번, 닫으면 그날은 끝)
  useEffect(() => {
    const show = () => {
      const s = saveRef.current;
      if (!s || !canOfferCheat(s.today) || Date.now() < boostRef.current || offerFrom.current !== null) return false;
      offerFrom.current = s.today!.rub;
      setOffer(true);
      commit((cur) => markOffer(cur, false));
      return true;
    };
    // 개발 중 확인용: 주소 끝에 ?offer 를 붙이면 바로 띄운다
    if (process.env.NODE_ENV !== "production" && window.location.search.includes("offer")) window.setTimeout(show, 1500);
    const id = window.setInterval(() => {
      if (Math.random() < CHEAT.chance) show();
    }, CHEAT.checkEveryMs);
    return () => window.clearInterval(id);
  }, [commit]);

  // 제안 카드는 시간이 아니라 문지름으로 사라진다: 뜬 뒤 100번 문지르면 들어감
  const todayRub = save?.today?.rub ?? 0;
  const todayDone = !!save?.today?.done;
  useEffect(() => {
    if (!offer) {
      offerFrom.current = null;
      return;
    }
    if (adOpen) return;
    if (todayDone || (offerFrom.current !== null && todayRub - offerFrom.current >= CHEAT.offerRubs)) setOffer(false);
  }, [offer, adOpen, todayRub, todayDone]);

  // 2배 남은 시간 표시용
  useEffect(() => {
    if (boostUntil <= Date.now()) return;
    const id = window.setInterval(() => {
      setBoostTick((k) => k + 1);
      if (Date.now() >= boostUntil) {
        window.clearInterval(id);
        setBoostUntil(0);
        // 2배가 끝나면 "치트키 발동!" 말풍선도 바로 내린다 (다음 20초 대사까지 남아 있지 않게)
        const s = saveRef.current;
        bubbleLock.current = 0;
        setBubble((b) => (b.cheat && s ? { text: ambientLine(s, new Date()), n: b.n + 1 } : b));
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [boostUntil]);

  const startBoost = () => {
    const until = Date.now() + CHEAT.boostMs;
    boostRef.current = until;
    setBoostUntil(until);
    setAdOpen(false);
    commit((s) => applyCheat(s));
    say(`치트키 발동! ${CHEAT.boostMs / 1000}초 동안 ${CHEAT.multiplier}배로 깎여요. 빨리요!`, CHEAT.boostMs, true);
    toast(`치트키 · ${CHEAT.boostMs / 1000}초간 ${CHEAT.multiplier}배`, "gold");
  };

  // ---------- 화면 ----------
  if (!save) return <main className="app is-loading" />;

  const today = save.today;
  const working = !!today && !today.off;
  const t = working ? roundness(today!.rub, today!.maxLv) : 0;
  const lv = working ? levelOf(today!.rub, today!.maxLv) : 0;
  const info = clockInfo(today, now);
  const stampOk = canStamp(today, now);
  const unseen = unseenUnlocked(save);
  const rocks = allRocks(save);

  let face: Face = "idle";
  if (today?.off) face = "off";
  else if (info.phase === "over") face = "over";
  if (rubbing) face = "rub";
  if (faceFlash) face = faceFlash;

  const needName = !save.named;
  const needCheckin = save.named && !today;

  const openShop = () => {
    setFresh(unseen);
    setSheet("shop");
    if (unseen.length) commit((s) => ({ ...s, seen: [...s.seen, ...unseen] }));
  };

  const openPhoto = async (kind: "today" | "shelf", y?: number, m?: number) => {
    const s = saveRef.current!;
    const stampKey = (kind === "today" && s.today ? s.today.date : dateKey(new Date(y!, m!, 1)).slice(0, 7)).replace(/-/g, "");
    const filename = `퇴근돌_${stampKey}.png`;
    setPhoto({ blob: null, loading: true, filename });
    try {
      const mod = await import("@/lib/photo");
      const blob =
        kind === "today" && s.today
          ? await mod.todayPhoto(s.today)
          : await mod.shelfPhoto(y!, m!, allRocks(s), doneIn(allRocks(s), y!, m!), rankName(s.rank));
      setPhoto({ blob, loading: false, filename });
    } catch (err) {
      console.error("사진 만들기 실패", err); // 기기별 원인 확인용
      setPhoto(null);
      toast("사진을 만들지 못했어요", "red");
    }
  };

  const stampLabel = !today
    ? "퇴근 도장"
    : today.off
      ? "오늘은 휴무"
      : today.stamp
        ? "퇴근 완료"
        : stampOk
          ? "퇴근 도장 찍기"
          : `${today.outT}에 퇴근 도장`;

  const toNext = working ? rubsToNextLevel(today!.rub, today!.maxLv) : 0;
  const best = working ? bestRecord(rocks, today!.maxLv, today!.date) : null;

  return (
    <main className="app">
      {/* 상단바 */}
      <header className="topbar">
        <button
          className="coin-chip"
          aria-label={`퇴근포인트 ${save.coins}. 모으는 법 보기`}
          aria-expanded={coinTip}
          onClick={() => setCoinTip((v) => !v)}
        >
          <CoinIcon size={18} />
          {save.coins.toLocaleString()}
        </button>
        {coinTip && <CoinTip onClose={closeCoinTip} />}
        <div className="topbar__right">
          <button className="icon-btn" onClick={() => setSheet("shelf")} aria-label="진열장">
            <ShelfIcon />
          </button>
          <button className="icon-btn" onClick={() => setSheet("settings")} aria-label="설정">
            <GearIcon />
          </button>
        </div>
      </header>
      <WorkTimeline today={today} now={now} onEdit={() => setSheet(today ? "edit" : null)} />

      <section className="stage">
        <div className="bubble" key={bubble.n}>
          {bubble.text}
        </div>

        {today?.off ? (
          <OffShelf rocks={rocks} onOpen={() => setSheet("shelf")} />
        ) : (
          <>
            <div
              className={`rock-pad ${working ? "" : "is-idle"}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => (ptr.current = null)}
            >
              <div ref={stageRef} className="rock-wrap">
                <RockSvg
                  seed={today?.date ?? dateKey(now)}
                  t={t}
                  name={today?.name ?? save.name}
                  wear={today?.wear ?? save.wear}
                  color={today?.color ?? save.color}
                  face={face}
                  className={`rock ${t >= 1 ? "is-done" : ""} ${boostUntil > Date.now() ? "is-boost" : ""}`}
                />
              </div>
              <div ref={fxRef} className="fx" aria-hidden />
              {boostUntil > Date.now() && (
                <span className="boost-badge" data-tick={boostTick}>
                  {CHEAT.multiplier}배 · {Math.ceil((boostUntil - Date.now()) / 1000)}초
                </span>
              )}
              {working && today!.rub === 0 && <p className="hint">돌을 문질러 보세요</p>}
            </div>
            {working && (
              <div className="meter">
                <p className="meter__title">
                  <span className="meter__name">
                    <span className="rank-stamp rank-stamp--sm" aria-label={`직급 ${RANKS[save.rank].name}`}>
                      {RANKS[save.rank].name}
                    </span>
                    <b>{stageName(t)}</b>
                  </span>
                  <span className="meter__lv">
                    Lv.{lv} <small>/ {today!.maxLv}</small>
                  </span>
                </p>
                <div className="meter__track" style={{ gridTemplateColumns: `repeat(${today!.maxLv}, 1fr)` }}>
                  {Array.from({ length: today!.maxLv }, (_, i) => {
                    const fill = Math.max(0, Math.min(1, (today!.rub - i * RUB_PER_LEVEL) / RUB_PER_LEVEL));
                    return (
                      <span key={i} className={fill >= 1 ? "is-full" : ""}>
                        <i style={{ width: `${fill * 100}%` }} />
                      </span>
                    );
                  })}
                </div>
                <div className="meter__sub">
                  {t >= 1 ? (
                    <span className="record is-done">
                      <b>{recordPhrase(recordMs(today!) ?? 0)} 완성</b>
                      {!today!.cheats && best !== null && (recordMs(today!) ?? 0) <= best && <em>개인 최고</em>}
                    </span>
                  ) : (
                    <span>다음 레벨까지 {toNext.toLocaleString()}번</span>
                  )}
                  {best !== null && (t < 1 || (recordMs(today!) ?? 0) > best) && <span>내 최고 {formatRecord(best)}</span>}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <nav className="actions">
        <button
          className={`act act--stamp ${today?.stamp ? "is-done" : ""}`}
          disabled={!stampOk}
          onClick={() => commit((s, ev) => stamp(s, new Date(), ev))}
        >
          <SealIcon />
          <span>{stampLabel}</span>
        </button>
        <button className="act act--deco" onClick={openShop}>
          {unseen.length > 0 && <i className="red-dot" aria-label="새 아이템" />}
          <HangerIcon />
          <span>꾸미기</span>
        </button>
        <button className={`act act--photo ${t >= 1 ? "is-hot" : ""}`} disabled={!working} onClick={() => openPhoto("today")}>
          <CameraIcon />
          <span>사진</span>
        </button>
      </nav>
      <footer className="credit">퇴근돌 키우기 · {CREDIT}</footer>

      {offer && !adOpen && (
        <CheatOffer
          onWatch={() => {
            setOffer(false);
            setAdOpen(true);
          }}
          onClose={() => {
            setOffer(false);
            commit((s) => markOffer(s, true));
          }}
        />
      )}
      {adOpen && (
        <AdModal
          onReward={startBoost}
          onClose={() => {
            setAdOpen(false);
            toast("광고를 끝까지 봐야 치트키를 받아요");
          }}
        />
      )}

      {/* 토스트 */}
      <div className="toasts" aria-live="polite">
        {toasts.map((x) => (
          <div key={x.id} className={`toast toast--${x.tone ?? "plain"}`}>
            {x.text}
          </div>
        ))}
      </div>

      {stampAnim > 0 && (
        <div className="stamp-fx" key={stampAnim} onAnimationEnd={(e) => e.target === e.currentTarget && setStampAnim(0)} aria-hidden>
          <div className="stamp-fx__seal">
            <span>퇴근</span>
          </div>
        </div>
      )}

      {/* 시트들 */}
      <NameDialog
        open={needName}
        onDone={(name) => {
          commit((s) => setName(s, name, "always"));
          say(`${name}… 마음에 들어요. 잘 부탁해요.`, 5000);
        }}
      />
      {(needCheckin || sheet === "edit") && (
        <CheckinSheet
          key={`${today?.date ?? "new"}-${sheet}`}
          open
          dateKey={dateKey(now)}
          initialIn={today && !today.off ? today.inT : save.defIn}
          initialOut={today && !today.off ? today.outT : save.defOut}
          initialColor={today?.color ?? save.color}
          editing={!!today}
          canTakeOff={!today || (!today.off && today.rub === 0)}
          onClose={today ? () => setSheet(null) : undefined}
          onSubmit={(inT, outT, color) => {
            const first = !today || today.off;
            // 고른 색은 오늘 돌에 바로, 내일 돌에도 기본으로
            commit((s, ev) => {
              const c = setColor(s, color);
              return c.today ? editTimes(c, new Date(), inT, outT, ev) : checkIn(c, new Date(), inT, outT);
            });
            setSheet(null);
            if (first) say(lineOf("newRock"), 6000);
          }}
          onOff={() => {
            commit((s) => takeDayOff({ ...s, today: null }, new Date()));
            setSheet(null);
            say(lineOf("off"), 6000);
          }}
        />
      )}
      <ShopSheet
        open={sheet === "shop"}
        save={save}
        fresh={fresh}
        onClose={() => setSheet(null)}
        onBuy={(id) => {
          commit((s) => buy(s, id));
          const it = ITEMS.find((i) => i.id === id);
          if (it) say(it.line.replaceAll("{이름}", save.name), 5000);
        }}
        onWear={(id) => {
          commit((s) => wearItem(s, id));
          const it = ITEMS.find((i) => i.id === id);
          const next = saveRef.current!;
          const full = new Set(next.wear.map((w) => ITEMS.find((i) => i.id === w)?.slot)).size >= 6;
          if (full) say(lineOf("fullSet"), 6000);
          else if (it) say(it.line.replaceAll("{이름}", save.name), 5000);
        }}
        onUnwear={(id) => commit((s) => unwearItem(s, id))}
      />
      {sheet === "shelf" && (
        <ShelfSheet
          open
          rocks={rocks}
          todayKey={dateKey(now)}
          totalDone={save.doneCount}
          streak={save.streak}
          onClose={() => setSheet(null)}
          onPhoto={(y, m) => openPhoto("shelf", y, m)}
        />
      )}
      {sheet === "settings" && (
        <SettingsSheet
          open
          save={save}
          storageOk={storageOk}
          onClose={() => setSheet(null)}
          onSave={({ name, defIn, defOut, color }) => {
            commit((s, ev) => {
              let c = setColor(setName(s, name, "always"), color);
              // 출근한 날 시간을 바꾸면 오늘 돌(최대 레벨, 타임라인)에도 바로 반영
              const t = c.today;
              if (t && !t.off && (t.inT !== defIn || t.outT !== defOut)) c = editTimes(c, new Date(), defIn, defOut, ev);
              return { ...c, defIn, defOut };
            });
            setSheet(null);
            toast("저장했어요");
          }}
          onReset={() => {
            clearSave();
            const fresh = defaultSave();
            saveRef.current = fresh;
            setSave(fresh);
            setSheet(null);
          }}
        />
      )}
      {sheet === "rename" && today && (
        <RenameDialog
          open
          current={today.name}
          onClose={() => setSheet(null)}
          onSave={(name, scope) => {
            commit((s) => setName(s, name, scope));
            setSheet(null);
          }}
        />
      )}
      {photo && <PhotoModal blob={photo.blob} loading={photo.loading} filename={photo.filename} onClose={() => setPhoto(null)} />}
    </main>
  );
}

function OffShelf({ rocks, onOpen }: { rocks: import("@/lib/types").Rock[]; onOpen: () => void }) {
  const recent = rocks.filter((r) => !r.off).slice(-5);
  return (
    <button className="offshelf" onClick={onOpen} aria-label="진열장 열기">
      <p className="offshelf__title">오늘은 돌이 없어요</p>
      <div className="offshelf__plank">
        {recent.length ? (
          recent.map((r) => (
            <RockSvg key={r.date} seed={r.date} t={roundness(r.rub, r.maxLv)} wear={r.wear} color={r.color} thumb className="offshelf__rock" />
          ))
        ) : (
          <span className="offshelf__empty">아직 진열된 돌이 없어요</span>
        )}
      </div>
      <p className="offshelf__more">진열장 보기</p>
    </button>
  );
}
