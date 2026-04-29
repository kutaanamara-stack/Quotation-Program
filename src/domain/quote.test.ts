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
