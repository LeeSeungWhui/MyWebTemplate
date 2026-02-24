/**
 * 파일명: app/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 루트 랜딩 페이지 정적 데이터
 */

export const LANDING_HERO = {
  title: "웹 개발, 깔끔하게 만들어드립니다",
  subtitle:
    "관리자 화면부터 반응형 웹까지, 이 페이지가 포트폴리오입니다.",
  primaryCta: { href: "/sample", label: "샘플 체험하기" },
  secondaryCta: { href: "/component", label: "컴포넌트 보기" },
  previewImage: {
    src: "/images/landing/demo-dashboard.png",
    alt: "샘플 대시보드 미리보기 스크린샷",
  },
};

export const LANDING_SERVICE_LIST = [
  {
    icon: "ri:RiDashboardLine",
    title: "관리자 대시보드",
    description:
      "KPI/차트/테이블 기반으로 핵심 데이터를 한눈에 확인할 수 있는 화면을 구성합니다.",
  },
  {
    icon: "ri:RiTableLine",
    title: "CRUD 관리 화면",
    description: "등록·조회·수정·삭제 흐름을 사용자 경험 중심으로 구현합니다.",
  },
  {
    icon: "ri:RiSmartphoneLine",
    title: "반응형 웹사이트",
    description: "모바일부터 데스크톱까지 자연스럽게 동작하는 레이아웃을 제공합니다.",
  },
  {
    icon: "ri:RiCodeSSlashLine",
    title: "API 개발",
    description: "FastAPI 기반 REST API와 인증/로그 체계를 함께 구성합니다.",
  },
];

export const LANDING_GALLERY_LIST = [
  {
    href: "/sample/dashboard",
    title: "샘플 대시보드",
    description: "요약 지표/차트/최근 업무 확인",
    imageSrc: "/images/landing/demo-dashboard.png",
    imageAlt: "샘플 대시보드 화면 스크린샷",
  },
  {
    href: "/sample/form",
    title: "복합 폼 샘플",
    description: "스텝 기반 입력/검증 흐름",
    imageSrc: "/images/landing/demo-form.png",
    imageAlt: "복합 폼 샘플 화면 스크린샷",
  },
  {
    href: "/sample/admin",
    title: "관리자 화면 샘플",
    description: "사용자/권한/설정 화면",
    imageSrc: "/images/landing/demo-admin.png",
    imageAlt: "관리자 화면 샘플 스크린샷",
  },
];

export const LANDING_STACK_LIST = [
  "Next.js 15",
  "React 19",
  "Python",
  "FastAPI",
  "SQLAlchemy",
  "Vitest",
];

export const LANDING_BOTTOM_CTA = {
  title: "직접 체험해 보세요",
  subtitle:
    "샘플 페이지와 컴포넌트 문서를 통해 구현 스타일과 완성도를 확인할 수 있습니다.",
  demo: { href: "/sample", label: "샘플 보기" },
};
