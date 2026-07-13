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

  it("opens the technical notes by default and shows the active runtime stack", () => {
    render(<PortfolioView initialDataObj={{}} initialErrorObj={{}} />);

    const technicalNotesSummary = screen.getByText("기술 구성과 검증 기준");
    const technicalNotesDetails = technicalNotesSummary.closest("details");

    expect(technicalNotesDetails).not.toBeNull();
    expect(technicalNotesDetails).toHaveProperty("open", true);
    expect(screen.getByText("런타임: Node.js 26.3.0, Python 3.14.5")).toBeVisible();
    expect(screen.getByText(/Next\.js 16\.2\.7.*React 19\.2\.7.*Tailwind CSS 4\.3\.0/u)).toBeVisible();
    expect(screen.getByText(/FastAPI 0\.136\.3.*Pydantic 2\.13\.4.*Gunicorn 26\.0\.0/u)).toBeVisible();
    expect(screen.getByText(/PostgreSQL 운영·테스트 구성.*SQLAlchemy 2\.0\.50.*asyncpg 0\.31\.0/u)).toBeVisible();
  });
});
