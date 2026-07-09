/**
 * 파일명: app/sample/lang.ko.js
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: sample 경로 한국어 리소스
 */

export const LANG_KO = {
  page: {
    metadataTitle: "Sample Hub | MyWebTemplate",
    metadataDescription: "공개 샘플 허브",
  },
  view: {
    heroBadge: "웹서비스 샘플 모음",
    openSampleButton: "샘플 열기",
    extraSectionTitle: "처음 보신다면 여기부터 확인해 보세요",
    statLabel: {
      taskCount: "업무 데이터",
      adminUserCount: "관리자 사용자",
      formSubmissionCount: "폼 제출",
    },
  },
  initData: {
    header: {
      title: "샘플 페이지 모음",
      subtitle:
        "업무 대시보드, 데이터 관리, 신청/문의 폼, 회원/권한 관리 화면을 바로 체험할 수 있습니다.",
    },
    cardList: [
      {
        href: "/sample/dashboard",
        title: "업무 대시보드 샘플",
        description: "요약 지표, 차트, 최근 업무 목록처럼 운영자가 처음 보는 화면 구성을 확인합니다.",
        icon: "ri:RiBarChart2Line",
        badge: "1",
      },
      {
        href: "/sample/crud",
        title: "업무 데이터 관리 샘플",
        description: "목록 검색, 필터, 등록, 수정, 삭제까지 실제 관리자 페이지의 핵심 흐름을 체험합니다.",
        icon: "ri:RiTableLine",
        badge: "2",
      },
      {
        href: "/sample/form",
        title: "신청/문의 폼 샘플",
        description: "단계별 입력, 필수값 검증, 제출 결과 저장까지 이어지는 폼 흐름을 확인합니다.",
        icon: "ri:RiFileEditLine",
        badge: "3",
      },
      {
        href: "/sample/admin",
        title: "회원/권한 관리 샘플",
        description: "사용자 목록, 역할, 시스템 설정처럼 운영 관리에 필요한 화면 구성을 확인합니다.",
        icon: "ri:RiShieldUserLine",
        badge: "4",
      },
    ],
    extraLinkList: [
      {
        href: "/component",
        label: "UI 컴포넌트 문서 보기",
      },
      {
        href: "/sample/portfolio",
        label: "개발자 포트폴리오 요약 보기",
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
    helperText: "샘플 화면을 체험할 수 있어요.",
    brandName: "MyWebTemplate",
    footerLinkList: [
      { linkId: "demo", linkNm: "샘플 허브", href: "/sample" },
      { linkId: "component", linkNm: "UI 컴포넌트", href: "/component" },
      { linkId: "portfolio", linkNm: "포트폴리오", href: "/sample/portfolio" },
    ],
  },
};

export default LANG_KO;
