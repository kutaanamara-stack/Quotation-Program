type SummaryPanelProps = {
  total: number;
  errors: string[];
};

export function SummaryPanel({ total, errors }: SummaryPanelProps) {
  return (
    <section className="panel">
      <h2>汇总</h2>
      <p>总金额：{total}</p>
      {errors.length > 0 ? (
        <ul>
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : (
        <p>可以导出正式文件。</p>
      )}
    </section>
  );
}
