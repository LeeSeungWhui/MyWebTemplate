import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import Input from "../app/lib/component/Input.jsx";

describe("Input mask compatibility", () => {
  it("supports function mask and commits transformed value", () => {
    const onValueChange = vi.fn();
    const maskFn = (rawValue) =>
      String(rawValue || "")
        .replace(/\D/g, "")
        .slice(0, 4);

    render(<Input aria-label="fn-mask" mask={maskFn} onValueChange={onValueChange} />);
    const input = screen.getByLabelText("fn-mask");

    fireEvent.change(input, { target: { value: "ab12cd345" } });

    expect(input).toHaveValue("1234");
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe("1234");
    expect(input.getAttribute("placeholder")).toBeNull();
  });

  it("uses string mask as fallback placeholder when placeholder prop is empty", () => {
    render(<Input aria-label="string-mask" mask="###-####-####" />);
    const input = screen.getByLabelText("string-mask");
    expect(input).toHaveAttribute("placeholder", "###-####-####");
  });
});
