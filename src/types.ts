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
