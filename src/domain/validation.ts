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
