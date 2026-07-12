import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("../app/component/docs/shared/TableOfContents.jsx", () => ({
  default: () => <a href="#first-section">첫 목차 항목</a>,
}));

import { MobileTableOfContents } from "../app/component/view.jsx";

describe("Component catalog mobile table of contents", () => {
  it("provides modal semantics, traps focus, closes from all controls, and restores page state", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "목차 열기";
    document.body.appendChild(trigger);
    trigger.focus();
    document.body.style.overflow = "auto";

    const handleClose = vi.fn();
    const { unmount } = render(
      <MobileTableOfContents
        onClose={handleClose}
        triggerRef={{ current: trigger }}
      />
    );

    const dialog = screen.getByRole("dialog");
    const closeButton = screen.getByRole("button", { name: "닫기" });
    const tocLink = screen.getByRole("link", { name: "첫 목차 항목" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(document.body.style.overflow).toBe("hidden");
    await waitFor(() => expect(closeButton).toHaveFocus());

    tocLink.focus();
    fireEvent.keyDown(dialog, { key: "Tab", code: "Tab" });
    expect(closeButton).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Tab", code: "Tab", shiftKey: true });
    expect(tocLink).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(closeButton);
    fireEvent.click(screen.getByRole("button", { name: "목차 닫기" }));
    expect(handleClose).toHaveBeenCalledTimes(3);

    unmount();
    expect(document.body.style.overflow).toBe("auto");
    expect(trigger).toHaveFocus();
    document.body.style.overflow = "";
    trigger.remove();
  });
});
