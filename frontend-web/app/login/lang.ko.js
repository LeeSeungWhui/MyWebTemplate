/**
 * 파일명: app/login/lang.ko.js
 * 작성자: LSH
 * 갱신일: 2026-02-25
 * 설명: login 경로 한국어 리소스
 */

export const LANG_KO = {
  page: {
    metadataTitle: "Login | MyWebTemplate",
  },
  view: {
    toast: {
      sessionExpired: "세션이 만료되었습니다. 다시 로그인해 주세요.",
      signupDone: "회원가입이 완료되었습니다. 로그인해 주세요.",
    },
    error: {
      tooManyAttempts: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
      invalidCredential: "이메일 또는 비밀번호가 올바르지 않습니다.",
      loginFailed: "로그인에 실패했습니다.",
      invalidInput: "입력값을 확인해 주세요.",
    },
    validation: {
      emailRequired: "이메일을 입력해주세요",
      emailMinLength: "아이디는 최소 3자 이상 입력해주세요",
      emailInvalid: "올바른 이메일 형식이 아닙니다",
      passwordRequired: "비밀번호를 입력해주세요",
      passwordMinLength: "비밀번호는 최소 8자 이상이어야 합니다",
    },
    side: {
      title: "웹페이지 템플릿",
      subtitle: "샘플 로그인 화면",
      pointList: [
        "로그인 시 샘플 대시보드 페이지로 이동",
        "/component에서 컴포넌트 목록 조회",
        "demo@demo.demo / password123",
      ],
    },
    form: {
      title: "로그인",
      subtitle: "계정 정보로 로그인하여 시작하세요",
      emailLabel: "이메일",
      emailPlaceholder: "이메일을 입력하세요",
      passwordLabel: "비밀번호",
      passwordPlaceholder: "비밀번호를 입력하세요",
      rememberMeLabel: "로그인 상태 유지",
      forgotPasswordLabel: "비밀번호 찾기",
      submitLabel: "로그인",
      signupGuidePrefix: "계정이 없으신가요?",
      signupLinkLabel: "회원가입",
    },
  },
};

export default LANG_KO;
