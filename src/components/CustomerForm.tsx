import type { QuoteDocument } from "../types";

type CustomerFormProps = {
  quote: QuoteDocument;
  onChange: (patch: Partial<QuoteDocument>) => void;
};

export function CustomerForm({ quote, onChange }: CustomerFormProps) {
  return (
    <section className="panel">
      <label>
        客户公司名称
        <input
          aria-label="客户公司名称"
          value={quote.companyName}
          onChange={(event) => onChange({ companyName: event.target.value })}
        />
      </label>

      <label>
        日期
        <input
          type="date"
          aria-label="日期"
          value={quote.quoteDate}
          onChange={(event) => onChange({ quoteDate: event.target.value })}
        />
      </label>
    </section>
  );
}
