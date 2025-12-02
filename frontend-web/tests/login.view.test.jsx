import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

vi.mock("@/app/lib/hooks/useSwr", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock("@/app/lib/runtime/api", () => ({
  __esModule: true,
  apiRequest: vi.fn(),
}));

import Client from "@/app/login/view";
import useSwr from "@/app/lib/hooks/useSwr";
import { apiRequest } from "@/app/lib/runtime/api";

const mutateMock = vi.fn();

const ensureRaf = () => {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  }
};

const renderLogin = (props = {}) => {
  useSwr.mockReturnValue({ data: { result: null }, mutate: mutateMock });
  return render(<Client mode="CSR" init={null} nextHint={null} {...props} />);
};

beforeEach(() => {
  vi.clearAllMocks();
  mutateMock.mockReset();
  ensureRaf();
});

test("폼 유효성 검사 후 첫 번째 에러 필드에 포커스한다", async () => {
  renderLogin();

  fireEvent.click(screen.getByRole("button", { name: "로그인" }));

  await waitFor(() => {
    expect(screen.getAllByText("이메일을 입력해주세요").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("비밀번호를 입력해주세요").length
    ).toBeGreaterThan(0);
  });

  await waitFor(() => {
    expect(document.activeElement?.id).toBe("login-email");
  });
});

test("백엔드 인증 오류를 비밀번호 필드와 에러 요약으로 노출한다", async () => {
  useSwr.mockReturnValue({ data: { result: null }, mutate: mutateMock });
  apiRequest.mockResolvedValue({
    ok: false,
    status: 401,
    headers: { get: vi.fn() },
    json: vi.fn().mockResolvedValue({
      status: false,
      code: "AUTH_401_INVALID",
      message: "invalid credentials",
    }),
  });

  renderLogin();

  fireEvent.change(screen.getByLabelText("이메일"), {
    target: { value: "demo@demo.demo" },
  });
  fireEvent.change(screen.getByLabelText("비밀번호"), {
    target: { value: "password123" },
  });
  fireEvent.click(screen.getByRole("button", { name: "로그인" }));

  await waitFor(() => {
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
  expect(screen.getByRole("alert").textContent).toContain("이메일 또는 비밀번호");
  expect(
    screen.getAllByText(/이메일 또는 비밀번호가 올바르지 않아/i).length
  ).toBeGreaterThan(0);
  await waitFor(() => {
    expect(document.activeElement?.id).toBe("login-password");
  });
});

test("로그인 성공 시 next가 없으면 대시보드로 이동한다", async () => {
  useSwr.mockReturnValue({ data: { result: null }, mutate: mutateMock });
  mutateMock.mockResolvedValue({ result: { username: "demo" } });
  apiRequest.mockResolvedValue({ ok: true });

  const assignMock = vi.fn();
  const originalLocation = globalThis.location;
  vi.stubGlobal("location", { ...originalLocation, assign: assignMock, replace: vi.fn() });

  renderLogin();

  fireEvent.change(screen.getByLabelText("이메일"), {
    target: { value: "demo@demo.demo" },
  });
  fireEvent.change(screen.getByLabelText("비밀번호"), {
    target: { value: "password123" },
  });
  fireEvent.click(screen.getByRole("button", { name: "로그인" }));

  await waitFor(() => {
    expect(assignMock).toHaveBeenCalledWith("/dashboard");
  });

  vi.unstubAllGlobals();
});
