import { act, renderHook } from "@testing-library/react";

import { useEasyObj } from "@/app/lib/dataset/EasyObj";
import { useEasyList } from "@/app/lib/dataset/EasyList";

describe("dataset proxy invariants", () => {
  it("EasyObj는 non-writable/non-configurable object property에 원본 값을 반환한다", () => {
    const lockedChild = { id: 1, label: "locked" };
    const lockedBranch = {};
    Object.defineProperty(lockedBranch, "locked", {
      value: lockedChild,
      writable: false,
      configurable: false,
      enumerable: true,
    });

    const { result } = renderHook(() => useEasyObj({}));

    act(() => {
      result.current.set("bag", lockedBranch);
    });

    expect(() => result.current.bag.locked).not.toThrow();
    expect(result.current.bag.locked).toBe(lockedChild);
    expect(Object.getOwnPropertyDescriptor(result.current.bag, "locked")).toEqual(
      Object.getOwnPropertyDescriptor(lockedBranch, "locked"),
    );
    expect(Reflect.ownKeys(result.current.bag)).toEqual(Reflect.ownKeys(lockedBranch));
    expect("locked" in result.current.bag).toBe(true);
  });

  it("EasyList는 frozen nested array index에 원본 값을 반환한다", () => {
    const lockedItem = Object.freeze({ id: 2, label: "frozen" });
    const frozenList = Object.freeze([lockedItem]);

    const { result } = renderHook(() => useEasyList([]));

    act(() => {
      result.current.set(0, frozenList);
    });

    expect(() => result.current[0][0]).not.toThrow();
    expect(result.current[0][0]).toBe(lockedItem);
    expect(Object.getOwnPropertyDescriptor(result.current[0], "0")).toEqual(
      Object.getOwnPropertyDescriptor(frozenList, "0"),
    );
    expect(Reflect.ownKeys(result.current[0])).toEqual(Reflect.ownKeys(frozenList));
    expect("0" in result.current[0]).toBe(true);
  });
});
