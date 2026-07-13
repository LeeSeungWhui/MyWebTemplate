/**
 * 파일명: __tests__/settingsTabQuery.test.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-03
 * 설명: 설정 페이지 탭-쿼리 동기화 동작 테스트
 */

import { Children, forwardRef } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import SettingsView from "@/app/dashboard/settings/view";
import { apiJSON } from "@/app/lib/runtime/api";

const { replaceMock, setUserMock, showToastMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  setUserMock: vi.fn(),
  showToastMock: vi.fn(),
}));
let currentSearchParams = new URLSearchParams();

const setSearchParams = (queryObj = {}) => {
  currentSearchParams = new URLSearchParams(queryObj);
};

const profileApiResponse = {
  result: {
    userId: "demo@demo.demo",
    userNm: "데모",
    userEml: "demo@demo.demo",
    roleCd: "user",
    notifyEmail: false,
    notifySms: false,
    notifyPush: false,
  },
};

const fillPasswordForm = ({
  currentPassword = "password123",
  newPassword = "password456",
  newPasswordConfirm = "password456",
} = {}) => {
  fireEvent.change(screen.getByLabelText("현재 비밀번호"), {
    target: { value: currentPassword },
  });
  fireEvent.change(screen.getByLabelText("새 비밀번호"), {
    target: { value: newPassword },
  });
  fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), {
    target: { value: newPasswordConfirm },
  });
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/dashboard/settings",
  useSearchParams: () => currentSearchParams,
}));

vi.mock("@/app/common/store/SharedStore", () => ({
  useGlobalUi: () => ({
    showToast: showToastMock,
  }),
  useUser: () => ({ setUser: setUserMock }),
}));

vi.mock("@/app/lib/runtime/api", () => ({
  apiJSON: vi.fn(),
}));

vi.mock("@/app/lib/component/Badge", () => ({
  __esModule: true,
  default: ({ children }) => <span>{children}</span>,
}));

vi.mock("@/app/lib/component/Button", () => ({
  __esModule: true,
  default: ({ children, onClick, className, disabled = false, loading = false, type = "button" }) => (
    <button
      type={type}
      onClick={onClick}
      className={className}
      disabled={disabled || loading}
      aria-busy={loading ? "true" : undefined}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/app/lib/component/Card", () => ({
  __esModule: true,
  default: ({ title, children }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

vi.mock("@/app/lib/component/Input", () => ({
  __esModule: true,
  default: forwardRef(function MockInput({
    value,
    dataObj,
    dataKey,
    onChange,
    onValueChange,
    readOnly,
    placeholder,
    type = "text",
    id,
    autoComplete,
    disabled,
    error,
  }, ref) {
    const pathSegments = String(dataKey || "").split(".").filter(Boolean);
    const readBoundValue = () => pathSegments.reduce(
      (cursor, pathSegment) => cursor?.[pathSegment],
      dataObj,
    );
    const writeBoundValue = (nextValue) => {
      let cursor = dataObj;
      for (let index = 0; index < pathSegments.length - 1; index += 1) {
        cursor = cursor[pathSegments[index]];
      }
      cursor[pathSegments[pathSegments.length - 1]] = nextValue;
    };
    const inputValue = value ?? (dataObj && dataKey ? readBoundValue() ?? "" : "");
    const handleChange = dataObj && dataKey || onChange || onValueChange
      ? (event) => {
        if (dataObj && dataKey) writeBoundValue(event.target.value);
        onChange?.(event);
        onValueChange?.(event.target.value);
      }
      : undefined;
    const errorId = error && id ? `${id}-error` : undefined;
    return (
      <div>
        <input
          ref={ref}
          id={id}
          type={type}
          value={inputValue}
          onChange={handleChange}
          readOnly={Boolean(readOnly || !handleChange)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
        />
        {error && <span id={errorId}>{error}</span>}
      </div>
    );
  }),
}));

vi.mock("@/app/lib/component/NumberInput", () => ({
  __esModule: true,
  default: ({ value = 0, onChange }) => (
    <input type="number" value={value} onChange={onChange} readOnly={!onChange} />
  ),
}));

vi.mock("@/app/lib/component/Switch", () => ({
  __esModule: true,
  default: ({ checked = false, onChange, label }) => (
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} readOnly={!onChange} />
      {label}
    </label>
  ),
}));

vi.mock("@/app/lib/component/Tab", () => {
  const Tab = ({ tabIndex = 0, onValueChange, children }) => {
    const tabItemList = Children.toArray(children).filter(Boolean);
    const activeTabIndex = Math.max(0, Math.min(tabIndex, tabItemList.length - 1));
    return (
      <div>
        <div role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTabIndex === 0}
            onClick={() => onValueChange?.(0)}
          >
            profile-tab
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTabIndex === 1}
            onClick={() => onValueChange?.(1)}
          >
            system-tab
          </button>
        </div>
        <div data-testid="active-tab">{String(activeTabIndex)}</div>
        <div role="tabpanel">{tabItemList[activeTabIndex]}</div>
      </div>
    );
  };

  const TabItem = ({ children }) => <div>{children}</div>;
  TabItem.displayName = "MockTabItem";
  Tab.Item = TabItem;
  return {
    __esModule: true,
    default: Tab,
  };
});

describe("settings tab query helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiJSON.mockReset();
    setSearchParams();
    apiJSON.mockResolvedValue(profileApiResponse);
    vi.stubGlobal("requestAnimationFrame", (callback) => setTimeout(callback, 0));
    vi.stubGlobal("cancelAnimationFrame", (frameId) => clearTimeout(frameId));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("tab 쿼리가 없거나 잘못되면 profile 탭으로 정규화한다", async () => {
    setSearchParams();
    const firstRender = render(<SettingsView initialDataObj={{}} initialErrorObj={{}} />);

    await waitFor(() => {
      expect(apiJSON).toHaveBeenCalled();
    });
    expect(screen.getByTestId("active-tab")).toHaveTextContent("0");

    firstRender.unmount();

    vi.clearAllMocks();
    setSearchParams({ tab: "unknown" });
    apiJSON.mockResolvedValue({
      result: {
        userId: "demo@demo.demo",
        userNm: "데모",
        userEml: "demo@demo.demo",
        roleCd: "user",
        notifyEmail: false,
        notifySms: false,
        notifyPush: false,
      },
    });
    render(<SettingsView initialDataObj={{}} initialErrorObj={{}} />);

    await waitFor(() => {
      expect(apiJSON).toHaveBeenCalled();
    });
    expect(screen.getByTestId("active-tab")).toHaveTextContent("0");
  });

  test("tab=system이면 system 탭으로 정규화한다", async () => {
    setSearchParams({ tab: "system" });

    render(<SettingsView initialDataObj={{}} initialErrorObj={{}} />);

    await waitFor(() => {
      expect(apiJSON).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByTestId("active-tab")).toHaveTextContent("1");
    });
    expect(screen.queryByRole("form", { name: "비밀번호 변경" })).not.toBeInTheDocument();
  });

  test("초기 프로필 자동 로드는 한 번만 실행되고 로딩 상태를 벗어난다", async () => {
    setSearchParams();

    render(<SettingsView initialDataObj={{}} initialErrorObj={{}} />);

    await waitFor(() => {
      expect(apiJSON).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue("demo@demo.demo")).toBeTruthy();
    });
    await waitFor(() => {
      expect(apiJSON).toHaveBeenCalledTimes(1);
    }, { timeout: 50 });
  });

  test("탭 인덱스 변경 시 쿼리값 변환이 일관된다", async () => {
    setSearchParams();

    render(<SettingsView initialDataObj={{}} initialErrorObj={{}} />);

    await waitFor(() => {
      expect(apiJSON).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("tab", { name: "system-tab" }));
    expect(replaceMock).toHaveBeenCalledWith("/dashboard/settings?tab=system", {
      scroll: false,
    });

    fireEvent.click(screen.getByRole("tab", { name: "profile-tab" }));
    expect(replaceMock).toHaveBeenCalledWith("/dashboard/settings", {
      scroll: false,
    });
  });

  test("프로필 저장은 정규화된 PUT payload를 보내고 응답으로 화면을 동기화한다", async () => {
    apiJSON
      .mockResolvedValueOnce({
        result: {
          userId: "demo@demo.demo",
          userNm: "데모",
          userEml: "demo@demo.demo",
          roleCd: "admin",
          notifyEmail: false,
          notifySms: false,
          notifyPush: false,
        },
      })
      .mockResolvedValueOnce({
        result: {
          userId: "demo@demo.demo",
          userNm: "수정된 데모",
          userEml: "demo@demo.demo",
          roleCd: "admin",
          notifyEmail: false,
          notifySms: false,
          notifyPush: false,
        },
      });

    render(<SettingsView initialDataObj={{}} initialErrorObj={{}} />);
    await screen.findByDisplayValue("데모");
    fireEvent.change(screen.getByDisplayValue("데모"), { target: { value: "  수정된 데모  " } });
    fireEvent.click(screen.getAllByRole("button", { name: "저장" })[0]);

    await waitFor(() => expect(apiJSON).toHaveBeenCalledTimes(2));
    expect(apiJSON.mock.calls[1][0]).toMatchObject({ path: "/api/v1/profile/me" });
    expect(apiJSON.mock.calls[1][1]).toEqual({
      method: "PUT",
      body: {
        userNm: "수정된 데모",
        notifyEmail: false,
        notifySms: false,
        notifyPush: false,
      },
    });
    expect(await screen.findByDisplayValue("수정된 데모")).toBeTruthy();
  });

  test("프로필 저장 실패는 requestId를 안전한 alert에 표시한다", async () => {
    const saveError = Object.assign(new Error("private upstream detail must not render"), {
      code: "PROFILE_503_UNAVAILABLE",
      requestId: "rid-profile-safe-1",
    });
    apiJSON
      .mockResolvedValueOnce({
        result: {
          userId: "demo@demo.demo",
          userNm: "데모",
          userEml: "demo@demo.demo",
          roleCd: "admin",
          notifyEmail: false,
          notifySms: false,
          notifyPush: false,
        },
      })
      .mockRejectedValueOnce(saveError);

    render(<SettingsView initialDataObj={{}} initialErrorObj={{}} />);
    await screen.findByDisplayValue("데모");
    fireEvent.click(screen.getAllByRole("button", { name: "저장" })[0]);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("프로필 저장에 실패했습니다.");
    expect(alert).toHaveTextContent("PROFILE_503_UNAVAILABLE");
    expect(alert).toHaveTextContent("rid-profile-safe-1");
    expect(alert).not.toHaveTextContent("private upstream detail must not render");
  });

  test("시스템 설정 저장 재시도 성공 시 이전 오류 alert를 제거한다", async () => {
    const systemSaveError = Object.assign(new Error("private system detail"), {
      code: "SYSTEM_503_UNAVAILABLE",
      requestId: "rid-system-safe-1",
    });
    apiJSON
      .mockResolvedValueOnce({
        result: {
          userId: "demo@demo.demo",
          userNm: "데모",
          userEml: "demo@demo.demo",
          roleCd: "admin",
          notifyEmail: false,
          notifySms: false,
          notifyPush: false,
        },
      })
      .mockRejectedValueOnce(systemSaveError)
      .mockResolvedValueOnce({ result: { saved: true } });

    render(<SettingsView initialDataObj={{}} initialErrorObj={{}} />);
    await screen.findByDisplayValue("데모");
    fireEvent.click(screen.getByRole("tab", { name: "system-tab" }));
    await waitFor(() => {
      expect(screen.getByTestId("active-tab")).toHaveTextContent("1");
    });
    const systemSaveButton = screen.getByRole("button", { name: "저장" });

    fireEvent.click(systemSaveButton);
    expect(await screen.findByRole("alert")).toHaveTextContent("SYSTEM_503_UNAVAILABLE");

    fireEvent.click(systemSaveButton);
    await waitFor(() => expect(apiJSON).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });

  test("비밀번호 변경 검증은 요청 전에 첫 오류를 표시하고 순서대로 focus한다", async () => {
    render(<SettingsView initialDataObj={{}} initialErrorObj={{}} />);
    await screen.findByDisplayValue("데모");

    const currentPasswordInput = screen.getByLabelText("현재 비밀번호");
    const newPasswordInput = screen.getByLabelText("새 비밀번호");
    const newPasswordConfirmInput = screen.getByLabelText("새 비밀번호 확인");
    const passwordChangeButton = screen.getByRole("button", { name: "비밀번호 변경" });

    expect(currentPasswordInput).toHaveAttribute("type", "password");
    expect(currentPasswordInput).toHaveAttribute("autocomplete", "current-password");
    expect(newPasswordInput).toHaveAttribute("autocomplete", "new-password");
    expect(newPasswordConfirmInput).toHaveAttribute("autocomplete", "new-password");

    fireEvent.click(passwordChangeButton);
    await waitFor(() => {
      expect(currentPasswordInput).toHaveFocus();
      expect(currentPasswordInput).toHaveAttribute("aria-invalid", "true");
      expect(screen.getAllByText("현재 비밀번호를 입력해주세요.").length).toBeGreaterThan(0);
    });

    fireEvent.change(currentPasswordInput, { target: { value: "password123" } });
    fireEvent.click(passwordChangeButton);
    await waitFor(() => {
      expect(newPasswordInput).toHaveFocus();
      expect(screen.getAllByText("새 비밀번호를 입력해주세요.").length).toBeGreaterThan(0);
    });

    fireEvent.change(newPasswordInput, { target: { value: "short" } });
    fireEvent.click(passwordChangeButton);
    await waitFor(() => {
      expect(newPasswordInput).toHaveFocus();
      expect(screen.getAllByText("새 비밀번호는 8자 이상 입력해주세요.").length).toBeGreaterThan(0);
    });

    fireEvent.change(newPasswordInput, { target: { value: "password123" } });
    fireEvent.change(newPasswordConfirmInput, { target: { value: "password123" } });
    fireEvent.click(passwordChangeButton);
    await waitFor(() => {
      expect(newPasswordInput).toHaveFocus();
      expect(screen.getAllByText("새 비밀번호는 현재 비밀번호와 달라야 합니다.").length).toBeGreaterThan(0);
    });

    fireEvent.change(newPasswordInput, { target: { value: "password456" } });
    fireEvent.change(newPasswordConfirmInput, { target: { value: "" } });
    fireEvent.click(passwordChangeButton);
    await waitFor(() => {
      expect(newPasswordConfirmInput).toHaveFocus();
      expect(screen.getAllByText("새 비밀번호 확인을 입력해주세요.").length).toBeGreaterThan(0);
    });

    fireEvent.change(newPasswordConfirmInput, { target: { value: "password789" } });
    fireEvent.click(passwordChangeButton);
    await waitFor(() => {
      expect(newPasswordConfirmInput).toHaveFocus();
      expect(screen.getAllByText("새 비밀번호 확인이 일치하지 않습니다.").length).toBeGreaterThan(0);
    });
    expect(apiJSON).toHaveBeenCalledTimes(1);
  });

  test("비밀번호 변경은 exact payload만 보내고 rapid double submit을 한 요청으로 막는다", async () => {
    let resolvePasswordChange;
    const passwordChangePromise = new Promise((resolve) => {
      resolvePasswordChange = resolve;
    });
    apiJSON
      .mockReset()
      .mockResolvedValueOnce(profileApiResponse)
      .mockImplementationOnce(() => passwordChangePromise);

    render(<SettingsView initialDataObj={{}} initialErrorObj={{}} />);
    await screen.findByDisplayValue("데모");
    fillPasswordForm();

    const passwordForm = screen.getByRole("form", { name: "비밀번호 변경" });
    const passwordChangeButton = screen.getByRole("button", { name: "비밀번호 변경" });
    const currentPasswordInput = document.getElementById("settings-current-password");
    expect(currentPasswordInput).not.toBeNull();
    const newPasswordInput = screen.getByLabelText("새 비밀번호");
    const newPasswordConfirmInput = screen.getByLabelText("새 비밀번호 확인");
    fireEvent.submit(passwordForm);
    fireEvent.submit(passwordForm);

    await waitFor(() => expect(apiJSON).toHaveBeenCalledTimes(2));
    expect(apiJSON.mock.calls[1][0]).toMatchObject({
      path: "/api/v1/auth/password-change",
      method: "POST",
    });
    expect(apiJSON.mock.calls[1][1]).toEqual({
      method: "POST",
      body: {
        currentPassword: "password123",
        newPassword: "password456",
      },
    });
    expect(Object.keys(apiJSON.mock.calls[1][1].body).sort()).toEqual([
      "currentPassword",
      "newPassword",
    ]);
    await waitFor(() => {
      expect(currentPasswordInput).toBeDisabled();
      expect(newPasswordInput).toBeDisabled();
      expect(newPasswordConfirmInput).toBeDisabled();
      expect(passwordChangeButton).toBeDisabled();
    });

    await act(async () => {
      resolvePasswordChange({ result: { changed: false } });
      await passwordChangePromise;
    });
    await waitFor(() => {
      expect(currentPasswordInput).not.toBeDisabled();
      expect(newPasswordInput).not.toBeDisabled();
      expect(newPasswordConfirmInput).not.toBeDisabled();
      expect(passwordChangeButton).not.toBeDisabled();
    });
    expect(apiJSON).toHaveBeenCalledTimes(2);
  });

  test("잘못된 현재 비밀번호는 새 비밀번호를 지우고 현재 입력에 focus한 뒤 재시도를 연다", async () => {
    const pendingFocusFrames = new Map();
    let nextFocusFrameId = 1;
    const requestFrameMock = vi.fn((callback) => {
      const frameId = nextFocusFrameId;
      nextFocusFrameId += 1;
      pendingFocusFrames.set(frameId, callback);
      return frameId;
    });
    const cancelFrameMock = vi.fn((frameId) => {
      pendingFocusFrames.delete(frameId);
    });
    const runPendingFrame = (frameId) => {
      const callback = pendingFocusFrames.get(frameId);
      expect(typeof callback).toBe("function");
      pendingFocusFrames.delete(frameId);
      act(() => callback());
    };
    const runPendingFramesExcept = (excludedFrameId) => {
      let frameIds = [...pendingFocusFrames.keys()]
        .filter((frameId) => frameId !== excludedFrameId);
      let executedFrameCount = 0;
      while (frameIds.length > 0 && executedFrameCount < 20) {
        runPendingFrame(frameIds[0]);
        executedFrameCount += 1;
        frameIds = [...pendingFocusFrames.keys()]
          .filter((frameId) => frameId !== excludedFrameId);
      }
      expect(frameIds).toHaveLength(0);
    };

    const currentPasswordError = Object.assign(new Error("private current-password detail"), {
      code: "AUTH_400_CURRENT_PASSWORD_INVALID",
      requestId: "rid-password-current-1",
      status: 400,
    });
    apiJSON
      .mockReset()
      .mockResolvedValueOnce(profileApiResponse)
      .mockRejectedValueOnce(currentPasswordError)
      .mockRejectedValueOnce(currentPasswordError)
      .mockRejectedValueOnce(currentPasswordError);

    const rendered = render(<SettingsView initialDataObj={{}} initialErrorObj={{}} />);
    await screen.findByDisplayValue("데모");
    fillPasswordForm();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    vi.stubGlobal("requestAnimationFrame", requestFrameMock);
    vi.stubGlobal("cancelAnimationFrame", cancelFrameMock);
    const firstCancelCallCount = cancelFrameMock.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));

    await waitFor(() => {
      expect(cancelFrameMock.mock.calls.length).toBe(firstCancelCallCount + 1);
    });
    const firstOuterFrameId = requestFrameMock.mock.results.at(-1).value;
    expect(pendingFocusFrames.has(firstOuterFrameId)).toBe(true);
    runPendingFramesExcept(firstOuterFrameId);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "비밀번호 변경" })).not.toBeDisabled();
    });
    const currentPasswordInput = document.getElementById("settings-current-password");
    expect(currentPasswordInput).not.toBeNull();
    expect(currentPasswordInput).not.toHaveFocus();
    runPendingFrame(firstOuterFrameId);
    const firstInnerFrameId = requestFrameMock.mock.results.at(-1).value;
    expect(firstInnerFrameId).not.toBe(firstOuterFrameId);
    expect(currentPasswordInput).not.toHaveFocus();
    expect(pendingFocusFrames.has(firstInnerFrameId)).toBe(true);
    runPendingFrame(firstInnerFrameId);
    expect(currentPasswordInput).toHaveFocus();
    expect(currentPasswordInput).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("새 비밀번호")).toHaveValue("");
    expect(screen.getByLabelText("새 비밀번호 확인")).toHaveValue("");
    expect(screen.getByRole("status")).toHaveTextContent("현재 비밀번호가 올바르지 않습니다.");
    expect(screen.getByRole("status")).toHaveTextContent("AUTH_400_CURRENT_PASSWORD_INVALID");
    expect(screen.getByRole("status")).toHaveTextContent("rid-password-current-1");
    expect(screen.getByRole("status")).not.toHaveTextContent("private current-password detail");
    expect(screen.getByRole("button", { name: "비밀번호 변경" })).not.toBeDisabled();

    fireEvent.change(screen.getByLabelText("새 비밀번호"), {
      target: { value: "password456" },
    });
    fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), {
      target: { value: "password456" },
    });
    runPendingFramesExcept(null);
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));
    await waitFor(() => {
      expect(cancelFrameMock).toHaveBeenCalledWith(firstInnerFrameId);
    });
    const priorPendingOuterFrameId = requestFrameMock.mock.results.at(-1).value;
    expect(pendingFocusFrames.has(priorPendingOuterFrameId)).toBe(true);
    runPendingFramesExcept(priorPendingOuterFrameId);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "비밀번호 변경" })).not.toBeDisabled();
    });

    fireEvent.change(screen.getByLabelText("새 비밀번호"), {
      target: { value: "password456" },
    });
    fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), {
      target: { value: "password456" },
    });
    runPendingFramesExcept(priorPendingOuterFrameId);
    const repeatCancelCallCount = cancelFrameMock.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));
    await waitFor(() => {
      expect(cancelFrameMock.mock.calls.length).toBe(repeatCancelCallCount + 1);
    });
    expect(cancelFrameMock.mock.calls.slice(repeatCancelCallCount)).toEqual([
      [priorPendingOuterFrameId],
    ]);
    expect(pendingFocusFrames.has(priorPendingOuterFrameId)).toBe(false);

    const finalOuterFrameId = requestFrameMock.mock.results.at(-1).value;
    expect(pendingFocusFrames.has(finalOuterFrameId)).toBe(true);
    runPendingFramesExcept(finalOuterFrameId);
    runPendingFrame(finalOuterFrameId);
    const finalInnerFrameId = requestFrameMock.mock.results.at(-1).value;
    expect(finalInnerFrameId).not.toBe(finalOuterFrameId);
    expect(pendingFocusFrames.has(finalInnerFrameId)).toBe(true);

    const unmountCancelCallCount = cancelFrameMock.mock.calls.length;
    rendered.unmount();
    expect(cancelFrameMock.mock.calls.slice(unmountCancelCallCount)).toEqual([
      [finalInnerFrameId],
    ]);
    expect(pendingFocusFrames.has(finalInnerFrameId)).toBe(false);
  });

  test.each([
    {
      label: "422",
      code: "AUTH_422_INVALID_BODY",
      status: 422,
      expectedCopy: "입력값을 확인한 뒤 다시 시도해주세요.",
    },
    {
      label: "503",
      code: "AUTH_503_DB_NOT_READY",
      status: 503,
      expectedCopy: "현재 비밀번호를 변경할 수 없습니다. 잠시 후 다시 시도해주세요.",
    },
    {
      label: "unknown",
      code: "AUTH_500_UNKNOWN",
      status: 500,
      expectedCopy: "비밀번호 변경에 실패했습니다. 다시 시도해주세요.",
    },
  ])("비밀번호 변경 $label 오류는 private detail을 숨기고 safe metadata만 표시한다", async ({
    code,
    status,
    expectedCopy,
  }) => {
    const privateDetail = `private upstream detail ${status}`;
    const passwordChangeError = Object.assign(new Error(privateDetail), {
      code,
      requestId: `rid-password-${status}`,
      status,
    });
    apiJSON
      .mockReset()
      .mockResolvedValueOnce(profileApiResponse)
      .mockRejectedValueOnce(passwordChangeError);

    render(<SettingsView initialDataObj={{}} initialErrorObj={{}} />);
    await screen.findByDisplayValue("데모");
    fillPasswordForm();
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));

    const statusRegion = await screen.findByRole("status");
    expect(statusRegion).toHaveTextContent(expectedCopy);
    expect(statusRegion).toHaveTextContent(code);
    expect(statusRegion).toHaveTextContent(`rid-password-${status}`);
    expect(statusRegion).not.toHaveTextContent(privateDetail);
    expect(document.body).not.toHaveTextContent(privateDetail);
    expect(JSON.stringify(showToastMock.mock.calls)).not.toContain(privateDetail);
    expect(screen.getByRole("button", { name: "비밀번호 변경" })).not.toBeDisabled();
  });

  test("changed true만 인증 상태를 비우고 성공 toast 한 번과 login redirect를 수행한다", async () => {
    const malformedPrivateDetail = "private malformed success detail";
    apiJSON
      .mockReset()
      .mockResolvedValueOnce(profileApiResponse)
      .mockResolvedValueOnce({
        result: { changed: "true" },
        code: "AUTH_200_MALFORMED",
        requestId: "rid-password-malformed-1",
        message: malformedPrivateDetail,
      })
      .mockResolvedValueOnce({
        result: { changed: true, token: "private-token-must-not-be-used" },
      });

    render(<SettingsView initialDataObj={{}} initialErrorObj={{}} />);
    await screen.findByDisplayValue("데모");
    fillPasswordForm();
    const passwordChangeButton = screen.getByRole("button", { name: "비밀번호 변경" });

    fireEvent.click(passwordChangeButton);
    const malformedStatus = await screen.findByRole("status");
    expect(malformedStatus).toHaveTextContent("비밀번호 변경 결과를 확인하지 못했습니다. 다시 시도해주세요.");
    expect(malformedStatus).toHaveTextContent("AUTH_200_MALFORMED");
    expect(malformedStatus).toHaveTextContent("rid-password-malformed-1");
    expect(malformedStatus).not.toHaveTextContent(malformedPrivateDetail);
    expect(setUserMock).not.toHaveBeenCalled();
    expect(showToastMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalledWith("/login");
    await waitFor(() => expect(passwordChangeButton).not.toBeDisabled());

    fireEvent.click(passwordChangeButton);
    await waitFor(() => expect(setUserMock).toHaveBeenCalledWith(null));
    expect(setUserMock).toHaveBeenCalledTimes(1);
    expect(showToastMock).toHaveBeenCalledTimes(1);
    expect(showToastMock).toHaveBeenCalledWith(
      "비밀번호가 변경되었습니다. 다시 로그인해주세요.",
      { type: "success" },
    );
    expect(replaceMock).toHaveBeenCalledWith("/login");
    await waitFor(() => {
      expect(screen.getByLabelText("현재 비밀번호")).toHaveValue("");
      expect(screen.getByLabelText("새 비밀번호")).toHaveValue("");
      expect(screen.getByLabelText("새 비밀번호 확인")).toHaveValue("");
    });
    expect(passwordChangeButton).toBeDisabled();
    expect(JSON.stringify(showToastMock.mock.calls)).not.toContain("private-token-must-not-be-used");
    expect(apiJSON).toHaveBeenCalledTimes(3);
  });
});
