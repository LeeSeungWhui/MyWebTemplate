import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PublicFooter from "../app/common/layout/PublicFooter.jsx";

vi.mock("next/link", () => ({
  default: ({ children, href, prefetch }) => (
    <a href={href} data-prefetch={String(prefetch)}>{children}</a>
  ),
}));

describe("PublicFooter prefetch contract", () => {
  it("does not preload the heavy component catalog from public pages", () => {
    render(<PublicFooter />);

    expect(screen.getByRole("link", { name: "컴포넌트" })).toHaveAttribute("data-prefetch", "false");
  });
});
