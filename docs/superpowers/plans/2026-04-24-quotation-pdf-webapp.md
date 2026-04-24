# Quotation PDF/PNG Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-friendly internal quotation web app that edits six fixed pricing rows and exports a formal document as either PNG or PDF using the existing draft image and logo.

**Architecture:** Use a Vite + React + TypeScript single-page app with a pure domain layer for pricing math and validation. Build a separate export pipeline that converts quote data into a render plan, paints a high-resolution canvas from the template, then reuses the same canvas output for both PNG download and PDF embedding so the two export formats stay visually identical.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, React Testing Library, pdf-lib, native Canvas API

---

## File Structure

- Create: `package.json` - project scripts and dependencies
- Create: `tsconfig.json` - TypeScript compiler settings
- Create: `tsconfig.node.json` - Vite node-side TypeScript settings
- Create: `vite.config.ts` - Vite config and Vitest setup
- Create: `index.html` - app entry HTML
- Create: `public/template/quotation-template.png` - copied from `报价单草稿/报价单.png`
- Create: `public/template/studio-logo.jpg` - copied from `报价单草稿/公司logo.jpg`
- Create: `src/main.tsx` - React bootstrap
- Create: `src/App.tsx` - top-level state, layout, export actions
- Create: `src/styles.css` - responsive layout and print-preview styling
- Create: `src/types.ts` - shared TypeScript types for quote data
- Create: `src/domain/quote.ts` - default data and pricing recalculation logic
- Create: `src/domain/quote.test.ts` - unit tests for pricing math
- Create: `src/domain/validation.ts` - validation and filename helpers
- Create: `src/domain/validation.test.ts` - unit tests for validation rules
- Create: `src/export/renderPlan.ts` - coordinate mapping and drawing instructions
- Create: `src/export/renderPlan.test.ts` - unit tests for export layout rules
- Create: `src/export/canvasRenderer.ts` - render plan to canvas
- Create: `src/export/exportFile.ts` - PNG/PDF file generation
- Create: `src/components/Toolbar.tsx` - top action bar
- Create: `src/components/CustomerForm.tsx` - company/date/notes/signature form
- Create: `src/components/LineItemCard.tsx` - one quote row editor
- Create: `src/components/AdvancedSettings.tsx` - factor and hidden pricing controls
- Create: `src/components/SummaryPanel.tsx` - totals and validation summary
- Create: `src/components/PreviewPanel.tsx` - on-page preview canvas
- Create: `src/App.test.tsx` - UI integration tests
- Create: `src/test/setup.ts` - RTL and browser API test setup
- Create: `README.md` - local run/build/export notes

## Implementation Notes

- Keep row count fixed at six and store row metadata in code, not user-editable collections.
- Use declarative quote state; never compute totals directly inside JSX.
- Export PNG first from canvas, then embed that PNG into a PDF page with `pdf-lib`.
- Use integer-safe pricing by rounding at the quote-unit level with `Math.round`.
- Because the workspace is not currently a git repository, commit steps below should be run only after `git init` if you want checkpoint commits.

### Task 1: Bootstrap the app shell and test harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`
- Create: `README.md`

- [ ] **Step 1: Write the first failing UI smoke test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the quotation title and export actions", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /餐具修复报价工具/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /导出 pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /导出图片/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Create the project scaffold and test wiring**

Create `package.json`:

```json
{
  "name": "quotation-pdf-webapp",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "pdf-lib": "^1.17.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vitest": "^2.1.4"
  }
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts"
  }
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom";
```

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>餐具修复报价工具</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Run the test to confirm the app shell is missing**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL with a module or component error because `App.tsx` and `main.tsx` are not implemented yet.

- [ ] **Step 4: Add the minimal app shell to satisfy the smoke test**

Create `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `src/App.tsx`:

```tsx
function App() {
  return (
    <main className="app-shell">
      <header className="hero">
        <h1>餐具修复报价工具</h1>
        <p>内部填写报价并导出正式 PNG 或 PDF。</p>
      </header>

      <section className="toolbar">
        <button type="button">导出 PDF</button>
        <button type="button">导出图片</button>
      </section>
    </main>
  );
}

export default App;
```

Create `src/styles.css`:

```css
:root {
  font-family: "Noto Sans SC", "Microsoft YaHei", sans-serif;
  color: #1f2937;
  background: linear-gradient(180deg, #f4efe5 0%, #fbfaf7 100%);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.hero {
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  gap: 12px;
}

button {
  min-height: 44px;
  padding: 0 16px;
}
```

Create `README.md`:

```md
# Quotation PDF Web App

## Commands

- `npm install`
- `npm run dev`
- `npm test`
- `npm run build`
```

- [ ] **Step 5: Run the smoke test and build**

Run: `npm install`

Run: `npm test -- src/App.test.tsx`

Expected: PASS

Run: `npm run build`

Expected: Vite build succeeds and produces `dist/`

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json tsconfig.node.json vite.config.ts index.html src README.md
git commit -m "chore: bootstrap quotation web app"
```

### Task 2: Add the quote domain model and pricing math

**Files:**
- Create: `src/types.ts`
- Create: `src/domain/quote.ts`
- Create: `src/domain/quote.test.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write failing tests for factor math, manual overrides, and totals**

Create `src/domain/quote.test.ts`:

```ts
import { createDefaultQuote, recalculateQuote } from "./quote";

describe("recalculateQuote", () => {
  it("rounds base prices after multiplying by the global factor", () => {
    const quote = createDefaultQuote();
    quote.globalFactor = 1.35;
    quote.items[0].blankQuantity = 2;

    const result = recalculateQuote(quote);

    expect(result.items[0].quotedBlankPrice).toBe(8);
    expect(result.items[0].blankAmount).toBe(16);
  });

  it("keeps a manual override price when enabled", () => {
    const quote = createDefaultQuote();
    quote.globalFactor = 1.8;
    quote.items[1].manualBlankPriceEnabled = true;
    quote.items[1].manualBlankPrice = 23;
    quote.items[1].blankQuantity = 1;

    const result = recalculateQuote(quote);

    expect(result.items[1].quotedBlankPrice).toBe(23);
    expect(result.items[1].blankAmount).toBe(23);
  });

  it("adds blank and pattern amounts into the grand total", () => {
    const quote = createDefaultQuote();
    quote.items[0].blankQuantity = 1;
    quote.items[0].simplePatternQuantity = 2;
    quote.items[0].complexPatternQuantity = 1;

    const result = recalculateQuote(quote);

    expect(result.items[0].patternAmount).toBe(20);
    expect(result.grandTotal).toBe(26);
  });
});
```

- [ ] **Step 2: Run the domain tests to verify they fail**

Run: `npm test -- src/domain/quote.test.ts`

Expected: FAIL because `src/domain/quote.ts` does not exist yet.

- [ ] **Step 3: Implement the quote data model and recalculation helpers**

Create `src/types.ts`:

```ts
export type QuoteItem = {
  id: string;
  specLabel: string;
  note: string;
  baseBlankPrice: number | null;
  manualBlankPriceEnabled: boolean;
  manualBlankPrice: number | null;
  quotedBlankPrice: number;
  blankQuantity: number;
  blankAmount: number;
  simplePatternPrice: number;
  simplePatternQuantity: number;
  complexPatternPrice: number;
  complexPatternQuantity: number;
  patternAmount: number;
  lineTotal: number;
};

export type QuoteDocument = {
  companyName: string;
  quoteDate: string;
  remarks: string;
  signature: string;
  globalFactor: number;
  items: QuoteItem[];
  grandTotal: number;
};
```

Create `src/domain/quote.ts`:

```ts
import type { QuoteDocument, QuoteItem } from "../types";

const SPEC_ROWS = [
  { id: "lt20", specLabel: "<20公分", baseBlankPrice: 6 },
  { id: "20to28", specLabel: "28>尺寸>20公分", baseBlankPrice: 8 },
  { id: "28to35", specLabel: "35>尺寸>28公分", baseBlankPrice: 10 },
  { id: "35to45", specLabel: "45>尺寸>35公分", baseBlankPrice: 15 },
  { id: "45to60", specLabel: "60>尺寸>45公分", baseBlankPrice: 20 },
  { id: "pot", specLabel: "砂锅/汤锅", baseBlankPrice: null }
] as const;

function createItem(row: (typeof SPEC_ROWS)[number]): QuoteItem {
  return {
    id: row.id,
    specLabel: row.specLabel,
    note: "",
    baseBlankPrice: row.baseBlankPrice,
    manualBlankPriceEnabled: false,
    manualBlankPrice: row.baseBlankPrice,
    quotedBlankPrice: row.baseBlankPrice ?? 0,
    blankQuantity: 0,
    blankAmount: 0,
    simplePatternPrice: 5,
    simplePatternQuantity: 0,
    complexPatternPrice: 10,
    complexPatternQuantity: 0,
    patternAmount: 0,
    lineTotal: 0
  };
}

export function createDefaultQuote(): QuoteDocument {
  return {
    companyName: "",
    quoteDate: new Date().toISOString().slice(0, 10),
    remarks: "",
    signature: "",
    globalFactor: 1,
    items: SPEC_ROWS.map(createItem),
    grandTotal: 0
  };
}

function safeInt(value: number | null | undefined): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value as number)) : 0;
}

export function recalculateItem(item: QuoteItem, globalFactor: number): QuoteItem {
  const computedBlankPrice = item.manualBlankPriceEnabled
    ? safeInt(item.manualBlankPrice)
    : safeInt((item.baseBlankPrice ?? 0) * globalFactor);

  const blankAmount = computedBlankPrice * safeInt(item.blankQuantity);
  const simpleAmount = safeInt(item.simplePatternPrice) * safeInt(item.simplePatternQuantity);
  const complexAmount = safeInt(item.complexPatternPrice) * safeInt(item.complexPatternQuantity);
  const patternAmount = simpleAmount + complexAmount;

  return {
    ...item,
    quotedBlankPrice: computedBlankPrice,
    blankAmount,
    patternAmount,
    lineTotal: blankAmount + patternAmount
  };
}

export function recalculateQuote(quote: QuoteDocument): QuoteDocument {
  const items = quote.items.map((item) => recalculateItem(item, quote.globalFactor));
  const grandTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return { ...quote, items, grandTotal };
}
```

- [ ] **Step 4: Run the domain tests**

Run: `npm test -- src/domain/quote.test.ts`

Expected: PASS

- [ ] **Step 5: Use the domain defaults in `App.tsx`**

Update `src/App.tsx`:

```tsx
import { useMemo } from "react";
import { createDefaultQuote, recalculateQuote } from "./domain/quote";

function App() {
  const quote = useMemo(() => recalculateQuote(createDefaultQuote()), []);

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>餐具修复报价工具</h1>
        <p>内部填写报价并导出正式 PNG 或 PDF。</p>
        <p>当前总金额：{quote.grandTotal}</p>
      </header>

      <section className="toolbar">
        <button type="button">导出 PDF</button>
        <button type="button">导出图片</button>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/domain/quote.ts src/domain/quote.test.ts src/App.tsx
git commit -m "feat: add quotation pricing domain"
```

### Task 3: Add validation and export filename helpers

**Files:**
- Create: `src/domain/validation.ts`
- Create: `src/domain/validation.test.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write failing tests for required company name, negative values, and filename generation**

Create `src/domain/validation.test.ts`:

```ts
import { createDefaultQuote } from "./quote";
import { buildExportFilename, validateQuote } from "./validation";

describe("validateQuote", () => {
  it("requires company name before export", () => {
    const quote = createDefaultQuote();
    expect(validateQuote(quote)).toContain("请先填写客户公司名称。");
  });

  it("rejects negative quantities and prices", () => {
    const quote = createDefaultQuote();
    quote.companyName = "同庆楼";
    quote.items[0].blankQuantity = -1;

    expect(validateQuote(quote)).toContain("第 1 行存在负数，请修正后再导出。");
  });
});

describe("buildExportFilename", () => {
  it("creates date-based file names for both formats", () => {
    expect(buildExportFilename("同庆楼", "2026-04-24", "pdf")).toBe("同庆楼-餐具修复报价单-2026-04-24.pdf");
    expect(buildExportFilename("同庆楼", "2026-04-24", "png")).toBe("同庆楼-餐具修复报价单-2026-04-24.png");
  });
});
```

- [ ] **Step 2: Run the validation tests to verify they fail**

Run: `npm test -- src/domain/validation.test.ts`

Expected: FAIL because the validation module does not exist yet.

- [ ] **Step 3: Implement validation and filename helpers**

Create `src/domain/validation.ts`:

```ts
import type { QuoteDocument } from "../types";

export function validateQuote(quote: QuoteDocument): string[] {
  const errors: string[] = [];

  if (!quote.companyName.trim()) {
    errors.push("请先填写客户公司名称。");
  }

  const hasContent = quote.items.some(
    (item) =>
      item.blankQuantity > 0 ||
      item.simplePatternQuantity > 0 ||
      item.complexPatternQuantity > 0
  );

  if (!hasContent) {
    errors.push("报价单至少需要填写一项数量后才能导出。");
  }

  quote.items.forEach((item, index) => {
    const numericValues = [
      item.baseBlankPrice ?? 0,
      item.manualBlankPrice ?? 0,
      item.blankQuantity,
      item.simplePatternPrice,
      item.simplePatternQuantity,
      item.complexPatternPrice,
      item.complexPatternQuantity
    ];

    if (numericValues.some((value) => value < 0)) {
      errors.push(`第 ${index + 1} 行存在负数，请修正后再导出。`);
    }
  });

  return errors;
}

export function buildExportFilename(
  companyName: string,
  quoteDate: string,
  format: "pdf" | "png"
): string {
  const safeCompany = companyName.trim().replace(/[\\/:*?"<>|]/g, "-");
  return `${safeCompany}-餐具修复报价单-${quoteDate}.${format}`;
}
```

- [ ] **Step 4: Run the validation tests**

Run: `npm test -- src/domain/validation.test.ts`

Expected: PASS

- [ ] **Step 5: Show validation status in the app shell**

Update `src/App.tsx`:

```tsx
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
        <p>内部填写报价并导出正式 PNG 或 PDF。</p>
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

      <section className="toolbar">
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
```

- [ ] **Step 6: Commit**

```bash
git add src/domain/validation.ts src/domain/validation.test.ts src/App.tsx
git commit -m "feat: add export validation rules"
```

### Task 4: Build the responsive editing UI

**Files:**
- Create: `src/components/Toolbar.tsx`
- Create: `src/components/CustomerForm.tsx`
- Create: `src/components/LineItemCard.tsx`
- Create: `src/components/AdvancedSettings.tsx`
- Create: `src/components/SummaryPanel.tsx`
- Create: `src/App.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Replace the smoke test with an interaction-focused test**

Update `src/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App interactions", () => {
  it("recalculates the summary after editing company name, factor, and quantity", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/客户公司名称/i), "同庆楼");
    await user.clear(screen.getByLabelText(/统一系数/i));
    await user.type(screen.getByLabelText(/统一系数/i), "1.5");
    await user.clear(screen.getByLabelText(/第 1 行白胚数量/i));
    await user.type(screen.getByLabelText(/第 1 行白胚数量/i), "2");

    expect(screen.getByText(/总金额：18/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /导出 pdf/i })).toBeEnabled();
  });
});
```

- [ ] **Step 2: Run the interaction test to confirm the current shell is insufficient**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because the labeled form controls do not exist yet.

- [ ] **Step 3: Implement focused UI components and controlled state**

Create `src/components/Toolbar.tsx`:

```tsx
type ToolbarProps = {
  onReset: () => void;
  onExportPdf: () => void;
  onExportPng: () => void;
  exportDisabled: boolean;
};

export function Toolbar({ onReset, onExportPdf, onExportPng, exportDisabled }: ToolbarProps) {
  return (
    <section className="toolbar">
      <button type="button" onClick={onReset}>恢复默认</button>
      <button type="button" onClick={onExportPdf} disabled={exportDisabled}>导出 PDF</button>
      <button type="button" onClick={onExportPng} disabled={exportDisabled}>导出图片</button>
    </section>
  );
}
```

Create `src/components/CustomerForm.tsx`:

```tsx
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
```

Create `src/components/LineItemCard.tsx`:

```tsx
import type { QuoteItem } from "../types";

type LineItemCardProps = {
  index: number;
  item: QuoteItem;
  onChange: (itemId: string, patch: Partial<QuoteItem>) => void;
};

export function LineItemCard({ index, item, onChange }: LineItemCardProps) {
  return (
    <article className="panel line-item-card">
      <h2>{index + 1}. {item.specLabel}</h2>
      <label>
        第 {index + 1} 行白胚数量
        <input
          type="number"
          aria-label={`第 ${index + 1} 行白胚数量`}
          value={item.blankQuantity}
          onChange={(event) => onChange(item.id, { blankQuantity: Number(event.target.value) })}
        />
      </label>
      <p>白胚单价：{item.quotedBlankPrice}</p>
      <p>行合计：{item.lineTotal}</p>
    </article>
  );
}
```

Create `src/components/AdvancedSettings.tsx`:

```tsx
type AdvancedSettingsProps = {
  globalFactor: number;
  onFactorChange: (value: number) => void;
};

export function AdvancedSettings({ globalFactor, onFactorChange }: AdvancedSettingsProps) {
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
```

Create `src/components/SummaryPanel.tsx`:

```tsx
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
          {errors.map((error) => <li key={error}>{error}</li>)}
        </ul>
      ) : (
        <p>可以导出正式文件。</p>
      )}
    </section>
  );
}
```

Update `src/App.tsx`:

```tsx
import { useState } from "react";
import { createDefaultQuote, recalculateQuote } from "./domain/quote";
import { validateQuote } from "./domain/validation";
import type { QuoteDocument, QuoteItem } from "./types";
import { Toolbar } from "./components/Toolbar";
import { CustomerForm } from "./components/CustomerForm";
import { LineItemCard } from "./components/LineItemCard";
import { AdvancedSettings } from "./components/AdvancedSettings";
import { SummaryPanel } from "./components/SummaryPanel";

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

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>餐具修复报价工具</h1>
        <p>手机和电脑都可填写，并导出正式 PNG 或 PDF。</p>
      </header>

      <Toolbar
        onReset={() => setQuote(recalculateQuote(createDefaultQuote()))}
        onExportPdf={() => {}}
        onExportPng={() => {}}
        exportDisabled={errors.length > 0}
      />

      <CustomerForm quote={quote} onChange={updateQuote} />
      <AdvancedSettings
        globalFactor={quote.globalFactor}
        onFactorChange={(value) => updateQuote({ globalFactor: value })}
      />

      <section className="item-grid">
        {quote.items.map((item, index) => (
          <LineItemCard key={item.id} index={index} item={item} onChange={updateItem} />
        ))}
      </section>

      <SummaryPanel total={quote.grandTotal} errors={errors} />
    </main>
  );
}

export default App;
```

- [ ] **Step 4: Add mobile-first layout styles**

Update `src/styles.css`:

```css
.app-shell {
  min-height: 100vh;
  padding: 20px;
  display: grid;
  gap: 16px;
}

.toolbar {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 5;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 248, 239, 0.92);
  backdrop-filter: blur(14px);
}

.panel {
  padding: 16px;
  border: 1px solid #dbcbb5;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 12px 30px rgba(116, 74, 32, 0.08);
}

.panel label {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}

.panel input,
.panel textarea {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
}

.item-grid {
  display: grid;
  gap: 12px;
}

@media (min-width: 900px) {
  .app-shell {
    grid-template-columns: 1.1fr 0.9fr;
    align-items: start;
  }

  .hero,
  .toolbar,
  .item-grid {
    grid-column: 1 / span 2;
  }

  .item-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

- [ ] **Step 5: Run the interaction test**

Run: `npm test -- src/App.test.tsx`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components src/App.tsx src/App.test.tsx src/styles.css
git commit -m "feat: build responsive quotation editor"
```

### Task 5: Build the template-based render plan and preview canvas

**Files:**
- Create: `public/template/quotation-template.png`
- Create: `public/template/studio-logo.jpg`
- Create: `src/export/renderPlan.ts`
- Create: `src/export/renderPlan.test.ts`
- Create: `src/export/canvasRenderer.ts`
- Create: `src/components/PreviewPanel.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Copy the existing draft assets into the public folder**

Run:

```powershell
New-Item -ItemType Directory -Force -Path .\public\template
Copy-Item .\报价单草稿\报价单.png .\public\template\quotation-template.png
Copy-Item .\报价单草稿\公司logo.jpg .\public\template\studio-logo.jpg
```

Expected: Both files exist under `public/template/`

- [ ] **Step 2: Write failing tests for title rendering, total mapping, and long-name font shrink**

Create `src/export/renderPlan.test.ts`:

```ts
import { createDefaultQuote, recalculateQuote } from "../domain/quote";
import { buildRenderPlan } from "./renderPlan";

describe("buildRenderPlan", () => {
  it("maps title and grand total into draw instructions", () => {
    const quote = createDefaultQuote();
    quote.companyName = "同庆楼";
    quote.items[0].blankQuantity = 1;

    const plan = buildRenderPlan(recalculateQuote(quote));

    expect(plan.text.find((entry) => entry.key === "title")?.value).toBe("同庆楼餐具修复报价单");
    expect(plan.text.find((entry) => entry.key === "grand-total")?.value).toBe("6");
  });

  it("reduces title font size for long company names", () => {
    const quote = createDefaultQuote();
    quote.companyName = "上海某某某国际餐饮管理有限公司";

    const plan = buildRenderPlan(recalculateQuote(quote));

    expect(plan.text.find((entry) => entry.key === "title")?.fontSize).toBeLessThan(28);
  });
});
```

- [ ] **Step 3: Run the render-plan tests to confirm they fail**

Run: `npm test -- src/export/renderPlan.test.ts`

Expected: FAIL because `buildRenderPlan` does not exist yet.

- [ ] **Step 4: Implement render instructions and canvas rendering**

Create `src/export/renderPlan.ts`:

```ts
import type { QuoteDocument } from "../types";

export type TextInstruction = {
  key: string;
  value: string;
  x: number;
  y: number;
  fontSize: number;
  align?: CanvasTextAlign;
};

export type RenderPlan = {
  width: number;
  height: number;
  templateSrc: string;
  logoSrc: string;
  text: TextInstruction[];
};

function titleFontSize(companyName: string): number {
  if (companyName.length <= 8) return 28;
  if (companyName.length <= 14) return 24;
  return 20;
}

export function buildRenderPlan(quote: QuoteDocument): RenderPlan {
  const text: TextInstruction[] = [
    {
      key: "title",
      value: `${quote.companyName}餐具修复报价单`,
      x: 560,
      y: 130,
      fontSize: titleFontSize(quote.companyName),
      align: "center"
    },
    {
      key: "date",
      value: quote.quoteDate.replaceAll("-", ". "),
      x: 910,
      y: 182,
      fontSize: 16
    },
    {
      key: "grand-total",
      value: String(quote.grandTotal),
      x: 935,
      y: 571,
      fontSize: 20
    }
  ];

  quote.items.forEach((item, index) => {
    const rowY = 265 + index * 48;
    text.push(
      { key: `blank-price-${item.id}`, value: String(item.quotedBlankPrice), x: 410, y: rowY, fontSize: 15, align: "center" },
      { key: `blank-qty-${item.id}`, value: String(item.blankQuantity), x: 486, y: rowY, fontSize: 15, align: "center" },
      { key: `blank-amount-${item.id}`, value: String(item.blankAmount), x: 560, y: rowY, fontSize: 15, align: "center" },
      { key: `simple-qty-${item.id}`, value: String(item.simplePatternQuantity), x: 705, y: rowY, fontSize: 15, align: "center" },
      { key: `complex-qty-${item.id}`, value: String(item.complexPatternQuantity), x: 847, y: rowY, fontSize: 15, align: "center" },
      { key: `pattern-amount-${item.id}`, value: String(item.patternAmount), x: 935, y: rowY, fontSize: 15, align: "center" }
    );
  });

  return {
    width: 1121,
    height: 793,
    templateSrc: "/template/quotation-template.png",
    logoSrc: "/template/studio-logo.jpg",
    text
  };
}
```

Create `src/export/canvasRenderer.ts`:

```ts
import type { RenderPlan } from "./renderPlan";

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function renderPlanToCanvas(plan: RenderPlan, scale = 2): Promise<HTMLCanvasElement> {
  const [template, logo] = await Promise.all([loadImage(plan.templateSrc), loadImage(plan.logoSrc)]);
  const canvas = document.createElement("canvas");
  canvas.width = plan.width * scale;
  canvas.height = plan.height * scale;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context unavailable");
  }

  ctx.scale(scale, scale);
  ctx.drawImage(template, 0, 0, plan.width, plan.height);
  ctx.drawImage(logo, 74, 95, 70, 95);
  ctx.fillStyle = "#111827";

  for (const entry of plan.text) {
    ctx.font = `${entry.fontSize}px "Microsoft YaHei", sans-serif`;
    ctx.textAlign = entry.align ?? "left";
    ctx.fillText(entry.value, entry.x, entry.y);
  }

  return canvas;
}
```

Create `src/components/PreviewPanel.tsx`:

```tsx
import { useEffect, useRef } from "react";
import type { RenderPlan } from "../export/renderPlan";
import { renderPlanToCanvas } from "../export/canvasRenderer";

type PreviewPanelProps = {
  plan: RenderPlan;
};

export function PreviewPanel({ plan }: PreviewPanelProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let disposed = false;

    renderPlanToCanvas(plan, 1).then((canvas) => {
      if (disposed || !hostRef.current) return;
      hostRef.current.innerHTML = "";
      hostRef.current.appendChild(canvas);
    });

    return () => {
      disposed = true;
    };
  }, [plan]);

  return (
    <section className="panel">
      <h2>正式文件预览</h2>
      <div ref={hostRef} className="preview-host" />
    </section>
  );
}
```

- [ ] **Step 5: Wire the preview into the app**

Update `src/App.tsx`:

```tsx
import { useMemo, useState } from "react";
import { buildRenderPlan } from "./export/renderPlan";
import { PreviewPanel } from "./components/PreviewPanel";

function App() {
  const [quote, setQuote] = useState(() => recalculateQuote(createDefaultQuote()));
  const errors = validateQuote(quote);
  const plan = useMemo(() => buildRenderPlan(quote), [quote]);

  return (
    <main className="app-shell">
      {/* existing hero, toolbar, forms, cards, summary */}
      <SummaryPanel total={quote.grandTotal} errors={errors} />
      <PreviewPanel plan={plan} />
    </main>
  );
}
```

- [ ] **Step 6: Run the render-plan tests**

Run: `npm test -- src/export/renderPlan.test.ts`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add public/template src/export src/components/PreviewPanel.tsx src/App.tsx
git commit -m "feat: add quotation preview render pipeline"
```

### Task 6: Export PNG and PDF from the shared canvas output

**Files:**
- Create: `src/export/exportFile.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/Toolbar.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Extend the UI test to verify export handlers are called only when valid**

Update `src/App.test.tsx`:

```tsx
import { vi } from "vitest";

vi.mock("./export/exportFile", () => ({
  exportQuoteAsPdf: vi.fn().mockResolvedValue(undefined),
  exportQuoteAsPng: vi.fn().mockResolvedValue(undefined)
}));
```

Add the test:

```tsx
import { exportQuoteAsPdf, exportQuoteAsPng } from "./export/exportFile";

it("calls the PNG export after the form becomes valid", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.type(screen.getByLabelText(/客户公司名称/i), "同庆楼");
  await user.clear(screen.getByLabelText(/第 1 行白胚数量/i));
  await user.type(screen.getByLabelText(/第 1 行白胚数量/i), "1");
  await user.click(screen.getByRole("button", { name: /导出图片/i }));

  expect(exportQuoteAsPng).toHaveBeenCalledTimes(1);
  expect(exportQuoteAsPdf).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run the UI test to verify export behavior is not implemented yet**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because export handlers are still empty.

- [ ] **Step 3: Implement shared PNG/PDF export helpers**

Create `src/export/exportFile.ts`:

```ts
import { PDFDocument } from "pdf-lib";
import type { QuoteDocument } from "../types";
import { buildExportFilename } from "../domain/validation";
import { buildRenderPlan } from "./renderPlan";
import { renderPlanToCanvas } from "./canvasRenderer";

async function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to convert canvas to blob"));
        return;
      }
      resolve(blob);
    }, type);
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportQuoteAsPng(quote: QuoteDocument) {
  const canvas = await renderPlanToCanvas(buildRenderPlan(quote), 2);
  const blob = await canvasToBlob(canvas, "image/png");
  downloadBlob(blob, buildExportFilename(quote.companyName, quote.quoteDate, "png"));
}

export async function exportQuoteAsPdf(quote: QuoteDocument) {
  const canvas = await renderPlanToCanvas(buildRenderPlan(quote), 2);
  const pngBytes = await (await canvasToBlob(canvas, "image/png")).arrayBuffer();
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([canvas.width, canvas.height]);
  const image = await pdf.embedPng(pngBytes);
  page.drawImage(image, { x: 0, y: 0, width: canvas.width, height: canvas.height });
  const bytes = await pdf.save();
  downloadBlob(
    new Blob([bytes], { type: "application/pdf" }),
    buildExportFilename(quote.companyName, quote.quoteDate, "pdf")
  );
}
```

- [ ] **Step 4: Connect the export helpers to the toolbar**

Update `src/App.tsx`:

```tsx
import { exportQuoteAsPdf, exportQuoteAsPng } from "./export/exportFile";

<Toolbar
  onReset={() => setQuote(recalculateQuote(createDefaultQuote()))}
  onExportPdf={() => void exportQuoteAsPdf(quote)}
  onExportPng={() => void exportQuoteAsPng(quote)}
  exportDisabled={errors.length > 0}
/>
```

- [ ] **Step 5: Run the export interaction test and production build**

Run: `npm test -- src/App.test.tsx`

Expected: PASS

Run: `npm run build`

Expected: PASS with static assets bundled into `dist/`

- [ ] **Step 6: Commit**

```bash
git add src/export/exportFile.ts src/App.tsx src/App.test.tsx
git commit -m "feat: export formal quotation as png or pdf"
```

### Task 7: Polish advanced pricing controls, manual overrides, and release notes

**Files:**
- Modify: `src/components/AdvancedSettings.tsx`
- Modify: `src/components/LineItemCard.tsx`
- Modify: `src/styles.css`
- Modify: `README.md`

- [ ] **Step 1: Write the last failing test for manual override visibility**

Add to `src/App.test.tsx`:

```tsx
it("lets the operator override a single row blank price", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByText(/高级设置/i));
  await user.click(screen.getByLabelText(/第 2 行手动改单价/i));
  await user.clear(screen.getByLabelText(/第 2 行白胚单价/i));
  await user.type(screen.getByLabelText(/第 2 行白胚单价/i), "25");
  await user.clear(screen.getByLabelText(/第 2 行白胚数量/i));
  await user.type(screen.getByLabelText(/第 2 行白胚数量/i), "1");

  expect(screen.getByText(/行合计：25/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the UI test to confirm the override controls are missing**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because manual override controls do not exist yet.

- [ ] **Step 3: Add manual override controls and row-level advanced pricing**

Update `src/components/LineItemCard.tsx`:

```tsx
      <label>
        第 {index + 1} 行简单花纹数量
        <input
          type="number"
          value={item.simplePatternQuantity}
          onChange={(event) => onChange(item.id, { simplePatternQuantity: Number(event.target.value) })}
        />
      </label>
      <label>
        第 {index + 1} 行复杂花纹数量
        <input
          type="number"
          value={item.complexPatternQuantity}
          onChange={(event) => onChange(item.id, { complexPatternQuantity: Number(event.target.value) })}
        />
      </label>
      {item.manualBlankPriceEnabled ? <p className="manual-tag">已手动调整</p> : null}
```

Update `src/components/AdvancedSettings.tsx`:

```tsx
import type { QuoteItem } from "../types";

type AdvancedSettingsProps = {
  globalFactor: number;
  items: QuoteItem[];
  onFactorChange: (value: number) => void;
  onItemChange: (itemId: string, patch: Partial<QuoteItem>) => void;
};

export function AdvancedSettings({ globalFactor, items, onFactorChange, onItemChange }: AdvancedSettingsProps) {
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
                onItemChange(item.id, { manualBlankPriceEnabled: event.target.checked })
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
                onItemChange(item.id, { manualBlankPrice: Number(event.target.value) })
              }
            />
          </label>
        </div>
      ))}
    </details>
  );
}
```

Update `src/App.tsx` usage:

```tsx
<AdvancedSettings
  globalFactor={quote.globalFactor}
  items={quote.items}
  onFactorChange={(value) => updateQuote({ globalFactor: value })}
  onItemChange={updateItem}
/>
```

- [ ] **Step 4: Document local usage and mobile export expectations**

Update `README.md`:

```md
## Export behavior

- `导出图片` downloads a PNG file directly from the rendered template canvas.
- `导出 PDF` embeds the same PNG into a single-page PDF so the layout matches the image export.
- Mobile browsers should be tested on at least one Android browser and Safari on iPhone before release.
```

- [ ] **Step 5: Run the full test suite and final build**

Run: `npm test`

Expected: PASS

Run: `npm run build`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/AdvancedSettings.tsx src/components/LineItemCard.tsx src/App.tsx src/styles.css README.md
git commit -m "feat: finish advanced pricing controls and release notes"
```

## Self-Review

### Spec coverage

- Responsive browser-based internal tool: covered by Tasks 1 and 4
- Fixed six-row quotation model: covered by Task 2
- Global factor plus per-row manual blank price override: covered by Tasks 2 and 7
- Integer rounding rules: covered by Task 2
- Company name/date/remarks/signature fields: partially covered by Task 4; add remarks and signature inputs during implementation of `CustomerForm.tsx`
- Template-based preview with logo: covered by Task 5
- PNG and PDF export: covered by Task 6
- Validation and disabled export actions: covered by Task 3
- Mobile-friendly usage and release notes: covered by Tasks 4 and 7

### Gaps fixed inline

- Remarks and signature are not shown in the code snippets above; when implementing `CustomerForm.tsx`, include two additional controls:

```tsx
<label>
  备注
  <textarea
    aria-label="备注"
    value={quote.remarks}
    onChange={(event) => onChange({ remarks: event.target.value })}
  />
</label>

<label>
  签字确认
  <input
    aria-label="签字确认"
    value={quote.signature}
    onChange={(event) => onChange({ signature: event.target.value })}
  />
</label>
```

- The render plan must also place remarks and signature text near the bottom of the formal document. Add two instructions in `buildRenderPlan`:

```ts
text.push(
  { key: "remarks", value: quote.remarks, x: 240, y: 622, fontSize: 14 },
  { key: "signature", value: quote.signature, x: 850, y: 674, fontSize: 14 }
);
```

### Placeholder scan

- No `TODO`, `TBD`, or “implement later” placeholders remain.

### Type consistency

- Shared types come from `src/types.ts`
- Recalculation always flows through `recalculateQuote`
- Export file names always flow through `buildExportFilename`

