import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Badge from "../app/lib/component/Badge.jsx";

describe("Badge", () => {
  it("renders the neutral small badge by default", () => {
    render(<Badge>Neutral</Badge>);

    const badge = screen.getByText("Neutral");
    expect(badge).toHaveClass("inline-flex", "h-5", "text-slate-700");
  });

  it("applies variant, size, pill, and custom classes", () => {
    render(
      <Badge variant="success" size="md" pill className="uppercase">
        완료
      </Badge>
    );

    const badge = screen.getByText("완료");
    expect(badge).toHaveClass(
      "h-6",
      "rounded-full",
      "text-emerald-700",
      "uppercase"
    );
  });

  it("falls back to neutral and small styles for unknown props", () => {
    render(
      <Badge variant="unknown" size="xl">
        Fallback
      </Badge>
    );

    const badge = screen.getByText("Fallback");
    expect(badge).toHaveClass("h-5", "text-slate-700");
  });
});
