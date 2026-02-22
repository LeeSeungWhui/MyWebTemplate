/**
 * 파일명: portfolio/initData.jsx
 * 작성자: Codex
 * 갱신일: 2026-02-22
 * 설명: 포트폴리오 페이지 정적 데이터
 */

export const PAGE_MODE = {
  MODE: 'STATIC',
  PUBLIC_PATH: '/portfolio',
}

export const PAGE_CONTENT = {
  hero: {
    title: '서비스형 웹 프로젝트 포트폴리오',
    subtitle:
      '백엔드 + BFF + 프론트엔드를 한 저장소에서 운영한 구조를 한 페이지에서 확인할 수 있게 정리했습니다.',
    summary: [
      '문제 정의 → 설계 → 구현 → 검증 흐름을 실제 코드 기준으로 설명',
      '로그인/세션/권한 처리와 공통 컴포넌트 운영 경험 포함',
      '과한 기술 과시는 줄이고, 결과와 신뢰 포인트 중심으로 구성',
    ],
  },
  overview: [
    {
      label: '프로젝트 형태',
      value: 'Full-Stack Web Template',
    },
    {
      label: '핵심 도메인',
      value: '인증/세션, 대시보드, 공통 UI 컴포넌트',
    },
    {
      label: '공개 데모 경로',
      value: '/portfolio, /component',
    },
  ],
  features: [
    {
      title: '안정적인 인증 흐름',
      detail:
        'Next BFF에서 HttpOnly 쿠키 기반 인증을 처리하고, 401 시 재시도/리다이렉트 규칙을 통일했습니다.',
    },
    {
      title: '공통 API 런타임',
      detail:
        'SSR/CSR에서 같은 유틸(apiJSON/apiRequest)로 통신하게 만들어 파싱/에러 처리 기준을 일원화했습니다.',
    },
    {
      title: '재사용 UI 컴포넌트',
      detail:
        'Input/Select/Checkbox/Table/Drawer 등 바인딩 패턴을 통일하고, 문서 페이지에서 사용 예시를 제공합니다.',
    },
  ],
  role: [
    '프론트엔드 구조 설계(라우팅, 상태, 공통 컴포넌트 계약)',
    'BFF/인증 흐름 정리(쿠키, 리다이렉트, 에러 핸들링)',
    '테스트/문서 동기화로 변경 리스크 관리',
  ],
  reliability: [
    '빌드/테스트 기반으로 회귀 확인',
    '공개 경로/보호 경로를 미들웨어로 분리',
    '공통 규칙 문서와 코드 동기화',
  ],
  demoFlow: [
    {
      name: '포트폴리오 요약',
      path: '/portfolio',
      note: '프로젝트 설명, 역할, 결과를 한 번에 확인',
    },
    {
      name: '컴포넌트 문서',
      path: '/component',
      note: '공통 컴포넌트 예제와 코드 사용법 확인',
    },
    {
      name: '로그인 화면',
      path: '/login',
      note: '세션/리다이렉트 정책 기반 진입점',
    },
  ],
  stack: ['Next.js 15', 'React 19', 'Node.js', 'Python Backend', 'Vitest'],
  technicalNotes: [
    '인증 토큰은 JS에서 직접 접근하지 않고 HttpOnly 쿠키 기준으로 처리',
    '401 처리 규칙은 런타임 유틸에서 공통화',
    '공개 API는 authless 옵션을 사용하고, legacy csrf skip 신호는 사용하지 않음',
  ],
}
