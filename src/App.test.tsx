import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the quotation title and export actions", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /餐具修复报价工具/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /导出 pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /导出图片/i })).toBeInTheDocument();
  });

  it("shows the default grand total from the quote domain", () => {
    render(<App />);

    expect(screen.getByText(/当前总金额：0/)).toBeInTheDocument();
  });

  it("shows validation errors and disables export by default", () => {
    render(<App />);

    expect(screen.getByText("请先填写客户公司名称。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /导出 pdf/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /导出图片/i })).toBeDisabled();
  });
});
