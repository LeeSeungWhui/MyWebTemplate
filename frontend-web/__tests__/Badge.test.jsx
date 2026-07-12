import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Badge from "../app/lib/component/Badge.jsx";

describe("Badge", () => {
  it("renders the neutral small badge by default", () => {
    render(<Badge>Neutral</Badge>);

    const badge = screen.getByText("Neutral");
    expect(badge).toHaveClass("inline-flex", "h-5", "text-slate-700");
  });

  it.each([
    ["neutral", "text-slate-700"],
    ["primary", "text-indigo-700"],
    ["success", "text-emerald-700"],
    ["warning", "text-amber-800"],
    ["danger", "text-rose-700"],
    ["outline", "border-slate-200"],
  ])("renders the %s documented variant", (variant, expectedClass) => {
    render(<Badge variant={variant}>{variant}</Badge>);

    expect(screen.getByText(variant)).toHaveClass(expectedClass);
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

  it("renders the non-pill shape and forwards root span attributes", () => {
    render(
      <Badge size="md" className="tracking-wide" data-testid="forwarded" aria-label="상태 배지">
        상태
      </Badge>
    );

    const badge = screen.getByTestId("forwarded");
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveClass("h-6", "rounded-md", "tracking-wide");
    expect(badge).toHaveAttribute("aria-label", "상태 배지");
  });

  it("accepts icon and text nodes as documented children", () => {
    render(
      <Badge variant="warning" pill>
        <svg data-testid="badge-icon" aria-hidden="true" /> 검토중
      </Badge>
    );

    expect(screen.getByTestId("badge-icon")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText(/검토중/)).toHaveClass("rounded-full", "text-amber-800");
  });
});
