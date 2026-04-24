import type { QuoteItem } from "../types";

type LineItemCardProps = {
  index: number;
  item: QuoteItem;
  onChange: (itemId: string, patch: Partial<QuoteItem>) => void;
};

export function LineItemCard({ index, item, onChange }: LineItemCardProps) {
  return (
    <article className="panel line-item-card">
      <h2>
        {index + 1}. {item.specLabel}
      </h2>
      <label>
        第 {index + 1} 行白胚数量
        <input
          type="number"
          aria-label={`第 ${index + 1} 行白胚数量`}
          value={item.blankQuantity}
          onChange={(event) =>
            onChange(item.id, { blankQuantity: Number(event.target.value) })
          }
        />
      </label>
      {item.manualBlankPriceEnabled ? <p className="manual-tag">已手动调整</p> : null}
      <p>白胚单价：{item.quotedBlankPrice}</p>
      <p>行合计：{item.lineTotal}</p>
    </article>
  );
}
