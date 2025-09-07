import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  user: null,
  shared: {},

  // loading
  loadingCounter: 0,
  isLoading: false,
  updateLoading: (delta) => set((s) => ({
    loadingCounter: Math.max(0, s.loadingCounter + (delta || 0)),
    isLoading: Math.max(0, s.loadingCounter + (delta || 0)) > 0,
  })),
  setLoading: (v) => set({ isLoading: !!v, loadingCounter: v ? 1 : 0 }),

  // alert
  alert: { show: false, title: '', message: '', type: 'info' },
  showAlert: (message, opts = {}) => set({
    alert: {
      show: true,
      title: opts.title || '알림',
      message,
      type: opts.type || 'info',
    },
  }),
  hideAlert: () => set({ alert: { show: false, title: '', message: '', type: 'info' } }),

  // confirm
  confirm: { show: false, title: '', message: '', type: 'info', confirmText: '확인', cancelText: '취소' },
  showConfirm: (message, opts = {}) => set({
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
  }),
  hideConfirm: (confirmed) => {
    const { confirm } = get()
    if (confirmed && typeof confirm.onConfirm === 'function') confirm.onConfirm()
    if (!confirmed && typeof confirm.onCancel === 'function') confirm.onCancel()
    set({ confirm: { show: false, title: '', message: '', type: 'info', confirmText: '확인', cancelText: '취소' } })
  },

  // toast
  toast: { show: false, message: '', type: 'info', position: 'bottom-center' },
  showToast: (message, opts = {}) => set({
    toast: {
      show: true,
      message,
      type: opts.type || 'info',
      position: opts.position || 'bottom-center',
      duration: opts.duration || 3000,
    },
  }),
  hideToast: () => set({ toast: { show: false, message: '', type: 'info', position: 'bottom-center' } }),
}))

