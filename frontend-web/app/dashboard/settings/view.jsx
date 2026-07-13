"use client";

/**
 * 파일명: dashboard/settings/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: 대시보드 설정 클라이언트 뷰(프로필/시스템설정 탭)
 */

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGlobalUi, useUser } from "@/app/common/store/SharedStore";
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
  const { setUser } = useUser();
  const pageApi = PAGE_CONFIG.API || {};
  const hasProfileEndpoint = Boolean(pageApi.profileMe);
  const hasPasswordChangeEndpoint = Boolean(pageApi.passwordChange);
  const hasSystemEndpoint = Boolean(pageApi.settingsUpdate);
  const profileMeObj = EasyObj({ ...defaultProfileObj });
  const ui = EasyObj({
    systemSetting: { ...systemSettingSeedObj },
    activeTabIndex: 0,
    isLoadingProfile: true,
    isSavingProfile: false,
    isChangingPassword: false,
    isPasswordChangeBlocked: false,
    passwordForm: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
    passwordErrors: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
    passwordStatus: {
      message: "",
      code: "",
      requestId: "",
    },
    isSavingSystem: false,
    error: null,
  });
  const pageMode = normalizePageConfig(PAGE_CONFIG).MODE;
  const { dataObj, errorObj, isLoading: pageLoading } = usePageData({
    pageConfig: PAGE_CONFIG,
    initialDataObj,
    initialErrorObj,
  });
  const uiRef = useRef(ui);
  const profileMeObjRef = useRef(profileMeObj);
  const dataObjRef = useRef(dataObj);
  const errorObjRef = useRef(errorObj);
  const currentPasswordInputRef = useRef(null);
  const newPasswordInputRef = useRef(null);
  const newPasswordConfirmInputRef = useRef(null);
  const passwordFocusFrameRef = useRef(null);
  const passwordSubmitGuardRef = useRef(false);
  const profileResultRevision = JSON.stringify(dataObj?.profileMe?.result ?? null);
  const profileErrorRevision = JSON.stringify(errorObj?.profileMe ?? null);

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
      profileMeObj.copy(profileResponse?.result ?? {});
      showToast(LANG_KO.view.toast.profileSaved, { type: "success" });
    } catch (err) {
      ui.error = {
        message: LANG_KO.view.error.profileSaveFailed,
        code: err?.code,
        requestId: err?.requestId,
      };
      showToast(LANG_KO.view.error.profileSaveFailed, { type: "error" });
    } finally {
      ui.isSavingProfile = false;
    }
  };

  const emptyPasswordErrors = () => ({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const emptyPasswordStatus = () => ({
    message: "",
    code: "",
    requestId: "",
  });

  const normalizeSafeDiagnostic = (value) => {
    const diagnosticText = typeof value === "string" ? value : "";
    return /^[A-Za-z0-9_.:-]{1,120}$/.test(diagnosticText) ? diagnosticText : "";
  };

  const setPasswordStatus = (message, diagnosticSource) => {
    ui.passwordStatus = {
      message,
      code: normalizeSafeDiagnostic(diagnosticSource?.code),
      requestId: normalizeSafeDiagnostic(diagnosticSource?.requestId),
    };
  };

  const focusPasswordField = (fieldName) => {
    const inputRefMap = {
      currentPassword: currentPasswordInputRef,
      newPassword: newPasswordInputRef,
      newPasswordConfirm: newPasswordConfirmInputRef,
    };
    const inputIdMap = {
      currentPassword: "settings-current-password",
      newPassword: "settings-new-password",
      newPasswordConfirm: "settings-new-password-confirm",
    };
    cancelAnimationFrame(passwordFocusFrameRef.current);
    passwordFocusFrameRef.current = requestAnimationFrame(() => {
      passwordFocusFrameRef.current = requestAnimationFrame(() => {
        const liveInput = typeof document !== "undefined"
          ? document.getElementById(inputIdMap[fieldName])
          : null;
        (liveInput || inputRefMap[fieldName]?.current)?.focus();
      });
    });
  };

  const validatePasswordChange = () => {
    const currentPassword = String(ui.passwordForm.currentPassword || "");
    const newPassword = String(ui.passwordForm.newPassword || "");
    const newPasswordConfirm = String(ui.passwordForm.newPasswordConfirm || "");
    const nextErrors = emptyPasswordErrors();

    if (!currentPassword) {
      nextErrors.currentPassword = LANG_KO.view.validation.currentPasswordRequired;
    }
    if (!newPassword) {
      nextErrors.newPassword = LANG_KO.view.validation.newPasswordRequired;
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = LANG_KO.view.validation.newPasswordMinLength;
    } else if (newPassword === currentPassword) {
      nextErrors.newPassword = LANG_KO.view.validation.newPasswordMustDiffer;
    }
    if (!newPasswordConfirm) {
      nextErrors.newPasswordConfirm = LANG_KO.view.validation.newPasswordConfirmRequired;
    } else if (newPasswordConfirm !== newPassword) {
      nextErrors.newPasswordConfirm = LANG_KO.view.validation.newPasswordConfirmMismatch;
    }

    ui.passwordErrors = nextErrors;
    const firstErrorField = ["currentPassword", "newPassword", "newPasswordConfirm"]
      .find((fieldName) => Boolean(nextErrors[fieldName]));
    if (firstErrorField) {
      setPasswordStatus(nextErrors[firstErrorField]);
      focusPasswordField(firstErrorField);
      return null;
    }

    ui.passwordStatus = emptyPasswordStatus();
    return { currentPassword, newPassword };
  };

  const handlePasswordFieldChange = (fieldName) => {
    if (ui.passwordErrors[fieldName]) {
      ui.passwordErrors[fieldName] = "";
    }
    if (ui.passwordStatus.message) {
      ui.passwordStatus = emptyPasswordStatus();
    }
  };

  /**
   * @description 인증된 사용자의 현재 비밀번호를 확인하고 새 비밀번호로 변경
   * 처리 규칙: client validation과 동기 제출 guard를 통과한 경우에만 비밀번호 두 필드만 전송한다.
   */
  const changePassword = async () => {
    if (passwordSubmitGuardRef.current || ui.isPasswordChangeBlocked) return;
    if (!hasPasswordChangeEndpoint) {
      setPasswordStatus(LANG_KO.view.error.passwordChangeEndpointMissing);
      return;
    }

    const passwordPayload = validatePasswordChange();
    if (!passwordPayload) return;

    passwordSubmitGuardRef.current = true;
    ui.isChangingPassword = true;
    let passwordChanged = false;
    try {
      const passwordResponse = await apiJSON(pageApi.passwordChange, {
        method: "POST",
        body: passwordPayload,
      });
      if (passwordResponse?.result?.changed !== true) {
        setPasswordStatus(LANG_KO.view.error.passwordChangeMalformedResponse, passwordResponse);
        return;
      }

      passwordChanged = true;
      ui.passwordForm.currentPassword = "";
      ui.passwordForm.newPassword = "";
      ui.passwordForm.newPasswordConfirm = "";
      ui.passwordErrors = emptyPasswordErrors();
      ui.passwordStatus = emptyPasswordStatus();
      ui.isPasswordChangeBlocked = true;
      setUser(null);
      showToast(LANG_KO.view.toast.passwordChanged, { type: "success" });
      router.replace("/login");
    } catch (err) {
      if (passwordChanged) return;
      const errorCode = typeof err?.code === "string" ? err.code : "";
      const errorStatus = Number(err?.status ?? err?.statusCode ?? 0);
      ui.passwordErrors = emptyPasswordErrors();
      if (errorCode === "AUTH_400_CURRENT_PASSWORD_INVALID") {
        ui.passwordForm.newPassword = "";
        ui.passwordForm.newPasswordConfirm = "";
        ui.passwordErrors.currentPassword = LANG_KO.view.error.currentPasswordInvalid;
        setPasswordStatus(LANG_KO.view.error.currentPasswordInvalid, err);
        focusPasswordField("currentPassword");
      } else if (errorStatus === 422 || errorCode.includes("_422_")) {
        setPasswordStatus(LANG_KO.view.error.passwordChangeInvalid, err);
      } else if (errorStatus === 503 || errorCode.includes("_503_")) {
        setPasswordStatus(LANG_KO.view.error.passwordChangeUnavailable, err);
      } else {
        setPasswordStatus(LANG_KO.view.error.passwordChangeFailed, err);
      }
    } finally {
      ui.isChangingPassword = false;
      if (!passwordChanged) {
        passwordSubmitGuardRef.current = false;
      }
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
    ui.error = null;
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
      ui.error = {
        message: LANG_KO.view.error.systemSaveFailed,
        code: err?.code,
        requestId: err?.requestId,
      };
      showToast(LANG_KO.view.error.systemSaveFailed, { type: "error" });
    } finally {
      ui.isSavingSystem = false;
    }
  };

  /* 8. useEffect ================================================================================================================== */
  useEffect(() => () => cancelAnimationFrame(passwordFocusFrameRef.current), []);

  /**
   * @description URL query 변경 시 탭 인덱스를 화면 상태와 동기화
   * 처리 규칙: 동일 인덱스면 상태 갱신을 생략한다.
   */
  useEffect(() => {
    const queryTab = String(searchParams?.get("tab") || "").trim().toLowerCase();
    const nextTabIndex = queryTab === settingsTabObj.SYSTEM ? 1 : 0;
    if (uiRef.current.activeTabIndex !== nextTabIndex) {
      uiRef.current.activeTabIndex = nextTabIndex;
    }
  }, [searchParams, searchParamText, settingsTabObj.SYSTEM]);

  /**
   * @description 페이지 자동 로더 상태를 프로필 로딩 플래그와 에러로 반영
   * 처리 규칙: INIT_API profileMe 성공 시 모델 copy, 실패 시 ui.error를 표준 에러 형태로 저장한다.
   */
  useEffect(() => {
    const currentUi = uiRef.current;
    const currentError = errorObjRef.current?.profileMe;
    const currentResult = dataObjRef.current?.profileMe?.result;
    currentUi.isLoadingProfile = Boolean(pageLoading);
    if (!hasProfileEndpoint) {
      currentUi.error = { message: LANG_KO.view.error.profileEndpointMissing };
      currentUi.isLoadingProfile = false;
      return;
    }
    if (currentError) {
      currentUi.error = {
        message: LANG_KO.view.error.profileLoadFailed,
        code: currentError?.code,
        requestId: currentError?.requestId,
      };
      currentUi.isLoadingProfile = false;
      return;
    }
    if (currentResult) {
      profileMeObjRef.current.copy(currentResult);
      currentUi.error = null;
    }
  }, [hasProfileEndpoint, pageLoading, profileErrorRevision, profileResultRevision]);

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
            {ui.error.code && (
              <div className="mt-1 text-xs text-red-700/80">
                {LANG_KO.view.error.codeLabel}: {ui.error.code}
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

              <section className="border-t border-gray-200 pt-4" aria-labelledby="settings-password-change-title">
                <div className="space-y-1">
                  <h3 id="settings-password-change-title" className="text-sm font-semibold text-gray-900">
                    {LANG_KO.view.profile.passwordChangeTitle}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {LANG_KO.view.profile.passwordChangeDescription}
                  </p>
                </div>

                <form
                  className="mt-3 space-y-3"
                  aria-labelledby="settings-password-change-title"
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    void changePassword();
                  }}
                >
                  <label className="block space-y-1" htmlFor="settings-current-password">
                    <span className="text-sm font-medium text-gray-700">
                      {LANG_KO.view.profile.currentPasswordLabel}
                    </span>
                    <Input
                      ref={currentPasswordInputRef}
                      id="settings-current-password"
                      dataObj={ui}
                      dataKey="passwordForm.currentPassword"
                      type="password"
                      autoComplete="current-password"
                      disabled={ui.isChangingPassword || ui.isPasswordChangeBlocked}
                      error={ui.passwordErrors.currentPassword}
                      onValueChange={() => handlePasswordFieldChange("currentPassword")}
                    />
                  </label>

                  <label className="block space-y-1" htmlFor="settings-new-password">
                    <span className="text-sm font-medium text-gray-700">
                      {LANG_KO.view.profile.newPasswordLabel}
                    </span>
                    <Input
                      ref={newPasswordInputRef}
                      id="settings-new-password"
                      dataObj={ui}
                      dataKey="passwordForm.newPassword"
                      type="password"
                      autoComplete="new-password"
                      disabled={ui.isChangingPassword || ui.isPasswordChangeBlocked}
                      error={ui.passwordErrors.newPassword}
                      onValueChange={() => handlePasswordFieldChange("newPassword")}
                    />
                  </label>

                  <label className="block space-y-1" htmlFor="settings-new-password-confirm">
                    <span className="text-sm font-medium text-gray-700">
                      {LANG_KO.view.profile.newPasswordConfirmLabel}
                    </span>
                    <Input
                      ref={newPasswordConfirmInputRef}
                      id="settings-new-password-confirm"
                      dataObj={ui}
                      dataKey="passwordForm.newPasswordConfirm"
                      type="password"
                      autoComplete="new-password"
                      disabled={ui.isChangingPassword || ui.isPasswordChangeBlocked}
                      error={ui.passwordErrors.newPasswordConfirm}
                      onValueChange={() => handlePasswordFieldChange("newPasswordConfirm")}
                    />
                  </label>

                  {ui.passwordStatus.message && (
                    <div
                      className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                      role="status"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      <div>{ui.passwordStatus.message}</div>
                      {ui.passwordStatus.requestId && (
                        <div className="mt-1 text-xs text-red-700/80">
                          {LANG_KO.view.error.requestIdLabel}: {ui.passwordStatus.requestId}
                        </div>
                      )}
                      {ui.passwordStatus.code && (
                        <div className="mt-1 text-xs text-red-700/80">
                          {LANG_KO.view.error.codeLabel}: {ui.passwordStatus.code}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-1">
                    <Button
                      type="submit"
                      loading={ui.isChangingPassword}
                      disabled={ui.isPasswordChangeBlocked}
                      className="w-full sm:w-auto"
                    >
                      {LANG_KO.view.profile.passwordChangeButton}
                    </Button>
                  </div>
                </form>
              </section>
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
