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

  it("shows the current product scope separately from live sample metrics", () => {
    render(<PortfolioView initialDataObj={{}} initialErrorObj={{}} />);

    expect(screen.getByRole("heading", { name: "프로젝트 개요" })).toBeInTheDocument();
    expect(screen.getByText("프로젝트 구성")).toBeVisible();
    expect(screen.getByText(/Next\.js Web, FastAPI API, PostgreSQL/u)).toBeVisible();
    expect(screen.getByText("인증·계정")).toBeVisible();
    expect(screen.getByText(/비밀번호 찾기 샘플 안내.*로그인 사용자 비밀번호 변경/u)).toBeVisible();
    expect(screen.getByText("업무·설정")).toBeVisible();
    expect(screen.getByText(/업무 등록·조회·수정·삭제.*프로필·알림 설정/u)).toBeVisible();
    expect(screen.getByText("품질·운영")).toBeVisible();
    expect(screen.getByText(/Vitest·pytest·rule-gate.*Web\/API 분리 운영/u)).toBeVisible();
    expect(screen.getByRole("heading", { name: "실시간 샘플 현황" })).toBeInTheDocument();
    expect(screen.getByText("등록된 샘플 업무")).toBeVisible();
    expect(screen.getByText("관리 대상 사용자")).toBeVisible();
    expect(screen.getByText("접수된 샘플 문의")).toBeVisible();
  });

  it("opens every expandable content section by default and shows the active runtime stack", () => {
    const { container } = render(<PortfolioView initialDataObj={{}} initialErrorObj={{}} />);

    const technicalNotesSummary = screen.getByText("기술 구성과 검증 기준");
    const technicalNotesDetails = technicalNotesSummary.closest("details");
    const expandableSectionList = [...container.querySelectorAll("details")];

    expect(technicalNotesDetails).not.toBeNull();
    expect(expandableSectionList).toHaveLength(7);
    expandableSectionList.forEach((expandableSection) => {
      expect(expandableSection).toHaveProperty("open", true);
    });
    expect(screen.getByText("런타임: Node.js 26.3.0, Python 3.14.5")).toBeVisible();
    expect(screen.getByText(/Next\.js 16\.2\.7.*React 19\.2\.7.*Tailwind CSS 4\.3\.0/u)).toBeVisible();
    expect(screen.getByText(/FastAPI 0\.136\.3.*Pydantic 2\.13\.4.*Gunicorn 26\.0\.0/u)).toBeVisible();
    expect(screen.getByText(/PostgreSQL 운영·테스트 구성.*SQLAlchemy 2\.0\.50.*asyncpg 0\.31\.0/u)).toBeVisible();
  });
});
