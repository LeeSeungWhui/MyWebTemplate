/**
 * 파일명: app/sample/portfolio/lang.ko.js
 * 작성자: LSH
 * 갱신일: 2026-07-13
 * 설명: portfolio 경로 한국어 리소스
 */

export const LANG_KO = {
  page: {
    metadataTitle: "풀스택 웹서비스 포트폴리오 | LSH",
    metadataDescription:
      "관리자·업무 웹서비스의 구현 범위와 실제 사용 흐름을 직접 확인하는 풀스택 개발 포트폴리오",
  },
  view: {
    heroBadge: "FULL-STACK WEB PORTFOLIO",
    sectionTitle: {
      overview: "프로젝트 개요",
      sampleMetrics: "실시간 샘플 현황",
      recentTasks: "최근 샘플 업무",
      profile: "개발자 소개",
      featuredProjects: "대표 프로젝트",
      careerTimeline: "경력 요약",
      education: "학력",
      research: "경험 및 활동",
      strengths: "주요 강점",
      architecture: "작동 흐름",
      demoFlow: "직접 체험할 화면",
      technicalNotes: "기술 구성과 검증 기준",
    },
    label: {
      developer: "담당 개발자",
      moveSample: "직접 체험하기",
      status: "상태",
      architectureDescription:
        "화면에서 요청한 정보가 어떤 단계로 처리되는지, 이해하기 쉽게 단순화해서 표현했습니다.",
    },
    statusLabelMap: {
      ready: "준비",
      pending: "대기",
      running: "진행 중",
      done: "완료",
      failed: "실패",
    },
    overviewCard: {
      taskCount: "등록된 샘플 업무",
      adminUserCount: "관리 대상 사용자",
      formSubmissionCount: "접수된 샘플 문의",
      countSuffix: "건",
      userSuffix: "명",
    },
  },
  initData: {
    content: {
      hero: {
        title: "관리자·업무 웹서비스 구축 포트폴리오",
        subtitle:
          "프로젝트 상담 전에 대시보드, 데이터 관리, 문의 접수, 회원 권한 설정 등 실제 운영에 필요한 흐름을 직접 확인할 수 있습니다.",
        cta: [
          { href: "/sample", label: "기능 샘플 직접 체험" },
          { href: "/component", label: "UI 구성 요소 살펴보기", variant: "outline", prefetch: false },
        ],
        summary: [
          "처음 방문해도 1분 안에 핵심 업무 화면을 체험할 수 있도록 구성",
          "대시보드, 데이터 관리, 신청·문의 접수, 회원 권한 관리까지 연결",
          "화면 구현부터 API·DB 연동, 배포 준비까지 한 흐름으로 제공",
        ],
      },
      overview: [
        {
          label: "프로젝트 구성",
          value: "Next.js Web, FastAPI API, PostgreSQL을 연결한 풀스택 업무 웹 템플릿",
        },
        {
          label: "인증·계정",
          value: "회원가입, 로그인, 세션 갱신, 비밀번호 찾기 샘플 안내, 로그인 사용자 비밀번호 변경",
        },
        {
          label: "업무·설정",
          value: "대시보드, 업무 등록·조회·수정·삭제, 프로필·알림 설정, 공개 체험 화면",
        },
        {
          label: "품질·운영",
          value: "Vitest·pytest·rule-gate 검증과 systemd 기반 Web/API 분리 운영",
        },
      ],
      features: [
        {
          title: "처음 써도 이해되는 화면",
          detail:
            "중요한 정보가 한눈에 보이도록 정보 배치와 흐름을 단순하게 구성했습니다.",
        },
        {
          title: "실무형 업무 동선",
          detail:
            "조회, 검색, 등록, 수정, 삭제와 신청·문의 접수까지 실제 운영 흐름에 맞춰 구성했습니다.",
        },
        {
          title: "빠른 커스터마이징",
          detail:
            "브랜드 색상, 문구, 메뉴 구조만 바꿔도 업종별 서비스 화면으로 빠르게 전환할 수 있습니다.",
        },
      ],
      architectureFlow: [
        {
          icon: "ri:RiUser3Line",
          title: "사용자 화면",
          description: "고객과 운영자가 웹에서 바로 사용",
        },
        {
          icon: "ri:RiShieldCheckLine",
          title: "접근 제어",
          description: "로그인 상태와 권한 확인",
        },
        {
          icon: "ri:RiSettings3Line",
          title: "서비스 처리",
          description: "데이터 저장·조회와 결과 제공",
        },
      ],
      profile: {
        name: "LSH",
        role: "풀스택 웹 개발자",
        tagline:
          "요구사항 정리부터 구현, 운영 반영까지 이어지는 실무형 프로젝트를 중심으로 경력을 쌓아왔습니다.",
        quickFacts: [
          "8년 이상 실무 경력",
          "현재 앨엔소프트 개발팀 차장",
          "웹·앱 구축 및 운영 경험",
          "근무지역 서울",
        ],
        strengths: [
          "관리자 화면, 업무 시스템, 채용/평판조회 플랫폼 구축 경험",
          "초기 구축부터 유지보수/고도화까지 이어지는 프로젝트 수행",
          "변경이 잦은 요구사항에서도 구조를 단순하게 유지하는 방식 선호",
        ],
        featuredProjects: [
          {
            title: "EY한영 Korea Portal Mobile Project",
            period: "2024.07 ~ 2024.12",
            summary: "기존 Korea Portal의 모바일 WebApp 버전 구축",
            stack: "React · Tailwind CSS · Nginx",
          },
          {
            title: "Refercheck 평판조회사이트 구축",
            period: "2024.10 ~ 진행 중",
            summary: "평판조회 요청/응답 관리 중심의 서비스 구축",
            stack: "Spring Boot · React · Tailwind CSS · AuroraDB · Nginx",
          },
          {
            title: "대양그룹 DSCM 수주입력 자동화 시스템",
            period: "2023.12 ~ 2024.03",
            summary: "모바일 발주 및 진행현황 제공 SCM 플랫폼 구축",
            stack: "전자정부 Framework · Spring Boot · React · MySQL",
          },
          {
            title: "대양그룹/태림 TMS 구축",
            period: "2020.10 ~ 2023.02",
            summary: "운송관리시스템 웹/앱 구축 및 리포트 화면 개발",
            stack: "Nexacro · Java · Oracle · Android Studio · UbiReport",
          },
        ],
        careerTimeline: [
          {
            company: "앨엔소프트",
            period: "2024.04 ~ 재직 중",
            position: "개발팀 차장",
            summary: "웹 및 앱 개발",
            highlights: [
              "AnyApply 채용 사이트 구축 (2024.04 ~ 진행 중)",
              "EY한영 Korea Portal Mobile Project (2024.07 ~ 2024.12)",
              "Refercheck 평판 조회 사이트 구축 (2024.10 ~ 진행 중)",
            ],
          },
          {
            company: "조앤소프트",
            period: "2021.10 ~ 2024.03",
            position: "임시직/프리랜서",
            summary: "웹 및 앱 개발",
            highlights: [
              "대양그룹/태림 TMS 구축 (Nexacro, Java, Oracle)",
              "KT DS BizMate App 유지보수 (Android Studio, Swift)",
              "LG U+ 정보현행화 및 대양그룹 DSCM 자동화 시스템 구축",
            ],
          },
          {
            company: "알앤비소프트 · 네오지앤피",
            period: "2020.10 ~ 2021.09",
            position: "임시직/프리랜서",
            summary: "운송관리시스템(TMS) 구축",
            highlights: [
              "Nexacro 기반 운송관리 웹페이지 개발",
              "출력용 리포트 페이지 개발(UbiReport)",
            ],
          },
          {
            company: "와이비에스",
            period: "2018.02 ~ 2020.07",
            position: "기업부설연구소 매니저",
            summary: "교통/모빌리티 데이터 기반 SW 개발",
            highlights: [
              "교통카드 데이터 가공 및 분석 시스템 개발",
              "운전자/차량 데이터 동기화 및 모니터링 SW 개발",
              "교통예보 시스템 고도화 및 데이터 품질 개선",
            ],
          },
          {
            company: "슈어소프트테크",
            period: "2016.12 ~ 2017.07",
            position: "SE사업본부 연구원",
            summary: "신뢰성 검증 및 임베디드 SW 프로젝트 참여",
            highlights: [
              "AUTOSAR 기반 ISJB 개발",
              "다기능 레이더(L-SAM) 신뢰성 시험",
            ],
          },
        ],
        education: [
          {
            school: "연세대학교(원주) 컴퓨터공학",
            detail: "4년제 졸업",
          },
        ],
        research: [
          "연세대학교 모바일 소프트웨어 연구실 (2015.08 ~ 2016.06)",
          "안드로이드 앱 안전성 테스트 및 예외처리 관련 학술 발표 참여",
        ],
      },
      role: [
        "요구사항 분석 및 화면 구조 설계",
        "프론트 화면과 백엔드 API·DB 흐름 연결",
        "배포, 검수, 수정 반영 및 문서 정리",
      ],
      reliability: [
        "자동 테스트와 핵심 동작 점검으로 변경 후 회귀 확인",
        "공개 페이지와 로그인 보호 영역을 분리해 안전하게 운영",
        "요구사항, 구현, 검수 기준을 함께 관리해 결과물의 일관성 유지",
      ],
      demoFlow: [
        {
          name: "업무 데이터 관리 샘플",
          path: "/sample/crud",
          note: "업무 목록 조회부터 등록·수정·삭제까지 한 번에 체험",
          imageSrc: "/images/landing/demo-crud.png",
          imageAlt: "업무 데이터 관리 샘플 화면 미리보기",
        },
        {
          name: "신청/문의 폼 샘플",
          path: "/sample/form",
          note: "단계별 입력과 검증, 제출·저장 흐름을 직관적으로 확인",
          imageSrc: "/images/landing/demo-form.png",
          imageAlt: "신청 문의 폼 샘플 화면 미리보기",
        },
        {
          name: "회원/권한 관리 샘플",
          path: "/sample/admin",
          note: "사용자 목록, 역할 권한, 설정 탭 구조를 빠르게 확인",
          imageSrc: "/images/landing/demo-admin.png",
          imageAlt: "회원 권한 관리 샘플 미리보기",
        },
      ],
      technicalNotes: [
        "런타임: Node.js 26.3.0, Python 3.14.5",
        "프론트엔드: Next.js 16.2.7(App Router·Turbopack), React 19.2.7, Tailwind CSS 4.3.0",
        "백엔드: FastAPI 0.136.3, Pydantic 2.13.4, Gunicorn 26.0.0 + Uvicorn Worker",
        "데이터베이스: PostgreSQL 운영·테스트 구성, SQLAlchemy 2.0.50 + asyncpg 0.31.0",
        "로그인: HttpOnly Cookie 기반 세션으로 로그인 상태를 안전하게 유지하고 갱신 토큰을 분리",
        "API 연결: 브라우저와 서버에서 같은 요청 경로를 사용하도록 BFF로 통일",
        "접근 제어: 공개 화면과 로그인 보호 화면을 분리하고 만료 후 원래 화면으로 복귀",
        "응답 규약: 성공·오류 응답 형식을 통일해 화면과 서버의 예외 처리를 단순화",
        "데이터 관리: SQL 파일과 실행 코드를 분리해 변경 내용을 쉽게 추적",
        "품질 검증: ESLint 9.39.4, Vitest 4.1.8, pytest 9.0.3, rule-gate로 주요 회귀를 차단",
        "운영 실행: Next.js와 Gunicorn/Uvicorn을 분리된 systemd 서비스로 운영",
      ],
    },
  },
};

export default LANG_KO;
