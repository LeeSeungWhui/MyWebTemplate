'use client'
/**
 * 파일명: AppShell.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 앱 공통 셸 컴포넌트
 */

import { useEffect, useCallback } from 'react'
import { usePathname } from "next/navigation";
import { useGlobalUi } from './common/store/SharedStore'
import Loading from '@/app/lib/component/Loading'
import Alert from '@/app/lib/component/Alert'
import Confirm from '@/app/lib/component/Confirm'
import Toast from '@/app/lib/component/Toast/Toast'
import PublicGnb from "@/app/common/layout/PublicGnb";
import PublicFooter from "@/app/common/layout/PublicFooter";

/**
 * @description 현재 경로가 PublicGnb/PublicFooter를 포함한 퍼블릭 셸 대상인지 판별
 * 반환값: 홈(`/`)과 샘플 포트폴리오 경로면 true, 그 외는 false.
 * @updated 2026-02-27
 */
const isPublicShellPath = (pathname) => {
  const pathText = String(pathname || "");
  if (pathText === "/") return true;
  if (pathText.startsWith("/sample/portfolio")) return true;
  return false;
};

/**
 * @description  퍼블릭 셸 본문 영역에 적용할 컨테이너 클래스 문자열을 계산한다. 입력/출력 계약을 함께 명시
 * 처리 규칙: `/sample/portfolio`는 상하 여백을 크게, 그 외 경로는 기본 여백을 사용한다.
 * @updated 2026-02-27
 */
const resolvePublicContentClassName = (pathname) => {
  const pathText = String(pathname || "");
  if (pathText.startsWith("/sample/portfolio")) {
    return "mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8";
  }
  return "mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8";
};

/**
 * @description  로딩/알림/확인/토스트 오버레이와 퍼블릭 셸 분기를 관리하는 AppShell 컴포넌트를 렌더링한다. 입력/출력 계약을 함께 명시
 * 처리 규칙: 퍼블릭 경로는 Header/Footer를 감싸고, 그 외 경로는 children만 그대로 노출한다.
 */
const AppShell = ({ children }) => {

  const pathname = usePathname();
  const {
    isLoading,
    alert, hideAlert,
    confirm, hideConfirm,
    toast, hideToast,
  } = useGlobalUi()
  const usePublicShell = isPublicShellPath(pathname);
  const publicContentClassName = resolvePublicContentClassName(pathname);

  const onAlertClick = useCallback(() => {
    const onClick = alert && typeof alert.onClick === 'function' ? alert.onClick : null
    const onFocus = alert && typeof alert.onFocus === 'function' ? alert.onFocus : null
    try {
      onClick?.()
    } finally {
      hideAlert()
      // 한글설명: 설명 move focus after the alert is closed/unmounted
      setTimeout(() => onFocus?.(), 0)
    }
  }, [alert, hideAlert])

  // 한글설명: 설명 auto-hide toast after duration if set
  useEffect(() => {
    if (toast?.show && (toast.duration ?? 3000) !== Infinity) {
      const toastTimer = setTimeout(() => hideToast(), toast.duration ?? 3000)
      return () => clearTimeout(toastTimer)
    }
  }, [toast?.show, toast?.duration, hideToast])

  // 한글설명: 설명 removed: focusing on show caused premature focus shift

  const onConfirmClose = useCallback((ok) => {
    const onFocus = confirm && typeof confirm.onFocus === 'function' ? confirm.onFocus : null
    hideConfirm(ok)
    setTimeout(() => onFocus?.(), 0)
  }, [confirm, hideConfirm])

  return (
    <>
      {isLoading && <Loading />}
      {usePublicShell ? (
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <PublicGnb />
          <main className={publicContentClassName}>{children}</main>
          <PublicFooter />
        </div>
      ) : (
        children
      )}
      {alert?.show && (
        <Alert title={alert.title} text={alert.message} type={alert.type} onClick={onAlertClick} />
      )}
      {confirm?.show && (
        <Confirm
          title={confirm.title}
          text={confirm.message}
          type={confirm.type}
          onConfirm={() => onConfirmClose(true)}
          onCancel={() => onConfirmClose(false)}
          confirmText={confirm.confirmText}
          cancelText={confirm.cancelText}
        />
      )}
      {toast?.show && (
        <Toast message={toast.message} type={toast.type} position={toast.position} isExiting={false} onClose={hideToast} />
      )}
    </>
  )
}

export default AppShell
