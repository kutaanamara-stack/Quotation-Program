import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the quotation title and export actions", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /餐具修复报价工具/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /导出 pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /导出图片/i })).toBeInTheDocument();
  });
});
