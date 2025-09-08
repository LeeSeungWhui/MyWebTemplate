'use client'

import { create } from 'zustand'

export const useSharedStore = create((set, get) => ({
  // session-ish meta
  user: null,
  setUser: (user) => set({ user }),
  userJson: null,
  setUserJson: (userJson) => set({ userJson }),
  shared: {},
  setShared: (patch) => set((s) => ({ shared: { ...s.shared, ...(patch || {}) } })),

  // loading
  loadingCounter: 0,
  isLoading: false,
  updateLoading: (delta = 0) => set((s) => {
    const c = Math.max(0, (s.loadingCounter || 0) + delta)
    return { loadingCounter: c, isLoading: c > 0 }
  }),
  setLoading: (v) => set({ isLoading: !!v, loadingCounter: v ? 1 : 0 }),

  // alert
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

  // confirm (Promise-based API)
  confirm: { show: false, title: '', message: '', type: 'info', confirmText: '확인', cancelText: '취소' },
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
        confirm: { show: false, title: '', message: '', type: 'info', confirmText: '확인', cancelText: '취소' },
        confirmPromiseResolve: null,
      })
    }
  },

  // toast
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

