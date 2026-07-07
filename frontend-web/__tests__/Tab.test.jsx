import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Tab from "../app/lib/component/Tab.jsx";

const renderTabs = () =>
  render(
    <Tab>
      <Tab.Item title="첫번째">첫번째 내용</Tab.Item>
      <Tab.Item title="두번째">두번째 내용</Tab.Item>
    </Tab>
  );

describe("Tab", () => {
  it("renders the refined segmented tablist and content panel", () => {
    renderTabs();

    expect(screen.getByRole("tablist")).toHaveClass("rounded-lg", "bg-slate-100/80", "ring-slate-200/80");
    expect(screen.getByRole("tab", { name: "첫번째" })).toHaveClass("bg-white", "text-indigo-700", "shadow-sm");
    expect(screen.getByRole("tab", { name: "두번째" })).toHaveClass("text-slate-600", "hover:bg-white/70");
    expect(screen.getByRole("tabpanel")).toHaveClass("rounded-xl", "bg-white", "text-slate-700", "ring-slate-200/80");
  });

  it("switches selected tab while preserving tab semantics", () => {
    renderTabs();

    const firstTab = screen.getByRole("tab", { name: "첫번째" });
    const secondTab = screen.getByRole("tab", { name: "두번째" });

    expect(firstTab).toHaveAttribute("aria-selected", "true");
    expect(secondTab).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("첫번째 내용");

    fireEvent.click(secondTab);

    expect(firstTab).toHaveAttribute("aria-selected", "false");
    expect(secondTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("두번째 내용");
  });

  it("keeps the underline variant available by prop", () => {
    render(
      <Tab variant="underline">
        <Tab.Item title="요약">요약 내용</Tab.Item>
        <Tab.Item title="상세">상세 내용</Tab.Item>
      </Tab>
    );

    expect(screen.getByRole("tablist")).toHaveAttribute("data-variant", "underline");
    expect(screen.getByRole("tablist")).toHaveClass("border-b", "border-slate-200");
    expect(screen.getByRole("tab", { name: "요약" })).toHaveClass("border-indigo-600", "text-indigo-700");
    expect(screen.getByRole("tab", { name: "상세" })).toHaveClass("border-transparent", "text-slate-500");
    expect(screen.getByRole("tabpanel")).toHaveClass("py-4", "text-slate-700");
  });
});
