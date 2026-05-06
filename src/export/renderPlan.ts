import type { QuoteDocument } from "../types";

export type TextInstruction = {
  key: string;
  value: string;
  x: number;
  y: number;
  fontSize: number;
  align?: CanvasTextAlign;
  box?: TextBox;
  minFontSize?: number;
};

export type TextBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  padding?: number;
};

export type ClearInstruction = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RenderPlan = {
  width: number;
  height: number;
  templateSrc: string;
  logoSrc: string;
  clear: ClearInstruction[];
  text: TextInstruction[];
};

function titleFontSize(companyName: string): number {
  if (companyName.length <= 8) {
    return 28;
  }

  if (companyName.length <= 14) {
    return 24;
  }

  return 20;
}

export function buildRenderPlan(quote: QuoteDocument): RenderPlan {
  const totals = quote.items.reduce(
    (acc, item) => ({
      blankQuantity: acc.blankQuantity + item.blankQuantity,
      blankAmount: acc.blankAmount + item.blankAmount,
      simplePatternQuantity: acc.simplePatternQuantity + item.simplePatternQuantity,
      complexPatternQuantity: acc.complexPatternQuantity + item.complexPatternQuantity,
      patternAmount: acc.patternAmount + item.patternAmount
    }),
    {
      blankQuantity: 0,
      blankAmount: 0,
      simplePatternQuantity: 0,
      complexPatternQuantity: 0,
      patternAmount: 0
    }
  );

  const clear: ClearInstruction[] = [
    { key: "title", x: 250, y: 82, width: 620, height: 70 },
    { key: "date", x: 610, y: 148, width: 410, height: 48 },
    { key: "total-blank-qty", x: 438, y: 511, width: 68, height: 36 },
    { key: "total-blank-amount", x: 520, y: 511, width: 62, height: 36 },
    { key: "total-simple-qty", x: 665, y: 511, width: 62, height: 36 },
    { key: "total-complex-qty", x: 807, y: 511, width: 62, height: 36 },
    { key: "total-pattern-amount", x: 878, y: 511, width: 66, height: 36 },
    { key: "grand-total", x: 890, y: 538, width: 92, height: 42 }
  ];

  const text: TextInstruction[] = [
    {
      key: "title",
      value: `${quote.companyName}\u9910\u5177\u4fee\u590d\u62a5\u4ef7\u5355`,
      x: 560,
      y: 130,
      fontSize: titleFontSize(quote.companyName),
      align: "center",
      box: { x: 240, y: 100, width: 640, height: 60, padding: 12 },
      minFontSize: 18
    },
    {
      key: "date",
      value: quote.quoteDate.split("-").join(". "),
      x: 770,
      y: 176,
      fontSize: 13,
      align: "left",
      box: { x: 760, y: 160, width: 145, height: 28, padding: 4 },
      minFontSize: 10
    },
    {
      key: "grand-total",
      value: String(quote.grandTotal),
      x: 909,
      y: 561,
      fontSize: 14,
      align: "center",
      box: { x: 871, y: 547, width: 76, height: 28, padding: 4 },
      minFontSize: 10
    },
    {
      key: "total-blank-qty",
      value: String(totals.blankQuantity),
      x: 470,
      y: 537,
      fontSize: 14,
      align: "center",
      box: { x: 432, y: 523, width: 76, height: 24, padding: 4 },
      minFontSize: 9
    },
    {
      key: "total-blank-amount",
      value: String(totals.blankAmount),
      x: 547,
      y: 537,
      fontSize: 14,
      align: "center",
      box: { x: 508, y: 523, width: 78, height: 24, padding: 4 },
      minFontSize: 9
    },
    {
      key: "total-simple-qty",
      value: String(totals.simplePatternQuantity),
      x: 692,
      y: 537,
      fontSize: 14,
      align: "center",
      box: { x: 657, y: 523, width: 71, height: 24, padding: 4 },
      minFontSize: 9
    },
    {
      key: "total-complex-qty",
      value: String(totals.complexPatternQuantity),
      x: 836,
      y: 537,
      fontSize: 14,
      align: "center",
      box: { x: 800, y: 523, width: 71, height: 24, padding: 4 },
      minFontSize: 9
    },
    {
      key: "total-pattern-amount",
      value: String(totals.patternAmount),
      x: 909,
      y: 537,
      fontSize: 14,
      align: "center",
      box: { x: 871, y: 523, width: 76, height: 24, padding: 4 },
      minFontSize: 9
    }
  ];

  quote.items.forEach((item, index) => {
    const rowY = 265 + index * 48;

    clear.push(
      { key: `blank-price-${item.id}`, x: 365, y: rowY - 35, width: 60, height: 45 },
      { key: `blank-qty-${item.id}`, x: 440, y: rowY - 35, width: 66, height: 45 },
      { key: `blank-amount-${item.id}`, x: 520, y: rowY - 35, width: 62, height: 45 },
      { key: `simple-price-${item.id}`, x: 592, y: rowY - 35, width: 60, height: 45 },
      { key: `simple-qty-${item.id}`, x: 665, y: rowY - 35, width: 62, height: 45 },
      { key: `complex-price-${item.id}`, x: 735, y: rowY - 35, width: 60, height: 45 },
      { key: `complex-qty-${item.id}`, x: 807, y: rowY - 35, width: 62, height: 45 },
      { key: `pattern-amount-${item.id}`, x: 878, y: rowY - 35, width: 66, height: 45 }
    );

    text.push(
      {
        key: `blank-price-${item.id}`,
        value: String(item.quotedBlankPrice),
        x: 394,
        y: rowY,
        fontSize: 13,
        align: "center",
        box: { x: 355, y: rowY - 18, width: 77, height: 36, padding: 4 },
        minFontSize: 9
      },
      {
        key: `blank-qty-${item.id}`,
        value: String(item.blankQuantity),
        x: 470,
        y: rowY,
        fontSize: 13,
        align: "center",
        box: { x: 432, y: rowY - 18, width: 76, height: 36, padding: 4 },
        minFontSize: 9
      },
      {
        key: `blank-amount-${item.id}`,
        value: String(item.blankAmount),
        x: 547,
        y: rowY,
        fontSize: 13,
        align: "center",
        box: { x: 508, y: rowY - 18, width: 78, height: 36, padding: 4 },
        minFontSize: 9
      },
      {
        key: `simple-price-${item.id}`,
        value: String(item.simplePatternPrice),
        x: 622,
        y: rowY,
        fontSize: 13,
        align: "center",
        box: { x: 586, y: rowY - 18, width: 71, height: 36, padding: 4 },
        minFontSize: 9
      },
      {
        key: `simple-qty-${item.id}`,
        value: String(item.simplePatternQuantity),
        x: 692,
        y: rowY,
        fontSize: 13,
        align: "center",
        box: { x: 657, y: rowY - 18, width: 71, height: 36, padding: 4 },
        minFontSize: 9
      },
      {
        key: `complex-price-${item.id}`,
        value: String(item.complexPatternPrice),
        x: 764,
        y: rowY,
        fontSize: 13,
        align: "center",
        box: { x: 728, y: rowY - 18, width: 72, height: 36, padding: 4 },
        minFontSize: 9
      },
      {
        key: `complex-qty-${item.id}`,
        value: String(item.complexPatternQuantity),
        x: 836,
        y: rowY,
        fontSize: 13,
        align: "center",
        box: { x: 800, y: rowY - 18, width: 71, height: 36, padding: 4 },
        minFontSize: 9
      },
      {
        key: `pattern-amount-${item.id}`,
        value: String(item.patternAmount),
        x: 909,
        y: rowY,
        fontSize: 13,
        align: "center",
        box: { x: 871, y: rowY - 18, width: 76, height: 36, padding: 4 },
        minFontSize: 9
      }
    );
  });

  return {
    width: 1121,
    height: 793,
    templateSrc: "./template/quotation-template.png",
    logoSrc: "./template/studio-logo.jpg",
    clear,
    text
  };
}
