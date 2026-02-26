"use client";
/**
 * 파일명: signup/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 회원가입 페이지 클라이언트 뷰
 */

import { useMemo, useRef } from "react";
import EasyObj from "@/app/lib/dataset/EasyObj";
import Button from "@/app/lib/component/Button";
import Checkbox from "@/app/lib/component/Checkbox";
import Input from "@/app/lib/component/Input";
import Link from "next/link";
import { apiJSON } from "@/app/lib/runtime/api";
import { useGlobalUi } from "@/app/common/store/SharedStore";
import { SIGNUP_PATH, createSignupFormModel } from "./initData";
import LANG_KO from "./lang.ko";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @description SignupView export를 노출한다.
 */
const SignupView = () => {
  const signupObj = EasyObj(useMemo(() => createSignupFormModel(), []));
  const ui = EasyObj(
    useMemo(
      () => ({
        pending: false,
        formError: "",
      }),
      [],
    ),
  );
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordConfirmRef = useRef(null);
  const agreeTermsRef = useRef(null);
  const errorSummaryRef = useRef(null);
  const { showToast } = useGlobalUi();

  const resetErrors = () => {
    signupObj.errors.name = "";
    signupObj.errors.email = "";
    signupObj.errors.password = "";
    signupObj.errors.passwordConfirm = "";
    signupObj.errors.agreeTerms = "";
    ui.formError = "";
  };

  const focusOnError = (ref) => {
    if (!ref || !ref.current) return;
    requestAnimationFrame(() => {
      ref.current?.focus();
    });
  };

  const validateForm = () => {
    resetErrors();
    const issues = [];
    const name = String(signupObj.name || "").trim();
    const email = String(signupObj.email || "").trim().toLowerCase();
    const password = String(signupObj.password || "");
    const passwordConfirm = String(signupObj.passwordConfirm || "");
    const agreeTerms = !!signupObj.agreeTerms;

    signupObj.name = name;
    signupObj.email = email;

    if (!name || name.length < 2) {
      signupObj.errors.name = LANG_KO.view.validation.nameMinLength;
      issues.push({ ref: nameRef, message: signupObj.errors.name });
    }
    if (!email || !EMAIL_RE.test(email)) {
      signupObj.errors.email = LANG_KO.view.validation.emailInvalid;
      issues.push({ ref: emailRef, message: signupObj.errors.email });
    }
    if (!password || password.length < 8) {
      signupObj.errors.password = LANG_KO.view.validation.passwordMinLength;
      issues.push({ ref: passwordRef, message: signupObj.errors.password });
    }
    if (passwordConfirm !== password) {
      signupObj.errors.passwordConfirm = LANG_KO.view.validation.passwordConfirmMismatch;
      issues.push({
        ref: passwordConfirmRef,
        message: signupObj.errors.passwordConfirm,
      });
    }
    if (!agreeTerms) {
      signupObj.errors.agreeTerms = LANG_KO.view.validation.agreeTermsRequired;
      issues.push({ ref: agreeTermsRef, message: signupObj.errors.agreeTerms });
    }

    if (issues.length) {
      ui.formError = issues[0].message;
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
      await apiJSON(SIGNUP_PATH, {
        method: "POST",
        body: {
          name: String(signupObj.name || "").trim(),
          email: String(signupObj.email || "").trim().toLowerCase(),
          password: String(signupObj.password || ""),
        },
      });
      showToast(LANG_KO.view.toast.signupDone, { type: "success" });
      window.location.assign("/login?signup=done");
    } catch (error) {
      if (error?.code === "AUTH_409_USER_EXISTS") {
        signupObj.errors.email = LANG_KO.view.error.userExists;
        ui.formError = signupObj.errors.email;
        focusOnError(emailRef);
        return;
      }
      if (error?.code === "AUTH_422_INVALID_INPUT") {
        ui.formError = LANG_KO.view.error.invalidInput;
      } else {
        const requestIdText = error?.requestId ? ` (requestId: ${error.requestId})` : "";
        ui.formError = `${error?.message || LANG_KO.view.error.signupFailed}${requestIdText}`;
      }
      focusOnError(errorSummaryRef);
    } finally {
      ui.pending = false;
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      <section className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">{LANG_KO.view.form.title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {LANG_KO.view.form.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
            <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700">
              {LANG_KO.view.form.nameLabel}
            </label>
            <div className="mt-2">
              <Input
                id="signup-name"
                dataObj={signupObj}
                dataKey="name"
                ref={nameRef}
                placeholder={LANG_KO.view.form.namePlaceholder}
                error={signupObj.errors.name}
              />
              {signupObj.errors.name ? (
                <p className="mt-2 text-sm text-red-600">{signupObj.errors.name}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
              {LANG_KO.view.form.emailLabel}
            </label>
            <div className="mt-2">
              <Input
                id="signup-email"
                type="email"
                dataObj={signupObj}
                dataKey="email"
                ref={emailRef}
                placeholder={LANG_KO.view.form.emailPlaceholder}
                error={signupObj.errors.email}
              />
              {signupObj.errors.email ? (
                <p className="mt-2 text-sm text-red-600">{signupObj.errors.email}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
              {LANG_KO.view.form.passwordLabel}
            </label>
            <div className="mt-2">
              <Input
                id="signup-password"
                type="password"
                dataObj={signupObj}
                dataKey="password"
                ref={passwordRef}
                placeholder={LANG_KO.view.form.passwordPlaceholder}
                error={signupObj.errors.password}
              />
              {signupObj.errors.password ? (
                <p className="mt-2 text-sm text-red-600">{signupObj.errors.password}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="signup-password-confirm" className="block text-sm font-medium text-gray-700">
              {LANG_KO.view.form.passwordConfirmLabel}
            </label>
            <div className="mt-2">
              <Input
                id="signup-password-confirm"
                type="password"
                dataObj={signupObj}
                dataKey="passwordConfirm"
                ref={passwordConfirmRef}
                placeholder={LANG_KO.view.form.passwordConfirmPlaceholder}
                error={signupObj.errors.passwordConfirm}
              />
              {signupObj.errors.passwordConfirm ? (
                <p className="mt-2 text-sm text-red-600">{signupObj.errors.passwordConfirm}</p>
              ) : null}
            </div>
          </div>

          <div>
            <Checkbox
              dataObj={signupObj}
              dataKey="agreeTerms"
              label={LANG_KO.view.form.agreeTermsLabel}
              ref={agreeTermsRef}
            />
            {signupObj.errors.agreeTerms ? (
              <p className="mt-2 text-sm text-red-600">{signupObj.errors.agreeTerms}</p>
            ) : null}
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={ui.pending}>
            {LANG_KO.view.form.submitLabel}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {`${LANG_KO.view.form.loginGuidePrefix} `}{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            {LANG_KO.view.form.loginLinkLabel}
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SignupView;
