import { useState } from "react";
import { AdvancedSettings } from "./components/AdvancedSettings";
import { CustomerForm } from "./components/CustomerForm";
import { LineItemCard } from "./components/LineItemCard";
import { PreviewPanel } from "./components/PreviewPanel";
import { SummaryPanel } from "./components/SummaryPanel";
import { Toolbar } from "./components/Toolbar";
import { createDefaultQuote, recalculateQuote } from "./domain/quote";
import { validateQuote } from "./domain/validation";
import { exportQuoteAsPdf, exportQuoteAsPng } from "./export/exportFile";
import { buildRenderPlan } from "./export/renderPlan";
import type { QuoteDocument, QuoteItem } from "./types";

function App() {
  const [quote, setQuote] = useState(() => recalculateQuote(createDefaultQuote()));

  function updateQuote(patch: Partial<QuoteDocument>) {
    setQuote((current) => recalculateQuote({ ...current, ...patch }));
  }

  function updateItem(itemId: string, patch: Partial<QuoteItem>) {
    setQuote((current) =>
      recalculateQuote({
        ...current,
        items: current.items.map((item) =>
          item.id === itemId ? { ...item, ...patch } : item
        )
      })
    );
  }

  const errors = validateQuote(quote);
  const plan = buildRenderPlan(quote);

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>餐具修复报价工具</h1>
        <p>内部填写报价并导出正式图片或 PDF。</p>
      </header>

      <Toolbar
        onReset={() => setQuote(recalculateQuote(createDefaultQuote()))}
        onExportPdf={() => void exportQuoteAsPdf(quote)}
        onExportPng={() => void exportQuoteAsPng(quote)}
        exportDisabled={errors.length > 0}
      />

      <CustomerForm quote={quote} onChange={updateQuote} />
      <AdvancedSettings
        globalFactor={quote.globalFactor}
        items={quote.items}
        onFactorChange={(value) => updateQuote({ globalFactor: value })}
        onItemChange={updateItem}
      />

      <section className="item-grid">
        {quote.items.map((item, index) => (
          <LineItemCard key={item.id} index={index} item={item} onChange={updateItem} />
        ))}
      </section>

      <SummaryPanel total={quote.grandTotal} errors={errors} />
      <PreviewPanel plan={plan} />
    </main>
  );
}

export default App;
