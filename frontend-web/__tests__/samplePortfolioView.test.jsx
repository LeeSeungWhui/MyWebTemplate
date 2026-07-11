import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PortfolioView from "../app/sample/portfolio/view.jsx";

vi.mock("next/image", () => ({
  default: ({ alt, fill: _fill, loading, src }) => (
    <span
      role="img"
      aria-label={alt}
      data-loading={loading}
      data-src={src}
    />
  ),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, prefetch, ...props }) => (
    <a href={href} data-prefetch={String(prefetch)} {...props}>{children}</a>
  ),
}));

vi.mock("@/app/lib/component/Icon", () => ({
  default: ({ icon }) => <span data-testid="architecture-icon" data-icon={icon} />,
}));

vi.mock("@/app/lib/hooks/usePageData", () => ({
  usePageData: () => ({
    mode: "SSR",
    dataObj: {
      overview: { result: {} },
      dashboard: { result: { recentList: [] } },
    },
  }),
}));

describe("sample portfolio sales-facing display", () => {
  it("shows truthful trust text, repository icons, and eager preview assets", () => {
    render(<PortfolioView initialDataObj={{}} initialErrorObj={{}} />);

    expect(screen.getAllByText("LSH").length).toBeGreaterThan(0);
    expect(screen.getAllByText("풀스택 웹 개발자").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "관리자·업무 웹서비스 구축 포트폴리오" })).toBeInTheDocument();
    expect(screen.getByText(/프로젝트 상담 전에/)).toBeInTheDocument();
    expect(screen.queryByText(/숨고|크몽/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "UI 구성 요소 살펴보기" })).toHaveAttribute("data-prefetch", "false");

    expect(screen.getAllByTestId("architecture-icon").map((icon) => icon.dataset.icon)).toEqual([
      "ri:RiUser3Line",
      "ri:RiShieldCheckLine",
      "ri:RiSettings3Line",
    ]);

    const previewImageList = screen.getAllByRole("img");
    expect(previewImageList).toHaveLength(3);
    previewImageList.forEach((image) => {
      expect(image).toHaveAttribute("data-loading", "eager");
      expect(image).toHaveAttribute("data-src", expect.stringContaining("/images/landing/demo-"));
    });
  });
});
