"use client";
/**
 * 파일명: app/login/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 로그인 페이지 클라이언트 뷰
 */

import { useEffect, useMemo, useRef } from "react";
import EasyObj from "@/app/lib/dataset/EasyObj";
import Button from "@/app/lib/component/Button";
import Input from "@/app/lib/component/Input";
import Checkbox from "@/app/lib/component/Checkbox";
import { apiJSON } from "@/app/lib/runtime/api";
import useSwr from "@/app/lib/hooks/useSwr";
import { SESSION_PATH, createLoginFormModel } from "./initData";
import Link from "next/link";
import { useGlobalUi } from "@/app/common/store/SharedStore";
import LANG_KO from "./lang.ko";

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;

/**
 * @description Client export를 노출한다.
 */
const Client = ({ mode, init, nextHint, authReason }) => {
  const sanitizeRedirect = (candidate) => {
    if (!candidate || typeof candidate !== "string") return null;
    if (!candidate.startsWith("/")) return null;
    if (candidate.startsWith("//")) return null;
    if (/^https?:/i.test(candidate)) return null;
    return candidate;
  };
  const loginObj = EasyObj(useMemo(() => createLoginFormModel(), []));
  const ui = EasyObj(
    useMemo(
      () => ({
        pending: false,
        formError: "",
      }),
      [],
    ),
  );
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
      : LANG_KO.view.toast.sessionExpired;
    const metaParts = [];
    if (authReason?.code) metaParts.push(`code: ${authReason.code}`);
    if (authReason?.requestId) metaParts.push(`requestId: ${authReason.requestId}`);
    const metaText = metaParts.length ? ` (${metaParts.join(", ")})` : "";
    showToast(`${message}${metaText}`, { type: "error", duration: 5000 });
  }, [authReason, showToast, LANG_KO.view.toast.sessionExpired]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentUrl = new URL(window.location.href);
    const signupStatus = currentUrl.searchParams.get("signup");
    if (signupStatus !== "done") return;
    showToast(LANG_KO.view.toast.signupDone, {
      type: "success",
      duration: 4000,
    });
    currentUrl.searchParams.delete("signup");
    const nextSearch = currentUrl.searchParams.toString();
    const nextUrl = nextSearch
      ? `${currentUrl.pathname}?${nextSearch}`
      : currentUrl.pathname;
    window.history.replaceState({}, "", nextUrl);
  }, [showToast, LANG_KO.view.toast.signupDone]);

  const resetErrors = () => {
    loginObj.errors.email = "";
    loginObj.errors.password = "";
    ui.formError = "";
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
      return { message: LANG_KO.view.error.tooManyAttempts };
    }
    if (code === "AUTH_422_INVALID_INPUT") {
      return { message: LANG_KO.view.error.invalidInput };
    }
    if (code === "AUTH_401_INVALID") {
      return {
        message: LANG_KO.view.error.invalidCredential,
        field: "password",
      };
    }
    if (error?.statusCode === 401) {
      return { message: LANG_KO.view.toast.sessionExpired };
    }
    if (error?.message) {
      return { message: error.message };
    }
    return { message: LANG_KO.view.error.loginFailed };
  };

  const validateForm = () => {
    resetErrors();
    const issues = [];

    const email = String(loginObj.email || "").trim();
    const password = String(loginObj.password || "");

    loginObj.email = email;

    if (!email) {
      loginObj.errors.email = LANG_KO.view.validation.emailRequired;
      issues.push({ ref: emailRef, summary: loginObj.errors.email });
    } else if (email.length < MIN_USERNAME_LENGTH) {
      loginObj.errors.email = LANG_KO.view.validation.emailMinLength;
      issues.push({ ref: emailRef, summary: loginObj.errors.email });
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      loginObj.errors.email = LANG_KO.view.validation.emailInvalid;
      issues.push({ ref: emailRef, summary: loginObj.errors.email });
    }

    if (!password) {
      loginObj.errors.password = LANG_KO.view.validation.passwordRequired;
      issues.push({ ref: passwordRef, summary: loginObj.errors.password });
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      loginObj.errors.password = LANG_KO.view.validation.passwordMinLength;
      issues.push({ ref: passwordRef, summary: loginObj.errors.password });
    }

    if (issues.length) {
      ui.formError = issues[0].summary || LANG_KO.view.error.invalidInput;
      focusOnError(issues[0].ref);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    ui.pending = true;
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
      if (process.env.NODE_ENV !== "production") {
        console.error("login submit failed", error);
      }
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
      ui.formError = message;
    } finally {
      ui.pending = false;
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
          <h1 className="text-3xl font-bold">{LANG_KO.view.side.title}</h1>
          <p className="max-w-xs text-center text-sm text-white/80">
            {LANG_KO.view.side.subtitle}
          </p>
          <ul className="w-full max-w-xs list-inside list-disc space-y-1 text-left text-sm text-white/90">
            <li>{LANG_KO.view.side.pointList[0]}</li>
            <li>{LANG_KO.view.side.pointList[1]}</li>
            <li>{LANG_KO.view.side.pointList[2]}</li>
          </ul>
        </aside>

        <section className="w-full p-6 sm:p-10 md:p-16 lg:w-3/5">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              {LANG_KO.view.form.title}
            </h2>
            <p className="text-sm text-gray-600">
              {LANG_KO.view.form.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {ui.formError ? (
              <div
                ref={errorSummaryRef}
                tabIndex={-1}
                role="alert"
                aria-live="assertive"
                className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {ui.formError}
              </div>
            ) : null}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700"
              >
                {LANG_KO.view.form.emailLabel}
              </label>
              <div className="mt-2">
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  dataObj={loginObj}
                  dataKey="email"
                  ref={emailRef}
                  placeholder={LANG_KO.view.form.emailPlaceholder}
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
                {LANG_KO.view.form.passwordLabel}
              </label>
              <div className="mt-2">
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  togglePassword
                  dataObj={loginObj}
                  dataKey="password"
                  ref={passwordRef}
                  placeholder={LANG_KO.view.form.passwordPlaceholder}
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
                label={LANG_KO.view.form.rememberMeLabel}
              />
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {LANG_KO.view.form.forgotPasswordLabel}
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={ui.pending}
            >
              {LANG_KO.view.form.submitLabel}
            </Button>

            <div className="text-center text-sm text-gray-600">
              {`${LANG_KO.view.form.signupGuidePrefix} `}{" "}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {LANG_KO.view.form.signupLinkLabel}
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Client;
