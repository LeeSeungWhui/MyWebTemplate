"use client";
/**
 * 파일명: app/login/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 로그인 페이지 클라이언트 뷰
 */

import { useEffect, useMemo, useRef, useState } from "react";
import EasyObj from "@/app/lib/dataset/EasyObj";
import Button from "@/app/lib/component/Button";
import Input from "@/app/lib/component/Input";
import Checkbox from "@/app/lib/component/Checkbox";
import { apiJSON } from "@/app/lib/runtime/api";
import useSwr from "@/app/lib/hooks/useSwr";
import { SESSION_PATH, createLoginFormModel } from "./initData";
import Link from "next/link";
import { useGlobalUi } from "@/app/common/store/SharedStore";

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;

const sanitizeRedirect = (candidate) => {
  if (!candidate || typeof candidate !== "string") return null;
  if (!candidate.startsWith("/")) return null;
  if (candidate.startsWith("//")) return null;
  if (/^https?:/i.test(candidate)) return null;
  return candidate;
};

const Client = ({ mode, init, nextHint, authReason }) => {
  const loginObj = EasyObj(useMemo(() => createLoginFormModel(), []));
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState("");
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const errorSummaryRef = useRef(null);
  const { showToast } = useGlobalUi();
  const hasInitSession = !!(init && init.result && init.result.username);
  const sessionKey = hasInitSession ? "session" : null;
  const { data: sessionData, mutate } = useSwr(sessionKey, SESSION_PATH, {
    swr: { fallbackData: init, revalidateOnFocus: true },
  });
  const isAuthed = !!(
    sessionData &&
    sessionData.result &&
    sessionData.result.username
  );

  useEffect(() => {
    if (!authReason) return;
    const message = authReason?.message
      ? String(authReason.message)
      : "세션이 만료되었습니다. 다시 로그인해 주세요.";
    const metaParts = [];
    if (authReason?.code) metaParts.push(`code: ${authReason.code}`);
    if (authReason?.requestId) metaParts.push(`requestId: ${authReason.requestId}`);
    const metaText = metaParts.length ? ` (${metaParts.join(", ")})` : "";
    showToast(`${message}${metaText}`, { type: "error", duration: 5000 });
  }, [authReason, showToast]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentUrl = new URL(window.location.href);
    const signupStatus = currentUrl.searchParams.get("signup");
    if (signupStatus !== "done") return;
    showToast("회원가입이 완료되었습니다. 로그인해 주세요.", {
      type: "success",
      duration: 4000,
    });
    currentUrl.searchParams.delete("signup");
    const nextSearch = currentUrl.searchParams.toString();
    const nextUrl = nextSearch
      ? `${currentUrl.pathname}?${nextSearch}`
      : currentUrl.pathname;
    window.history.replaceState({}, "", nextUrl);
  }, [showToast]);

  const resetErrors = () => {
    loginObj.errors.email = "";
    loginObj.errors.password = "";
    setFormError("");
  };

  const focusOnError = (ref) => {
    if (!ref || !ref.current) return;
    requestAnimationFrame(() => {
      ref.current?.focus();
    });
  };

  const resolveBackendError = (error) => {
    const code = error?.code;
    if (code === "AUTH_429_RATE_LIMIT") {
      return { message: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요." };
    }
    if (code === "AUTH_401_INVALID") {
      return {
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        field: "password",
      };
    }
    if (error?.statusCode === 401) {
      return { message: "세션이 만료되었습니다. 다시 로그인해 주세요." };
    }
    if (error?.message) {
      return { message: error.message };
    }
    return { message: "로그인에 실패했습니다." };
  };

  const validateForm = () => {
    resetErrors();
    const issues = [];

    const email = String(loginObj.email || "").trim();
    const password = String(loginObj.password || "");

    loginObj.email = email;

    if (!email) {
      loginObj.errors.email = "이메일을 입력해주세요";
      issues.push({ ref: emailRef, summary: loginObj.errors.email });
    } else if (email.length < MIN_USERNAME_LENGTH) {
      loginObj.errors.email = "아이디는 최소 3자 이상 입력해주세요";
      issues.push({ ref: emailRef, summary: loginObj.errors.email });
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      loginObj.errors.email = "올바른 이메일 형식이 아닙니다";
      issues.push({ ref: emailRef, summary: loginObj.errors.email });
    }

    if (!password) {
      loginObj.errors.password = "비밀번호를 입력해주세요";
      issues.push({ ref: passwordRef, summary: loginObj.errors.password });
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      loginObj.errors.password = "비밀번호는 최소 8자 이상이어야 합니다";
      issues.push({ ref: passwordRef, summary: loginObj.errors.password });
    }

    if (issues.length) {
      setFormError(issues[0].summary || "입력값을 확인해 주세요.");
      focusOnError(issues[0].ref);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setPending(true);
    try {
      const payload = {
        username: loginObj.email,
        password: loginObj.password,
        rememberMe: !!loginObj.rememberMe,
      };
      await apiJSON("/api/v1/auth/login", {
        method: "POST",
        body: payload,
      });
      await mutate?.();
      const target = sanitizeRedirect(nextHint) || "/dashboard";
      window.location.assign(target);
      return;
    } catch (error) {
      console.error(error);
      const { message, field } = resolveBackendError(error);
      if (field === "email") {
        loginObj.errors.email = message;
        focusOnError(emailRef);
      } else if (field === "password") {
        loginObj.errors.password = message;
        focusOnError(passwordRef);
      } else {
        focusOnError(errorSummaryRef);
      }
      setFormError(message);
    } finally {
      setPending(false);
    }
  };

  if (isAuthed) {
    if (typeof window !== "undefined") {
      const target = sanitizeRedirect(nextHint) || "/dashboard";
      window.location.replace(target);
    }
    return null;
  }

  const emailErrorId = loginObj.errors.email ? "login-email-error" : undefined;
  const passwordErrorId = loginObj.errors.password
    ? "login-password-error"
    : undefined;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="flex w-full max-w-5xl mx-4 shadow-xl rounded-2xl overflow-hidden bg-white">
        <aside className="hidden w-2/5 flex-col items-center justify-center space-y-4 bg-gradient-to-br from-[#1e3a5f] to-[#312e81] p-12 text-white lg:flex">
          <h1 className="text-3xl font-bold">웹페이지 템플릿</h1>
          <p className="max-w-xs text-center text-sm text-white/80">
            샘플 로그인 화면
          </p>
          <ul className="w-full max-w-xs list-inside list-disc space-y-1 text-left text-sm text-white/90">
            <li>로그인 시 샘플 대시보드 페이지로 이동</li>
            <li>/component에서 컴포넌트 목록 조회</li>
            <li>demo@demo.demo / password123</li>
          </ul>
        </aside>

        <section className="w-full p-6 sm:p-10 md:p-16 lg:w-3/5">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              로그인
            </h2>
            <p className="text-sm text-gray-600">
              계정 정보로 로그인하여 시작하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {formError ? (
              <div
                ref={errorSummaryRef}
                tabIndex={-1}
                role="alert"
                aria-live="assertive"
                className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {formError}
              </div>
            ) : null}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일
              </label>
              <div className="mt-2">
                <Input
                  id="login-email"
                  type="email"
                  dataObj={loginObj}
                  dataKey="email"
                  ref={emailRef}
                  placeholder="이메일을 입력하세요"
                  aria-describedby={emailErrorId}
                  error={loginObj.errors.email}
                />
                {loginObj.errors.email && (
                  <p id={emailErrorId} className="mt-2 text-sm text-red-600">
                    {loginObj.errors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <div className="mt-2">
                <Input
                  id="login-password"
                  type="password"
                  togglePassword
                  dataObj={loginObj}
                  dataKey="password"
                  ref={passwordRef}
                  placeholder="비밀번호를 입력하세요"
                  aria-describedby={passwordErrorId}
                  error={loginObj.errors.password}
                />
                {loginObj.errors.password && (
                  <p id={passwordErrorId} className="mt-2 text-sm text-red-600">
                    {loginObj.errors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Checkbox
                dataObj={loginObj}
                dataKey="rememberMe"
                label="로그인 상태 유지"
              />
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                비밀번호 찾기
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={pending}
            >
              로그인
            </Button>

            <div className="text-center text-sm text-gray-600">
              계정이 없으신가요?{" "}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                회원가입
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Client;
