import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ForgotPasswordView from "../app/forgot-password/view.jsx";
import LoginView from "../app/login/view.jsx";
import SignupView from "../app/signup/view.jsx";

const apiJSONMock = vi.hoisted(() => vi.fn());
const reloadMock = vi.hoisted(() => vi.fn());
const showToastMock = vi.hoisted(() => vi.fn());

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>,
}));

vi.mock("@/app/lib/runtime/api", () => ({
  apiJSON: apiJSONMock,
}));

vi.mock("@/app/lib/runtime/pageData", () => ({
  normalizePageConfig: (pageConfig) => pageConfig,
}));

vi.mock("@/app/lib/hooks/usePageData", () => ({
  default: () => ({
    dataObj: { session: null },
    reload: reloadMock,
  }),
}));

vi.mock("@/app/common/store/SharedStore", () => ({
  useGlobalUi: () => ({ showToast: showToastMock }),
}));

describe("auth views", () => {
  beforeEach(() => {
    apiJSONMock.mockReset();
    reloadMock.mockReset();
    showToastMock.mockReset();
    vi.stubGlobal("requestAnimationFrame", (callback) => setTimeout(callback, 0));
    vi.stubGlobal("cancelAnimationFrame", (frameId) => clearTimeout(frameId));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders login controls and focuses the first invalid field with summary and field errors", async () => {
    render(<LoginView initialDataObj={{}} initialErrorObj={{}} />);

    expect(screen.getByLabelText("이메일")).toHaveAttribute("autocomplete", "username");
    expect(screen.getByLabelText("비밀번호")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("checkbox", { name: "로그인 상태 유지" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "비밀번호 찾기" })).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByRole("link", { name: "회원가입" })).toHaveAttribute("href", "/signup");

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    const emailInput = screen.getByLabelText("이메일");
    await waitFor(() => expect(emailInput).toHaveFocus());
    expect(screen.getAllByText("이메일을 입력해주세요")).toHaveLength(2);
    expect(screen.getByRole("alert")).toHaveTextContent("이메일을 입력해주세요");
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput.getAttribute("aria-describedby")).toBeTruthy();
    expect(document.getElementById(emailInput.getAttribute("aria-describedby"))).toHaveTextContent("이메일을 입력해주세요");
    expect(apiJSONMock).not.toHaveBeenCalled();
  });

  it("associates signup errors and exposes the expected autocomplete contract", async () => {
    render(<SignupView />);

    expect(screen.getByLabelText("이름")).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText("이메일")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("비밀번호")).toHaveAttribute("autocomplete", "new-password");
    expect(screen.getByLabelText("비밀번호 확인")).toHaveAttribute("autocomplete", "new-password");

    fireEvent.click(screen.getByRole("button", { name: "회원가입" }));

    const nameInput = screen.getByLabelText("이름");
    const termsCheckbox = screen.getByRole("checkbox", { name: "이용약관에 동의합니다." });
    await waitFor(() => expect(nameInput).toHaveFocus());
    expect(screen.getAllByText("이름은 2자 이상 입력해주세요.")).toHaveLength(2);
    expect(screen.getByRole("alert")).toHaveTextContent("이름은 2자 이상 입력해주세요.");
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(termsCheckbox).toHaveAttribute("aria-invalid", "true");
    expect(termsCheckbox).toHaveAttribute("aria-describedby", "signup-agree-terms-error");
    expect(document.getElementById("signup-agree-terms-error")).toHaveTextContent("약관 동의는 필수입니다.");
  });

  it("submits the normalized signup payload through the mocked API boundary", async () => {
    apiJSONMock.mockRejectedValueOnce(Object.assign(new Error("safe duplicate"), {
      code: "AUTH_409_USER_EXISTS",
    }));
    render(<SignupView />);

    fireEvent.change(screen.getByLabelText("이름"), { target: { value: "홍길동" } });
    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "DEMO@EXAMPLE.COM" } });
    fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText("비밀번호 확인"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "이용약관에 동의합니다." }));
    fireEvent.click(screen.getByRole("button", { name: "회원가입" }));

    await waitFor(() => expect(apiJSONMock).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/api/v1/auth/signup" }),
      {
        method: "POST",
        body: {
          name: "홍길동",
          email: "demo@example.com",
          password: "password123",
        },
      },
      { authless: true },
    ));
  });

  it("focuses invalid reset email and announces a successful mocked reset", async () => {
    render(<ForgotPasswordView />);

    const emailInput = screen.getByLabelText("이메일");
    expect(emailInput).toHaveAttribute("autocomplete", "email");
    fireEvent.click(screen.getByRole("button", { name: "재설정 안내 받기" }));

    await waitFor(() => expect(emailInput).toHaveFocus());
    expect(screen.getAllByText("올바른 이메일 형식을 입력해주세요.")).toHaveLength(2);
    expect(screen.getByRole("alert")).toHaveTextContent("올바른 이메일 형식을 입력해주세요.");
    expect(apiJSONMock).not.toHaveBeenCalled();

    apiJSONMock.mockResolvedValueOnce({ status: true });
    fireEvent.change(emailInput, { target: { value: "demo@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "재설정 안내 받기" }));

    await waitFor(() => expect(apiJSONMock).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/api/v1/auth/passwordResetRequest" }),
      {
        method: "POST",
        body: { email: "demo@example.com" },
      },
      { authless: true },
    ));
    const status = await screen.findByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("입력하신 이메일로 안내를 보냈습니다.");
  });
});
