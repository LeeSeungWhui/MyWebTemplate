/**
 * 파일명: __tests__/settingsTabQuery.test.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-03
 * 설명: 설정 페이지 탭-쿼리 동기화 동작 테스트
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import SettingsView from "@/app/dashboard/settings/view";
import { apiJSON } from "@/app/lib/runtime/api";

const replaceMock = vi.fn();
let currentSearchParams = new URLSearchParams();

const setSearchParams = (queryObj = {}) => {
  currentSearchParams = new URLSearchParams(queryObj);
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/dashboard/settings",
  useSearchParams: () => currentSearchParams,
}));

vi.mock("@/app/common/store/SharedStore", () => ({
  useGlobalUi: () => ({
    showToast: vi.fn(),
  }),
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
  default: ({ children, onClick, className, disabled }) => (
    <button type="button" onClick={onClick} className={className} disabled={disabled}>
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
  default: ({ value, dataObj, dataKey, onChange, readOnly, placeholder }) => {
    const inputValue = value ?? (dataObj && dataKey ? dataObj[dataKey] ?? "" : "");
    const handleChange = onChange || (dataObj && dataKey
      ? (event) => {
        dataObj[dataKey] = event.target.value;
      }
      : undefined);
    return (
      <input
        value={inputValue}
        onChange={handleChange}
        readOnly={Boolean(readOnly || !handleChange)}
        placeholder={placeholder}
      />
    );
  },
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
  const Tab = ({ tabIndex = 0, onValueChange, children }) => (
    <div>
      <button type="button" onClick={() => onValueChange?.(0)}>
        profile-tab
      </button>
      <button type="button" onClick={() => onValueChange?.(1)}>
        system-tab
      </button>
      <div data-testid="active-tab">{String(tabIndex)}</div>
      {children}
    </div>
  );

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
    setSearchParams();
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

    fireEvent.click(screen.getByRole("button", { name: "system-tab" }));
    expect(replaceMock).toHaveBeenCalledWith("/dashboard/settings?tab=system", {
      scroll: false,
    });

    fireEvent.click(screen.getByRole("button", { name: "profile-tab" }));
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
    const systemSaveButton = screen.getAllByRole("button", { name: "저장" })[1];

    fireEvent.click(systemSaveButton);
    expect(await screen.findByRole("alert")).toHaveTextContent("SYSTEM_503_UNAVAILABLE");

    fireEvent.click(systemSaveButton);
    await waitFor(() => expect(apiJSON).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });
});
