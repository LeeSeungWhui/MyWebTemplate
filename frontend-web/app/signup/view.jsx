"use client";
/**
 * 파일명: signup/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 회원가입 페이지 클라이언트 뷰
 */

import { useMemo, useRef, useState } from "react";
import EasyObj from "@/app/lib/dataset/EasyObj";
import Button from "@/app/lib/component/Button";
import Checkbox from "@/app/lib/component/Checkbox";
import Input from "@/app/lib/component/Input";
import Link from "next/link";
import { apiJSON } from "@/app/lib/runtime/api";
import { useGlobalUi } from "@/app/common/store/SharedStore";
import { SIGNUP_PATH, createSignupFormModel } from "./initData";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignupView = () => {
  const signupObj = EasyObj(useMemo(() => createSignupFormModel(), []));
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState("");
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
    setFormError("");
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
      signupObj.errors.name = "이름은 2자 이상 입력해주세요.";
      issues.push({ ref: nameRef, message: signupObj.errors.name });
    }
    if (!email || !EMAIL_RE.test(email)) {
      signupObj.errors.email = "올바른 이메일 형식을 입력해주세요.";
      issues.push({ ref: emailRef, message: signupObj.errors.email });
    }
    if (!password || password.length < 8) {
      signupObj.errors.password = "비밀번호는 8자 이상 입력해주세요.";
      issues.push({ ref: passwordRef, message: signupObj.errors.password });
    }
    if (passwordConfirm !== password) {
      signupObj.errors.passwordConfirm = "비밀번호 확인이 일치하지 않습니다.";
      issues.push({
        ref: passwordConfirmRef,
        message: signupObj.errors.passwordConfirm,
      });
    }
    if (!agreeTerms) {
      signupObj.errors.agreeTerms = "약관 동의는 필수입니다.";
      issues.push({ ref: agreeTermsRef, message: signupObj.errors.agreeTerms });
    }

    if (issues.length) {
      setFormError(issues[0].message);
      focusOnError(issues[0].ref);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setPending(true);
    try {
      await apiJSON(SIGNUP_PATH, {
        method: "POST",
        body: {
          name: String(signupObj.name || "").trim(),
          email: String(signupObj.email || "").trim().toLowerCase(),
          password: String(signupObj.password || ""),
        },
      });
      showToast("회원가입이 완료되었습니다. 로그인해 주세요.", { type: "success" });
      window.location.assign("/login?signup=done");
    } catch (error) {
      if (error?.code === "AUTH_409_USER_EXISTS") {
        signupObj.errors.email = "이미 사용 중인 이메일입니다.";
        setFormError(signupObj.errors.email);
        focusOnError(emailRef);
        return;
      }
      if (error?.code === "AUTH_422_INVALID_INPUT") {
        setFormError("입력값을 다시 확인해주세요.");
      } else {
        const requestIdText = error?.requestId ? ` (requestId: ${error.requestId})` : "";
        setFormError(`${error?.message || "회원가입에 실패했습니다."}${requestIdText}`);
      }
      focusOnError(errorSummaryRef);
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      <section className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">회원가입</h1>
          <p className="mt-2 text-sm text-gray-600">
            새 계정을 만들고 로그인해서 대시보드를 확인하세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
            <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700">
              이름
            </label>
            <div className="mt-2">
              <Input
                id="signup-name"
                dataObj={signupObj}
                dataKey="name"
                ref={nameRef}
                placeholder="이름을 입력해주세요"
                error={signupObj.errors.name}
              />
              {signupObj.errors.name ? (
                <p className="mt-2 text-sm text-red-600">{signupObj.errors.name}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <div className="mt-2">
              <Input
                id="signup-email"
                type="email"
                dataObj={signupObj}
                dataKey="email"
                ref={emailRef}
                placeholder="이메일을 입력해주세요"
                error={signupObj.errors.email}
              />
              {signupObj.errors.email ? (
                <p className="mt-2 text-sm text-red-600">{signupObj.errors.email}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <div className="mt-2">
              <Input
                id="signup-password"
                type="password"
                dataObj={signupObj}
                dataKey="password"
                ref={passwordRef}
                placeholder="비밀번호를 입력해주세요"
                error={signupObj.errors.password}
              />
              {signupObj.errors.password ? (
                <p className="mt-2 text-sm text-red-600">{signupObj.errors.password}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="signup-password-confirm" className="block text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <div className="mt-2">
              <Input
                id="signup-password-confirm"
                type="password"
                dataObj={signupObj}
                dataKey="passwordConfirm"
                ref={passwordConfirmRef}
                placeholder="비밀번호를 다시 입력해주세요"
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
              label="이용약관에 동의합니다."
              ref={agreeTermsRef}
            />
            {signupObj.errors.agreeTerms ? (
              <p className="mt-2 text-sm text-red-600">{signupObj.errors.agreeTerms}</p>
            ) : null}
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={pending}>
            회원가입
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            로그인
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SignupView;
