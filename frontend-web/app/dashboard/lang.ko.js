/**
 * 파일명: app/dashboard/lang.ko.js
 * 작성자: LSH
 * 갱신일: 2026-02-25
 * 설명: dashboard 경로 한국어 리소스
 */

export const LANG_KO = {
  page: {
    metadataTitle: "Dashboard | MyWebTemplate",
    endpointMissingLog: "대시보드 엔드포인트가 설정되지 않았습니다.",
    initFetchFailedLog: "대시보드 초기 데이터 조회 실패",
  },
  view: {
    statusLabelMap: {
      ready: "준비",
      pending: "대기",
      running: "진행중",
      done: "완료",
      failed: "실패",
    },
    unknown: "알 수 없음",
    error: {
      endpointMissing: "엔드포인트가 설정되지 않았습니다.",
      fetchFailed: "대시보드 데이터를 불러오지 못했습니다.",
      sectionAriaLabel: "오류 안내",
    },
    stat: {
      totalCount: "전체 건수",
      totalAmount: "총 금액",
      activeCount: "진행 중",
    },
    chart: {
      summaryAriaLabel: "지표 요약",
      chartAriaLabel: "차트 영역",
      tableAriaLabel: "업무 테이블",
      trendTitle: "가입/활성 추이",
      statusTitle: "상태 분포",
      seriesCount: "건수",
      seriesAmount: "금액",
    },
    card: {
      quickTitle: "업무 바로가기",
      recentTitle: "최근 업무",
    },
    action: {
      allTasks: "전체 업무",
      viewAll: "전체보기",
      countSuffix: "건",
    },
    table: {
      titleHeader: "제목",
      statusHeader: "상태",
      amountHeader: "금액",
      createdAtHeader: "생성일",
      emptyWhenError: "데이터를 불러오지 못했습니다.",
      emptyDefault: "업무가 없습니다.",
    },
    monthSuffix: "월",
  },
  layoutMeta: {
    menuList: [
      {
        menuId: "dashboard",
        menuNm: "대시보드",
        href: "/dashboard",
        icon: "ri:RiDashboardLine",
      },
      {
        menuId: "tasks",
        menuNm: "업무 관리",
        href: "/dashboard/tasks",
        icon: "ri:RiListCheck3",
      },
      {
        menuId: "settings",
        menuNm: "설정",
        href: "/dashboard/settings",
        icon: "ri:RiSettings3Line",
      },
    ],
    title: {
      dashboard: "대시보드",
      tasks: "업무 관리",
      settings: "설정",
    },
    subtitle: {
      dashboard: "대시보드 > 요약",
      settingsProfile: "대시보드 > 설정 > 내 프로필",
      settingsSystem: "대시보드 > 설정 > 시스템 설정",
      tasksPrefix: "대시보드 > 업무 관리",
      statusPrefix: "상태",
      sortPrefix: "정렬",
      keywordPrefix: "검색",
      pagePrefix: "페이지",
    },
    tasksAllStatus: "전체 상태",
    welcomeText: "어서오세요.",
  },
};

export default LANG_KO;
