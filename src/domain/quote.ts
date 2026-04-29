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

  return {
    ...quote,
    items,
    grandTotal
  };
}
