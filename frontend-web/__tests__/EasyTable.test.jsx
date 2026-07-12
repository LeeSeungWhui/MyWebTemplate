/**
 * 파일명: EasyTable.test.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-11
 * 설명: EasyTable 렌더링 및 페이지 상태 동기화 회귀 테스트
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import EasyTable from "../app/lib/component/EasyTable.jsx";

const columns = [
  { key: "id", header: "ID", width: "80px", align: "center" },
  { key: "name", header: "이름", align: "left" },
];

const data = [
  { id: 1, name: "사용자 1" },
  { id: 2, name: "사용자 2" },
];

describe("EasyTable", () => {
  it("renders the refined enterprise table surface", () => {
    render(<EasyTable data={data} columns={columns} pageSize={2} />);

    const table = screen.getByRole("table");
    expect(table).toHaveClass("rounded-xl", "bg-white", "shadow-sm", "ring-slate-200/80");

    const headerRow = screen.getByRole("columnheader", { name: "ID" }).parentElement;
    expect(headerRow).toHaveClass("bg-slate-100/70", "uppercase", "tracking-wider", "text-slate-600");

    const firstRow = screen.getByRole("cell", { name: "사용자 1" }).parentElement;
    expect(firstRow).toHaveClass("border-slate-200/70", "text-slate-700", "hover:bg-slate-100/50");
  });

  it("uses slate status styling while preserving busy state semantics", () => {
    render(<EasyTable data={[]} columns={columns} loading />);

    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveClass("text-slate-600");
  });

  it("connects an opt-in mobile scroll hint to the focusable scroll region", () => {
    render(
      <EasyTable
        data={data}
        columns={columns}
        pageSize={2}
        mobileScrollHint="좌우로 스크롤해 확인하세요."
      />,
    );

    const hint = screen.getByText("좌우로 스크롤해 확인하세요.");
    const scrollRegion = hint.nextElementSibling;

    expect(hint).toHaveClass("sm:hidden");
    expect(scrollRegion).toHaveAttribute("tabindex", "0");
    expect(scrollRegion).toHaveAttribute("aria-describedby", hint.id);
    expect(scrollRegion).toHaveAttribute("aria-label", "좌우로 스크롤해 확인하세요.");
  });

  it("does not write the default page on mount and removes pageParam when returning to it", async () => {
    window.history.replaceState(null, "", "/component?filter=active#table");
    window.sessionStorage.clear();
    const pagedData = [
      ...data,
      { id: 3, name: "사용자 3" },
      { id: 4, name: "사용자 4" },
    ];

    render(
      <EasyTable
        data={pagedData}
        columns={columns}
        pageSize={2}
        defaultPage={1}
        pageParam="page"
        persistKey="easy-table-page"
      />,
    );

    expect(window.location.search).toBe("?filter=active");
    expect(window.location.hash).toBe("#table");
    expect(window.sessionStorage.getItem("easy-table-page")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    await waitFor(() => {
      expect(new URLSearchParams(window.location.search).get("page")).toBe("2");
      expect(window.sessionStorage.getItem("easy-table-page")).toBe("2");
    });

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get("page")).toBeNull();
      expect(params.get("filter")).toBe("active");
      expect(window.location.hash).toBe("#table");
      expect(window.sessionStorage.getItem("easy-table-page")).toBe("1");
    });
  });

  it("keeps controlled page mode free of URL and storage writes", () => {
    window.history.replaceState(null, "", "/component?filter=active#table");
    window.sessionStorage.clear();

    render(
      <EasyTable
        data={[...data, { id: 3, name: "사용자 3" }]}
        columns={columns}
        page={1}
        pageSize={2}
        pageParam="page"
        persistKey="controlled-easy-table-page"
      />,
    );

    expect(window.location.search).toBe("?filter=active");
    expect(window.sessionStorage.getItem("controlled-easy-table-page")).toBeNull();
  });

  it("renders server-paginated rows as the current page slice", () => {
    const pageTwoRows = [
      { id: 3, name: "사용자 3" },
      { id: 4, name: "사용자 4" },
    ];

    render(
      <EasyTable
        data={pageTwoRows}
        columns={columns}
        page={2}
        pageSize={2}
        total={6}
      />,
    );

    expect(screen.getByRole("cell", { name: "사용자 3" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "사용자 4" })).toBeInTheDocument();
    expect(screen.queryByText("표시할 데이터가 없습니다.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");
  });

  it("continues to slice complete client data by the active page", () => {
    const clientRows = [
      ...data,
      { id: 3, name: "사용자 3" },
      { id: 4, name: "사용자 4" },
    ];

    render(
      <EasyTable
        data={clientRows}
        columns={columns}
        defaultPage={2}
        pageSize={2}
      />,
    );

    expect(screen.queryByRole("cell", { name: "사용자 1" })).not.toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "사용자 3" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "사용자 4" })).toBeInTheDocument();
  });

  it("uses one clamped controlled page for rows, indexes, pager, and shrinking data", () => {
    const onRowClick = vi.fn();
    const clientRows = [
      ...data,
      { id: 3, name: "사용자 3" },
      { id: 4, name: "사용자 4" },
      { id: 5, name: "사용자 5" },
      { id: 6, name: "사용자 6" },
    ];
    const { rerender } = render(
      <EasyTable
        data={clientRows}
        columns={columns}
        page={99}
        pageSize={2}
        onRowClick={onRowClick}
      />,
    );

    expect(screen.getByRole("cell", { name: "사용자 5" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "사용자 6" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("cell", { name: "사용자 5" }).parentElement);
    expect(onRowClick).toHaveBeenLastCalledWith(clientRows[4], 4);

    rerender(
      <EasyTable
        data={clientRows.slice(0, 3)}
        columns={columns}
        page={99}
        pageSize={2}
        onRowClick={onRowClick}
      />,
    );
    expect(screen.getByRole("cell", { name: "사용자 3" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("cell", { name: "사용자 3" }).parentElement);
    expect(onRowClick).toHaveBeenLastCalledWith(clientRows[2], 2);
  });

  it("keeps a controlled server page consistent when total shrinks", () => {
    const onRowClick = vi.fn();
    const onPageChange = vi.fn();
    const pageThreeRows = [
      { id: 5, name: "사용자 5" },
      { id: 6, name: "사용자 6" },
    ];
    const { rerender } = render(
      <EasyTable
        data={pageThreeRows}
        columns={columns}
        page={99}
        pageSize={2}
        total={6}
        onRowClick={onRowClick}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByRole("button", { name: "3" })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("cell", { name: "사용자 5" }).parentElement);
    expect(onRowClick).toHaveBeenLastCalledWith(pageThreeRows[0], 4);

    const finalPageRows = [{ id: 3, name: "사용자 3" }];
    rerender(
      <EasyTable
        data={finalPageRows}
        columns={columns}
        page={99}
        pageSize={2}
        total={3}
        onRowClick={onRowClick}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("cell", { name: "사용자 3" }).parentElement);
    expect(onRowClick).toHaveBeenLastCalledWith(finalPageRows[0], 2);
  });

  it("normalizes non-finite controlled pagination inputs", () => {
    render(
      <EasyTable
        data={data}
        columns={columns}
        page={Infinity}
        pageSize={Infinity}
        total={Infinity}
      />,
    );

    expect(screen.getByRole("cell", { name: "사용자 1" })).toBeInTheDocument();
    expect(screen.queryByText("Infinity")).not.toBeInTheDocument();
  });

  it("applies cardsPerRow through static responsive classes and preserves explicit overrides", () => {
    const renderCard = (row) => <article>{row.name}</article>;
    const { rerender } = render(
      <EasyTable
        data={data}
        variant="card"
        renderCard={renderCard}
      />,
    );

    let cardGrid = screen.getByText("사용자 1").parentElement.parentElement;
    expect(cardGrid).toHaveClass(
      "grid",
      "grid-cols-1",
      "sm:grid-cols-2",
      "lg:grid-cols-3",
      "xl:grid-cols-4",
      "gap-4",
    );

    rerender(
      <EasyTable
        data={data}
        variant="card"
        renderCard={renderCard}
        cardsPerRow={2}
      />,
    );
    cardGrid = screen.getByText("사용자 1").parentElement.parentElement;
    expect(cardGrid).toHaveClass("grid", "grid-cols-1", "sm:grid-cols-2", "gap-4");
    expect(cardGrid).not.toHaveClass("lg:grid-cols-3", "xl:grid-cols-4");

    rerender(
      <EasyTable
        data={data}
        variant="card"
        renderCard={renderCard}
        cardsPerRow={5}
        gridClassName="custom-card-grid"
      />,
    );
    cardGrid = screen.getByText("사용자 1").parentElement.parentElement;
    expect(cardGrid).toHaveClass("custom-card-grid");
    expect(cardGrid).not.toHaveClass("grid", "xl:grid-cols-5");
  });

  it("activates clickable rows exactly once by click, Enter, and Space with the row payload", () => {
    const onRowClick = vi.fn();
    render(<EasyTable data={data} columns={columns} pageSize={2} onRowClick={onRowClick} />);

    const firstRow = screen.getByRole("cell", { name: "사용자 1" }).parentElement;
    expect(firstRow).toHaveAttribute("tabindex", "0");

    fireEvent.click(firstRow);
    expect(onRowClick).toHaveBeenLastCalledWith(data[0], 0);
    expect(onRowClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(firstRow, { key: "Enter" });
    expect(onRowClick).toHaveBeenLastCalledWith(data[0], 0);
    expect(onRowClick).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(firstRow, { key: " " });
    expect(onRowClick).toHaveBeenLastCalledWith(data[0], 0);
    expect(onRowClick).toHaveBeenCalledTimes(3);
  });

  it("keeps non-clickable rows out of the tab order", () => {
    render(<EasyTable data={data} columns={columns} pageSize={2} />);

    const firstRow = screen.getByRole("cell", { name: "사용자 1" }).parentElement;
    expect(firstRow).not.toHaveAttribute("tabindex");
  });

  it("uses list semantics for card mode without exposing a table role", () => {
    render(
      <EasyTable
        data={data}
        variant="card"
        pageSize={2}
        renderCard={(row) => <article>{row.name}</article>}
      />,
    );

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
