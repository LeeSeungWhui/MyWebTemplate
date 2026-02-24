"use client";
/**
 * 파일명: forgot-password/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 비밀번호 찾기 페이지 클라이언트 뷰
 */

import { useMemo, useRef, useState } from "react";
import EasyObj from "@/app/lib/dataset/EasyObj";
import Button from "@/app/lib/component/Button";
import Input from "@/app/lib/component/Input";
import Link from "next/link";
import { createForgotPasswordFormModel } from "./initData";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordView = () => {
  const formObj = EasyObj(useMemo(() => createForgotPasswordFormModel(), []));
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const emailRef = useRef(null);
  const errorSummaryRef = useRef(null);

  const resetErrors = () => {
    formObj.errors.email = "";
    setFormError("");
  };

  const focusOnError = (ref) => {
    if (!ref || !ref.current) return;
    requestAnimationFrame(() => {
      ref.current?.focus();
    });
  };

  const validate = () => {
    resetErrors();
    const email = String(formObj.email || "").trim().toLowerCase();
    formObj.email = email;
    if (!email || !EMAIL_RE.test(email)) {
      formObj.errors.email = "올바른 이메일 형식을 입력해주세요.";
      setFormError(formObj.errors.email);
      focusOnError(emailRef);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setPending(true);
    setSubmitted(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSubmitted(true);
    } catch {
      setFormError("요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      focusOnError(errorSummaryRef);
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <section className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">비밀번호 찾기</h1>
          <p className="mt-2 text-sm text-gray-600">
            가입한 이메일을 입력하면 재설정 절차 안내를 확인할 수 있습니다.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            입력하신 이메일로 안내를 보냈습니다. 데모 환경에서는 실제 메일이 발송되지 않습니다.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5" noValidate>
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
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <div className="mt-2">
              <Input
                id="forgot-email"
                type="email"
                dataObj={formObj}
                dataKey="email"
                ref={emailRef}
                placeholder="가입한 이메일을 입력해주세요"
                error={formObj.errors.email}
              />
              {formObj.errors.email ? (
                <p className="mt-2 text-sm text-red-600">{formObj.errors.email}</p>
              ) : null}
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={pending}>
            재설정 안내 받기
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            로그인 화면으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ForgotPasswordView;
