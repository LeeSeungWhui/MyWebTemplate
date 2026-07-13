/**
 * 파일명: app/dashboard/settings/lang.ko.js
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: settings 경로 한국어 리소스
 */

export const LANG_KO = {
  page: {
    metadataTitle: "Dashboard Settings | Web Sample",
  },
  initData: {
    systemDefault: {
      siteName: "Web Sample",
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
      systemEndpointMissing: "시스템 설정 API 경로가 아직 설정되지 않았습니다.",
      profileLoadFailed: "프로필 정보를 불러오지 못했습니다.",
      profileSaveFailed: "프로필 저장에 실패했습니다.",
      passwordChangeEndpointMissing: "비밀번호 변경 API 경로가 설정되지 않았습니다.",
      passwordChangeInvalid: "입력값을 확인한 뒤 다시 시도해주세요.",
      passwordChangeUnavailable: "현재 비밀번호를 변경할 수 없습니다. 잠시 후 다시 시도해주세요.",
      passwordChangeFailed: "비밀번호 변경에 실패했습니다. 다시 시도해주세요.",
      passwordChangeMalformedResponse: "비밀번호 변경 결과를 확인하지 못했습니다. 다시 시도해주세요.",
      currentPasswordInvalid: "현재 비밀번호가 올바르지 않습니다.",
      systemSaveFailed: "시스템 설정 저장에 실패했습니다.",
      requestIdLabel: "requestId",
      codeLabel: "오류 코드",
    },
    validation: {
      nameMinLength: "이름은 2자 이상 입력해주세요.",
      currentPasswordRequired: "현재 비밀번호를 입력해주세요.",
      newPasswordRequired: "새 비밀번호를 입력해주세요.",
      newPasswordMinLength: "새 비밀번호는 8자 이상 입력해주세요.",
      newPasswordMustDiffer: "새 비밀번호는 현재 비밀번호와 달라야 합니다.",
      newPasswordConfirmRequired: "새 비밀번호 확인을 입력해주세요.",
      newPasswordConfirmMismatch: "새 비밀번호 확인이 일치하지 않습니다.",
    },
    toast: {
      profileSaved: "프로필이 저장되었습니다.",
      passwordChanged: "비밀번호가 변경되었습니다. 다시 로그인해주세요.",
      systemSaved: "시스템 설정이 저장되었습니다.",
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
      passwordChangeTitle: "비밀번호 변경",
      passwordChangeDescription: "현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.",
      currentPasswordLabel: "현재 비밀번호",
      newPasswordLabel: "새 비밀번호",
      newPasswordConfirmLabel: "새 비밀번호 확인",
      passwordChangeButton: "비밀번호 변경",
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

export default LANG_KO;
