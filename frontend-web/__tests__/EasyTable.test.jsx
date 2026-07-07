import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
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
});
