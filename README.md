# 퇴근돌 키우기

퇴근하고 싶을 때마다 문지르는 돌. 기획서는 `PLAN.md` (v0.4).

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 로직 테스트 (vitest)
npm run build
```

## 구조

| 경로 | 역할 |
|---|---|
| `src/lib/config.ts` | 수치 표 (레벨, 보상, 직급, 돌 이름 단계) |
| `src/lib/checkin.ts` | `maxLevel(in, out)`, 둥글기·레벨 계산 |
| `src/lib/shape.ts` | `rockShape(seed, t)` 네모→원 외곽선 (순수 함수, 날짜 시드) |
| `src/lib/state.ts` | 저장/불러오기, 체크인, 문지르기, 보상, 승진, 날짜 변경 |
| `src/lib/clock.ts` | 출퇴근 시계 상태 |
| `src/lib/items.tsx` | 꾸밈 아이템 21개 (데이터 + SVG) |
| `src/lib/lines.ts` | 상황별 대사 |
| `src/lib/photo.tsx` | 1080×1350 사진 생성 |

폰트: 제목·숫자는 Gaegu(700), 본문은 Gowun Dodum. 제목 폰트는 `src/app/layout.tsx`의 `--font-display`와 `photo.tsx`의 Google Fonts 요청 두 곳에서 바꾼다.
| `src/components/` | 화면 (Game, RockSvg, 시트들) |

저장은 `localStorage['toegeun-dol-v3']`.
