"use client";

/**
 * 파일명: reset-password/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-13
 * 설명: 비밀번호 재설정 완료 페이지 클라이언트 뷰
 */

import { useEffect, useRef } from "react";
import Link from "next/link";
import EasyObj from "@/app/lib/dataset/EasyObj";
import Button from "@/app/lib/component/Button";
import Input from "@/app/lib/component/Input";
import { apiJSON } from "@/app/lib/runtime/api";
import { normalizePageConfig } from "@/app/lib/runtime/pageData";
import { PAGE_CONFIG } from "./initData";
import LANG_KO from "./lang.ko";

const MIN_PASSWORD_LENGTH = 8;

/**
 * @description fragment parameter에서 token 관련 값만 제거
 * 처리 규칙: token과 실제 raw token을 포함하지 않는 일반 fragment는 그대로 보존한다.
 */
const sanitizeResetHash = (hashText, rawToken) => {
  const originalHash = String(hashText || "");
  if (!originalHash.startsWith("#")) return originalHash;

  try {
    const retainedHashParams = new URLSearchParams();
    let sensitiveValueFound = false;
    new URLSearchParams(originalHash.slice(1)).forEach((value, key) => {
      if (/token/i.test(key) || (rawToken && (key.includes(rawToken) || value.includes(rawToken)))) {
        sensitiveValueFound = true;
        return;
      }
      retainedHashParams.append(key, value);
    });
    if (!sensitiveValueFound) return originalHash;
    const retainedHash = retainedHashParams.toString();
    return retainedHash ? `#${retainedHash}` : "";
  } catch {
    return "";
  }
};

/**
 * @description history state 문자열에서 reset token query와 raw token 값을 제거
 * 처리 규칙: Next router가 보관한 상대 URL 구조는 유지하되 token parameter만 제거한다.
 */
const sanitizeHistoryString = (value, rawToken) => {
  let sanitizedHistoryText = String(value || "");
  const hashIndex = sanitizedHistoryText.indexOf("#");
  if (hashIndex >= 0) {
    sanitizedHistoryText = `${sanitizedHistoryText.slice(0, hashIndex)}${sanitizeResetHash(
      sanitizedHistoryText.slice(hashIndex),
      rawToken,
    )}`;
  }
  sanitizedHistoryText = sanitizedHistoryText.replace(/([?&])[^?&#=]*token[^?&#=]*=[^&#]*/gi, (_match, separator) => (
    separator === "?" ? "?" : ""
  ));
  sanitizedHistoryText = sanitizedHistoryText.replace(/\?&/g, "?").replace(/[?&](?=#|$)/g, "");
  if (rawToken) sanitizedHistoryText = sanitizedHistoryText.split(rawToken).join("");
  return sanitizedHistoryText;
};

/**
 * @description history state를 복제하면서 token key와 raw token 문자열을 재귀 제거
 * 처리 규칙: 안전한 Next/router state key와 값은 그대로 보존한다.
 */
const sanitizeHistoryState = (value, rawToken, seenValueMap = new WeakMap()) => {
  if (typeof value === "string") return sanitizeHistoryString(value, rawToken);
  if (value == null || typeof value !== "object") return value;
  if (seenValueMap.has(value)) return seenValueMap.get(value);

  if (Array.isArray(value)) {
    const sanitizedArray = [];
    seenValueMap.set(value, sanitizedArray);
    value.forEach((entryValue) => {
      sanitizedArray.push(sanitizeHistoryState(entryValue, rawToken, seenValueMap));
    });
    return sanitizedArray;
  }

  const sanitizedStateObject = {};
  seenValueMap.set(value, sanitizedStateObject);
  Object.entries(value).forEach(([key, entryValue]) => {
    if (/token/i.test(key)) return;
    if (rawToken && key.includes(rawToken)) return;
    sanitizedStateObject[key] = sanitizeHistoryState(entryValue, rawToken, seenValueMap);
  });
  return sanitizedStateObject;
};

/**
 * @description URL에서 token 관련 값을 제거하고 안전한 나머지 query/hash만 보존
 * 처리 규칙: token 이름 또는 실제 token 값을 포함한 query/hash는 보존하지 않는다.
 */
const scrubResetTokenFromHistory = (currentUrl, rawToken) => {
  const retainedSearchParams = new URLSearchParams();
  currentUrl.searchParams.forEach((value, key) => {
    if (/token/i.test(key)) return;
    if (rawToken && value.includes(rawToken)) return;
    retainedSearchParams.append(key, value);
  });

  const retainedHash = sanitizeResetHash(currentUrl.hash, rawToken);

  const retainedSearch = retainedSearchParams.toString();
  const scrubbedUrl = `${currentUrl.pathname}${retainedSearch ? `?${retainedSearch}` : ""}${retainedHash}`;
  const scrubbedHistoryState = sanitizeHistoryState(window.history.state, rawToken);
  window.history.replaceState(scrubbedHistoryState, "", scrubbedUrl);
};

/**
 * @description reset token과 새 비밀번호를 검증하고 완료 API를 호출하는 화면을 렌더링
 * 처리 규칙: token은 ref 메모리에만 두고 mount 직후 URL history에서 제거한다.
 */
const ResetPasswordView = () => {
  /* 1. 상수 ======================================================================================================================= */
  const pageMode = normalizePageConfig(PAGE_CONFIG).MODE;

  /* 2. 데이터 ===================================================================================================================== */
  const formObj = EasyObj({
    newPassword: "",
    newPasswordConfirm: "",
    errors: {
      newPassword: "",
      newPasswordConfirm: "",
    },
  });
  const ui = EasyObj({
    initialized: false,
    pending: false,
    succeeded: false,
    recoveryRequired: false,
    formError: "",
  });
  const tokenRef = useRef(null);
  const resetViewStateRef = useRef(ui);
  const passwordRef = useRef(null);
  const passwordConfirmRef = useRef(null);
  const errorSummaryRef = useRef(null);
  const summaryFocusRequestedRef = useRef(false);
  const focusFrameRef = useRef(null);

  /* 3. UI ========================================================================================================================= */
  // 없음

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 ================================================================================================================= */
  // 없음

  /* 7. 함수 ======================================================================================================================= */

  const focusSoon = (targetRef) => {
    cancelAnimationFrame(focusFrameRef.current);
    focusFrameRef.current = requestAnimationFrame(() => targetRef.current?.focus());
  };

  const focusMountedStatus = (element) => {
    element?.focus();
  };

  const bindErrorSummaryRef = (element) => {
    errorSummaryRef.current = element;
    if (!element || !summaryFocusRequestedRef.current) return;
    summaryFocusRequestedRef.current = false;
    element.focus();
  };

  const clearSensitiveForm = () => {
    formObj.newPassword = "";
    formObj.newPasswordConfirm = "";
    tokenRef.current = null;
  };

  const showRecovery = () => {
    clearSensitiveForm();
    ui.formError = "";
    ui.recoveryRequired = true;
  };

  const validateForm = () => {
    formObj.errors.newPassword = "";
    formObj.errors.newPasswordConfirm = "";
    ui.formError = "";

    const newPassword = String(formObj.newPassword || "");
    const newPasswordConfirm = String(formObj.newPasswordConfirm || "");
    let firstIssueObj = null;

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      formObj.errors.newPassword = LANG_KO.view.validation.passwordMinLength;
      firstIssueObj = { ref: passwordRef, message: formObj.errors.newPassword };
    }
    if (newPasswordConfirm !== newPassword) {
      formObj.errors.newPasswordConfirm = LANG_KO.view.validation.passwordConfirmMismatch;
      if (!firstIssueObj) {
        firstIssueObj = {
          ref: passwordConfirmRef,
          message: formObj.errors.newPasswordConfirm,
        };
      }
    }

    if (!firstIssueObj) return true;
    ui.formError = firstIssueObj.message;
    focusSoon(firstIssueObj.ref);
    return false;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (ui.pending) return;
    if (!tokenRef.current) {
      showRecovery();
      return;
    }
    if (!validateForm()) return;

    ui.pending = true;
    try {
      await apiJSON(
        PAGE_CONFIG.API.completePasswordReset,
        {
          method: "POST",
          body: {
            token: tokenRef.current,
            newPassword: String(formObj.newPassword || ""),
          },
        },
        { authless: true },
      );
      clearSensitiveForm();
      ui.succeeded = true;
    } catch (error) {
      if (error?.code === "AUTH_400_RESET_INVALID_OR_EXPIRED") {
        showRecovery();
      } else {
        summaryFocusRequestedRef.current = true;
        ui.formError = LANG_KO.view.error.retryFailed;
      }
    } finally {
      ui.pending = false;
    }
  };

  /* 8. useEffect ================================================================================================================== */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const resetViewState = resetViewStateRef.current;
    const currentUrl = new URL(window.location.href);
    const fragmentParams = new URLSearchParams(currentUrl.hash.replace(/^#/, ""));
    const rawToken = fragmentParams.get("token") || currentUrl.searchParams.get("token") || "";
    if (rawToken) tokenRef.current = rawToken;
    scrubResetTokenFromHistory(currentUrl, rawToken);
    resetViewState.recoveryRequired = !rawToken;
    resetViewState.initialized = true;
  }, []);

  useEffect(() => () => cancelAnimationFrame(focusFrameRef.current), []);

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  if (!ui.initialized) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6" data-page-mode={pageMode}>
      <section className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl sm:p-10">
        {ui.succeeded ? (
          <div
            ref={focusMountedStatus}
            tabIndex={-1}
            className="text-center"
            role="status"
            aria-live="polite"
          >
            <h1 className="text-3xl font-semibold text-gray-900">{LANG_KO.view.success.title}</h1>
            <p className="mt-3 text-sm text-gray-600">{LANG_KO.view.success.message}</p>
            <Link href="/login" className="mt-6 inline-block font-medium text-blue-600 hover:text-blue-500">
              {LANG_KO.view.success.loginLabel}
            </Link>
          </div>
        ) : ui.recoveryRequired ? (
          <div
            ref={focusMountedStatus}
            tabIndex={-1}
            className="text-center"
            role="alert"
            aria-live="assertive"
          >
            <h1 className="text-3xl font-semibold text-gray-900">{LANG_KO.view.recovery.title}</h1>
            <p className="mt-3 text-sm text-gray-600">{LANG_KO.view.recovery.message}</p>
            <Link href="/forgot-password" className="mt-6 inline-block font-medium text-blue-600 hover:text-blue-500">
              {LANG_KO.view.recovery.requestLabel}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold text-gray-900">{LANG_KO.view.form.title}</h1>
              <p className="mt-2 text-sm text-gray-600">{LANG_KO.view.form.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {ui.formError ? (
                <div
                  ref={bindErrorSummaryRef}
                  tabIndex={-1}
                  role="alert"
                  aria-live="assertive"
                  className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {ui.formError}
                </div>
              ) : null}

              <div>
                <label htmlFor="reset-password" className="block text-sm font-medium text-gray-700">
                  {LANG_KO.view.form.passwordLabel}
                </label>
                <div className="mt-2">
                  <Input
                    id="reset-password"
                    type="password"
                    autoComplete="new-password"
                    dataObj={formObj}
                    dataKey="newPassword"
                    ref={passwordRef}
                    placeholder={LANG_KO.view.form.passwordPlaceholder}
                    error={formObj.errors.newPassword}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reset-password-confirm" className="block text-sm font-medium text-gray-700">
                  {LANG_KO.view.form.passwordConfirmLabel}
                </label>
                <div className="mt-2">
                  <Input
                    id="reset-password-confirm"
                    type="password"
                    autoComplete="new-password"
                    dataObj={formObj}
                    dataKey="newPasswordConfirm"
                    ref={passwordConfirmRef}
                    placeholder={LANG_KO.view.form.passwordConfirmPlaceholder}
                    error={formObj.errors.newPasswordConfirm}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={ui.pending}
                disabled={ui.pending}
              >
                {LANG_KO.view.form.submitLabel}
              </Button>
            </form>
          </>
        )}
      </section>
    </main>
  );
};

export default ResetPasswordView;
