/**
 * 파일명: app/sample/form/lang.ko.js
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: form 경로 한국어 리소스
 */

export const LANG_KO = {
  page: {
    metadataTitle: "신청/문의 폼 샘플 | Web Sample",
    metadataDescription: "프로젝트 상담 정보를 단계별로 입력하고 저장하는 신청·문의 폼 샘플",
  },
  initData: {
    categoryOptions: [
      { value: "", text: "서비스 선택" },
      { value: "web", text: "웹 개발" },
      { value: "app", text: "앱 개발" },
      { value: "api", text: "API 개발" },
      { value: "etc", text: "기타" },
    ],
    featureOptions: [
      { key: "login", label: "로그인" },
      { key: "board", label: "게시판" },
      { key: "payment", label: "결제" },
      { key: "chart", label: "차트" },
      { key: "admin", label: "관리자 페이지" },
    ],
  },
  view: {
    stepList: [
      { step: 1, label: "문의자 정보" },
      { step: 2, label: "프로젝트 정보" },
      { step: 3, label: "입력 내용 확인" },
    ],
    summaryLabel: {
      name: "이름",
      email: "이메일",
      phone: "연락처",
      category: "필요한 서비스",
      startDate: "희망 시작일",
      endDate: "희망 완료일",
      period: "기간",
      budgetRange: "예산 범위",
      features: "우선 기능",
      requirement: "요청 사항",
      referenceUrl: "참고 URL",
      attachmentName: "첨부파일",
    },
    latestSubmissionLabel: {
      category: "필요한 서비스",
      features: "우선 기능",
      createdAt: "제출일",
    },
    validation: {
      nameRequired: "이름을 입력해 주세요.",
      emailInvalid: "올바른 이메일 형식을 입력해 주세요.",
      phoneRequired: "연락처를 입력해 주세요.",
      categoryRequired: "필요한 서비스를 선택해 주세요.",
      startDateRequired: "희망 시작일을 입력해 주세요.",
      endDateRequired: "희망 완료일을 입력해 주세요.",
      budgetRangeRequired: "예산 범위를 입력해 주세요.",
      endDateAfterStartDate: "희망 완료일은 희망 시작일 이후여야 합니다.",
      requiredFieldToast: "필수 입력 항목을 확인해 주세요.",
    },
    page: {
      title: "신청/문의 폼 샘플",
      subtitle: "필요한 서비스와 일정, 예산을 단계별로 입력하고 제출 결과가 저장되는 흐름을 체험합니다.",
      loadingCardTitle: "로딩 중",
      loadingCardBody: "데이터를 준비하는 중입니다...",
    },
    card: {
      step1Title: "문의자 정보",
      step2Title: "프로젝트 정보",
      step3Title: "입력 내용 확인",
      submissionTitlePrefix: "접수된 문의",
      submissionTitleSuffix: "건",
      submissionDescription: "제출 내용은 실제 샘플 DB에 저장되며 최근 접수 이력에도 바로 반영됩니다.",
      latestSubmissionTitle: "최근 접수 내용",
      latestSubmissionEmpty: "아직 접수된 문의가 없습니다.",
    },
    input: {
      namePlaceholder: "이름 또는 담당자명",
      emailPlaceholder: "연락받을 이메일",
      phonePlaceholder: "연락 가능한 전화번호",
      budgetRangePlaceholder: "예) 300만 ~ 500만",
      requirementPlaceholder: "필요한 기능과 요청 사항을 적어 주세요",
      referenceUrlPlaceholder: "참고할 서비스나 자료의 URL",
    },
    action: {
      prev: "이전",
      next: "다음",
      submit: "상담 요청 제출",
      submitSuccessToast: "상담 요청이 접수되었습니다.",
    },
    error: {
      submitFailed: "제출에 실패했습니다.",
    },
  },
};

export default LANG_KO;
