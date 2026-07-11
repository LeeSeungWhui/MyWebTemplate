/**
 * 파일명: app/sample/dashboard/lang.ko.js
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: dashboard 경로 한국어 리소스
 */

export const LANG_KO = {
  page: {
    metadataTitle: "업무 대시보드 샘플 | Web Sample",
    metadataDescription: "프로젝트 운영 현황과 예산을 한눈에 확인하는 업무 대시보드 샘플",
  },
  initData: {
    monthlyTrendLabels: ["11월", "12월", "1월", "2월"],
    recentTaskTitles: [
      "신규 프로젝트 문의 내용 확인",
      "요구사항과 참고 자료 정리",
      "상담 일정 및 담당자 확정",
      "예상 일정과 견적 범위 검토",
      "고객 검수 의견 반영",
    ],
    ctaLabels: {
      crud: "업무 데이터 관리 보기",
      admin: "회원/권한 관리 보기",
    },
  },
  view: {
    monthSuffix: "월",
    statusLabelMap: {
      ready: "준비",
      pending: "대기",
      running: "진행 중",
      done: "완료",
      failed: "실패",
    },
    unknown: "알 수 없음",
    statLabel: {
      totalCount: "전체 업무",
      totalAmount: "전체 예산",
      activePending: "대기·진행 업무",
    },
    table: {
      titleHeader: "제목",
      statusHeader: "상태",
      amountHeader: "예산",
      createdAtHeader: "등록일",
      empty: "표시할 업무가 없습니다.",
      mobileScrollHint: "표의 나머지 항목은 좌우로 스크롤해 확인할 수 있습니다.",
    },
    chart: {
      trendTitle: "월별 업무 추이",
      statusTitle: "업무 상태 분포",
      seriesCount: "업무 수",
      seriesAmount: "예산(백만원)",
    },
    card: {
      recentTitle: "최근 진행 업무",
      recentSubtitle: "프로젝트의 진행 현황과 우선순위를 한눈에 확인하는 읽기 전용 화면입니다.",
    },
    quickLinkTitle: "다른 기능 체험하기",
    number: {
      locale: "ko-KR",
      zeroText: "0",
    },
    misc: {
      defaultStatusCode: "ready",
    },
  },
};

export default LANG_KO;
