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
  if (companyName.length <= 8) {
    return 28;
  }

  if (companyName.length <= 14) {
    return 24;
  }

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
      value: quote.quoteDate.split("-").join(". "),
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
      {
        key: `blank-price-${item.id}`,
        value: String(item.quotedBlankPrice),
        x: 410,
        y: rowY,
        fontSize: 15,
        align: "center"
      },
      {
        key: `blank-qty-${item.id}`,
        value: String(item.blankQuantity),
        x: 486,
        y: rowY,
        fontSize: 15,
        align: "center"
      },
      {
        key: `blank-amount-${item.id}`,
        value: String(item.blankAmount),
        x: 560,
        y: rowY,
        fontSize: 15,
        align: "center"
      },
      {
        key: `simple-qty-${item.id}`,
        value: String(item.simplePatternQuantity),
        x: 705,
        y: rowY,
        fontSize: 15,
        align: "center"
      },
      {
        key: `complex-qty-${item.id}`,
        value: String(item.complexPatternQuantity),
        x: 847,
        y: rowY,
        fontSize: 15,
        align: "center"
      },
      {
        key: `pattern-amount-${item.id}`,
        value: String(item.patternAmount),
        x: 935,
        y: rowY,
        fontSize: 15,
        align: "center"
      }
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
