import type { QuoteItem } from "../types";

type AdvancedSettingsProps = {
  globalFactor: number;
  items: QuoteItem[];
  onFactorChange: (value: number) => void;
  onItemChange: (itemId: string, patch: Partial<QuoteItem>) => void;
};

export function AdvancedSettings({
  globalFactor,
  items,
  onFactorChange,
  onItemChange
}: AdvancedSettingsProps) {
  return (
    <details className="panel">
      <summary>高级设置</summary>
      <label>
        统一系数
        <input
          type="number"
          step="0.01"
          aria-label="统一系数"
          value={globalFactor}
          onChange={(event) => onFactorChange(Number(event.target.value))}
        />
      </label>

      {items.map((item, index) => (
        <div key={item.id} className="advanced-row">
          <label>
            第 {index + 1} 行手动改单价
            <input
              type="checkbox"
              aria-label={`第 ${index + 1} 行手动改单价`}
              checked={item.manualBlankPriceEnabled}
              onChange={(event) =>
                onItemChange(item.id, {
                  manualBlankPriceEnabled: event.target.checked
                })
              }
            />
          </label>

          <label>
            第 {index + 1} 行白胚单价
            <input
              type="number"
              aria-label={`第 ${index + 1} 行白胚单价`}
              value={item.manualBlankPrice ?? 0}
              disabled={!item.manualBlankPriceEnabled}
              onChange={(event) =>
                onItemChange(item.id, {
                  manualBlankPrice: Number(event.target.value)
                })
              }
            />
          </label>
        </div>
      ))}
    </details>
  );
}
