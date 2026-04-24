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
    expect(buildExportFilename("同庆楼", "2026-04-24", "pdf")).toBe(
      "同庆楼-餐具修复报价单-2026-04-24.pdf"
    );
    expect(buildExportFilename("同庆楼", "2026-04-24", "png")).toBe(
      "同庆楼-餐具修复报价单-2026-04-24.png"
    );
  });
});
