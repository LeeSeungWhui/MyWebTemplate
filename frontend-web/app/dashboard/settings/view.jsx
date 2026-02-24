"use client";
/**
 * 파일명: dashboard/settings/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 대시보드 설정 클라이언트 뷰(프로필/시스템설정 탭)
 */

import { useEffect, useState } from "react";
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

const ROLE_BADGE_VARIANT = {
  admin: "primary",
  manager: "warning",
  user: "neutral",
};

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
  const [profile, setProfile] = useState(createDefaultProfile());
  const [systemSetting, setSystemSetting] = useState(SYSTEM_SETTING_DEFAULT);
  const [activeTabIndex, setActiveTabIndex] = useState(() =>
    toSettingsTabIndex(normalizeSettingsTab(searchParams))
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSystem, setIsSavingSystem] = useState(false);
  const [error, setError] = useState(null);
  const endPoints = PAGE_MODE.endPoints || {};
  const hasProfileEndpoint = Boolean(endPoints.profileMe);

  useEffect(() => {
    const tabIndex = toSettingsTabIndex(normalizeSettingsTab(searchParams));
    setActiveTabIndex((prev) => (prev === tabIndex ? prev : tabIndex));
  }, [searchParams?.toString()]);

  const loadProfile = async () => {
    if (!hasProfileEndpoint) {
      setError({ message: "프로필 API 경로가 설정되지 않았습니다." });
      setIsLoadingProfile(false);
      return;
    }
    setIsLoadingProfile(true);
    setError(null);
    try {
      const response = await apiJSON(endPoints.profileMe);
      const next = response?.result || {};
      setProfile({
        userId: next?.userId || "",
        userNm: next?.userNm || "",
        userEml: next?.userEml || "",
        roleCd: next?.roleCd || "user",
        notifyEmail: Boolean(next?.notifyEmail),
        notifySms: Boolean(next?.notifySms),
        notifyPush: Boolean(next?.notifyPush),
      });
    } catch (err) {
      console.error("프로필 조회 실패", err);
      setError(toApiError(err, "프로필 정보를 불러오지 못했습니다."));
    } finally {
      setIsLoadingProfile(false);
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
    setActiveTabIndex(nextTabIndex);
    syncTabQuery(nextTabIndex);
  };

  const saveProfile = async () => {
    if (!hasProfileEndpoint) {
      showToast("프로필 API 경로가 설정되지 않았습니다.", { type: "error" });
      return;
    }
    if (String(profile.userNm || "").trim().length < 2) {
      showToast("이름은 2자 이상 입력해주세요.", { type: "warning" });
      return;
    }
    setIsSavingProfile(true);
    setError(null);
    try {
      const response = await apiJSON(endPoints.profileMe, {
        method: "PUT",
        body: {
          userNm: String(profile.userNm || "").trim(),
          notifyEmail: Boolean(profile.notifyEmail),
          notifySms: Boolean(profile.notifySms),
          notifyPush: Boolean(profile.notifyPush),
        },
      });
      const next = response?.result || {};
      setProfile((prev) => ({
        ...prev,
        userNm: next?.userNm || prev.userNm,
        notifyEmail: Boolean(next?.notifyEmail),
        notifySms: Boolean(next?.notifySms),
        notifyPush: Boolean(next?.notifyPush),
      }));
      showToast("프로필이 저장되었습니다.", { type: "success" });
    } catch (err) {
      console.error("프로필 저장 실패", err);
      setError(toApiError(err, "프로필 저장에 실패했습니다."));
      showToast(err?.message || "프로필 저장에 실패했습니다.", { type: "error" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const saveSystemSetting = async () => {
    setIsSavingSystem(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      showToast("시스템 설정이 저장되었습니다. (로컬 상태)", { type: "success" });
    } finally {
      setIsSavingSystem(false);
    }
  };

  return (
    <div className="space-y-3">
      {error?.message ? (
        <section aria-label="오류 안내">
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <div>{error.message}</div>
            {error.requestId ? (
              <div className="mt-1 text-xs text-red-700/80">requestId: {error.requestId}</div>
            ) : null}
          </div>
        </section>
      ) : null}

      <Card title="설정">
        <Tab
          key={`settings-tab-${activeTabIndex}`}
          tabIndex={activeTabIndex}
          onValueChange={handleTabChange}
        >
          <Tab.Item title="내 프로필">
            <div className="space-y-3">
              {isLoadingProfile ? (
                <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
                  프로필을 불러오는 중...
                </div>
              ) : (
                <>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-gray-700">이름</span>
                    <Input
                      value={profile.userNm}
                      onChange={(event) =>
                        setProfile((prev) => ({ ...prev, userNm: event.target.value }))
                      }
                      placeholder="이름을 입력해주세요"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-gray-700">이메일</span>
                    <Input value={profile.userEml} readOnly />
                  </label>

                  <div className="space-y-1">
                    <span className="text-sm font-medium text-gray-700">역할</span>
                    <div>
                      <Badge variant={ROLE_BADGE_VARIANT[profile.roleCd] || "neutral"} pill>
                        {profile.roleCd || "user"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">알림 설정</span>
                    <div className="flex flex-wrap gap-4">
                      <Switch
                        label="이메일 알림"
                        checked={Boolean(profile.notifyEmail)}
                        onChange={(event) =>
                          setProfile((prev) => ({ ...prev, notifyEmail: event.target.checked }))
                        }
                      />
                      <Switch
                        label="SMS 알림"
                        checked={Boolean(profile.notifySms)}
                        onChange={(event) =>
                          setProfile((prev) => ({ ...prev, notifySms: event.target.checked }))
                        }
                      />
                      <Switch
                        label="푸시 알림"
                        checked={Boolean(profile.notifyPush)}
                        onChange={(event) =>
                          setProfile((prev) => ({ ...prev, notifyPush: event.target.checked }))
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2">
                <Button onClick={saveProfile} loading={isSavingProfile || isLoadingProfile} className="w-full sm:w-auto">
                  저장
                </Button>
              </div>
            </div>
          </Tab.Item>

          <Tab.Item title="시스템 설정">
            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">사이트명</span>
                <Input
                  value={systemSetting.siteName}
                  onChange={(event) =>
                    setSystemSetting((prev) => ({ ...prev, siteName: event.target.value }))
                  }
                />
              </label>

              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-700">점검 모드</span>
                <Switch
                  label={systemSetting.maintenanceMode ? "활성화" : "비활성화"}
                  checked={Boolean(systemSetting.maintenanceMode)}
                  onChange={(event) =>
                    setSystemSetting((prev) => ({
                      ...prev,
                      maintenanceMode: event.target.checked,
                    }))
                  }
                />
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">세션 타임아웃(분)</span>
                <NumberInput
                  value={systemSetting.sessionTimeoutMinutes}
                  min={5}
                  step={5}
                  onChange={(event) =>
                    setSystemSetting((prev) => ({
                      ...prev,
                      sessionTimeoutMinutes: Number(event?.target?.value || 5),
                    }))
                  }
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">최대 업로드 크기(MB)</span>
                <NumberInput
                  value={systemSetting.maxUploadMb}
                  min={1}
                  step={1}
                  onChange={(event) =>
                    setSystemSetting((prev) => ({
                      ...prev,
                      maxUploadMb: Number(event?.target?.value || 1),
                    }))
                  }
                />
              </label>

              <div className="pt-2">
                <Button onClick={saveSystemSetting} loading={isSavingSystem} className="w-full sm:w-auto">
                  저장
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
