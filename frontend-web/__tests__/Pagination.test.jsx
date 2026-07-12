import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Pagination from "../app/lib/component/Pagination.jsx";

const getNavigationButtons = () => within(screen.getByRole("navigation")).getAllByRole("button");

describe("Pagination", () => {
  it("covers the basic documented example with current-page and class semantics", () => {
    const onChange = vi.fn();
    render(
      <Pagination
        page={2}
        pageCount={12}
        onChange={onChange}
        className="documented-basic-class"
      />,
    );

    expect(screen.getByRole("navigation")).toHaveClass("documented-basic-class");
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("covers the limited documented example and renders its edge window", () => {
    render(<Pagination page={5} pageCount={50} maxButtons={5} onChange={vi.fn()} />);

    for (const pageNo of [1, 4, 5, 6, 50]) {
      expect(screen.getByRole("button", { name: String(pageNo) })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "5" })).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByText("…")).toHaveLength(2);
  });

  it("fires every edge, direction, and numbered navigation callback exactly once", () => {
    const onChange = vi.fn();
    render(<Pagination page={5} pageCount={50} maxButtons={5} onChange={onChange} />);
    const buttons = getNavigationButtons();
    const expectedPageList = [1, 4, 1, 4, 5, 6, 50, 6, 50];

    buttons.forEach((button, buttonIndex) => {
      fireEvent.click(button);
      expect(onChange).toHaveBeenCalledTimes(buttonIndex + 1);
      expect(onChange).toHaveBeenLastCalledWith(expectedPageList[buttonIndex]);
    });
  });

  it("hides first/last controls and ellipses when showEdges is false", () => {
    const onChange = vi.fn();
    render(
      <Pagination
        page={25}
        pageCount={50}
        maxButtons={5}
        showEdges={false}
        onChange={onChange}
      />,
    );

    const buttons = getNavigationButtons();
    expect(buttons).toHaveLength(7);
    for (const pageNo of [23, 24, 25, 26, 27]) {
      expect(screen.getByRole("button", { name: String(pageNo) })).toBeInTheDocument();
    }
    expect(screen.queryByText("…")).not.toBeInTheDocument();

    fireEvent.click(buttons[0]);
    fireEvent.click(buttons.at(-1));
    expect(onChange.mock.calls).toEqual([[24], [26]]);
  });

  it("clamps invalid page bounds and disables navigation at each boundary", () => {
    const onChange = vi.fn();
    const { rerender } = render(<Pagination page={0} pageCount={3} onChange={onChange} />);

    let buttons = getNavigationButtons();
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();

    rerender(<Pagination page={99} pageCount={3} onChange={onChange} />);
    buttons = getNavigationButtons();
    expect(screen.getByRole("button", { name: "3" })).toHaveAttribute("aria-current", "page");
    expect(buttons.at(-2)).toBeDisabled();
    expect(buttons.at(-1)).toBeDisabled();
  });

  it("normalizes non-finite and non-numeric inputs before building page tokens", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Pagination
        page={Infinity}
        pageCount={Infinity}
        maxButtons={Infinity}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByText("Infinity")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    expect(onChange).toHaveBeenCalledWith(1);

    rerender(
      <Pagination
        page={-Infinity}
        pageCount="not-a-number"
        maxButtons="not-a-number"
        onChange={onChange}
      />,
    );
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
    expect(getNavigationButtons()).toHaveLength(5);
  });
});
