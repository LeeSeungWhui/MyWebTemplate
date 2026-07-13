import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ForgotPasswordView from "../app/forgot-password/view.jsx";
import LoginView from "../app/login/view.jsx";
import ResetPasswordView from "../app/reset-password/view.jsx";
import { metadata as resetPasswordMetadata } from "../app/reset-password/page.jsx";
import SignupView from "../app/signup/view.jsx";
import { isPublicPath } from "../app/common/config/publicRoutes.js";

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
    window.history.replaceState({}, "", "/");
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

  it("focuses invalid reset email and announces the sample no-email reset contract", async () => {
    render(<ForgotPasswordView />);

    const emailInput = screen.getByLabelText("이메일");
    expect(emailInput).toHaveAttribute("autocomplete", "email");
    fireEvent.click(screen.getByRole("button", { name: "재설정 요청 확인하기" }));

    await waitFor(() => expect(emailInput).toHaveFocus());
    expect(screen.getAllByText("올바른 이메일 형식을 입력해주세요.")).toHaveLength(2);
    expect(screen.getByRole("alert")).toHaveTextContent("올바른 이메일 형식을 입력해주세요.");
    expect(apiJSONMock).not.toHaveBeenCalled();

    apiJSONMock.mockResolvedValueOnce({ status: true });
    fireEvent.change(emailInput, { target: { value: "demo@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "재설정 요청 확인하기" }));

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
    const submittedMessage =
      "샘플 프로젝트에서는 실제 이메일을 전송하지 않습니다. 비밀번호 재설정 요청만 처리되었습니다.";
    expect(status).toHaveTextContent(submittedMessage);
    expect(showToastMock).toHaveBeenCalledTimes(1);
    expect(showToastMock).toHaveBeenCalledWith(submittedMessage, {
      type: "info",
      duration: 5000,
    });
  });

  it("registers the reset page as a public route", () => {
    expect(isPublicPath("/reset-password")).toBe(true);
    expect(isPublicPath("/reset-password/extra")).toBe(false);
    expect(resetPasswordMetadata.robots).toEqual({ index: false, follow: false });
    expect(resetPasswordMetadata.referrer).toBe("no-referrer");
  });

  it("shows the same safe recovery state when the reset token is missing", async () => {
    window.history.replaceState({}, "", "/reset-password");
    render(<ResetPasswordView />);

    const recoveryAlert = await screen.findByRole("alert");
    expect(recoveryAlert).toHaveTextContent("재설정 링크를 사용할 수 없습니다.");
    await waitFor(() => expect(recoveryAlert).toHaveFocus());
    expect(screen.getByRole("link", { name: "비밀번호 재설정 다시 요청하기" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    expect(apiJSONMock).not.toHaveBeenCalled();
  });

  it("scrubs the token while preserving safe URL parts and focuses reset validation errors", async () => {
    window.history.replaceState(
      {
        __NA: true,
        as: "/reset-password?token=reset-secret&source=email#confirm",
        url: "/reset-password?token=reset-secret&source=email#confirm",
        resetToken: "reset-secret",
        nested: {
          safe: "preserved",
          token: "reset-secret",
          values: ["reset-secret", "safe-value"],
          alternate: "/reset-password?resetToken=other-secret&source=email",
        },
      },
      "",
      "/reset-password?token=reset-secret&source=email#confirm",
    );
    render(<ResetPasswordView />);

    const passwordInput = await screen.findByLabelText("새 비밀번호");
    const passwordConfirmInput = screen.getByLabelText("새 비밀번호 확인");
    expect(window.location.pathname).toBe("/reset-password");
    expect(window.location.search).toBe("?source=email");
    expect(window.location.hash).toBe("#confirm");
    expect(JSON.stringify(window.history.state)).not.toContain("reset-secret");
    expect(JSON.stringify(window.history.state)).not.toContain("other-secret");
    expect(JSON.stringify(window.history.state)).not.toMatch(/token=/i);
    expect(window.history.state).toMatchObject({
      __NA: true,
      as: "/reset-password?source=email#confirm",
      url: "/reset-password?source=email#confirm",
      nested: {
        safe: "preserved",
        values: ["", "safe-value"],
        alternate: "/reset-password?source=email",
      },
    });
    expect(window.history.state.resetToken).toBeUndefined();
    expect(window.history.state.nested.token).toBeUndefined();
    expect(passwordInput).toHaveAttribute("autocomplete", "new-password");
    expect(passwordConfirmInput).toHaveAttribute("autocomplete", "new-password");

    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));
    await waitFor(() => expect(passwordInput).toHaveFocus());
    expect(screen.getByRole("alert")).toHaveTextContent("비밀번호는 8자 이상 입력해주세요.");
    expect(apiJSONMock).not.toHaveBeenCalled();

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(passwordConfirmInput, { target: { value: "password456" } });
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));
    await waitFor(() => expect(passwordConfirmInput).toHaveFocus());
    expect(screen.getByRole("alert")).toHaveTextContent("비밀번호 확인이 일치하지 않습니다.");
  });

  it("consumes an encoded fragment token and scrubs it from URL and history state", async () => {
    const rawToken = "fragment+/secret";
    const encodedToken = encodeURIComponent(rawToken);
    window.history.replaceState(
      {
        __NA: true,
        as: `/reset-password?source=email#token=${encodedToken}`,
        url: `/reset-password?source=email#token=${encodedToken}`,
        nested: { resetToken: rawToken },
      },
      "",
      `/reset-password?source=email#token=${encodedToken}`,
    );
    apiJSONMock.mockResolvedValueOnce({ status: true });
    render(<ResetPasswordView />);

    const passwordInput = await screen.findByLabelText("새 비밀번호");
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), {
      target: { value: "password123" },
    });

    expect(window.location.search).toBe("?source=email");
    expect(window.location.hash).toBe("");
    expect(JSON.stringify(window.history.state)).not.toContain(rawToken);
    expect(JSON.stringify(window.history.state)).not.toContain(encodedToken);
    expect(window.history.state).toMatchObject({
      __NA: true,
      as: "/reset-password?source=email",
      url: "/reset-password?source=email",
      nested: {},
    });

    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));
    await waitFor(() => expect(apiJSONMock).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/api/v1/auth/passwordResetComplete" }),
      {
        method: "POST",
        body: { token: rawToken, newPassword: "password123" },
      },
      { authless: true },
    ));
  });

  it("submits the exact authless reset payload once and replaces the form with login recovery", async () => {
    let resolveComplete;
    apiJSONMock.mockImplementationOnce(() => new Promise((resolve) => {
      resolveComplete = resolve;
    }));
    window.history.replaceState({}, "", "/reset-password?token=reset-secret");
    render(<ResetPasswordView />);

    const passwordInput = await screen.findByLabelText("새 비밀번호");
    const passwordConfirmInput = screen.getByLabelText("새 비밀번호 확인");
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(passwordConfirmInput, { target: { value: "password123" } });
    const submitButton = screen.getByRole("button", { name: "비밀번호 변경" });
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    await waitFor(() => expect(apiJSONMock).toHaveBeenCalledTimes(1));
    expect(apiJSONMock).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/api/v1/auth/passwordResetComplete" }),
      {
        method: "POST",
        body: {
          token: "reset-secret",
          newPassword: "password123",
        },
      },
      { authless: true },
    );
    expect(window.location.search).toBe("");

    await act(async () => {
      resolveComplete({ status: true });
    });
    await waitFor(() => expect(screen.queryByLabelText("새 비밀번호")).not.toBeInTheDocument());
    const successStatus = screen.getByRole("status");
    expect(successStatus).toHaveTextContent("비밀번호가 변경되었습니다.");
    await waitFor(() => expect(successStatus).toHaveFocus());
    expect(screen.getByRole("link", { name: "로그인 화면으로 이동" })).toHaveAttribute("href", "/login");
  });

  it("uses generic recovery for invalid, expired, or used reset tokens", async () => {
    apiJSONMock.mockRejectedValueOnce(Object.assign(new Error("private reset detail"), {
      code: "AUTH_400_RESET_INVALID_OR_EXPIRED",
    }));
    window.history.replaceState({}, "", "/reset-password?token=used-secret");
    render(<ResetPasswordView />);

    fireEvent.change(await screen.findByLabelText("새 비밀번호"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));

    const recoveryAlert = await screen.findByRole("alert");
    expect(recoveryAlert).toHaveTextContent("재설정 링크를 사용할 수 없습니다.");
    expect(recoveryAlert).not.toHaveTextContent("private reset detail");
    await waitFor(() => expect(recoveryAlert).toHaveFocus());
    expect(document.body.textContent).not.toContain("used-secret");
    expect(screen.getByRole("link", { name: "비밀번호 재설정 다시 요청하기" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });

  it("retains the token and form for transient reset failures and focuses a safe retry error", async () => {
    apiJSONMock
      .mockRejectedValueOnce(Object.assign(new Error("private transport detail"), {
        code: "BFF_502_BACKEND_UNAVAILABLE",
        statusCode: 502,
      }))
      .mockResolvedValueOnce({ status: true });
    window.history.replaceState({}, "", "/reset-password?token=retry-secret");
    render(<ResetPasswordView />);

    const passwordInput = await screen.findByLabelText("새 비밀번호");
    const passwordConfirmInput = screen.getByLabelText("새 비밀번호 확인");
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(passwordConfirmInput, { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));

    const retryAlert = await screen.findByRole("alert");
    expect(retryAlert).toHaveTextContent("잠시 후 다시 시도해주세요.");
    expect(retryAlert).not.toHaveTextContent("private transport detail");
    await waitFor(() => expect(retryAlert).toHaveFocus());
    expect(passwordInput).toHaveValue("password123");
    expect(passwordConfirmInput).toHaveValue("password123");
    expect(screen.queryByRole("link", { name: "비밀번호 재설정 다시 요청하기" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));
    await waitFor(() => expect(apiJSONMock).toHaveBeenCalledTimes(2));
    expect(apiJSONMock.mock.calls[1][1].body).toEqual({
      token: "retry-secret",
      newPassword: "password123",
    });
    expect(await screen.findByText("비밀번호가 변경되었습니다.")).toBeInTheDocument();
  });
});
