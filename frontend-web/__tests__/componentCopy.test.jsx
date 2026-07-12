import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import COMPONENT_LANG_KO from "../app/component/lang.ko.js";
import CodeBlock from "../app/component/docs/shared/CodeBlock.jsx";

const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");

const setClipboard = (clipboard) => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: clipboard,
  });
};

afterEach(() => {
  vi.useRealTimers();
  if (originalClipboardDescriptor) {
    Object.defineProperty(navigator, "clipboard", originalClipboardDescriptor);
  } else {
    delete navigator.clipboard;
  }
});

describe("component catalog copy contract", () => {
  it("introduces the catalog before the technical reference", () => {
    expect(COMPONENT_LANG_KO.metadata.title).toContain("UI 컴포넌트 카탈로그");
    expect(COMPONENT_LANG_KO.metadata.description).toContain("33가지");
    expect(COMPONENT_LANG_KO.view.introTitle).toContain("33가지 UI 구성 요소");
    expect(COMPONENT_LANG_KO.view.introDescription).toContain("동작하는 예시와 구현 코드");
  });

  it("uses readable Korean labels for technical interaction modes", () => {
    expect(COMPONENT_LANG_KO.view.tocLabels.numberUnbound).toContain("독립형");
    expect(COMPONENT_LANG_KO.view.tocLabels.comboboxBound).toContain("데이터 연결");
    expect(COMPONENT_LANG_KO.view.tocLabels.tableControlled).toContain("외부 상태 제어");
    expect(COMPONENT_LANG_KO.view.tocLabels.comboboxMulti).toContain("다중 선택");
  });

  it("shows copied only after clipboard success and resets after two seconds", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    render(<CodeBlock code="const answer = 42;" />);

    fireEvent.click(screen.getByRole("button", { name: "코드 복사" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await act(async () => Promise.resolve());
    expect(writeText).toHaveBeenCalledWith("const answer = 42;");
    expect(screen.getByRole("status")).toHaveTextContent(COMPONENT_LANG_KO.view.copyDoneLabel);

    act(() => vi.advanceTimersByTime(1999));
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows and clears copied status after StrictMode effect replay", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    render(
      <React.StrictMode>
        <CodeBlock code="strict mode copy" />
      </React.StrictMode>,
    );

    fireEvent.click(screen.getByRole("button", { name: "코드 복사" }));
    await act(async () => Promise.resolve());

    expect(writeText).toHaveBeenCalledWith("strict mode copy");
    expect(screen.getByRole("status")).toHaveTextContent(COMPONENT_LANG_KO.view.copyDoneLabel);

    act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it.each([
    ["missing", undefined],
    ["rejected", { writeText: vi.fn().mockRejectedValue(new Error("denied")) }],
  ])("does not report false copy success when clipboard is %s", async (_state, clipboard) => {
    setClipboard(clipboard);
    render(<CodeBlock code="sample" />);

    fireEvent.click(screen.getByRole("button", { name: "코드 복사" }));
    await act(async () => Promise.resolve());

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("restarts the reset timer safely for repeated successful copies", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    render(<CodeBlock code="sample" />);
    const copyButton = screen.getByRole("button", { name: "코드 복사" });

    fireEvent.click(copyButton);
    await act(async () => Promise.resolve());
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(copyButton);
    await act(async () => Promise.resolve());
    act(() => vi.advanceTimersByTime(1500));

    expect(writeText).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("cancels pending copy work and reset timers on unmount", async () => {
    vi.useFakeTimers();
    let resolveWrite;
    const writeText = vi.fn(() => new Promise((resolve) => {
      resolveWrite = resolve;
    }));
    setClipboard({ writeText });
    const { unmount } = render(<CodeBlock code="sample" />);

    fireEvent.click(screen.getByRole("button", { name: "코드 복사" }));
    unmount();
    await act(async () => {
      resolveWrite();
      await Promise.resolve();
    });

    expect(vi.getTimerCount()).toBe(0);
  });
});
