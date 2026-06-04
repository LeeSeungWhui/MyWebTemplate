"use client";

/**
 * 파일명: dashboard/settings/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: 대시보드 설정 클라이언트 뷰(프로필/시스템설정 탭)
 */

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGlobalUi } from "@/app/common/store/SharedStore";
import { normalizePageConfig } from "@/app/lib/runtime/pageData";
import { usePageData } from "@/app/lib/hooks/usePageData";
import Badge from "@/app/lib/component/Badge";
import Button from "@/app/lib/component/Button";
import Card from "@/app/lib/component/Card";
import Input from "@/app/lib/component/Input";
import NumberInput from "@/app/lib/component/NumberInput";
import Switch from "@/app/lib/component/Switch";
import Tab from "@/app/lib/component/Tab";
import { apiJSON } from "@/app/lib/runtime/api";
import { PAGE_CONFIG } from "./initData";
import LANG_KO from "./lang.ko";
import EasyObj from "@/app/lib/dataset/EasyObj";

/**
 * @description 설정 페이지의 프로필/시스템 탭 UI를 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: 프로필 API 응답은 profileMeObj에 복사하고 탭 상태는 query `tab`과 양방향 동기화한다.
 */
const SettingsView = ({ initialDataObj, initialErrorObj }) => {

  /* 1. 상수 ======================================================================================================================= */
  const settingsTabObj = {
    PROFILE: "profile",
    SYSTEM: "system",
  };
  const systemSettingSeedObj = {
    ...LANG_KO.initData.systemDefault,
  };
  const defaultProfileObj = {
    userId: "",
    userNm: "",
    userEml: "",
    roleCd: "user",
    notifyEmail: false,
    notifySms: false,
    notifyPush: false,
  };

  /* 2. 데이터 ======================================================================================================================= */
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamText = searchParams?.toString() || "";
  const { showToast } = useGlobalUi();
  const pageApi = PAGE_CONFIG.API || {};
  const hasProfileEndpoint = Boolean(pageApi.profileMe);
  const hasSystemEndpoint = Boolean(pageApi.settingsUpdate);
  const profileMeObj = EasyObj({ ...defaultProfileObj });
  const ui = EasyObj({
    systemSetting: { ...systemSettingSeedObj },
    activeTabIndex: 0,
    isLoadingProfile: true,
    isSavingProfile: false,
    isSavingSystem: false,
    error: null,
  });
  const pageMode = normalizePageConfig(PAGE_CONFIG).MODE;
  const { dataObj, errorObj, isLoading: pageLoading } = usePageData({
    pageConfig: PAGE_CONFIG,
    initialDataObj,
    initialErrorObj,
  });

  /* 3. UI ========================================================================================================================= */

  // 없음

  /* 4. 팝업 ======================================================================================================================= */

  // 없음

  /* 5. 기타 ======================================================================================================================= */

  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */

  /**
   * @description 탭 인덱스를 URL query(`tab`) 값으로 동기화
   * 처리 규칙: 기본 탭은 query를 제거하고, 비기본 탭은 replace(스크롤 유지)로 반영한다.
   * @updated 2026-02-27
   */
  const syncTabQuery = (nextTabIndex) => {
    if (!pathname) return;
    const nextQueryValue = Number(nextTabIndex) === 1 ? settingsTabObj.SYSTEM : "";
    const nextParams = new URLSearchParams(searchParams?.toString() || "");
    if (nextQueryValue) {
      nextParams.set("tab", nextQueryValue);
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
      const profileResponse = await apiJSON(pageApi.profileMe, {
        method: "PUT",
        body: {
          userNm: String(profileMeObj.userNm || "").trim(),
          notifyEmail: Boolean(profileMeObj.notifyEmail),
          notifySms: Boolean(profileMeObj.notifySms),
          notifyPush: Boolean(profileMeObj.notifyPush),
        },
      });
      profileMeObj.copy(profileResponse?.result || {});
      showToast(LANG_KO.view.toast.profileSaved, { type: "success" });
    } catch (err) {
      ui.error = {
        message: err?.message || LANG_KO.view.error.profileSaveFailed,
        requestId: err?.requestId,
      };
      showToast(err?.message || LANG_KO.view.error.profileSaveFailed, { type: "error" });
    } finally {
      ui.isSavingProfile = false;
    }
  };

  /**
   * @description 시스템 설정 저장 API를 호출하고 저장 상태 표시를 관리
   * 실패 동작: API 미연동 또는 저장 실패 시 에러 토스트를 노출한다.
   * @updated 2026-02-27
   */
  const saveSystemSetting = async () => {
    if (!hasSystemEndpoint) {
      showToast(LANG_KO.view.error.systemEndpointMissing, { type: "error" });
      return;
    }
    ui.isSavingSystem = true;
    try {
      await apiJSON(pageApi.settingsUpdate, {
        method: "PUT",
        body: {
          siteName: String(ui.systemSetting.siteName || "").trim(),
          adminEmail: String(profileMeObj.userEml || "").trim(),
          maintenanceMode: Boolean(ui.systemSetting.maintenanceMode),
          sessionTimeout: Number(ui.systemSetting.sessionTimeoutMinutes || 0),
          maxUploadMb: Number(ui.systemSetting.maxUploadMb || 0),
        },
      });
      showToast(LANG_KO.view.toast.systemSaved, { type: "success" });
    } catch (err) {
      showToast(err?.message || LANG_KO.view.error.systemSaveFailed, { type: "error" });
    } finally {
      ui.isSavingSystem = false;
    }
  };

  /* 8. useEffect ================================================================================================================== */
  /**
   * @description URL query 변경 시 탭 인덱스를 화면 상태와 동기화
   * 처리 규칙: 동일 인덱스면 상태 갱신을 생략한다.
   */
  useEffect(() => {
    const queryTab = String(searchParams?.get("tab") || "").trim().toLowerCase();
    const nextTabIndex = queryTab === settingsTabObj.SYSTEM ? 1 : 0;
    if (ui.activeTabIndex !== nextTabIndex) {
      ui.activeTabIndex = nextTabIndex;
    }
  }, [searchParams, searchParamText, settingsTabObj.SYSTEM, ui]);

  /**
   * @description 페이지 자동 로더 상태를 프로필 로딩 플래그와 에러로 반영
   * 처리 규칙: INIT_API profileMe 성공 시 모델 copy, 실패 시 ui.error를 표준 에러 형태로 저장한다.
   */
  useEffect(() => {
    ui.isLoadingProfile = Boolean(pageLoading);
    if (!hasProfileEndpoint) {
      ui.error = { message: LANG_KO.view.error.profileEndpointMissing };
      ui.isLoadingProfile = false;
      return;
    }
    if (errorObj?.profileMe) {
      ui.error = {
        message: errorObj.profileMe?.message || LANG_KO.view.error.profileLoadFailed,
        requestId: errorObj.profileMe?.requestId,
      };
      ui.isLoadingProfile = false;
      return;
    }
    if (dataObj?.profileMe?.result) {
      profileMeObj.copy(dataObj.profileMe.result);
      ui.error = null;
    }
  }, [dataObj?.profileMe?.result, errorObj?.profileMe, hasProfileEndpoint, pageLoading, profileMeObj, ui]);

  /* 9. 내부 컴포넌트 ============================================================================================================== */

  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  return (
    <div className="space-y-3" data-page-mode={pageMode}>
      {ui.error?.message && (
        <section aria-label={LANG_KO.view.error.profileLoadFailed}>
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <div>{ui.error.message}</div>
            {ui.error.requestId && (
              <div className="mt-1 text-xs text-red-700/80">
                {LANG_KO.view.error.requestIdLabel}: {ui.error.requestId}
              </div>
            )}
          </div>
        </section>
      )}

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
                      dataObj={profileMeObj}
                      dataKey="userNm"
                      placeholder={LANG_KO.view.profile.namePlaceholder}
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-gray-700">{LANG_KO.view.profile.emailLabel}</span>
                    <Input dataObj={profileMeObj} dataKey="userEml" readOnly />
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
                        dataObj={profileMeObj}
                        dataKey="notifyEmail"
                      />
                      <Switch
                        label={LANG_KO.view.profile.notifySmsLabel}
                        dataObj={profileMeObj}
                        dataKey="notifySms"
                      />
                      <Switch
                        label={LANG_KO.view.profile.notifyPushLabel}
                        dataObj={profileMeObj}
                        dataKey="notifyPush"
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
                  dataObj={ui}
                  dataKey="systemSetting.siteName"
                />
              </label>

              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.system.maintenanceModeLabel}</span>
                <Switch
                  label={ui.systemSetting.maintenanceMode ? LANG_KO.view.system.maintenanceActive : LANG_KO.view.system.maintenanceInactive}
                  dataObj={ui}
                  dataKey="systemSetting.maintenanceMode"
                />
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.system.sessionTimeoutLabel}</span>
                <NumberInput
                  dataObj={ui}
                  dataKey="systemSetting.sessionTimeoutMinutes"
                  min={5}
                  step={5}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.system.maxUploadLabel}</span>
                <NumberInput
                  dataObj={ui}
                  dataKey="systemSetting.maxUploadMb"
                  min={1}
                  step={1}
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
