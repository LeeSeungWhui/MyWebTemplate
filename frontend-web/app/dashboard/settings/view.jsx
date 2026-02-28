"use client";
/**
 * 파일명: dashboard/settings/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 대시보드 설정 클라이언트 뷰(프로필/시스템설정 탭)
 */

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGlobalUi } from "@/app/common/store/SharedStore";
import Badge from "@/app/lib/component/Badge";
import Button from "@/app/lib/component/Button";
import Card from "@/app/lib/component/Card";
import Input from "@/app/lib/component/Input";
import NumberInput from "@/app/lib/component/NumberInput";
import Switch from "@/app/lib/component/Switch";
import Tab from "@/app/lib/component/Tab";
import { apiJSON } from "@/app/lib/runtime/api";
import {
  normalizeSettingsTab,
  PAGE_MODE,
  SYSTEM_SETTING_DEFAULT,
  toSettingsTabIndex,
  toSettingsTabQueryValue,
} from "./initData";
import LANG_KO from "./lang.ko";
import EasyObj from "@/app/lib/dataset/EasyObj";

/**
 * @description 설정 페이지의 프로필/시스템 탭 UI를 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: 프로필 API 응답은 profileMeObj에 복사하고 탭 상태는 query `tab`과 양방향 동기화한다.
 */
const SettingsView = () => {
  const defaultProfileObj = {
    userId: "",
    userNm: "",
    userEml: "",
    roleCd: "user",
    notifyEmail: false,
    notifySms: false,
    notifyPush: false,
  };

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast } = useGlobalUi();
  const profileMeObj = EasyObj({ ...defaultProfileObj });
  const ui = EasyObj({
    systemSetting: { ...SYSTEM_SETTING_DEFAULT },
    activeTabIndex: toSettingsTabIndex(normalizeSettingsTab(searchParams)),
    isLoadingProfile: true,
    isSavingProfile: false,
    isSavingSystem: false,
    error: null,
  });
  const endPoints = PAGE_MODE.endPoints || {};
  const hasProfileEndpoint = Boolean(endPoints.profileMe);

  useEffect(() => {
    const tabIndex = toSettingsTabIndex(normalizeSettingsTab(searchParams));
    if (ui.activeTabIndex !== tabIndex) {
      ui.activeTabIndex = tabIndex;
    }
  }, [searchParams?.toString(), ui]);

  /**
   * @description API 예외 객체를 화면 표시용 에러 메타로 정규화. 입력/출력 계약을 함께 명시
   * 반환값: message/requestId 필드를 갖는 단순 객체.
   * @updated 2026-02-27
   */
  const toApiError = (error, fallbackMessage) => ({
    message: error?.message || fallbackMessage,
    requestId: error?.requestId,
  });

  /**
   * @description 프로필 조회 API를 호출해 profileMeObj와 로딩/에러 상태를 갱신
   * 실패 동작: API 실패 시 ui.error에 message/requestId를 저장하고 로딩을 종료한다.
   * @updated 2026-02-27
   */
  const loadProfile = async () => {
    if (!hasProfileEndpoint) {
      ui.error = { message: LANG_KO.view.error.profileEndpointMissing };
      ui.isLoadingProfile = false;
      return;
    }
    ui.isLoadingProfile = true;
    ui.error = null;
    try {
      const response = await apiJSON(endPoints.profileMe);
      const next = response?.result || {};
      profileMeObj.copy({
        userId: next?.userId || "",
        userNm: next?.userNm || "",
        userEml: next?.userEml || "",
        roleCd: next?.roleCd || "user",
        notifyEmail: Boolean(next?.notifyEmail),
        notifySms: Boolean(next?.notifySms),
        notifyPush: Boolean(next?.notifyPush),
      });
    } catch (err) {
      console.error(LANG_KO.view.error.profileLoadFailed, err);
      ui.error = toApiError(err, LANG_KO.view.error.profileLoadFailed);
    } finally {
      ui.isLoadingProfile = false;
    }
  };

  useEffect(() => {
    loadProfile();
  }, [hasProfileEndpoint]);

  /**
   * @description 탭 인덱스를 URL query(`tab`) 값으로 동기화
   * 처리 규칙: 기본 탭은 query를 제거하고, 비기본 탭은 replace(스크롤 유지)로 반영한다.
   * @updated 2026-02-27
   */
  const syncTabQuery = (nextTabIndex) => {
    if (!pathname) return;
    const queryValue = toSettingsTabQueryValue(nextTabIndex);
    const nextParams = new URLSearchParams(searchParams?.toString() || "");
    if (queryValue) {
      nextParams.set("tab", queryValue);
    } else {
      nextParams.delete("tab");
    }
    const nextQuery = nextParams.toString();
    const href = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(href, { scroll: false });
  };

  /**
   * @description 탭 변경 이벤트를 받아 상태와 URL 쿼리를 함께 갱신
   * 처리 규칙: 허용 인덱스(0/1) 외 값은 0으로 보정한다.
   * @updated 2026-02-27
   */
  const handleTabChange = (nextValue) => {
    const nextTabIndex = Number(nextValue) === 1 ? 1 : 0;
    ui.activeTabIndex = nextTabIndex;
    syncTabQuery(nextTabIndex);
  };

  /**
   * @description 프로필 저장 요청을 수행하고 성공 시 화면 모델을 서버 응답으로 동기화
   * 실패 동작: 이름 길이 검증 실패 또는 API 오류 시 토스트와 ui.error를 설정한다.
   * @updated 2026-02-27
   */
  const saveProfile = async () => {
    if (!hasProfileEndpoint) {
      showToast(LANG_KO.view.error.profileEndpointMissing, { type: "error" });
      return;
    }
    if (String(profileMeObj.userNm || "").trim().length < 2) {
      showToast(LANG_KO.view.validation.nameMinLength, { type: "warning" });
      return;
    }
    ui.isSavingProfile = true;
    ui.error = null;
    try {
      const response = await apiJSON(endPoints.profileMe, {
        method: "PUT",
        body: {
          userNm: String(profileMeObj.userNm || "").trim(),
          notifyEmail: Boolean(profileMeObj.notifyEmail),
          notifySms: Boolean(profileMeObj.notifySms),
          notifyPush: Boolean(profileMeObj.notifyPush),
        },
      });
      const next = response?.result || {};
      profileMeObj.copy({
        userId: profileMeObj.userId || "",
        userNm: next?.userNm || profileMeObj.userNm || "",
        userEml: profileMeObj.userEml || "",
        roleCd: profileMeObj.roleCd || "user",
        notifyEmail: Boolean(next?.notifyEmail),
        notifySms: Boolean(next?.notifySms),
        notifyPush: Boolean(next?.notifyPush),
      });
      showToast(LANG_KO.view.toast.profileSaved, { type: "success" });
    } catch (err) {
      console.error(LANG_KO.view.error.profileSaveFailed, err);
      ui.error = toApiError(err, LANG_KO.view.error.profileSaveFailed);
      showToast(err?.message || LANG_KO.view.error.profileSaveFailed, { type: "error" });
    } finally {
      ui.isSavingProfile = false;
    }
  };

  /**
   * @description 시스템 설정 저장 시뮬레이션을 수행하고 저장 상태 표시를 관리
   * 부작용: ui.isSavingSystem true/false 전환 및 성공 토스트를 발생시킨다.
   * @updated 2026-02-27
   */
  const saveSystemSetting = async () => {
    ui.isSavingSystem = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      showToast(LANG_KO.view.toast.systemSaved, { type: "success" });
    } finally {
      ui.isSavingSystem = false;
    }
  };

  return (
    <div className="space-y-3">
      {ui.error?.message ? (
        <section aria-label={LANG_KO.view.error.profileLoadFailed}>
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <div>{ui.error.message}</div>
            {ui.error.requestId ? (
              <div className="mt-1 text-xs text-red-700/80">
                {LANG_KO.view.error.requestIdLabel}: {ui.error.requestId}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <Card title={LANG_KO.view.card.title}>
        <Tab
          key={`settings-tab-${ui.activeTabIndex}`}
          tabIndex={ui.activeTabIndex}
          onValueChange={handleTabChange}
        >
          <Tab.Item title={LANG_KO.view.tab.profile}>
            <div className="space-y-3">
              {ui.isLoadingProfile ? (
                <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
                  {LANG_KO.view.profile.loading}
                </div>
              ) : (
                <>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-gray-700">{LANG_KO.view.profile.nameLabel}</span>
                    <Input
                      value={profileMeObj.userNm}
                      onChange={(event) => {
                        profileMeObj.userNm = event.target.value;
                      }}
                      placeholder={LANG_KO.view.profile.namePlaceholder}
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-gray-700">{LANG_KO.view.profile.emailLabel}</span>
                    <Input value={profileMeObj.userEml} readOnly />
                  </label>

                  <div className="space-y-1">
                    <span className="text-sm font-medium text-gray-700">{LANG_KO.view.profile.roleLabel}</span>
                    <div>
                      <Badge variant={LANG_KO.view.roleBadge[profileMeObj.roleCd] || "neutral"} pill>
                        {profileMeObj.roleCd || "user"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">{LANG_KO.view.profile.notifyLabel}</span>
                    <div className="flex flex-wrap gap-4">
                      <Switch
                        label={LANG_KO.view.profile.notifyEmailLabel}
                        checked={Boolean(profileMeObj.notifyEmail)}
                        onChange={(event) => {
                          profileMeObj.notifyEmail = event.target.checked;
                        }}
                      />
                      <Switch
                        label={LANG_KO.view.profile.notifySmsLabel}
                        checked={Boolean(profileMeObj.notifySms)}
                        onChange={(event) => {
                          profileMeObj.notifySms = event.target.checked;
                        }}
                      />
                      <Switch
                        label={LANG_KO.view.profile.notifyPushLabel}
                        checked={Boolean(profileMeObj.notifyPush)}
                        onChange={(event) => {
                          profileMeObj.notifyPush = event.target.checked;
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2">
                <Button onClick={saveProfile} loading={ui.isSavingProfile || ui.isLoadingProfile} className="w-full sm:w-auto">
                  {LANG_KO.view.profile.saveButton}
                </Button>
              </div>
            </div>
          </Tab.Item>

          <Tab.Item title={LANG_KO.view.tab.system}>
            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.system.siteNameLabel}</span>
                <Input
                  value={ui.systemSetting.siteName}
                  onChange={(event) => {
                    ui.systemSetting.siteName = event.target.value;
                  }}
                />
              </label>

              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.system.maintenanceModeLabel}</span>
                <Switch
                  label={ui.systemSetting.maintenanceMode ? LANG_KO.view.system.maintenanceActive : LANG_KO.view.system.maintenanceInactive}
                  checked={Boolean(ui.systemSetting.maintenanceMode)}
                  onChange={(event) => {
                    ui.systemSetting.maintenanceMode = event.target.checked;
                  }}
                />
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.system.sessionTimeoutLabel}</span>
                <NumberInput
                  value={ui.systemSetting.sessionTimeoutMinutes}
                  min={5}
                  step={5}
                  onChange={(event) => {
                    ui.systemSetting.sessionTimeoutMinutes = Number(
                      event?.target?.value || 5,
                    );
                  }}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.system.maxUploadLabel}</span>
                <NumberInput
                  value={ui.systemSetting.maxUploadMb}
                  min={1}
                  step={1}
                  onChange={(event) => {
                    ui.systemSetting.maxUploadMb = Number(event?.target?.value || 1);
                  }}
                />
              </label>

              <div className="pt-2">
                <Button onClick={saveSystemSetting} loading={ui.isSavingSystem} className="w-full sm:w-auto">
                  {LANG_KO.view.system.saveButton}
                </Button>
              </div>
            </div>
          </Tab.Item>
        </Tab>
      </Card>
    </div>
  );
};

export default SettingsView;
