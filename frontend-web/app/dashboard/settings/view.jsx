"use client";
/**
 * 파일명: dashboard/settings/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 대시보드 설정 클라이언트 뷰(프로필/시스템설정 탭)
 */

import { useEffect, useMemo } from "react";
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

const { view: viewText } = LANG_KO;
const ROLE_BADGE_VARIANT = viewText.roleBadge;

const toApiError = (error, fallbackMessage) => ({
  message: error?.message || fallbackMessage,
  requestId: error?.requestId,
});

const createDefaultProfile = () => ({
  userId: "",
  userNm: "",
  userEml: "",
  roleCd: "user",
  notifyEmail: false,
  notifySms: false,
  notifyPush: false,
});

const SettingsView = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast } = useGlobalUi();
  const ui = EasyObj(
    useMemo(
      () => ({
        profile: createDefaultProfile(),
        systemSetting: { ...SYSTEM_SETTING_DEFAULT },
        activeTabIndex: toSettingsTabIndex(normalizeSettingsTab(searchParams)),
        isLoadingProfile: true,
        isSavingProfile: false,
        isSavingSystem: false,
        error: null,
      }),
      [],
    ),
  );
  const endPoints = PAGE_MODE.endPoints || {};
  const hasProfileEndpoint = Boolean(endPoints.profileMe);

  useEffect(() => {
    const tabIndex = toSettingsTabIndex(normalizeSettingsTab(searchParams));
    if (ui.activeTabIndex !== tabIndex) {
      ui.activeTabIndex = tabIndex;
    }
  }, [searchParams?.toString(), ui]);

  const loadProfile = async () => {
    if (!hasProfileEndpoint) {
      ui.error = { message: viewText.error.profileEndpointMissing };
      ui.isLoadingProfile = false;
      return;
    }
    ui.isLoadingProfile = true;
    ui.error = null;
    try {
      const response = await apiJSON(endPoints.profileMe);
      const next = response?.result || {};
      ui.profile = {
        userId: next?.userId || "",
        userNm: next?.userNm || "",
        userEml: next?.userEml || "",
        roleCd: next?.roleCd || "user",
        notifyEmail: Boolean(next?.notifyEmail),
        notifySms: Boolean(next?.notifySms),
        notifyPush: Boolean(next?.notifyPush),
      };
    } catch (err) {
      console.error(viewText.error.profileLoadFailed, err);
      ui.error = toApiError(err, viewText.error.profileLoadFailed);
    } finally {
      ui.isLoadingProfile = false;
    }
  };

  useEffect(() => {
    loadProfile();
  }, [hasProfileEndpoint]);

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

  const handleTabChange = (nextValue) => {
    const nextTabIndex = Number(nextValue) === 1 ? 1 : 0;
    ui.activeTabIndex = nextTabIndex;
    syncTabQuery(nextTabIndex);
  };

  const saveProfile = async () => {
    if (!hasProfileEndpoint) {
      showToast(viewText.error.profileEndpointMissing, { type: "error" });
      return;
    }
    if (String(ui.profile.userNm || "").trim().length < 2) {
      showToast(viewText.validation.nameMinLength, { type: "warning" });
      return;
    }
    ui.isSavingProfile = true;
    ui.error = null;
    try {
      const response = await apiJSON(endPoints.profileMe, {
        method: "PUT",
        body: {
          userNm: String(ui.profile.userNm || "").trim(),
          notifyEmail: Boolean(ui.profile.notifyEmail),
          notifySms: Boolean(ui.profile.notifySms),
          notifyPush: Boolean(ui.profile.notifyPush),
        },
      });
      const next = response?.result || {};
      ui.profile = {
        ...ui.profile,
        userNm: next?.userNm || ui.profile.userNm,
        notifyEmail: Boolean(next?.notifyEmail),
        notifySms: Boolean(next?.notifySms),
        notifyPush: Boolean(next?.notifyPush),
      };
      showToast(viewText.toast.profileSaved, { type: "success" });
    } catch (err) {
      console.error(viewText.error.profileSaveFailed, err);
      ui.error = toApiError(err, viewText.error.profileSaveFailed);
      showToast(err?.message || viewText.error.profileSaveFailed, { type: "error" });
    } finally {
      ui.isSavingProfile = false;
    }
  };

  const saveSystemSetting = async () => {
    ui.isSavingSystem = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      showToast(viewText.toast.systemSaved, { type: "success" });
    } finally {
      ui.isSavingSystem = false;
    }
  };

  return (
    <div className="space-y-3">
      {ui.error?.message ? (
        <section aria-label={viewText.error.profileLoadFailed}>
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <div>{ui.error.message}</div>
            {ui.error.requestId ? (
              <div className="mt-1 text-xs text-red-700/80">requestId: {ui.error.requestId}</div>
            ) : null}
          </div>
        </section>
      ) : null}

      <Card title={viewText.card.title}>
        <Tab
          key={`settings-tab-${ui.activeTabIndex}`}
          tabIndex={ui.activeTabIndex}
          onValueChange={handleTabChange}
        >
          <Tab.Item title={viewText.tab.profile}>
            <div className="space-y-3">
              {ui.isLoadingProfile ? (
                <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
                  {viewText.profile.loading}
                </div>
              ) : (
                <>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-gray-700">{viewText.profile.nameLabel}</span>
                    <Input
                      value={ui.profile.userNm}
                      onChange={(event) => {
                        ui.profile.userNm = event.target.value;
                      }}
                      placeholder={viewText.profile.namePlaceholder}
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-gray-700">{viewText.profile.emailLabel}</span>
                    <Input value={ui.profile.userEml} readOnly />
                  </label>

                  <div className="space-y-1">
                    <span className="text-sm font-medium text-gray-700">{viewText.profile.roleLabel}</span>
                    <div>
                      <Badge variant={ROLE_BADGE_VARIANT[ui.profile.roleCd] || "neutral"} pill>
                        {ui.profile.roleCd || "user"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">{viewText.profile.notifyLabel}</span>
                    <div className="flex flex-wrap gap-4">
                      <Switch
                        label={viewText.profile.notifyEmailLabel}
                        checked={Boolean(ui.profile.notifyEmail)}
                        onChange={(event) => {
                          ui.profile.notifyEmail = event.target.checked;
                        }}
                      />
                      <Switch
                        label={viewText.profile.notifySmsLabel}
                        checked={Boolean(ui.profile.notifySms)}
                        onChange={(event) => {
                          ui.profile.notifySms = event.target.checked;
                        }}
                      />
                      <Switch
                        label={viewText.profile.notifyPushLabel}
                        checked={Boolean(ui.profile.notifyPush)}
                        onChange={(event) => {
                          ui.profile.notifyPush = event.target.checked;
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2">
                <Button onClick={saveProfile} loading={ui.isSavingProfile || ui.isLoadingProfile} className="w-full sm:w-auto">
                  {viewText.profile.saveButton}
                </Button>
              </div>
            </div>
          </Tab.Item>

          <Tab.Item title={viewText.tab.system}>
            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{viewText.system.siteNameLabel}</span>
                <Input
                  value={ui.systemSetting.siteName}
                  onChange={(event) => {
                    ui.systemSetting.siteName = event.target.value;
                  }}
                />
              </label>

              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-700">{viewText.system.maintenanceModeLabel}</span>
                <Switch
                  label={ui.systemSetting.maintenanceMode ? viewText.system.maintenanceActive : viewText.system.maintenanceInactive}
                  checked={Boolean(ui.systemSetting.maintenanceMode)}
                  onChange={(event) => {
                    ui.systemSetting.maintenanceMode = event.target.checked;
                  }}
                />
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{viewText.system.sessionTimeoutLabel}</span>
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
                <span className="text-sm font-medium text-gray-700">{viewText.system.maxUploadLabel}</span>
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
                  {viewText.system.saveButton}
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
