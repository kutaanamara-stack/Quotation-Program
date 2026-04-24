import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
});
