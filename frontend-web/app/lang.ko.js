/**
 * 파일명: app/lang.ko.js
 * 작성자: LSH
 * 갱신일: 2026-03-05
 * 설명: app 경로 한국어 리소스
 */

export const LANG_KO = {
  layout: {
    metadataTitle: "Web Sample — 풀스택 개발 템플릿",
    metadataDescription: "FastAPI + Next.js 기반의 인증/컴포넌트/대시보드 템플릿",
  },
  view: {
    previewBadge: "WEB SERVICE SAMPLE",
    previewTitle: "업무 데이터 관리 화면",
    section: {
      services: "제공 서비스",
      tour: "추천 체험 순서",
      gallery: "샘플 스크린샷 갤러리",
      stack: "기술 스택",
      trust: "샘플에서 확인할 수 있는 것",
    },
  },
  initData: {
    hero: {
      title: "웹서비스 개발 샘플 템플릿",
      subtitle:
        "관리자 페이지, 대시보드, 신청/문의 폼, 로그인과 백엔드 API까지 실제로 연결된 풀스택 샘플입니다.",
      primaryCtaLabel: "샘플 체험하기",
      secondaryCtaLabel: "UI 컴포넌트 보기",
      previewImageAlt: "샘플 대시보드 미리보기 스크린샷",
    },
    services: [
      {
        icon: "ri:RiDashboardLine",
        title: "관리자 페이지",
        description:
          "회원, 권한, 설정처럼 운영자가 매일 쓰는 관리 화면을 업무 흐름에 맞게 구성합니다.",
      },
      {
        icon: "ri:RiTableLine",
        title: "업무 데이터 관리",
        description: "목록, 검색, 필터, 등록, 수정, 삭제까지 실제 관리툴에 필요한 흐름을 구현합니다.",
      },
      {
        icon: "ri:RiSmartphoneLine",
        title: "신청/문의 폼",
        description: "단계별 입력, 필수값 검증, 제출 결과 저장까지 이어지는 폼 화면을 제공합니다.",
      },
      {
        icon: "ri:RiCodeSSlashLine",
        title: "프론트+백엔드 연동",
        description: "로그인, 권한, API, DB 저장, 배포까지 단순 화면이 아닌 동작하는 샘플로 확인할 수 있습니다.",
      },
    ],
    tour: [
      "샘플 허브에서 제공 화면 전체를 확인합니다.",
      "업무 대시보드로 지표와 최근 업무 구성을 봅니다.",
      "업무 데이터 관리에서 등록·수정·삭제 흐름을 체험합니다.",
      "신청/문의 폼에서 단계 입력과 제출 검증을 확인합니다.",
      "회원/권한 관리 샘플과 UI 컴포넌트 문서로 확장 가능성을 봅니다.",
    ],
    gallery: [
      {
        href: "/sample/dashboard",
        title: "업무 대시보드 샘플",
        description: "요약 지표, 차트, 최근 업무 흐름 확인",
        imageSrc: "/images/landing/demo-dashboard.png",
        imageAlt: "업무 대시보드 샘플 화면 스크린샷",
      },
      {
        href: "/sample/form",
        title: "신청/문의 폼 샘플",
        description: "단계 입력, 검증, 제출 결과 저장 흐름",
        imageSrc: "/images/landing/demo-form.png",
        imageAlt: "신청 문의 폼 샘플 화면 스크린샷",
      },
      {
        href: "/sample/admin",
        title: "회원/권한 관리 샘플",
        description: "사용자, 권한, 시스템 설정 화면",
        imageSrc: "/images/landing/demo-admin.png",
        imageAlt: "회원 권한 관리 샘플 스크린샷",
      },
    ],
    stackList: [
      "Node.js 26.3.0",
      "Next.js 16.2.7",
      "React 19.2.7",
      "Tailwind CSS 4.3.0",
      "Python 3.14.5",
      "FastAPI 0.136.3",
      "PostgreSQL",
      "Vitest 4.1.8 · pytest 9.0.3",
    ],
    trustList: [
      "반응형 프론트 화면과 실제 API 호출 구조",
      "로그인/보호 페이지/세션 흐름",
      "DB에 저장되는 샘플 데이터 관리",
      "테스트와 빌드가 통과하는 배포 가능한 코드",
    ],
    bottomCta: {
      title: "링크를 눌러 바로 체험해 보세요",
      subtitle:
        "숨고·크몽 상담 전에도 화면 구성, 기능 흐름, 개발 스타일을 먼저 확인할 수 있습니다.",
      label: "샘플 허브 보기",
    },
  },
};

export default LANG_KO;
