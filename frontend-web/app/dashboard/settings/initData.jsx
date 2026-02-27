/**
 * 파일명: dashboard/settings/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 설정 페이지 초기 설정
 */

import LANG_KO from "./lang.ko";

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

/**
 * @description 검색 파라미터에서 문자열 값을 안전하게 조회한다.
 * @returns {string}
 * @updated 2026-02-27
 */
const pickQueryValue = (searchParams, key) => {
  if (!searchParams || !key) return "";
  if (typeof searchParams.get === "function") {
    return String(searchParams.get(key) || "");
  }
  if (Array.isArray(searchParams[key])) return String(searchParams[key][0] || "");
  if (searchParams[key] == null) return "";
  return String(searchParams[key]);
};

/**
 * @description 검색 파라미터의 `tab` 값을 설정 화면 탭 키(profile/system)로 정규화한다.
 * 처리 규칙: 미지원 값이거나 비어 있으면 PROFILE 탭으로 기본 보정한다.
 * @returns {string} SETTINGS_TAB.PROFILE 또는 SETTINGS_TAB.SYSTEM
 * @updated 2026-02-27
 */
export const normalizeSettingsTab = (searchParams) => {
  const tab = pickQueryValue(searchParams, "tab").trim().toLowerCase();
  return tab === SETTINGS_TAB.SYSTEM ? SETTINGS_TAB.SYSTEM : SETTINGS_TAB.PROFILE;
};

/**
 * @description 탭 키(profile/system)를 Tab 컴포넌트 인덱스(0/1)로 변환한다.
 * 처리 규칙: system만 1로 매핑하고 나머지는 0으로 처리한다.
 * @returns {number} Tab 컴포넌트에서 사용하는 탭 인덱스
 * @updated 2026-02-27
 */
export const toSettingsTabIndex = (tab) => {
  return tab === SETTINGS_TAB.SYSTEM ? 1 : 0;
};

/**
 * @description 탭 인덱스를 URL query(`tab`) 값으로 직렬화한다.
 * 처리 규칙: 기본 탭(0)은 빈 문자열을 반환해 URL에서 query를 제거한다.
 * @returns {string} query `tab` 값(system) 또는 빈 문자열
 * @updated 2026-02-27
 */
export const toSettingsTabQueryValue = (tabIndex) => {
  return Number(tabIndex) === 1 ? SETTINGS_TAB.SYSTEM : "";
};

export const SYSTEM_SETTING_DEFAULT = {
  ...LANG_KO.initData.systemDefault,
};
