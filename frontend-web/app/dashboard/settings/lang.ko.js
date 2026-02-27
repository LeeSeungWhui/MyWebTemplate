/**
 * 파일명: app/dashboard/settings/lang.ko.js
 * 작성자: LSH
 * 갱신일: 2026-02-25
 * 설명: settings 경로 한국어 리소스
 */

export const LANG_KO = {
  page: {
    metadataTitle: "Dashboard Settings | MyWebTemplate",
  },
  initData: {
    systemDefault: {
      siteName: "MyWebTemplate",
      maintenanceMode: false,
      sessionTimeoutMinutes: 60,
      maxUploadMb: 30,
    },
  },
  view: {
    roleBadge: {
      admin: "primary",
      manager: "warning",
      user: "neutral",
    },
    error: {
      profileEndpointMissing: "프로필 API 경로가 설정되지 않았습니다.",
      profileLoadFailed: "프로필 정보를 불러오지 못했습니다.",
      profileSaveFailed: "프로필 저장에 실패했습니다.",
      requestIdLabel: "requestId",
    },
    validation: {
      nameMinLength: "이름은 2자 이상 입력해주세요.",
    },
    toast: {
      profileSaved: "프로필이 저장되었습니다.",
      systemSaved: "시스템 설정이 저장되었습니다. (로컬 상태)",
    },
    card: {
      title: "설정",
    },
    tab: {
      profile: "내 프로필",
      system: "시스템 설정",
    },
    profile: {
      loading: "프로필을 불러오는 중...",
      nameLabel: "이름",
      namePlaceholder: "이름을 입력해주세요",
      emailLabel: "이메일",
      roleLabel: "역할",
      notifyLabel: "알림 설정",
      notifyEmailLabel: "이메일 알림",
      notifySmsLabel: "SMS 알림",
      notifyPushLabel: "푸시 알림",
      saveButton: "저장",
    },
    system: {
      siteNameLabel: "사이트명",
      maintenanceModeLabel: "점검 모드",
      maintenanceActive: "활성화",
      maintenanceInactive: "비활성화",
      sessionTimeoutLabel: "세션 타임아웃(분)",
      maxUploadLabel: "최대 업로드 크기(MB)",
      saveButton: "저장",
    },
  },
};

/**
 * @description LANG_KO export를 노출
 */
export default LANG_KO;
