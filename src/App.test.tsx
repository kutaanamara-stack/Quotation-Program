import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the quotation title and export actions", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /\u9910\u5177\u4fee\u590d\u62a5\u4ef7\u5de5\u5177/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\u5bfc\u51fa pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\u5bfc\u51fa\u56fe\u7247/i })).toBeInTheDocument();
  });
});
