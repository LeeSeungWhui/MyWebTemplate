/**
 * 파일명: SharedStore.jsx
 * 설명: Zustand 기반 전역 공유 스토어 (웹과 동일 API: useGlobalUi)
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { create } from "zustand";
import Loading from "../../lib/component/Loading";
import Icon from "../../lib/component/Icon";
import { View, Text, Pressable, Animated, Platform } from "react-native";
import { useEffect, useRef } from "react";

const ALERT_META = {
  info: { color: "#2563EB", icon: "md:info-outline" },
  success: { color: "#16A34A", icon: "md:check-circle-outline" },
  warning: { color: "#F59E0B", icon: "md:warning-amber" },
  danger: { color: "#DC2626", icon: "md:error-outline" },
};

const normalizeType = (type) => {
  if (type === "error") return "danger";
  return type || "info";
};

const getToastPositionStyle = (position) => {
  const pos = position || "bottom-center";
  const [vertical, horizontal] = pos.split("-");
  const style = {
    alignItems: "center",
    paddingHorizontal: 16,
  };

  if (vertical === "top") {
    style.top = 24;
  } else {
    style.bottom = 24;
  }

  if (horizontal === "left") {
    style.alignItems = "flex-start";
  } else if (horizontal === "right") {
    style.alignItems = "flex-end";
  } else {
    style.alignItems = "center";
  }

  return style;
};

export const useSharedStore = create((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  userJson: null,
  setUserJson: (userJson) => set({ userJson }),
  config: {},
  setConfig: (config) =>
    set({ config: config && typeof config === "object" ? config : {} }),
  shared: {},
  setShared: (patch) =>
    set((s) => ({ shared: { ...s.shared, ...(patch || {}) } })),

  loadingCounter: 0,
  isLoading: false,
  updateLoading: (delta = 0) =>
    set((s) => {
      const c = Math.max(0, (s.loadingCounter || 0) + delta);
      return { loadingCounter: c, isLoading: c > 0 };
    }),
  setLoading: (v) => set({ isLoading: !!v, loadingCounter: v ? 1 : 0 }),

  alert: {
    show: false,
    title: "",
    message: "",
    type: "info",
    onClick: undefined,
    onFocus: undefined,
  },
  showAlert: (message, opts = {}) =>
    set({
      alert: {
        show: true,
        title: opts.title || "알림",
        message,
        type: normalizeType(opts.type),
        onClick: typeof opts.onClick === "function" ? opts.onClick : undefined,
        onFocus: typeof opts.onFocus === "function" ? opts.onFocus : undefined,
      },
    }),
  hideAlert: () =>
    set({
      alert: {
        show: false,
        title: "",
        message: "",
        type: "info",
        onClick: undefined,
        onFocus: undefined,
      },
    }),

  confirm: {
    show: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "확인",
    cancelText: "취소",
    onConfirm: undefined,
    onCancel: undefined,
    onFocus: undefined,
  },
  confirmPromiseResolve: null,
  showConfirm: (message, opts = {}) =>
    new Promise((resolve) => {
      set({
        confirm: {
          show: true,
          title: opts.title || "확인",
          message,
          type: normalizeType(opts.type),
          confirmText: opts.confirmText || "확인",
          cancelText: opts.cancelText || "취소",
          onConfirm: opts.onConfirm,
          onCancel: opts.onCancel,
          onFocus:
            typeof opts.onFocus === "function" ? opts.onFocus : undefined,
        },
        confirmPromiseResolve: resolve,
      });
    }),
  hideConfirm: (confirmed) => {
    const { confirm, confirmPromiseResolve } = get();
    try {
      if (confirmed && typeof confirm.onConfirm === "function")
        confirm.onConfirm();
      if (!confirmed && typeof confirm.onCancel === "function")
        confirm.onCancel();
      if (typeof confirmPromiseResolve === "function")
        confirmPromiseResolve(!!confirmed);
    } finally {
      set({
        confirm: {
          show: false,
          title: "",
          message: "",
          type: "info",
          confirmText: "확인",
          cancelText: "취소",
          onConfirm: undefined,
          onCancel: undefined,
          onFocus: undefined,
        },
        confirmPromiseResolve: null,
      });
      if (typeof confirm.onFocus === "function") {
        // 한글설명: allow UI to settle before focusing
        setTimeout(() => confirm.onFocus(), 0);
      }
    }
  },

  toast: {
    show: false,
    message: "",
    type: "info",
    duration: 3000,
    position: "bottom-center",
  },
  showToast: (message, opts = {}) =>
    set({
      toast: {
        show: true,
        message,
        type: normalizeType(opts.type),
        duration: typeof opts.duration === "number" ? opts.duration : 3000,
        position:
          typeof opts.position === "string" ? opts.position : "bottom-center",
      },
    }),
  hideToast: () =>
    set({
      toast: {
        show: false,
        message: "",
        type: "info",
        duration: 3000,
        position: "bottom-center",
      },
    }),
}));

export const useUser = () => {
  const user = useSharedStore((s) => s.user);
  const setUser = useSharedStore((s) => s.setUser);
  return { user, setUser };
};

export const useSharedData = () => {
  const shared = useSharedStore((s) => s.shared);
  const setShared = useSharedStore((s) => s.setShared);
  return { shared, setShared };
};

export const useGlobalUi = () => {
  const isLoading = useSharedStore((s) => s.isLoading);
  const setLoading = useSharedStore((s) => s.setLoading);
  const updateLoading = useSharedStore((s) => s.updateLoading);

  const alert = useSharedStore((s) => s.alert);
  const showAlert = useSharedStore((s) => s.showAlert);
  const hideAlert = useSharedStore((s) => s.hideAlert);

  const confirm = useSharedStore((s) => s.confirm);
  const showConfirm = useSharedStore((s) => s.showConfirm);
  const hideConfirm = useSharedStore((s) => s.hideConfirm);

  const toast = useSharedStore((s) => s.toast);
  const showToast = useSharedStore((s) => s.showToast);
  const hideToast = useSharedStore((s) => s.hideToast);

  return {
    isLoading,
    setLoading,
    updateLoading,
    alert,
    showAlert,
    hideAlert,
    confirm,
    showConfirm,
    hideConfirm,
    toast,
    showToast,
    hideToast,
  };
};

/**
 * 오버레이 렌더러: 스토어 구독해서 Loading/Alert/Confirm/Toast 표시
 */
export const UiOverlay = () => {
  const {
    isLoading,
    alert,
    hideAlert,
    confirm,
    hideConfirm,
    toast,
    hideToast,
  } = useGlobalUi();
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);

  useEffect(() => {
    if (toast.show) {
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (Number.isFinite(toast.duration)) {
        toastTimer.current = setTimeout(() => {
          Animated.timing(toastOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start(() => hideToast());
        }, toast.duration || 3000);
      }
    } else {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [toast, hideToast, toastOpacity]);

  return (
    <>
      {isLoading ? <Loading /> : null}

      {alert.show ? (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/30 px-6">
          {(() => {
            const meta = ALERT_META[alert.type] || ALERT_META.info;
            return (
              <View className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg border border-gray-100">
                <View className="flex-row items-center space-x-2">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${meta.color}22` }}
                  >
                    <Icon icon={meta.icon} size={20} color={meta.color} />
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">
                    {alert.title}
                  </Text>
                </View>
                <Text className="mt-2 text-sm text-gray-700">
                  {alert.message}
                </Text>
                <View className="mt-4 flex-row justify-end space-x-2">
                  <Pressable
                    className="px-4 py-2 rounded-md"
                    style={{ backgroundColor: meta.color }}
                    onPress={() => {
                      if (typeof alert.onClick === "function") alert.onClick();
                      hideAlert();
                      if (typeof alert.onFocus === "function") {
                        setTimeout(() => alert.onFocus(), 0);
                      }
                    }}
                  >
                    <Text className="text-sm text-white">확인</Text>
                  </Pressable>
                </View>
              </View>
            );
          })()}
        </View>
      ) : null}

      {confirm.show ? (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/30 px-6">
          {(() => {
            const meta = ALERT_META[confirm.type] || ALERT_META.info;
            return (
              <View className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg border border-gray-100">
                <View className="flex-row items-center space-x-2">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${meta.color}22` }}
                  >
                    <Icon icon={meta.icon} size={20} color={meta.color} />
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">
                    {confirm.title}
                  </Text>
                </View>
                <Text className="mt-2 text-sm text-gray-700">
                  {confirm.message}
                </Text>
                <View className="mt-4 flex-row justify-end space-x-2">
                  <Pressable
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white active:bg-gray-100"
                    onPress={() => hideConfirm(false)}
                  >
                    <Text className="text-sm text-gray-800">
                      {confirm.cancelText}
                    </Text>
                  </Pressable>
                  <Pressable
                    className="px-4 py-2 rounded-md"
                    style={{ backgroundColor: meta.color }}
                    onPress={() => hideConfirm(true)}
                  >
                    <Text className="text-sm text-white">
                      {confirm.confirmText}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })()}
        </View>
      ) : null}

      {toast.show ? (
        <Animated.View
          pointerEvents="box-none"
          className="z-50"
          style={{
            position: Platform.OS === "web" ? "fixed" : "absolute",
            width: "100%",
            opacity: toastOpacity,
            ...getToastPositionStyle(toast.position),
          }}
        >
          {(() => {
            const meta = ALERT_META[toast.type] || ALERT_META.info;
            return (
              <View
                className="rounded-lg px-4 py-3 shadow-lg"
                style={{
                  backgroundColor: meta.color,
                  width: "100%",
                  maxWidth: 640,
                  alignSelf: "center",
                }}
              >
                <Text className="text-sm text-white">{toast.message}</Text>
              </View>
            );
          })()}
        </Animated.View>
      ) : null}
    </>
  );
};
