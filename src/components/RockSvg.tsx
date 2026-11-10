import { useId } from "react";
import { CX, CY, VB_H, VB_W, rockColors, rockShape } from "@/lib/shape";
import { ITEMS, itemById, type Geo } from "@/lib/items";

export type Face = "idle" | "rub" | "level" | "done" | "over" | "off";

type Props = {
  seed: string;
  t: number;
  name?: string;
  wear?: string[];
  /** 돌 색깔 id (lib/colors) */
  color?: string;
  face?: Face;
  /** 진열장 축소판: 얼굴·이름 생략, 머리 아이템만 */
  thumb?: boolean;
  /** 사진용: 처음 네모 모양을 흐리게 겹친다 */
  ghost?: boolean;
  className?: string;
  width?: number | string;
  height?: number | string;
};

const LINE = "#5f584f";
const INK = "#2b2824";

function nameSize(name: string): number {
  const n = Array.from(name).length;
  // Gaegu는 글자가 작게 그려져서 기획서 수치(22~16px)보다 키운다
  if (n <= 3) return 27;
  if (n === 4) return 24;
  if (n === 5) return 22;
  return 19;
}

const ORDER = ["floor", "body", "left", "right", "face", "head"];

export default function RockSvg({
  seed,
  t,
  name = "",
  wear = [],
  color,
  face = "idle",
  thumb = false,
  ghost = false,
  className,
  width,
  height,
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const shape = rockShape(seed, t);
  const { e, tilt, box, texture } = shape;
  const col = rockColors(t, color);
  const rough = 1 - e;
  const geo: Geo = { cx: CX, cy: CY, box, name };

  const worn = wear
    .map(itemById)
    .filter((i): i is (typeof ITEMS)[number] => !!i)
    .filter((i) => !thumb || i.slot === "head")
    .sort((a, b) => ORDER.indexOf(a.slot) - ORDER.indexOf(b.slot));
  const back = worn.filter((i) => i.layer === "back");
  const front = worn.filter((i) => i.layer !== "back");

  const viewBox = thumb ? `${CX - 118} ${CY - 172} 236 286` : `0 0 ${VB_W} ${VB_H}`;
  const stroke = thumb ? { strokeWidth: 1.5, vectorEffect: "non-scaling-stroke" as const } : { strokeWidth: 2.5 };

  const blush = face === "rub" || face === "done" ? 0.55 : t >= 1 ? 0.35 : 0.2;
  const ey = CY - 12;
  const ex = 26;

  return (
    <svg
      className={className}
      viewBox={viewBox}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={thumb ? "돌" : `${name} 돌`}
    >
      <defs>
        <radialGradient id={`g${uid}`} cx="34%" cy="30%" r="78%">
          <stop offset="0%" stopColor={col.light} />
          <stop offset="100%" stopColor={col.dark} />
        </radialGradient>
        <clipPath id={`c${uid}`}>
          <path d={shape.path} />
        </clipPath>
      </defs>

      {/* 바닥 그림자 */}
      <ellipse cx={CX} cy={box.maxY + 7} rx={(box.maxX - box.minX) * 0.42} ry={thumb ? 10 : 8} fill="#4a3f33" opacity={0.14} />

      {back.map((it) => (
        <g key={it.id} data-item={it.id}>
          {it.draw(geo)}
        </g>
      ))}

      {ghost && (
        <path
          d={rockShape(seed, 0).path}
          fill="#8a8378"
          fillOpacity={0.16}
          stroke="#5f584f"
          strokeOpacity={0.35}
          strokeWidth={2}
          strokeDasharray="6 6"
        />
      )}

      {/* 돌 */}
      <path d={shape.path} fill={`url(#g${uid})`} />
      <g clipPath={`url(#c${uid})`}>
        {!thumb &&
          texture.stains.map((s, i) => (
            <ellipse
              key={`s${i}`}
              cx={s.x}
              cy={s.y}
              rx={s.rx}
              ry={s.ry}
              transform={`rotate(${s.rot} ${s.x} ${s.y})`}
              fill="#4e473f"
              opacity={0.22 * rough}
            />
          ))}
        {texture.dots.map((d, i) => (
          <circle key={`d${i}`} cx={d.x} cy={d.y} r={thumb ? d.r * 1.8 : d.r} fill="#3d3731" opacity={0.55 * Math.max(0, rough * 1.3 - 0.3)} />
        ))}
        {!thumb &&
          texture.cracks.map((c, i) => (
            <polyline
              key={`k${i}`}
              points={c.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#3d3731"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.7 * rough}
            />
          ))}
        {/* 오른쪽 아래 그늘: 외곽선을 왼쪽 위로 밀어서 안쪽 초승달 모양만 남긴다 */}
        <path d={shape.path} fill="none" stroke="#3d3731" strokeWidth={24} opacity={0.13} transform="translate(-9 -11)" />
        {/* 광택 */}
        <ellipse cx={CX - 40} cy={CY - 48} rx={30} ry={17} transform={`rotate(-32 ${CX - 40} ${CY - 48})`} fill="#fff" opacity={0.18 * e} />
        <ellipse cx={CX - 44} cy={CY - 52} rx={14} ry={7} transform={`rotate(-32 ${CX - 44} ${CY - 52})`} fill="#fff" opacity={Math.max(0, e * 1.6 - 0.6) * 0.85} />
      </g>
      <path d={shape.path} fill="none" stroke={LINE} strokeLinejoin="round" {...stroke} />
      {t >= 1 && !thumb && (
        <path
          d={`M${CX - 20} ${CY - 70} l3 -9 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3 Z`}
          fill="#fff8df"
          stroke="#d6a224"
          strokeWidth={1.2}
          className="twinkle"
        />
      )}

      {/* 얼굴: 둥글기와 상관없이 같은 자리, 같은 크기 */}
      {!thumb && (
        <g>
          <ellipse cx={CX - 40} cy={CY + 6} rx={11} ry={6} fill="#e98b7a" opacity={blush} />
          <ellipse cx={CX + 40} cy={CY + 6} rx={11} ry={6} fill="#e98b7a" opacity={blush} />
          <Eyes face={face} ey={ey} ex={ex} />
          <Mouth face={face} />
          {face === "over" && (
            <path
              d={`M${CX + 48} ${CY - 44} q-7 10 0 13 q7 -3 0 -13 Z`}
              fill="#bfe1f0"
              stroke={INK}
              strokeWidth={1.6}
              className="sweat"
            />
          )}
          {face === "off" && (
            <g className="zz" fill={INK} fontFamily="Gaegu, sans-serif" fontWeight={700}>
              <text x={CX + 52} y={box.minY - 6} fontSize={18}>z</text>
              <text x={CX + 66} y={box.minY - 22} fontSize={13}>z</text>
            </g>
          )}
        </g>
      )}

      {/* 새긴 이름 (돌 기울기를 따라감) */}
      {!thumb && name && (
        <g transform={`rotate(${tilt} ${CX} ${CY})`} className="engrave" data-name-hit="1">
          <rect x={CX - 58} y={CY + 38} width={116} height={34} fill="transparent" />
          <text
            x={CX}
            y={CY + 63}
            textAnchor="middle"
            fontSize={nameSize(name)}
            fill="#fff"
            fillOpacity={0.4}
            fontFamily="Gaegu, sans-serif" fontWeight={700}
            className="font-display"
          >
            {name}
          </text>
          <text
            x={CX}
            y={CY + 62}
            textAnchor="middle"
            fontSize={nameSize(name)}
            fill={col.engrave}
            fontFamily="Gaegu, sans-serif" fontWeight={700}
            className="font-display"
          >
            {name}
          </text>
        </g>
      )}

      {front.map((it) => (
        <g key={it.id} data-item={it.id} transform={it.slot === "head" ? `rotate(${tilt} ${CX} ${CY})` : undefined}>
          {it.draw(geo)}
        </g>
      ))}
    </svg>
  );
}

function Eyes({ face, ey, ex }: { face: Face; ey: number; ex: number }) {
  const l = CX - ex;
  const r = CX + ex;
  if (face === "rub" || face === "done") {
    return (
      <g fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${l - 7} ${ey + 3} L${l} ${ey - 4} L${l + 7} ${ey + 3}`} />
        <path d={`M${r - 7} ${ey + 3} L${r} ${ey - 4} L${r + 7} ${ey + 3}`} />
      </g>
    );
  }
  if (face === "level") {
    const star = (x: number) =>
      `M${x} ${ey - 9} L${x + 2.6} ${ey - 2.8} L${x + 9} ${ey - 2.4} L${x + 4} ${ey + 1.8} L${x + 5.6} ${ey + 8.2} L${x} ${ey + 4.6} L${x - 5.6} ${ey + 8.2} L${x - 4} ${ey + 1.8} L${x - 9} ${ey - 2.4} L${x - 2.6} ${ey - 2.8} Z`;
    return (
      <g fill="#d6a224" stroke={INK} strokeWidth={1.6} strokeLinejoin="round">
        <path d={star(l)} />
        <path d={star(r)} />
      </g>
    );
  }
  if (face === "off") {
    return (
      <g stroke={INK} strokeWidth={3.2} strokeLinecap="round">
        <path d={`M${l - 7} ${ey} H${l + 7}`} />
        <path d={`M${r - 7} ${ey} H${r + 7}`} />
      </g>
    );
  }
  return (
    <g className="blink" style={{ transformOrigin: `${CX}px ${ey}px` }}>
      <ellipse cx={l} cy={ey} rx={5} ry={6.5} fill={INK} />
      <ellipse cx={r} cy={ey} rx={5} ry={6.5} fill={INK} />
      <circle cx={l + 1.6} cy={ey - 2.4} r={1.6} fill="#fff" />
      <circle cx={r + 1.6} cy={ey - 2.4} r={1.6} fill="#fff" />
    </g>
  );
}

function Mouth({ face }: { face: Face }) {
  const y = CY + 8;
  if (face === "rub" || face === "done" || face === "level") {
    return <path d={`M${CX - 11} ${y - 2} Q${CX} ${y + 14} ${CX + 11} ${y - 2} Z`} fill="#7a3b33" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />;
  }
  if (face === "over") {
    return (
      <path
        d={`M${CX - 12} ${y + 2} q3 -4 6 0 t6 0 t6 0 t6 0`}
        fill="none"
        stroke={INK}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    );
  }
  return <path d={`M${CX - 7} ${y} Q${CX} ${y + 6} ${CX + 7} ${y}`} fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />;
}

