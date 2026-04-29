import { createDefaultQuote, recalculateQuote } from "../domain/quote";
import { buildRenderPlan } from "./renderPlan";

describe("buildRenderPlan", () => {
  it("maps title and grand total into draw instructions", () => {
    const quote = createDefaultQuote();
    quote.companyName = "同庆楼";
    quote.items[0].blankQuantity = 1;

    const plan = buildRenderPlan(recalculateQuote(quote));

    expect(plan.text.find((entry) => entry.key === "title")?.value).toBe(
      "同庆楼餐具修复报价单"
    );
    expect(plan.text.find((entry) => entry.key === "grand-total")?.value).toBe("6");
  });

  it("reduces title font size for long company names", () => {
    const quote = createDefaultQuote();
    quote.companyName = "上海某某某国际餐饮管理有限公司";

    const plan = buildRenderPlan(recalculateQuote(quote));

    expect(plan.text.find((entry) => entry.key === "title")?.fontSize).toBeLessThan(28);
  });

  it("uses relative template asset paths for portable local packages", () => {
    const quote = createDefaultQuote();
    const plan = buildRenderPlan(recalculateQuote(quote));

    expect(plan.templateSrc).toBe("./template/quotation-template.png");
    expect(plan.logoSrc).toBe("./template/studio-logo.jpg");
  });

  it("clears template sample values before drawing dynamic quotation values", () => {
    const quote = createDefaultQuote();
    quote.items[0].blankQuantity = 2;
    quote.items[0].simplePatternPrice = 7;
    quote.items[0].simplePatternQuantity = 3;
    quote.items[0].complexPatternPrice = 12;
    quote.items[0].complexPatternQuantity = 4;

    const plan = buildRenderPlan(recalculateQuote(quote));

    expect(plan.clear.find((entry) => entry.key === "title")).toBeDefined();
    expect(plan.clear.find((entry) => entry.key === "blank-price-lt20")).toBeDefined();
    expect(plan.text.find((entry) => entry.key === "simple-price-lt20")?.value).toBe("7");
    expect(plan.text.find((entry) => entry.key === "complex-price-lt20")?.value).toBe("12");
    expect(plan.text.find((entry) => entry.key === "total-blank-qty")?.value).toBe("2");
  });
});
