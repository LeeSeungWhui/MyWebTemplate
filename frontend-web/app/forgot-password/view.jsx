"use client";
/**
 * 파일명: forgot-password/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 비밀번호 찾기 페이지 클라이언트 뷰
 */

import { useRef } from "react";
import EasyObj from "@/app/lib/dataset/EasyObj";
import Button from "@/app/lib/component/Button";
import Input from "@/app/lib/component/Input";
import Link from "next/link";
import LANG_KO from "./lang.ko";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @description 비밀번호 찾기 이메일 입력/검증/제출 상태를 관리하는 화면을 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: 유효한 이메일 제출 시 submitted 상태로 전환해 안내 메시지를 노출한다.
 */
const ForgotPasswordView = () => {
  const formObj = EasyObj({
    email: "",
    errors: {
      email: "",
    },
  });
  const ui = EasyObj({
    pending: false,
    submitted: false,
    formError: "",
  });
  const emailRef = useRef(null);
  const errorSummaryRef = useRef(null);

  /**
   * @description 이메일 필드 에러와 폼 공통 에러 메시지를 초기화
   * 부작용: formObj.errors.email, ui.formError 값을 빈 문자열로 덮어쓴다.
   * @updated 2026-02-27
   */
  const resetErrors = () => {
    formObj.errors.email = "";
    ui.formError = "";
  };

  /**
   * @description 오류 발생 요소 포커스 이동
   * 처리 규칙: ref.current가 있을 때 requestAnimationFrame 타이밍으로 focus를 호출한다.
   * @updated 2026-02-27
   */
  const focusOnError = (ref) => {
    if (!ref || !ref.current) return;
    requestAnimationFrame(() => {
      ref.current?.focus();
    });
  };

  /**
   * @description 이메일 입력값을 trim/lowercase 후 형식을 점검
   * 실패 동작: 형식 불일치 시 에러 메시지 설정 후 이메일 입력으로 포커스를 이동하고 false를 반환한다.
   * @updated 2026-02-27
   */
  const validate = () => {
    resetErrors();
    const email = String(formObj.email || "").trim().toLowerCase();
    formObj.email = email;
    if (!email || !EMAIL_RE.test(email)) {
      formObj.errors.email = LANG_KO.view.validation.emailInvalid;
      ui.formError = formObj.errors.email;
      focusOnError(emailRef);
      return false;
    }
    return true;
  };

  /**
   * @description 비밀번호 찾기 요청 제출 흐름을 진행
   * 실패 동작: 비동기 처리 실패 시 ui.formError를 노출하고 에러 요약 영역으로 포커스를 이동한다.
   * @updated 2026-02-27
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    ui.pending = true;
    ui.submitted = false;
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      ui.submitted = true;
    } catch {
      ui.formError = LANG_KO.view.error.requestFailed;
      focusOnError(errorSummaryRef);
    } finally {
      ui.pending = false;
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <section className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">{LANG_KO.view.form.title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {LANG_KO.view.form.subtitle}
          </p>
        </div>

        {ui.submitted ? (
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {LANG_KO.view.form.submittedMessage}
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
              {LANG_KO.view.form.emailLabel}
            </label>
            <div className="mt-2">
              <Input
                id="forgot-email"
                type="email"
                dataObj={formObj}
                dataKey="email"
                ref={emailRef}
                placeholder={LANG_KO.view.form.emailPlaceholder}
                error={formObj.errors.email}
              />
              {formObj.errors.email ? (
                <p className="mt-2 text-sm text-red-600">{formObj.errors.email}</p>
              ) : null}
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={ui.pending}>
            {LANG_KO.view.form.submitLabel}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            {LANG_KO.view.form.backToLoginLabel}
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ForgotPasswordView;
