import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("keeps closed descendants inert and restores the trigger focus and body overflow", async () => {
    document.body.style.overflow = "auto";
    const handleClose = vi.fn();
    const renderDrawer = (isOpen) => (
      <>
        <button type="button">드로어 열기</button>
        <Drawer isOpen={isOpen} onClose={handleClose} data-testid="drawer">
          <button type="button">첫 액션</button>
          <button type="button">마지막 액션</button>
        </Drawer>
      </>
    );
    const { rerender } = render(renderDrawer(false));

    const trigger = screen.getByRole("button", { name: "드로어 열기" });
    const closedDrawer = screen.getByTestId("drawer");
    expect(closedDrawer.parentElement).toHaveAttribute("inert");

    trigger.focus();
    rerender(renderDrawer(true));
    await waitFor(() => expect(screen.getByRole("button", { name: "첫 액션" })).toHaveFocus());
    expect(document.body.style.overflow).toBe("hidden");

    rerender(renderDrawer(false));
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("auto");
    document.body.style.overflow = "";
  });

  it("contains keyboard focus inside the open drawer", async () => {
    render(
      <Drawer isOpen onClose={() => {}}>
        <button type="button">첫 액션</button>
        <button type="button">마지막 액션</button>
      </Drawer>
    );

    const dialog = screen.getByRole("dialog", { name: "드로어" });
    const firstButton = screen.getByRole("button", { name: "첫 액션" });
    const lastButton = screen.getByRole("button", { name: "마지막 액션" });
    await waitFor(() => expect(firstButton).toHaveFocus());

    lastButton.focus();
    fireEvent.keyDown(dialog, { key: "Tab", code: "Tab" });
    expect(firstButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Tab", code: "Tab", shiftKey: true });
    expect(lastButton).toHaveFocus();
  });

  it.each([
    ["right", "right-0", "translate-x-0", "resize-x"],
    ["left", "left-0", "translate-x-0", "resize-x"],
    ["top", "top-0", "translate-y-0", "resize-y"],
    ["bottom", "bottom-0", "translate-y-0", "resize-y"],
  ])("supports the documented %s side, size, resize, class, and ref contracts", (side, sideClass, transformClass, resizeClass) => {
    const drawerRef = { current: null };
    render(
      <Drawer
        ref={drawerRef}
        isOpen
        side={side}
        size="custom-size"
        resizable
        className="custom-drawer"
      >
        내용
      </Drawer>
    );
    const dialog = screen.getByRole("dialog", { name: "드로어" });
    expect(drawerRef.current).toBe(dialog);
    expect(dialog).toHaveAttribute("data-side", side);
    expect(dialog).toHaveClass(sideClass, transformClass, resizeClass, "custom-size", "custom-drawer");
  });

  it("respects disabled close paths and chains consumer keydown before trapping focus", () => {
    const handleClose = vi.fn();
    const handleKeyDown = vi.fn((event) => event.preventDefault());
    render(
      <Drawer
        isOpen
        onClose={handleClose}
        closeOnBackdrop={false}
        closeOnEsc={false}
        onKeyDown={handleKeyDown}
      >
        <button type="button">첫 액션</button>
        <button type="button">마지막 액션</button>
      </Drawer>
    );
    const dialog = screen.getByRole("dialog", { name: "드로어" });
    const lastButton = screen.getByRole("button", { name: "마지막 액션" });
    lastButton.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
    expect(lastButton).toHaveFocus();
    fireEvent.click(dialog.previousElementSibling);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).not.toHaveBeenCalled();
  });
});
