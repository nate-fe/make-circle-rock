# 퇴근돌 키우기

퇴근하고 싶을 때마다 문지르는 돌. 매일 받는 네모돌을 문질러서 동그랗게 만들고, 출근 몇 시간 만에 완성했는지 기록으로 겨룬다.
기획서는 [`PLAN.md`](PLAN.md) (v0.5).

## 실행

```bash
npm install
npm run dev         # http://localhost:3000
npm test            # 로직 테스트 (vitest)
npm run typecheck   # 타입 검사
npm run build
```

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5 · Vitest 5
- 개발 중에는 주소 끝에 `?offer`를 붙이면 광고 치트키 카드가 바로 뜬다 (Lv.1 이상일 때, 개발 모드에서만).

## 구조

| 경로 | 역할 |
|---|---|
| `src/lib/config.ts` | 수치 표: 레벨당 문지름, 초당 제한, 광고 치트키, 보상, 직급, 돌 이름 단계 |
| `src/lib/state.ts` | 저장/불러오기, 체크인, 문지르기, 보상 정산, 승진, 날짜 변경, 도장, 치트키, 색, 상점 |
| `src/lib/checkin.ts` | `maxLevel(in, out)`, 둥글기·레벨 계산 |
| `src/lib/record.ts` | 시간 배틀 기록: 출근 시각 → 완성 순간 (`recordMs`, `recordPhrase`) |
| `src/lib/input.ts` | 초당 문지름 제한 (토큰 통) |
| `src/lib/shape.ts` | `rockShape(seed, t)` 네모→원 외곽선, `rockColors(t, color)` |
| `src/lib/colors.ts` | 기본 돌 색 8가지 + 직접 고른 색(`#rrggbb`)으로 팔레트 만들기 |
| `src/lib/clock.ts` | 출퇴근 상태, 도장 가능 여부 |
| `src/lib/date.ts` · `rng.ts` | 로컬 날짜 키, 날짜 시드 난수 (mulberry32) |
| `src/lib/shelf.ts` | 진열장 월 달력 칸 |
| `src/lib/items.tsx` | 꾸밈 아이템 21개 (데이터 + SVG) |
| `src/lib/lines.ts` | 상황별 대사 |
| `src/lib/photo.tsx` | 1080×1350 사진 (오늘의 돌, 이번 달 진열장) |
| `src/lib/logic.test.ts` | 로직 테스트 |
| `src/components/Game.tsx` | 메인 화면, 문지르기 입력, 토스트, 시트 열고 닫기 |
| `src/components/WorkTimeline.tsx` | "출근 후 / 퇴근까지" 통합 시계와 진행 바 |
| `src/components/Cheat.tsx` | 광고 치트키 제안 카드, 광고 화면 (지금은 가짜 광고) |
| `src/components/CheckinSheet.tsx` | 매일 출근 체크인 (출퇴근 시간 + 오늘 돌 색) |
| `src/components/ColorPicker.tsx` | 돌 색 고르기 (기본 8색 + 직접 고르기) |
| `src/components/` 나머지 | RockSvg, 진열장·상점·설정 시트, 사진 창, 이름 대화상자, 아이콘 |

## 저장

- `localStorage['toegeun-dol-v3']`에 JSON 하나로 저장. 바뀐 뒤 250ms 디바운스.
- 서버 없음. 기기·브라우저 사이에 공유되지 않고, 브라우저 데이터를 지우면 사라진다.
- 돌 모양은 저장하지 않는다. 날짜 시드와 문지름 수로 매번 다시 그린다.

## 폰트

제목·숫자는 Gaegu(700), 본문은 Gowun Dodum. 둘 다 SIL Open Font License라 무료로 쓸 수 있다.
제목 폰트를 바꾸려면 두 곳을 같이 바꾼다: `src/app/layout.tsx`의 `--font-display`, `src/lib/photo.tsx`의 Google Fonts 요청.

## 광고

`Cheat.tsx`의 `AdModal`은 지금 "광고가 들어갈 자리" 가짜 화면이다. 실제 보상형 광고(AdSense H5, Ad Manager 등)를 붙일 때는 이 컴포넌트 안만 바꾸고, 끝까지 봤을 때 `onReward`를 부르면 된다.
