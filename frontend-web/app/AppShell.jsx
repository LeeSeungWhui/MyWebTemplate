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

const isPublicShellPath = (pathname) => {
  const pathText = String(pathname || "");
  if (pathText === "/") return true;
  if (pathText.startsWith("/sample/portfolio")) return true;
  return false;
};

const resolvePublicContentClassName = (pathname) => {
  const pathText = String(pathname || "");
  if (pathText.startsWith("/sample/portfolio")) {
    return "mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8";
  }
  return "mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8";
};

/**
 * @description AppShell export를 노출한다.
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
      // 한글설명: move focus after the alert is closed/unmounted
      setTimeout(() => onFocus?.(), 0)
    }
  }, [alert, hideAlert])

  // 한글설명: auto-hide toast after duration if set
  useEffect(() => {
    if (toast?.show && (toast.duration ?? 3000) !== Infinity) {
      const toastTimer = setTimeout(() => hideToast(), toast.duration ?? 3000)
      return () => clearTimeout(toastTimer)
    }
  }, [toast?.show, toast?.duration, hideToast])

  // 한글설명: removed: focusing on show caused premature focus shift

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
