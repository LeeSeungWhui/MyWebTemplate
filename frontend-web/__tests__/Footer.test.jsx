import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Footer from "../app/common/layout/Footer.jsx";

vi.mock("next/link", () => ({
  default: ({ children, href, prefetch }) => (
    <a href={href} data-prefetch={String(prefetch)}>{children}</a>
  ),
}));

describe("Footer link prefetch contract", () => {
  it("passes an explicit per-link prefetch decision to Next Link", () => {
    render(
      <Footer
        linkList={[
          { linkId: "sample", linkNm: "샘플", href: "/sample" },
          { linkId: "component", linkNm: "컴포넌트", href: "/component", prefetch: false },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "샘플" })).toHaveAttribute("data-prefetch", "undefined");
    expect(screen.getByRole("link", { name: "컴포넌트" })).toHaveAttribute("data-prefetch", "false");
  });
});
