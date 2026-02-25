"use client";
/**
 * 파일명: forgot-password/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 비밀번호 찾기 페이지 클라이언트 뷰
 */

import { useMemo, useRef } from "react";
import EasyObj from "@/app/lib/dataset/EasyObj";
import Button from "@/app/lib/component/Button";
import Input from "@/app/lib/component/Input";
import Link from "next/link";
import { createForgotPasswordFormModel } from "./initData";
import LANG_KO from "./lang.ko";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordView = () => {
  const viewText = LANG_KO.view;
  const formObj = EasyObj(useMemo(() => createForgotPasswordFormModel(), []));
  const ui = EasyObj(
    useMemo(
      () => ({
        pending: false,
        submitted: false,
        formError: "",
      }),
      [],
    ),
  );
  const emailRef = useRef(null);
  const errorSummaryRef = useRef(null);

  const resetErrors = () => {
    formObj.errors.email = "";
    ui.formError = "";
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
      formObj.errors.email = viewText.validation.emailInvalid;
      ui.formError = formObj.errors.email;
      focusOnError(emailRef);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    ui.pending = true;
    ui.submitted = false;
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      ui.submitted = true;
    } catch {
      ui.formError = viewText.error.requestFailed;
      focusOnError(errorSummaryRef);
    } finally {
      ui.pending = false;
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <section className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">{viewText.form.title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {viewText.form.subtitle}
          </p>
        </div>

        {ui.submitted ? (
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {viewText.form.submittedMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5" noValidate>
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
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700">
              {viewText.form.emailLabel}
            </label>
            <div className="mt-2">
              <Input
                id="forgot-email"
                type="email"
                dataObj={formObj}
                dataKey="email"
                ref={emailRef}
                placeholder={viewText.form.emailPlaceholder}
                error={formObj.errors.email}
              />
              {formObj.errors.email ? (
                <p className="mt-2 text-sm text-red-600">{formObj.errors.email}</p>
              ) : null}
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={ui.pending}>
            {viewText.form.submitLabel}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            {viewText.form.backToLoginLabel}
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ForgotPasswordView;
