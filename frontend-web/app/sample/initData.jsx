/**
 * 파일명: demo/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 허브 페이지 정적 데이터
 */

export const PAGE_MODE = {
  MODE: "STATIC",
  PUBLIC_PATH: "/sample",
};

export const DEMO_HUB_HEADER = {
  title: "샘플 페이지 모음",
  subtitle:
    "대시보드/CRUD/복합 폼/관리자 화면을 바로 확인하고, 필요한 샘플로 한 번에 이동할 수 있습니다.",
};

export const DEMO_HUB_CARD_LIST = [
  {
    href: "/sample/dashboard",
    title: "샘플 대시보드",
    description: "요약 지표, 차트, 최근 업무 목록을 읽기 전용으로 확인합니다.",
    icon: "ri:RiBarChart2Line",
    badge: "P0",
  },
  {
    href: "/sample/crud",
    title: "CRUD 관리 샘플",
    description: "검색/필터/드로어 기반 등록·수정·삭제 흐름을 체험합니다.",
    icon: "ri:RiTableLine",
    badge: "P0",
  },
  {
    href: "/sample/form",
    title: "복합 폼 샘플",
    description: "스텝 검증과 제출 요약 흐름을 확인합니다.",
    icon: "ri:RiFileEditLine",
    badge: "P1",
  },
  {
    href: "/sample/admin",
    title: "관리자 화면 샘플",
    description: "사용자/권한/시스템 설정 탭 구성을 확인합니다.",
    icon: "ri:RiShieldUserLine",
    badge: "P1",
  },
];

export const DEMO_HUB_EXTRA_LINK_LIST = [
  {
    href: "/component",
    label: "컴포넌트 문서 보기",
  },
  {
    href: "/sample/portfolio",
    label: "포트폴리오 요약 보기",
  },
];
