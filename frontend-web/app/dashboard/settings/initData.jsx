/**
 * 파일명: dashboard/settings/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 설정 페이지 초기 설정
 */

export const PAGE_MODE = {
  MODE: "CSR",
  dynamic: "force-dynamic",
  runtime: "nodejs",
  revalidate: 0,
  fetchCache: "only-no-store",
  endPoints: {
    profileMe: "/api/v1/profile/me",
  },
};

export const SETTINGS_TAB = {
  PROFILE: "profile",
  SYSTEM: "system",
};

const pickQueryValue = (searchParams, key) => {
  if (!searchParams || !key) return "";
  if (typeof searchParams.get === "function") {
    return String(searchParams.get(key) || "");
  }
  const rawValue = searchParams[key];
  if (Array.isArray(rawValue)) return String(rawValue[0] || "");
  if (rawValue == null) return "";
  return String(rawValue);
};

export const normalizeSettingsTab = (searchParams) => {
  const tab = pickQueryValue(searchParams, "tab").trim().toLowerCase();
  return tab === SETTINGS_TAB.SYSTEM ? SETTINGS_TAB.SYSTEM : SETTINGS_TAB.PROFILE;
};

export const toSettingsTabIndex = (tab) => {
  return tab === SETTINGS_TAB.SYSTEM ? 1 : 0;
};

export const toSettingsTabQueryValue = (tabIndex) => {
  return Number(tabIndex) === 1 ? SETTINGS_TAB.SYSTEM : "";
};

export const SYSTEM_SETTING_DEFAULT = {
  siteName: "MyWebTemplate",
  maintenanceMode: false,
  sessionTimeoutMinutes: 60,
  maxUploadMb: 30,
};
