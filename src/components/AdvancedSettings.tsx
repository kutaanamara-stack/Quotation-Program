type AdvancedSettingsProps = {
  globalFactor: number;
  onFactorChange: (value: number) => void;
};

export function AdvancedSettings({
  globalFactor,
  onFactorChange
}: AdvancedSettingsProps) {
  return (
    <details className="panel" open>
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
    </details>
  );
}
