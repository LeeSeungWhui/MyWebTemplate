import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("../app/component/docs/shared/TableOfContents.jsx", () => ({
  default: () => <a href="#first-section">첫 목차 항목</a>,
}));

import {
  MOBILE_TOC_DIALOG_ID,
  MobileTableOfContents,
  MobileTableOfContentsTrigger,
} from "../app/component/view.jsx";
import ComboboxDocs from "../app/component/docs/components/ComboboxDocs.jsx";

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
    expect(dialog).toHaveAttribute("id", MOBILE_TOC_DIALOG_ID);
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

  it("connects the mobile trigger to the mounted dialog and reflects open state", async () => {
    const Harness = () => {
      const [isOpen, setIsOpen] = React.useState(false);
      const triggerRef = React.useRef(null);

      return (
        <>
          <MobileTableOfContentsTrigger
            triggerRef={triggerRef}
            isOpen={isOpen}
            onOpen={() => setIsOpen(true)}
          />
          {isOpen ? (
            <MobileTableOfContents
              triggerRef={triggerRef}
              onClose={() => setIsOpen(false)}
            />
          ) : null}
        </>
      );
    };

    render(<Harness />);

    const trigger = screen.getByRole("button", { name: "목차 열기" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", MOBILE_TOC_DIALOG_ID);
    expect(document.getElementById(MOBILE_TOC_DIALOG_ID)).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(MOBILE_TOC_DIALOG_ID)).toHaveAttribute("role", "dialog");

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    expect(document.getElementById(MOBILE_TOC_DIALOG_ID)).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

describe("Component catalog Combobox examples", () => {
  it("keeps section anchors unique and renders loading and empty states", () => {
    render(<ComboboxDocs />);

    expect(document.querySelectorAll("#combobox-bound")).toHaveLength(1);
    expect(document.querySelectorAll("#combobox-multi")).toHaveLength(1);
    expect(document.querySelectorAll("#combobox-basic-control")).toHaveLength(1);
    expect(document.querySelectorAll("#combobox-multi-control")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "상태 (로딩/빈 목록)" })).toBeInTheDocument();
    expect(document.getElementById("combobox-loading")).toHaveAttribute("aria-busy", "true");
    expect(document.getElementById("combobox-empty")).toBeInTheDocument();
    expect(screen.getByText(/로딩\/비활성화/)).toBeVisible();
    expect(screen.getByText(/빈 상태/)).toBeVisible();
  });
});
