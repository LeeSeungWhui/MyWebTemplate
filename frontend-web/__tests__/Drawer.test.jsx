import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Drawer from "../app/lib/component/Drawer.jsx";

describe("Drawer", () => {
  it("renders the refined open drawer surface and close handle", () => {
    render(
      <Drawer isOpen onClose={() => {}} collapseButton data-testid="drawer">
        드로어 내용
      </Drawer>
    );

    const drawer = screen.getByRole("dialog", { name: "드로어" });

    expect(drawer).toHaveAttribute("data-state", "open");
    expect(drawer).toHaveClass("bg-white", "text-slate-700", "shadow-2xl", "ring-slate-900/10");
    expect(drawer.parentElement).toHaveClass("opacity-100", "pointer-events-auto");
    expect(screen.getByRole("button", { name: "드로어 닫기" })).toHaveClass(
      "bg-white/95",
      "text-slate-500",
      "hover:bg-indigo-50",
      "focus-visible:ring-indigo-500/25"
    );
  });

  it("closes from backdrop, collapse button, and Escape", () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <Drawer isOpen onClose={handleClose} collapseButton>
        드로어 내용
      </Drawer>
    );

    fireEvent.click(screen.getByRole("dialog", { name: "드로어" }).previousElementSibling);
    fireEvent.click(screen.getByRole("button", { name: "드로어 닫기" }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(handleClose).toHaveBeenCalledTimes(3);

    rerender(
      <Drawer isOpen={false} onClose={handleClose} collapseButton data-testid="drawer">
        드로어 내용
      </Drawer>
    );

    expect(screen.getByTestId("drawer")).toHaveAttribute("data-state", "closed");
    expect(screen.getByTestId("drawer").parentElement).toHaveClass("opacity-0", "pointer-events-none");
  });
});
