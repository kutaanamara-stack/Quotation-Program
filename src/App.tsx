import { useMemo } from "react";
import { createDefaultQuote, recalculateQuote } from "./domain/quote";
import { validateQuote } from "./domain/validation";

function App() {
  const quote = useMemo(() => recalculateQuote(createDefaultQuote()), []);
  const errors = useMemo(() => validateQuote(quote), [quote]);

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>餐具修复报价工具</h1>
        <p>内部填写报价并导出正式图片或 PDF。</p>
        <p>当前总金额：{quote.grandTotal}</p>
      </header>

      {errors.length > 0 ? (
        <section aria-label="校验提示">
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="toolbar" aria-label="导出操作">
        <button type="button" disabled={errors.length > 0}>
          导出 PDF
        </button>
        <button type="button" disabled={errors.length > 0}>
          导出图片
        </button>
      </section>
    </main>
  );
}

export default App;
