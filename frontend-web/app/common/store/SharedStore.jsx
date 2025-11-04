"use client"
/**
 * 파일명: SharedStore.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Zustand 기반 전역 공유 스토어
 */

import { create } from 'zustand'
import { shallow } from 'zustand/shallow'

export const useSharedStore = create((set, get) => ({
  // 세션/사용자 메타
  user: null,
  setUser: (user) => set({ user }),
  userJson: null,
  setUserJson: (userJson) => set({ userJson }),
  shared: {},
  setShared: (patch) => set((s) => ({ shared: { ...s.shared, ...(patch || {}) } })),

  // 로딩
  loadingCounter: 0,
  isLoading: false,
  updateLoading: (delta = 0) => set((s) => {
    const c = Math.max(0, (s.loadingCounter || 0) + delta)
    return { loadingCounter: c, isLoading: c > 0 }
  }),
  setLoading: (v) => set({ isLoading: !!v, loadingCounter: v ? 1 : 0 }),

  // 알림
  alert: { show: false, title: '', message: '', type: 'info', onClick: undefined, onFocus: undefined },
  showAlert: (message, opts = {}) => set({
    alert: {
      show: true,
      title: opts.title || '알림',
      message,
      type: opts.type || 'info',
      onClick: typeof opts.onClick === 'function' ? opts.onClick : undefined,
      onFocus: typeof opts.onFocus === 'function' ? opts.onFocus : undefined,
    },
  }),
  hideAlert: () => set({ alert: { show: false, title: '', message: '', type: 'info', onClick: undefined, onFocus: undefined } }),

  // 확인(프라미스 기반)
  confirm: { show: false, title: '', message: '', type: 'info', confirmText: '확인', cancelText: '취소', onFocus: undefined },
  confirmPromiseResolve: null,
  showConfirm: (message, opts = {}) => {
    return new Promise((resolve) => {
      set({
        confirm: {
          show: true,
          title: opts.title || '확인',
          message,
          type: opts.type || 'info',
          confirmText: opts.confirmText || '확인',
          cancelText: opts.cancelText || '취소',
          onConfirm: opts.onConfirm,
          onCancel: opts.onCancel,
          onFocus: typeof opts.onFocus === 'function' ? opts.onFocus : undefined,
        },
        confirmPromiseResolve: resolve,
      })
    })
  },
  hideConfirm: (confirmed) => {
    const { confirm, confirmPromiseResolve } = get()
    try {
      if (confirmed && typeof confirm.onConfirm === 'function') confirm.onConfirm()
      if (!confirmed && typeof confirm.onCancel === 'function') confirm.onCancel()
      if (typeof confirmPromiseResolve === 'function') confirmPromiseResolve(!!confirmed)
    } finally {
      set({
        confirm: { show: false, title: '', message: '', type: 'info', confirmText: '확인', cancelText: '취소', onFocus: undefined },
        confirmPromiseResolve: null,
      })
    }
  },

  // 토스트
  toast: { show: false, message: '', type: 'info', position: 'bottom-center', duration: 3000 },
  showToast: (message, opts = {}) => set({
    toast: {
      show: true,
      message,
      type: opts.type || 'info',
      position: opts.position || 'bottom-center',
      duration: typeof opts.duration === 'number' ? opts.duration : 3000,
    },
  }),
  hideToast: () => set({ toast: { show: false, message: '', type: 'info', position: 'bottom-center', duration: 3000 } }),
}))

// Convenience hooks to reduce selector boilerplate
export const useUser = () =>
  useSharedStore(
    (s) => ({ user: s.user, setUser: s.setUser }),
    shallow,
  )

export const useSharedData = () =>
  useSharedStore(
    (s) => ({ shared: s.shared, setShared: s.setShared }),
    shallow,
  )

export const useGlobalUi = () =>
  useSharedStore(
    (s) => ({
      // loading
      isLoading: s.isLoading,
      setLoading: s.setLoading,
      updateLoading: s.updateLoading,
      // alert
      alert: s.alert,
      showAlert: s.showAlert,
      hideAlert: s.hideAlert,
      // confirm
      confirm: s.confirm,
      showConfirm: s.showConfirm,
      hideConfirm: s.hideConfirm,
      // toast
      toast: s.toast,
      showToast: s.showToast,
      hideToast: s.hideToast,
    }),
    shallow,
  )
