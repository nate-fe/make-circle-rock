"use client";

import Sheet from "./Sheet";
import ItemIcon from "./ItemIcon";
import { CoinIcon } from "./Icons";
import { ITEMS, SLOT_LABEL, fillName } from "@/lib/items";
import { RANKS } from "@/lib/config";
import type { SaveData } from "@/lib/types";

type Props = {
  open: boolean;
  save: SaveData;
  fresh: string[]; // NEW 표시할 아이템
  onClose: () => void;
  onBuy: (id: string) => void;
  onWear: (id: string) => void;
  onUnwear: (id: string) => void;
};

export default function ShopSheet({ open, save, fresh, onClose, onBuy, onWear, onUnwear }: Props) {
  const groups = RANKS.map((r, idx) => ({ rank: r.name, idx, items: ITEMS.filter((i) => i.rank === idx) })).filter(
    (g) => g.items.length,
  );

  return (
    <Sheet
      open={open}
      onClose={onClose}
      className="shop"
      title="꾸미기"
      headerRight={
        <span className="coin-chip">
          <CoinIcon size={18} /> {save.coins.toLocaleString()}
        </span>
      }
    >
      {groups.map((g) => {
        const unlocked = g.idx <= save.rank;
        return (
          <section key={g.rank} className="shop__group">
            <h3 className="shop__rank">
              <span className={`rank-stamp rank-stamp--sm ${unlocked ? "" : "is-muted"}`}>{g.rank}</span>
              <span className="shop__rank-line" aria-hidden />
            </h3>
            <div className="shop__grid">
              {g.items.map((it) => {
                if (!unlocked) {
                  return (
                    <article key={it.id} className="shop-card is-locked">
                      <div className="shop-card__art">
                        <ItemIcon item={it} name={save.name} locked />
                      </div>
                      <p className="shop-card__name">? ? ?</p>
                      <p className="shop-card__desc">{g.rank} 승진 시 공개</p>
                    </article>
                  );
                }
                const owned = save.owned.includes(it.id);
                const worn = save.wear.includes(it.id);
                const afford = save.coins >= it.price;
                return (
                  <article key={it.id} className={`shop-card ${worn ? "is-worn" : ""}`}>
                    {fresh.includes(it.id) && <span className="new-tag">NEW</span>}
                    <span className="slot-tag">{SLOT_LABEL[it.slot]}</span>
                    <div className="shop-card__art">
                      <ItemIcon item={it} name={save.name} />
                    </div>
                    <p className="shop-card__name">{it.name}</p>
                    <p className="shop-card__desc">{fillName(it.desc, save.name)}</p>
                    {owned ? (
                      <button
                        className={`btn btn--sm ${worn ? "" : "btn--green"}`}
                        onClick={() => (worn ? onUnwear(it.id) : onWear(it.id))}
                      >
                        {worn ? "벗기" : "착용"}
                      </button>
                    ) : (
                      <button className="btn btn--sm btn--buy" disabled={!afford} onClick={() => onBuy(it.id)}>
                        <CoinIcon size={15} /> {it.price.toLocaleString()}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </Sheet>
  );
}
