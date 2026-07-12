/**
 * 파일명: NumberDateTimeInputs.test.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-11
 * 설명: 숫자·날짜·시간 입력의 draft, 검증, 키보드 상호작용 회귀 테스트
 */

import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import NumberInput from "../app/lib/component/NumberInput.jsx";
import DateInput from "../app/lib/component/DateInput.jsx";
import TimeInput from "../app/lib/component/TimeInput.jsx";

describe("NumberInput draft and commit", () => {
  it("normalizes decimal steps for buttons, keyboard, and range clamps", () => {
    const onValueChange = vi.fn();
    render(
      <NumberInput
        defaultValue={0.2}
        step={0.1}
        min={0.1}
        max={0.3}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("spinbutton");

    fireEvent.click(screen.getByRole("button", { name: "increment" }));
    expect(input).toHaveValue("0.3");
    expect(onValueChange).toHaveBeenLastCalledWith(0.3, expect.any(Object));

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("0.3");
    expect(onValueChange).toHaveBeenLastCalledWith(0.3, expect.any(Object));

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveValue("0.2");
    fireEvent.keyDown(input, { key: "PageDown" });
    expect(input).toHaveValue("0.1");
    expect(onValueChange).toHaveBeenLastCalledWith(0.1, expect.any(Object));
  });

  it("keeps a controlled decimal draft editable and commits on blur", () => {
    const onValueChange = vi.fn();
    const ControlledNumber = () => {
      const [value, setValue] = useState(1);
      return (
        <NumberInput
          value={value}
          min={0}
          max={10}
          onValueChange={(nextValue, ctx) => {
            onValueChange(nextValue, ctx);
            setValue(nextValue);
          }}
        />
      );
    };
    render(<ControlledNumber />);
    const input = screen.getByRole("spinbutton");

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "1." } });
    expect(input).toHaveValue("1.");
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "1.5" } });
    fireEvent.blur(input);

    expect(input).toHaveValue("1.5");
    expect(onValueChange).toHaveBeenLastCalledWith(1.5, expect.objectContaining({ source: "user" }));
  });

  it("keeps a data-bound decimal draft and commits through binding on Enter", () => {
    const dataObj = { amount: 2 };
    const onValueChange = vi.fn();
    render(<NumberInput dataObj={dataObj} dataKey="amount" onValueChange={onValueChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "2." } });
    expect(input).toHaveValue("2.");
    expect(dataObj.amount).toBe(2);
    fireEvent.change(input, { target: { value: "2.75" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(dataObj.amount).toBe(2.75);
    expect(input).toHaveValue("2.75");
    expect(onValueChange).toHaveBeenCalledWith(2.75, expect.any(Object));
  });

  it("omits aria-valuenow for incomplete minus and decimal drafts without React warnings", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      render(<NumberInput defaultValue={1} />);
      const input = screen.getByRole("spinbutton");

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "-" } });
      expect(input).toHaveValue("-");
      expect(input).not.toHaveAttribute("aria-valuenow");

      fireEvent.change(input, { target: { value: "." } });
      expect(input).toHaveValue(".");
      expect(input).not.toHaveAttribute("aria-valuenow");
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    }
  });
});

describe("DateInput manual validation", () => {
  it("restores invalid and out-of-range drafts but commits an in-range date", () => {
    const onValueChange = vi.fn();
    render(
      <DateInput
        defaultValue="2026-07-10"
        min="2026-07-01"
        max="2026-07-31"
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "2026-02-30" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("2026-07-10");
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "2026-08-01" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toHaveValue("2026-07-10");
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "2026-07-20" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("2026-07-20");
    expect(onValueChange).toHaveBeenCalledWith("2026-07-20", expect.any(Object));
  });

  it("opens from the keyboard and exposes a reachable picker toggle", () => {
    render(<DateInput defaultValue="2026-07-10" />);
    const input = screen.getByRole("textbox");
    const toggle = screen.getByRole("button", { name: /./ });
    expect(toggle).not.toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(input, { key: "ArrowDown", altKey: true });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("TimeInput manual validation and keyboard options", () => {
  it("restores invalid and out-of-range drafts but commits an in-range time", () => {
    const onValueChange = vi.fn();
    render(
      <TimeInput
        defaultValue="10:00"
        min="09:00"
        max="18:00"
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "24:00" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("10:00");
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "08:59" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toHaveValue("10:00");
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "17:30" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("17:30");
    expect(onValueChange).toHaveBeenCalledWith("17:30", expect.any(Object));
  });

  it("filters options by range and selects an option with Enter", () => {
    const onValueChange = vi.fn();
    render(
      <TimeInput
        defaultValue="10:00"
        min="10:00"
        max="11:00"
        step={30}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("combobox");
    const toggle = screen.getByRole("button", { name: /./ });
    expect(toggle).not.toHaveAttribute("tabindex", "-1");
    expect(input).toHaveAttribute("aria-haspopup", "listbox");
    expect(input).toHaveAttribute("aria-expanded", "false");
    const listboxId = input.getAttribute("aria-controls");
    expect(listboxId).toBeTruthy();
    expect(document.getElementById(listboxId)).toBeNull();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toHaveAttribute("id", listboxId);
    expect(screen.queryByRole("option", { name: "09:30" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "11:30" })).not.toBeInTheDocument();
    const option = screen.getByRole("option", { name: "10:30" });
    expect(option.tagName).toBe("BUTTON");
    fireEvent.keyDown(option, { key: "Enter" });

    expect(input).toHaveValue("10:30");
    expect(onValueChange).toHaveBeenCalledWith("10:30", expect.any(Object));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});
