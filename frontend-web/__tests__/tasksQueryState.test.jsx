import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import TasksView from "@/app/dashboard/tasks/view";
import { apiJSON } from "@/app/lib/runtime/api";

const replaceMock = vi.fn();
const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();

const setSearchParams = (queryObj = {}) => {
  currentSearchParams = new URLSearchParams(queryObj);
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: pushMock }),
  usePathname: () => "/dashboard/tasks",
  useSearchParams: () => currentSearchParams,
}));

vi.mock("@/app/common/store/SharedStore", () => ({
  useGlobalUi: () => ({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
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
  default: ({ title, actions, children }) => (
    <section>
      <h2>{title}</h2>
      {actions}
      {children}
    </section>
  ),
}));

vi.mock("@/app/lib/component/Drawer", () => ({
  __esModule: true,
  default: ({ isOpen, children }) => (isOpen ? <div>{children}</div> : null),
}));

vi.mock("@/app/lib/component/EasyTable", () => ({
  __esModule: true,
  default: ({ dataList = [] }) => (
    <div data-testid="table">
      {dataList.map((row) => <span key={row.id}>{row.title}</span>)}
    </div>
  ),
}));

vi.mock("@/app/lib/component/Input", () => ({
  __esModule: true,
  default: ({ value, dataObj, dataKey, onChange, placeholder }) => {
    const readValue = () => {
      if (value !== undefined) return value;
      if (!dataObj || !dataKey) return "";
      return dataKey.split(".").reduce((current, key) => current?.[key], dataObj) ?? "";
    };
    const handleChange = onChange || (dataObj && dataKey
      ? (event) => {
        const keyList = dataKey.split(".");
        const lastKey = keyList.pop();
        const targetObj = keyList.reduce((current, key) => current[key], dataObj);
        targetObj[lastKey] = event.target.value;
      }
      : undefined);
    return <input value={readValue()} onChange={handleChange} placeholder={placeholder} readOnly={!handleChange} />;
  },
}));

vi.mock("@/app/lib/component/NumberInput", () => ({
  __esModule: true,
  default: ({ value = 0, onChange }) => (
    <input type="number" value={value} onChange={onChange} readOnly={!onChange} />
  ),
}));

vi.mock("@/app/lib/component/Pagination", () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock("@/app/lib/component/Select", () => ({
  __esModule: true,
  default: ({ value, dataObj, dataKey, onChange, dataList = [] }) => {
    const selectedValue = value ?? (dataObj && dataKey ? dataKey.split(".").reduce((current, key) => current?.[key], dataObj) : "") ?? "";
    const handleChange = onChange || (dataObj && dataKey
      ? (event) => {
        const keyList = dataKey.split(".");
        const lastKey = keyList.pop();
        const targetObj = keyList.reduce((current, key) => current[key], dataObj);
        targetObj[lastKey] = event.target.value;
      }
      : undefined);
    return (
    <select value={selectedValue} onChange={handleChange} disabled={!handleChange}>
      {dataList.map((optionItemObj, index) => (
        <option key={`${String(optionItemObj?.value)}-${index}`} value={optionItemObj?.value}>
          {optionItemObj?.text || optionItemObj?.label || String(optionItemObj?.value)}
        </option>
      ))}
    </select>
    );
  },
}));

vi.mock("@/app/lib/component/Textarea", () => ({
  __esModule: true,
  default: ({ value = "", onChange, placeholder }) => (
    <textarea value={value} onChange={onChange} placeholder={placeholder} readOnly={!onChange} />
  ),
}));

describe("tasks query state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSearchParams();
    apiJSON.mockResolvedValue({
      count: 0,
      result: {
        dataTemplateList: [],
        listMetaObj: {
          totalCount: 0,
        },
      },
    });
  });

  test("검색 파라미터를 안전하게 정규화해 목록 API를 호출한다", async () => {
    setSearchParams({
      q: "  백엔드  ",
      status: "RUNNING",
      sort: "AMT_DESC",
      page: "3",
    });

    render(<TasksView initialDataObj={{}} initialErrorObj={{}} />);

    await waitFor(() => {
      expect(apiJSON).toHaveBeenCalled();
    });
    const requestSpec = apiJSON.mock.calls[0][0];
    const requestUrl = typeof requestSpec === "string" ? requestSpec : requestSpec.path;
    const decodedRequestUrl = decodeURIComponent(requestUrl);
    expect(decodedRequestUrl).toContain("q=백엔드");
    expect(requestUrl).toContain("status=running");
    expect(requestUrl).toContain("sort=amt_desc");
    expect(requestUrl).toContain("page=3");
    expect(requestUrl).toContain("size=10");
  });

  test("허용되지 않은 값은 기본값으로 보정한다", async () => {
    setSearchParams({
      q: "first",
      status: "UNKNOWN",
      sort: "DROP_TABLE",
      page: "0",
    });

    render(<TasksView initialDataObj={{}} initialErrorObj={{}} />);

    await waitFor(() => {
      expect(apiJSON).toHaveBeenCalled();
    });
    const requestSpec = apiJSON.mock.calls[0][0];
    const requestUrl = typeof requestSpec === "string" ? requestSpec : requestSpec.path;
    expect(requestUrl).toContain("q=first");
    expect(requestUrl).not.toContain("status=");
    expect(requestUrl).toContain("sort=reg_dt_desc");
    expect(requestUrl).toContain("page=1");
  });

  test("초기 목록 조회는 브라우저 쿼리 문자열을 재기록하지 않는다", async () => {
    setSearchParams({ q: "테스트", status: "ready", sort: "amt_desc", page: "2" });

    render(<TasksView initialDataObj={{}} initialErrorObj={{}} />);

    await waitFor(() => {
      expect(apiJSON).toHaveBeenCalled();
    });
    expect(replaceMock).not.toHaveBeenCalled();
  });

  test("초기 목록 조회는 성공 후에도 반복 호출되지 않는다", async () => {
    setSearchParams({ q: "테스트", status: "ready", sort: "amt_desc", page: "2" });

    render(<TasksView initialDataObj={{}} initialErrorObj={{}} />);

    await waitFor(() => {
      expect(apiJSON).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(apiJSON).toHaveBeenCalledTimes(1);
    }, { timeout: 50 });
  });

  test("유효 상태값이면 상태 필터를 유지한다", async () => {
    setSearchParams({ status: "pending" });

    render(<TasksView initialDataObj={{}} initialErrorObj={{}} />);

    await waitFor(() => {
      expect(apiJSON).toHaveBeenCalled();
    });
    const requestSpec = apiJSON.mock.calls[0][0];
    const requestUrl = typeof requestSpec === "string" ? requestSpec : requestSpec.path;
    expect(requestUrl).toContain("status=pending");
  });

  test("검색 조작 후 query와 목록 API를 같은 조건으로 갱신한다", async () => {
    render(<TasksView initialDataObj={{}} initialErrorObj={{}} />);

    await waitFor(() => expect(apiJSON).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByPlaceholderText("제목/설명 검색"), {
      target: { value: "회귀 검증" },
    });
    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "running" },
    });
    fireEvent.click(screen.getByRole("button", { name: "검색" }));

    await waitFor(() => expect(apiJSON).toHaveBeenCalledTimes(2));
    const requestSpec = apiJSON.mock.calls[1][0];
    const requestUrl = typeof requestSpec === "string" ? requestSpec : requestSpec.path;
    expect(decodeURIComponent(requestUrl)).toContain("q=회귀+검증");
    expect(requestUrl).toContain("status=running");
    expect(replaceMock).toHaveBeenCalledWith(
      "/dashboard/tasks?q=%ED%9A%8C%EA%B7%80+%EA%B2%80%EC%A6%9D&status=running",
      { scroll: false },
    );
  });

  test("신규 업무를 저장한 뒤 첫 페이지 목록을 재조회한다", async () => {
    apiJSON
      .mockResolvedValueOnce({ count: 0, result: { dataTemplateList: [], listMetaObj: { totalCount: 0 } } })
      .mockResolvedValueOnce({ result: { id: 101 } })
      .mockResolvedValueOnce({ count: 1, result: { dataTemplateList: [{ id: 101, title: "신규 업무" }], listMetaObj: { totalCount: 1 } } });

    render(<TasksView initialDataObj={{}} initialErrorObj={{}} />);
    await waitFor(() => expect(apiJSON).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "업무 등록" }));
    fireEvent.change(await screen.findByPlaceholderText("업무 제목을 입력해주세요"), {
      target: { value: "신규 업무" },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(apiJSON).toHaveBeenCalledTimes(3));
    expect(apiJSON.mock.calls[1][1]).toMatchObject({
      method: "POST",
      body: expect.objectContaining({ title: "신규 업무", status: "ready" }),
    });
    expect(apiJSON.mock.calls[1][0]).toMatchObject({ path: "/api/v1/dashboard" });
    const readbackSpec = apiJSON.mock.calls[2][0];
    const readbackUrl = typeof readbackSpec === "string" ? readbackSpec : readbackSpec.path;
    expect(readbackUrl).toContain("/api/v1/dashboard?");
    expect(readbackUrl).toContain("page=1");
    expect(await screen.findByText("신규 업무")).toBeTruthy();
  });
});
