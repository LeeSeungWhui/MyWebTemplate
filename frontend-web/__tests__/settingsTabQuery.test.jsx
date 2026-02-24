/**
 * 파일명: __tests__/settingsTabQuery.test.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 대시보드 설정 탭 쿼리 정규화 유틸 테스트
 */

import {
  normalizeSettingsTab,
  SETTINGS_TAB,
  toSettingsTabIndex,
  toSettingsTabQueryValue,
} from "@/app/dashboard/settings/initData";

describe("settings tab query helpers", () => {
  test("tab 쿼리가 없거나 잘못되면 profile로 정규화한다", () => {
    expect(normalizeSettingsTab(new URLSearchParams())).toBe(
      SETTINGS_TAB.PROFILE
    );
    expect(normalizeSettingsTab(new URLSearchParams({ tab: "unknown" }))).toBe(
      SETTINGS_TAB.PROFILE
    );
  });

  test("tab=system이면 system으로 정규화한다", () => {
    expect(normalizeSettingsTab(new URLSearchParams({ tab: "system" }))).toBe(
      SETTINGS_TAB.SYSTEM
    );
  });

  test("탭 인덱스와 쿼리값 변환이 일관된다", () => {
    expect(toSettingsTabIndex(SETTINGS_TAB.PROFILE)).toBe(0);
    expect(toSettingsTabIndex(SETTINGS_TAB.SYSTEM)).toBe(1);
    expect(toSettingsTabQueryValue(0)).toBe("");
    expect(toSettingsTabQueryValue(1)).toBe("system");
  });
});
