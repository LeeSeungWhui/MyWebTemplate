/**
 * 파일명: app/sample/lang.ko.js
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: sample 경로 한국어 리소스
 */

export const LANG_KO = {
  page: {
    metadataTitle: "샘플 허브 | Web Sample",
    metadataDescription: "대시보드, 데이터 관리, 문의 접수, 회원 관리를 직접 체험하는 웹서비스 샘플",
  },
  view: {
    heroBadge: "직접 체험하는 웹서비스",
    openSampleButton: "직접 체험하기",
    extraSectionTitle: "구현 범위와 개발 역량도 확인해 보세요",
    statLabel: {
      taskCount: "등록된 업무",
      adminUserCount: "관리 대상 사용자",
      formSubmissionCount: "접수된 문의",
    },
  },
  initData: {
    header: {
      title: "웹서비스 핵심 기능을 직접 확인해 보세요",
      subtitle:
        "운영 현황 확인부터 데이터 관리, 문의 접수, 회원 권한 설정까지 실제 사용 흐름을 한곳에서 체험할 수 있습니다.",
    },
    cardList: [
      {
        href: "/sample/dashboard",
        title: "업무 대시보드 샘플",
        description: "운영 현황과 예산, 진행 중인 업무를 요약 지표와 차트로 한눈에 확인합니다.",
        icon: "ri:RiBarChart2Line",
        badge: "1",
      },
      {
        href: "/sample/crud",
        title: "업무 데이터 관리 샘플",
        description: "프로젝트 업무를 검색하고 등록·수정·삭제하는 관리자 페이지의 핵심 흐름을 체험합니다.",
        icon: "ri:RiTableLine",
        badge: "2",
      },
      {
        href: "/sample/form",
        title: "신청/문의 폼 샘플",
        description: "프로젝트 상담에 필요한 정보와 일정, 예산을 단계별로 입력하고 제출하는 흐름을 확인합니다.",
        icon: "ri:RiFileEditLine",
        badge: "3",
      },
      {
        href: "/sample/admin",
        title: "회원/권한 관리 샘플",
        description: "사용자별 역할과 권한을 관리하고 서비스 운영 설정을 변경하는 화면을 확인합니다.",
        icon: "ri:RiShieldUserLine",
        badge: "4",
      },
    ],
    extraLinkList: [
      {
        href: "/component",
        label: "UI 컴포넌트 문서 보기",
        prefetch: false,
      },
      {
        href: "/sample/portfolio",
        label: "개발자 포트폴리오 보기",
      },
    ],
  },
  layoutMeta: {
    menuList: [
      {
        menuId: "demo",
        menuNm: "샘플 허브",
        href: "/sample",
        icon: "ri:RiApps2Line",
      },
      {
        menuId: "dashboard",
        menuNm: "업무 대시보드",
        href: "/sample/dashboard",
        icon: "ri:RiBarChart2Line",
      },
      {
        menuId: "crud",
        menuNm: "업무 데이터 관리",
        href: "/sample/crud",
        icon: "ri:RiTableLine",
      },
      {
        menuId: "form",
        menuNm: "신청/문의 폼",
        href: "/sample/form",
        icon: "ri:RiFileEditLine",
      },
      {
        menuId: "admin",
        menuNm: "회원/권한 관리",
        href: "/sample/admin",
        icon: "ri:RiShieldUserLine",
      },
    ],
    title: {
      demo: "샘플 허브",
      dashboard: "업무 대시보드 샘플",
      form: "신청/문의 폼 샘플",
      admin: "회원/권한 관리 샘플",
      default: "업무 데이터 관리 샘플",
    },
    subtitle: {
      demo: "공개 샘플 > 허브",
      dashboard: "공개 샘플 > 업무 대시보드",
      form: "공개 샘플 > 신청/문의 폼",
      admin: "공개 샘플 > 회원/권한 관리",
      default: "공개 샘플 > 업무 데이터 관리",
    },
    helperText: "주요 기능을 직접 확인해 보세요.",
    brandName: "Web Sample",
    publicDemoNotice:
      "공개 체험용 샘플입니다. 입력하거나 변경한 내용은 다른 방문자에게 표시되거나 초기화될 수 있으니 실제 개인정보는 입력하지 마세요.",
    footerLinkList: [
      { linkId: "demo", linkNm: "샘플 허브", href: "/sample" },
      { linkId: "component", linkNm: "UI 컴포넌트", href: "/component", prefetch: false },
      { linkId: "portfolio", linkNm: "포트폴리오", href: "/sample/portfolio" },
    ],
  },
};

export default LANG_KO;
