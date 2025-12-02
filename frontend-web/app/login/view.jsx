"use client";
/**
 * Login page client view
 */

import { useEffect, useState, useMemo } from "react";
import EasyObj from "@/app/lib/dataset/EasyObj";
import Button from "@/app/lib/component/Button";
import Input from "@/app/lib/component/Input";
import Checkbox from "@/app/lib/component/Checkbox";
import { apiRequest } from "@/app/lib/runtime/api";
import useSwr from "@/app/lib/hooks/useSwr";
import { SESSION_PATH, createLoginFormModel } from "./initData";
import Link from "next/link";

const sanitizeRedirect = (candidate) => {
  if (!candidate || typeof candidate !== "string") return null;
  if (!candidate.startsWith("/")) return null;
  if (candidate.startsWith("//")) return null;
  if (/^https?:/i.test(candidate)) return null;
  return candidate;
};

const Client = ({ mode, init, nextHint }) => {
  const loginObj = EasyObj(useMemo(() => createLoginFormModel(), []));
  const [pending, setPending] = useState(false);
  const { data: sessionData, mutate } = useSwr("session", SESSION_PATH, {
    swr: { fallbackData: init, revalidateOnFocus: true },
  });
  const isAuthed = !!(
    sessionData &&
    sessionData.result &&
    sessionData.result.username
  );

  const resetErrors = () => {
    loginObj.errors.email = "";
    loginObj.errors.password = "";
  };

  const validateForm = () => {
    resetErrors();
    let isValid = true;

    const email = String(loginObj.email || "").trim();
    const password = String(loginObj.password || "");

    loginObj.email = email;

    if (!email) {
      loginObj.errors.email = "이메일을 입력해주세요";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      loginObj.errors.email = "올바른 이메일 형식이 아닙니다";
      isValid = false;
    }

    if (!password) {
      loginObj.errors.password = "비밀번호를 입력해주세요";
      isValid = false;
    }

    return isValid;
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
      const response = await apiRequest("/api/v1/auth/login", {
        method: "POST",
        body: payload,
      });
      if (response && response.ok) {
        const nextData = await mutate?.();
        const authed = !!(
          nextData &&
          nextData.result &&
          nextData.result.username
        );
        const target =
          sanitizeRedirect(nextHint) || (authed ? "/dashboard" : "/");
        window.location.assign(target);
        return;
      }
      const body = await response?.json?.().catch(() => ({}));
      loginObj.errors.password = body?.message || "로그인에 실패했습니다";
    } catch (error) {
      console.error(error);
      loginObj.errors.password = "로그인 중 오류가 발생했습니다";
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
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="flex w-full max-w-5xl mx-4 shadow-xl rounded-2xl overflow-hidden bg-white">
        <aside className="hidden lg:flex w-2/5 bg-gradient-to-br from-blue-600 to-blue-500 text-white flex-col justify-center items-center p-12 space-y-4">
          <h1 className="text-3xl font-bold">웹페이지 템플릿</h1>
          <p className="text-sm text-blue-100 text-center max-w-xs">
            샘플 로그인 화면
          </p>
          <ul className="text-sm text-blue-50 space-y-1 text-left w-full max-w-xs list-disc list-inside">
            <li>로그인시 샘플 대쉬보드 페이지</li>
            <li>/component에서 컴포넌트 목록 조회</li>
            <li>demo@demo.demo / password123</li>
          </ul>
        </aside>

        <section className="w-full lg:w-3/5 p-10 md:p-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              로그인
            </h2>
            <p className="text-sm text-gray-600">
              계정 정보로 로그인하여 시작하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                  dataObj={loginObj}
                  dataKey="password"
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

            <div className="flex items-center justify-between">
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
          </form>
        </section>
      </div>
    </main>
  );
};

export default Client;
