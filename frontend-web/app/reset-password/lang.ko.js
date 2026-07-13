/**
 * 파일명: reset-password/lang.ko.js
 * 작성자: LSH
 * 갱신일: 2026-07-13
 * 설명: 비밀번호 재설정 완료 화면 한국어 리소스
 */

export const LANG_KO = {
  page: {
    metadataTitle: "Reset Password | Web Sample",
  },
  view: {
    error: {
      retryFailed: "비밀번호 변경 요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.",
    },
    validation: {
      passwordMinLength: "비밀번호는 8자 이상 입력해주세요.",
      passwordConfirmMismatch: "비밀번호 확인이 일치하지 않습니다.",
    },
    recovery: {
      title: "재설정 링크를 사용할 수 없습니다.",
      message: "링크가 만료되었거나 이미 사용되었습니다. 비밀번호 재설정을 다시 요청해주세요.",
      requestLabel: "비밀번호 재설정 다시 요청하기",
    },
    success: {
      title: "비밀번호가 변경되었습니다.",
      message: "새 비밀번호로 로그인해주세요.",
      loginLabel: "로그인 화면으로 이동",
    },
    form: {
      title: "새 비밀번호 설정",
      subtitle: "새로 사용할 비밀번호를 입력해주세요.",
      passwordLabel: "새 비밀번호",
      passwordPlaceholder: "8자 이상 입력해주세요",
      passwordConfirmLabel: "새 비밀번호 확인",
      passwordConfirmPlaceholder: "새 비밀번호를 다시 입력해주세요",
      submitLabel: "비밀번호 변경",
    },
  },
};

export default LANG_KO;
