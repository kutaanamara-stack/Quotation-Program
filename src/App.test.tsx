import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { exportQuoteAsPdf, exportQuoteAsPng } from "./export/exportFile";
import App from "./App";

vi.mock("./export/exportFile", () => ({
  exportQuoteAsPdf: vi.fn().mockResolvedValue(undefined),
  exportQuoteAsPng: vi.fn().mockResolvedValue(undefined)
}));

describe("App", () => {
  it("renders the quotation title and export actions", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /餐具修复报价工具/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /导出 pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /导出图片/i })).toBeInTheDocument();
  });

  it("shows the default grand total from the quote domain", () => {
    render(<App />);

    expect(screen.getByText(/总金额：0/)).toBeInTheDocument();
  });

  it("shows validation errors and disables export by default", () => {
    render(<App />);

    expect(screen.getByText("请先填写客户公司名称。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /导出 pdf/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /导出图片/i })).toBeDisabled();
  });

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
});
