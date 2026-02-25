# 코딩 스타일 가이드 (React Native / Expo)

이 문서는 `frontend-app` 구현 시 적용하는 RN 전용 규칙이다.
웹 전용 문서(`docs/frontend-web/codding-rules-frontend.md`)와 공통 철학은 맞추되, 네비게이션/디바이스/API 처리 방식은 RN 기준으로 고정한다.

## 0. 기본 원칙
- 코드보다 규칙이 먼저다. 예외가 필요하면 이유를 문서에 남긴다.
- 추상화는 최소화하고, 화면 로직은 화면 파일에서 읽히게 유지한다.
- JavaScript Only를 유지한다(TypeScript 런타임 코드 금지).

## 1. 폴더/파일 구조
- 기본 구조
  - `src/route`: 네비게이션 정의(`RouteIndex.jsx`, `NavigationConfig.jsx`)
  - `src/page/<feature>`: 화면 단위 코드
  - `src/lib/component`: 재사용 UI 컴포넌트
  - `src/lib/dataset`: EasyObj/EasyList
  - `src/common`: 레이아웃/스토어/공통 유틸
- 화면 파일 규칙
  - 파일명은 PascalCase를 사용한다. 예: `LoginPage.jsx`, `DashboardPage.jsx`
  - 라우트 키는 소문자 고정(`login`, `dashboard`, `tasks`, `settings`, `component`)
  - 화면이 복잡해지면 `initData.jsx` + `Page.jsx` + `view.jsx`로 분리한다.

## 2. 네이밍 규칙
- 컴포넌트/클래스: PascalCase
- 변수/함수: camelCase
- 상수: UPPER_SNAKE_CASE
- one-letter 변수는 루프 인덱스 외 금지
- API 경로/상태 코드는 백엔드 원문을 그대로 사용한다.

## 3. 네비게이션 규칙
- 인증 분기 고정
  - `AuthStack`: `login` (필수)
  - `AppStack`: `dashboard`, `tasks`, `settings`
  - `DocsStack`: `component` (개발/검수용)
- Guard 원칙
  - 미인증 사용자가 AppStack 진입 시 즉시 `login`으로 전환
  - 인증 상태에서 `login` 진입 시 `dashboard`로 전환
  - 401 수신 시 토큰 파기 후 AuthStack으로 전환

## 4. 상태 관리 규칙
- 기본 정책
  - 도메인 데이터(리스트, 상세, 검색 조건 등)와 화면 UI 상태(토글/탭/선택/로딩/임시 입력값)는 `EasyObj/EasyList`를 기본으로 사용한다.
  - 검색/필터는 `draft`와 `applied`를 분리해 관리하는 것을 권장한다.
- `useState` 사용 정책
  - 원칙적으로 사용하지 않는다.
  - 아래처럼 진짜 불가피한 경우에만 예외적으로 사용한다.
    - 외부 라이브러리가 제어 상태를 강제하는 경우
    - 컴포넌트 내부의 초국소/일시 상태를 `EasyObj`로 올리는 것이 오히려 복잡도를 높이는 경우
  - 레거시/점진 전환(예: `LEGACY_TRANSITION`) 사유는 예외로 허용하지 않는다.
  - 예외 사용 시 `docs/frontend-app/rule-gate-usestate-allowlist.txt`에 사유를 명시하고 룰게이트 검증을 통과해야 한다.
- 전역 상태는 전용 store 훅만 통해 접근한다(직접 mutate 금지).
- 얕은 별칭(`const d = data`)은 금지한다.

## 5. API 통신 규칙
- 화면/컴포넌트에서 `fetch` 직접 호출 금지.
- 공통 API 클라이언트 모듈(CU-APP-005) 경유 호출만 허용.
- 공통 응답 스키마를 유지한다.
  - 성공: `{ status: true, message, result, count?, requestId }`
  - 실패: `{ status: false, code, message, requestId }`
- 인증
  - Access 토큰은 SecureStore 저장
  - 요청은 `Authorization: Bearer <token>` 헤더 사용
  - 만료/401은 재로그인 기본 전략

## 6. UI/스타일 규칙
- NativeWind 유틸 클래스 우선, 인라인 스타일은 예외 상황만 허용
- 터치 타겟은 최소 44x44
- 텍스트/버튼/입력 상태(`disabled/loading/error`)를 시각적으로 구분
- `Alert/Toast/Loading`는 공통 컴포넌트로만 노출

## 7. 오류/로그 규칙
- 사용자 메시지는 코드 기반 매핑으로 보여준다(서버 원문 직노출 금지)
- 오류 로그는 `code`, `requestId`, `route`, `status`를 최소 포함한다
- 민감정보(토큰/개인정보)는 로그에 남기지 않는다

## 8. 테스트/검증 규칙
- 최소 스모크 시나리오
  - 로그인 성공/실패
  - 미인증 보호경로 접근 차단
  - 401 수신 시 로그인 전환
  - 대시보드 목록/통계 조회
- PR/커밋 전 점검
  - 콘솔 error/warning 0
  - 규칙 문서 위반 항목 없음
  - 문서/코드 네이밍 일치

## 9. 금지 목록
- 라우트 이름 임의 혼용(`main`, `home`, `dashboard` 혼재)
- 화면 파일에서 API 엔드포인트 문자열 하드코딩
- 컴포넌트에서 전역 스토어를 우회한 직접 접근
- 네이티브 권한 요청 로직을 화면 곳곳에 중복 구현

## 10. DoD (RN)
- 라우트/파일/컴포넌트 네이밍이 문서 규칙과 일치한다.
- 인증/가드/API 호출이 CU-APP-001~005 계약과 일치한다.
- 오류/로딩/빈 상태가 공통 UX 규칙을 따른다.
- 문서와 구현 상태가 어긋나지 않는다(모듈/유닛 동기화 완료).
