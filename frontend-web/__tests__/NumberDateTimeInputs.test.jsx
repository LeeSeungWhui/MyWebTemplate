/**
 * 파일명: NumberDateTimeInputs.test.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-11
 * 설명: 숫자·날짜·시간 입력의 draft, 검증, 키보드 상호작용 회귀 테스트
 */

import { useState } from "react";
import { flushSync } from "react-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import NumberInput from "../app/lib/component/NumberInput.jsx";
import DateInput from "../app/lib/component/DateInput.jsx";
import TimeInput from "../app/lib/component/TimeInput.jsx";
import EasyObj from "../app/lib/dataset/EasyObj.jsx";

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

  it("repeats long-press steps deterministically and cleans active and pending timers", () => {
    vi.useFakeTimers();
    try {
      const onValueChange = vi.fn();
      const activeHold = render(
        <NumberInput defaultValue={0} step={1} onValueChange={onValueChange} />,
      );
      const increment = activeHold.getByRole("button", { name: "increment" });

      fireEvent.mouseDown(increment);
      act(() => vi.advanceTimersByTime(299));
      expect(onValueChange).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(1));
      expect(activeHold.getByRole("spinbutton")).toHaveValue("1");
      expect(onValueChange).toHaveBeenCalledTimes(1);

      act(() => vi.advanceTimersByTime(240));
      expect(activeHold.getByRole("spinbutton")).toHaveValue("3");
      expect(onValueChange).toHaveBeenCalledTimes(3);

      fireEvent.mouseUp(increment);
      fireEvent.click(increment);
      act(() => vi.advanceTimersByTime(600));
      expect(onValueChange).toHaveBeenCalledTimes(3);

      activeHold.unmount();

      const activeUnmountOnValueChange = vi.fn();
      const activeUnmount = render(
        <NumberInput defaultValue={0} onValueChange={activeUnmountOnValueChange} />,
      );
      fireEvent.mouseDown(activeUnmount.getByRole("button", { name: "increment" }));
      act(() => vi.advanceTimersByTime(300));
      expect(activeUnmountOnValueChange).toHaveBeenCalledTimes(1);
      activeUnmount.unmount();
      act(() => vi.advanceTimersByTime(600));
      expect(activeUnmountOnValueChange).toHaveBeenCalledTimes(1);

      let synchronousUnmount;
      const synchronousUnmountOnValueChange = vi.fn(() => synchronousUnmount.unmount());
      synchronousUnmount = render(
        <NumberInput defaultValue={0} onValueChange={synchronousUnmountOnValueChange} />,
      );
      fireEvent.mouseDown(synchronousUnmount.getByRole("button", { name: "increment" }));
      act(() => vi.advanceTimersByTime(300));
      expect(synchronousUnmountOnValueChange).toHaveBeenCalledTimes(1);
      act(() => vi.advanceTimersByTime(600));
      expect(synchronousUnmountOnValueChange).toHaveBeenCalledTimes(1);

      const pendingOnValueChange = vi.fn();
      const pendingHold = render(
        <NumberInput defaultValue={0} onValueChange={pendingOnValueChange} />,
      );
      fireEvent.mouseDown(pendingHold.getByRole("button", { name: "increment" }));
      pendingHold.unmount();
      act(() => vi.advanceTimersByTime(600));
      expect(pendingOnValueChange).not.toHaveBeenCalled();
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it("uses each controlled parent update during an active hold", () => {
    vi.useFakeTimers();
    try {
      const onValueChange = vi.fn();
      const ControlledHold = () => {
        const [value, setValue] = useState(0);
        return (
          <NumberInput
            value={value}
            onValueChange={(nextValue, ctx) => {
              onValueChange(nextValue, ctx);
              setValue(nextValue);
            }}
          />
        );
      };
      render(<ControlledHold />);
      const input = screen.getByRole("spinbutton");
      const increment = screen.getByRole("button", { name: "increment" });

      fireEvent.mouseDown(increment);
      act(() => vi.advanceTimersByTime(300));
      expect(input).toHaveValue("1");
      act(() => vi.advanceTimersByTime(120));
      expect(input).toHaveValue("2");
      act(() => vi.advanceTimersByTime(120));
      expect(input).toHaveValue("3");
      fireEvent.mouseUp(increment);

      expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([1, 2, 3]);
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it("keeps EasyObj binding cumulative during an active hold", () => {
    vi.useFakeTimers();
    try {
      const onValueChange = vi.fn();
      let boundModel;
      const BoundHold = () => {
        const model = EasyObj({ amount: 0 });
        boundModel = model;
        return (
          <NumberInput
            dataObj={model}
            dataKey="amount"
            onValueChange={onValueChange}
          />
        );
      };
      render(<BoundHold />);
      const increment = screen.getByRole("button", { name: "increment" });

      fireEvent.mouseDown(increment);
      act(() => vi.advanceTimersByTime(300));
      act(() => vi.advanceTimersByTime(120));
      act(() => vi.advanceTimersByTime(120));
      fireEvent.mouseUp(increment);

      expect(boundModel.amount).toBe(3);
      expect(screen.getByRole("spinbutton")).toHaveValue("3");
      expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([1, 2, 3]);
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it.each([
    ["read-only", { readOnly: true }],
    ["disabled", { disabled: true }],
  ])("cancels pending and active holds on a %s transition", (_label, lockedProps) => {
    vi.useFakeTimers();
    try {
      const pendingOnValueChange = vi.fn();
      const pendingHold = render(
        <NumberInput defaultValue={0} onValueChange={pendingOnValueChange} />,
      );
      fireEvent.mouseDown(pendingHold.getByRole("button", { name: "increment" }));
      act(() => vi.advanceTimersByTime(200));
      pendingHold.rerender(
        <NumberInput defaultValue={0} onValueChange={pendingOnValueChange} {...lockedProps} />,
      );
      act(() => vi.advanceTimersByTime(600));
      expect(pendingOnValueChange).not.toHaveBeenCalled();
      expect(pendingHold.getByRole("spinbutton")).toHaveValue("0");
      pendingHold.unmount();

      const activeOnValueChange = vi.fn();
      const activeHold = render(
        <NumberInput defaultValue={0} onValueChange={activeOnValueChange} />,
      );
      fireEvent.mouseDown(activeHold.getByRole("button", { name: "increment" }));
      act(() => vi.advanceTimersByTime(300));
      expect(activeOnValueChange).toHaveBeenCalledTimes(1);
      activeHold.rerender(
        <NumberInput defaultValue={0} onValueChange={activeOnValueChange} {...lockedProps} />,
      );
      act(() => vi.advanceTimersByTime(600));

      expect(activeOnValueChange).toHaveBeenCalledTimes(1);
      expect(activeHold.getByRole("spinbutton")).toHaveValue("1");
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it.each([
    ["read-only", { readOnly: true }],
    ["disabled", { disabled: true }],
  ])("does not resume an orphan hold after a synchronous %s lock", (_label, lockedProps) => {
    vi.useFakeTimers();
    try {
      const onValueChange = vi.fn();
      let unlock;
      const SynchronousLockHold = () => {
        const [isLocked, setIsLocked] = useState(false);
        unlock = () => flushSync(() => setIsLocked(false));
        return (
          <NumberInput
            defaultValue={0}
            onValueChange={(nextValue, ctx) => {
              onValueChange(nextValue, ctx);
              flushSync(() => setIsLocked(true));
            }}
            {...(isLocked ? lockedProps : {})}
          />
        );
      };
      render(<SynchronousLockHold />);
      const input = screen.getByRole("spinbutton");
      const increment = screen.getByRole("button", { name: "increment" });

      fireEvent.mouseDown(increment);
      act(() => vi.advanceTimersByTime(300));
      expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([1]);
      expect(increment).toBeDisabled();
      if (lockedProps.readOnly) expect(input).toHaveAttribute("readonly");
      if (lockedProps.disabled) expect(input).toBeDisabled();

      act(() => vi.advanceTimersByTime(600));
      expect(onValueChange).toHaveBeenCalledTimes(1);
      act(() => unlock());
      expect(increment).toBeEnabled();
      act(() => vi.advanceTimersByTime(600));

      expect(input).toHaveValue("1");
      expect(onValueChange).toHaveBeenCalledTimes(1);

      fireEvent.click(increment);
      expect(input).toHaveValue("2");
      expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([1, 2]);
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it.each([
    ["read-only", { readOnly: true }],
    ["disabled", { disabled: true }],
  ])("blocks typing, step, and hold mutations while %s", (_label, lockedProps) => {
    vi.useFakeTimers();
    try {
      const onChange = vi.fn();
      const onValueChange = vi.fn();
      const element = (
        <NumberInput
          defaultValue={2}
          onChange={onChange}
          onValueChange={onValueChange}
          {...lockedProps}
        />
      );
      const { rerender } = render(element);
      const input = screen.getByRole("spinbutton");
      const decrement = screen.getByRole("button", { name: "decrement" });
      const increment = screen.getByRole("button", { name: "increment" });

      if (lockedProps.readOnly) expect(input).toHaveAttribute("readonly");
      if (lockedProps.disabled) expect(input).toBeDisabled();
      expect(decrement).toBeDisabled();
      expect(increment).toBeDisabled();

      if (lockedProps.readOnly) {
        fireEvent.change(input, { target: { value: "9" } });
      }
      fireEvent.keyDown(input, { key: "Enter" });
      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.blur(input);
      fireEvent.click(increment);
      fireEvent.mouseDown(increment);
      act(() => vi.advanceTimersByTime(600));
      fireEvent.mouseUp(increment);
      rerender(element);

      expect(input).toHaveValue("2");
      expect(onChange).not.toHaveBeenCalled();
      expect(onValueChange).not.toHaveBeenCalled();
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
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
    expect(screen.getByRole("dialog", { name: "날짜 선택 달력" })).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not open the calendar from read-only or disabled inputs", () => {
    const { rerender } = render(<DateInput defaultValue="2026-07-10" readOnly />);
    const readOnlyInput = screen.getByRole("textbox");

    fireEvent.keyDown(readOnlyInput, { key: "ArrowDown", altKey: true });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "날짜 선택기 열기" })).toBeDisabled();

    rerender(<DateInput defaultValue="2026-07-10" disabled />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "ArrowDown", altKey: true });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it.each([
    ["read-only", { readOnly: true }],
    ["disabled", { disabled: true }],
  ])("closes an open calendar after a %s transition without committing", (_label, transitionProps) => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <DateInput defaultValue="2026-07-10" onValueChange={onValueChange} />,
    );
    const input = screen.getByRole("textbox");

    fireEvent.keyDown(input, { key: "ArrowDown", altKey: true });
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    rerender(
      <DateInput
        defaultValue="2026-07-10"
        onValueChange={onValueChange}
        {...transitionProps}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(input).toHaveValue("2026-07-10");

    fireEvent.change(input, { target: { value: "2026-07-20" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);
    expect(input).toHaveValue("2026-07-10");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it.each([
    ["read-only", { readOnly: true }],
    ["disabled", { disabled: true }],
  ])("discards an enabled date draft on a %s transition and does not resurrect it", (_label, transitionProps) => {
    const onValueChange = vi.fn();
    const enabledElement = (
      <DateInput defaultValue="2026-07-10" onValueChange={onValueChange} />
    );
    const { rerender } = render(enabledElement);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "2026-07-20" } });
    fireEvent.keyDown(input, { key: "ArrowDown", altKey: true });
    expect(input).toHaveValue("2026-07-20");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    rerender(
      <DateInput
        defaultValue="2026-07-10"
        onValueChange={onValueChange}
        {...transitionProps}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(input).toHaveValue("2026-07-10");
    expect(onValueChange).not.toHaveBeenCalled();

    rerender(enabledElement);
    expect(input).toHaveValue("2026-07-10");
    expect(onValueChange).not.toHaveBeenCalled();
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

  it("navigates listbox options from the input and exposes the active option", () => {
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

    fireEvent.keyDown(input, { key: "ArrowDown" });
    const listboxId = input.getAttribute("aria-controls");
    expect(input).toHaveAttribute("aria-activedescendant", `${listboxId}_option_0`);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-activedescendant", `${listboxId}_option_1`);
    fireEvent.keyDown(input, { key: "End" });
    expect(input).toHaveAttribute("aria-activedescendant", `${listboxId}_option_2`);
    fireEvent.keyDown(input, { key: "Home" });
    expect(input).toHaveAttribute("aria-activedescendant", `${listboxId}_option_0`);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("10:30");
    expect(onValueChange).toHaveBeenLastCalledWith("10:30", expect.any(Object));
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).not.toHaveAttribute("aria-activedescendant");

    fireEvent.keyDown(input, { key: "ArrowDown", altKey: true });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveAttribute("aria-activedescendant", `${listboxId}_option_0`);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("keeps keyboard navigation safe when the option list is empty", () => {
    render(<TimeInput min="11:00" max="10:00" step={30} />);
    const input = screen.getByRole("combobox");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(input).not.toHaveAttribute("aria-activedescendant");

    ["ArrowDown", "ArrowUp", "Home", "End"].forEach((key) => {
      fireEvent.keyDown(input, { key });
      expect(input).not.toHaveAttribute("aria-activedescendant");
    });
  });

  it("scrolls the active option into view when keyboard navigation moves", () => {
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    try {
      render(<TimeInput defaultValue="10:00" min="10:00" max="11:00" step={30} />);
      const input = screen.getByRole("combobox");

      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "End" });
      expect(scrollIntoView).toHaveBeenLastCalledWith({ block: "nearest" });
    } finally {
      if (originalScrollIntoView) {
        Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
          configurable: true,
          value: originalScrollIntoView,
        });
      } else {
        delete HTMLElement.prototype.scrollIntoView;
      }
    }
  });

  it("does not open the option list from read-only or disabled inputs", () => {
    const { rerender } = render(<TimeInput defaultValue="10:00" readOnly />);

    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown", altKey: true });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "시간 선택기 열기" })).toBeDisabled();

    rerender(<TimeInput defaultValue="10:00" disabled />);
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it.each([
    ["read-only", { readOnly: true }],
    ["disabled", { disabled: true }],
  ])("closes an open option list after a %s transition without committing", (_label, transitionProps) => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <TimeInput defaultValue="10:00" step={30} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole("combobox");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    rerender(
      <TimeInput
        defaultValue="10:00"
        step={30}
        onValueChange={onValueChange}
        {...transitionProps}
      />,
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveValue("10:00");
    expect(input).toHaveAttribute("aria-expanded", "false");

    fireEvent.change(input, { target: { value: "10:30" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);
    expect(input).toHaveValue("10:00");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it.each([
    ["read-only", { readOnly: true }],
    ["disabled", { disabled: true }],
  ])("discards an enabled time draft on a %s transition and does not resurrect it", (_label, transitionProps) => {
    const onValueChange = vi.fn();
    const enabledElement = (
      <TimeInput defaultValue="10:00" step={30} onValueChange={onValueChange} />
    );
    const { rerender } = render(enabledElement);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "10:30" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveValue("10:30");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    rerender(
      <TimeInput
        defaultValue="10:00"
        step={30}
        onValueChange={onValueChange}
        {...transitionProps}
      />,
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveValue("10:00");
    expect(onValueChange).not.toHaveBeenCalled();

    rerender(enabledElement);
    expect(input).toHaveValue("10:00");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
