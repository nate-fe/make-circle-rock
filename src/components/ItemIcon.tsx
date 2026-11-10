"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Geo, Item } from "@/lib/items";

const GEO: Geo = { cx: 150, cy: 170, box: { minX: 52, minY: 72, maxX: 248, maxY: 268 }, name: "돌쇠" };

/** 아이템만 따로 그린다. 실제로 그려진 영역에 맞춰 viewBox를 잡는다. */
export default function ItemIcon({ item, name, locked }: { item: Item; name: string; locked?: boolean }) {
  const ref = useRef<SVGGElement>(null);
  const [vb, setVb] = useState("0 0 300 320");
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    const b = g.getBBox();
    const side = Math.max(b.width, b.height) + 12;
    setVb(`${b.x + b.width / 2 - side / 2} ${b.y + b.height / 2 - side / 2} ${side} ${side}`);
  }, [item.id, name]);
  return (
    <svg viewBox={vb} className={`item-icon ${locked ? "is-locked" : ""}`} aria-hidden>
      <g ref={ref}>{item.draw({ ...GEO, name })}</g>
    </svg>
  );
}
