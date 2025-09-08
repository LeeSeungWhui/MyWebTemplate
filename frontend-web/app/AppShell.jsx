'use client'

import { useEffect, useCallback } from 'react'
import { useSharedStore } from './common/store/Shared'
import Loading from '@/app/lib/component/Loading'
import Alert from '@/app/lib/component/Alert'
import Confirm from '@/app/lib/component/Confirm'
import Toast from '@/app/lib/component/Toast/Toast'

export default function AppShell({ children }) {
  const {
    isLoading,
    alert, hideAlert,
    confirm, hideConfirm,
    toast, hideToast,
  } = useSharedStore()

  const onAlertClick = useCallback(() => {
    try {
      if (alert && typeof alert.onClick === 'function') alert.onClick()
    } finally {
      hideAlert()
    }
  }, [alert, hideAlert])

  // auto-hide toast after duration if set
  useEffect(() => {
    if (toast?.show && (toast.duration ?? 3000) !== Infinity) {
      const t = setTimeout(() => hideToast(), toast.duration ?? 3000)
      return () => clearTimeout(t)
    }
  }, [toast?.show, toast?.duration, hideToast])

  // focus hook for alert
  useEffect(() => {
    if (alert?.show && typeof alert.onFocus === 'function') {
      const t = setTimeout(() => alert.onFocus(), 0)
      return () => clearTimeout(t)
    }
  }, [alert?.show])

  return (
    <>
      {isLoading && <Loading />}
      {children}
      {alert?.show && (
        <Alert title={alert.title} text={alert.message} type={alert.type} onClick={onAlertClick} />
      )}
      {confirm?.show && (
        <Confirm
          title={confirm.title}
          text={confirm.message}
          type={confirm.type}
          onConfirm={() => hideConfirm(true)}
          onCancel={() => hideConfirm(false)}
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
