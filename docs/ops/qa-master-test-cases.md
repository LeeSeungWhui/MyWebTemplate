# QA Master Test Cases (Web + Backend)

## 목적
- 이 문서는 `docs/index.md`, `docs/common-rules.md`, `docs/frontend-web/units/CU-WEB-*`, `docs/backend/units/CU-BE-*` 기준으로 템플릿 전체 기능을 가능한 한 빠짐없이 검수하기 위한 마스터 테스트케이스다.
- 범위는 Web + Backend이며, App(`CU-APP-*`)은 이번 사이클에서 제외한다.
- 목표는 “기능 하나/버튼 하나” 레벨까지 재현 가능한 체크리스트를 고정하는 것이다.

## 실행 기준
- 실행 전 공통: `source ./env.sh`
- 프론트 단위 테스트: `pnpm -C frontend-web test`
- 프론트 린트: `pnpm -C frontend-web lint`
- 백엔드 단위 테스트: `cd backend && pytest`
- 운영 스모크: `curl` + Playwright(브라우저 시나리오)

## 케이스 표기 규칙
- 우선순위: `P0`(배포 차단), `P1`(강한 권장), `P2`(선택)
- 자동화 후보: `PW`(Playwright), `VT`(Vitest), `PY`(pytest), `MANUAL`
- 결과 기록: `PASS/FAIL/BLOCKED`, 실패 시 `requestId`/스크린샷/재현 절차 필수

## AC Traceability (Unit ↔ Case)
| Unit | AC 범위 | 커버 케이스 |
| --- | --- | --- |
| CU-WEB-001 | AC-1~6 | TC-AUTH-001~010, TC-API-003~006, TC-NFR-001~003 |
| CU-WEB-002 | AC-1~5 | TC-DASH-001~008, TC-DASH-021, TC-NFR-004~006 |
| CU-WEB-003 | AC-1~5 | TC-DEMO-001~004, TC-DEMO-027~030, TC-NFR-007~008 |
| CU-WEB-004 | AC-1~7 | TC-API-001~010, TC-AUTH-011~012, TC-DASH-026, TC-NFR-025 |
| CU-WEB-005 | AC-1~6 | TC-API-003~010, TC-API-013, TC-API-015, TC-BE-004, TC-NFR-024 |
| CU-WEB-006 | AC-1~4 | TC-DASH-022~024, TC-API-014, TC-NFR-009 |
| CU-WEB-007 | AC-1~6 | TC-PUB-001, TC-AUTH-001, TC-DASH-001, TC-API-001, TC-NFR-010 |
| CU-WEB-008 | AC-1~6 | TC-API-001~012 |
| CU-WEB-009 | AC 전체 | TC-DASH-022~024, TC-API-014 |
| CU-WEB-010 | AC-1~4 | TC-AUTH-013~016, TC-NFR-001 |
| CU-WEB-011 | AC-1~6 | TC-PUB-001~015, TC-DEMO-005~007, TC-NFR-021~023 |
| CU-WEB-012 | AC-1~10 | TC-PUB-001~020 |
| CU-WEB-013 | AC-1~12 | TC-DEMO-005~030, TC-NFR-011~014 |
| CU-WEB-014 | AC-1~9 | TC-DASH-001~020, TC-DASH-025, TC-API-011~012 |
| CU-WEB-015 | AC-1~6 | TC-PUB-016~020, TC-DEMO-025~026 |
| CU-WEB-016 | AC-1~5 | TC-AUTH-001, TC-AUTH-017~020 |
| CU-BE-001 | AC-1~5 | TC-BE-001~009, TC-API-003~006, TC-NFR-015~017 |
| CU-BE-002 | AC-1~2 | TC-BE-010~012 |
| CU-BE-003 | AC-1~5 | TC-BE-013~018 |
| CU-BE-004 | AC-1~5 | TC-BE-019~024, TC-NFR-019~020 |
| CU-BE-005 | AC-1~3 | TC-BE-025~027 |
| CU-BE-006 | AC-1~5 | TC-BE-028~032, TC-NFR-018 |
| CU-BE-007 | AC-1~4 | TC-BE-033~041, TC-DASH-009~017 |
| CU-BE-008 | AC-1~4 | TC-BE-042~046, TC-DASH-018~020 |
| CU-BE-009 | AC-1~4 | TC-BE-047~052, TC-AUTH-017~020 |

---

## 1) 공개 퍼널/공개 내비게이션 (`TC-PUB-*`)
| ID | Pri | 자동화 | 시나리오 | 절차 | 기대 결과 |
| --- | --- | --- | --- | --- | --- |
| TC-PUB-001 | P0 | PW | 랜딩 Hero 렌더링 | 비인증 상태 `/` 접속 | Hero 제목/부제/CTA 2개 노출 |
| TC-PUB-002 | P0 | PW | Hero CTA-샘플 | `샘플 체험하기` 클릭 | `/sample` 이동 |
| TC-PUB-003 | P1 | PW | Hero CTA-컴포넌트 | `컴포넌트 보기` 클릭 | `/component` 이동 |
| TC-PUB-004 | P1 | PW | Hero 우측 프리뷰 카드 | `/` 접속 후 Hero 우측 카드 확인 | 카드 1개 이상 노출, 레이아웃 깨짐 없음 |
| TC-PUB-005 | P0 | PW | 서비스 카드 4종 렌더링 | 랜딩 서비스 섹션 스크롤 | 카드 4개 제목/설명 노출 |
| TC-PUB-006 | P1 | PW | 스크린샷 카드-대시보드 | 랜딩 스크린샷 카드 1 클릭 | `/sample/dashboard` 이동 |
| TC-PUB-007 | P1 | PW | 스크린샷 카드-CRUD | 랜딩 스크린샷 카드 2 클릭 | `/sample/crud` 이동 |
| TC-PUB-008 | P1 | PW | 스크린샷 카드-폼 | 랜딩 스크린샷 카드 3 클릭 | `/sample/form` 이동 |
| TC-PUB-009 | P2 | PW | 기술 스택 뱃지 갯수 | 스택 섹션 확인 | 6개 뱃지 노출 |
| TC-PUB-010 | P1 | PW | 하단 CTA-샘플 | 하단 `샘플 보기` 클릭 | `/sample` 이동 |
| TC-PUB-011 | P1 | PW | 하단 CTA 단일 노출 | 하단 CTA 영역 확인 | `샘플 보기`만 노출되고 외부 문의 링크는 노출되지 않음 |
| TC-PUB-012 | P0 | PW | 공개 GNB 메뉴 구성 | 데스크톱 GNB 확인 | `샘플/컴포넌트/포트폴리오`만 노출 |
| TC-PUB-013 | P0 | PW | 공개 GNB 로그인 비노출 | 공개 페이지 GNB 확인 | 로그인/회원가입 메뉴 미노출 |
| TC-PUB-014 | P0 | PW | 샘플 드롭다운 링크 집합 | GNB `샘플` 드롭다운 열기 | `/sample/*` 5개 링크 노출 |
| TC-PUB-015 | P1 | PW | 활성 메뉴 하이라이트 정합 | `/sample/portfolio` 진입 | `포트폴리오`만 active, `샘플` inactive |
| TC-PUB-016 | P1 | PW | 포트폴리오 Hero 렌더링 | `/sample/portfolio` 접속 | 제목/소개/CTA 노출 |
| TC-PUB-017 | P1 | PW | 포트폴리오 섹션 6개 | 포트폴리오 섹션 순회 | 6개 섹션 순서대로 노출 |
| TC-PUB-018 | P2 | PW | 포트폴리오 mode/path 뱃지 제거 | 포트폴리오 상단 확인 | mode/path 뱃지 미노출 |
| TC-PUB-019 | P1 | PW | 포트폴리오 샘플 CTA | 포트폴리오 CTA 클릭 | 대응 샘플 경로 이동 |
| TC-PUB-020 | P1 | PW | 모바일 GNB 링크 집합 | 모바일 햄버거 열기 | 데스크톱과 동일 링크 집합 노출 |

## 2) 샘플 허브/샘플 페이지 (`TC-DEMO-*`)
| ID | Pri | 자동화 | 시나리오 | 절차 | 기대 결과 |
| --- | --- | --- | --- | --- | --- |
| TC-DEMO-001 | P0 | PW | 샘플 허브 카드 4종 | `/sample` 접속 | 대시보드/CRUD/복합폼/관리자 카드 노출 |
| TC-DEMO-002 | P1 | PW | 샘플 허브 카드 이동-대시보드 | 허브 카드 클릭 | `/sample/dashboard` 이동 |
| TC-DEMO-003 | P1 | PW | 샘플 허브 카드 이동-CRUD | 허브 카드 클릭 | `/sample/crud` 이동 |
| TC-DEMO-004 | P1 | PW | 샘플 허브 카드 이동-폼/관리자 | 카드 각각 클릭 | `/sample/form`, `/sample/admin` 이동 |
| TC-DEMO-005 | P0 | PW | 샘플 대시보드 비인증 접근 | 로그아웃 상태 `/sample/dashboard` 접속 | 페이지 렌더링 성공 |
| TC-DEMO-006 | P1 | PW | 샘플 대시보드 KPI 렌더링 | KPI 카드 영역 확인 | KPI 카드가 1개 이상 노출 |
| TC-DEMO-007 | P1 | PW | 샘플 대시보드 차트/목록 | 차트/최근 목록 영역 확인 | 두 영역 모두 렌더링 |
| TC-DEMO-008 | P0 | PW | CRUD 비인증 접근 | 로그아웃 상태 `/sample/crud` 접속 | 페이지 렌더링 성공 |
| TC-DEMO-009 | P0 | PW | CRUD 검색 필터 구성 | 검색 카드 확인 | 키워드/상태/기간/버튼/신규등록 노출 |
| TC-DEMO-010 | P0 | PW | CRUD 테이블 컬럼 8개 | 테이블 헤더 확인 | 명세된 8개 컬럼 노출 |
| TC-DEMO-011 | P0 | PW | CRUD 신규 등록 | 신규 등록 → 저장 | 목록 건수 +1 |
| TC-DEMO-012 | P0 | PW | CRUD 수정 | 임의 행 수정 저장 | 수정 값으로 행 반영 |
| TC-DEMO-013 | P0 | PW | CRUD 단건 삭제 | 삭제 클릭 후 확인 | 해당 행 삭제 |
| TC-DEMO-014 | P1 | PW | CRUD 선택 삭제 | 다중 선택 후 선택삭제 | 선택 행 일괄 삭제 |
| TC-DEMO-015 | P1 | PW | CRUD 검색-키워드 | 키워드 입력 후 검색 | 일치 데이터만 노출 |
| TC-DEMO-016 | P1 | PW | CRUD 검색-상태 | 상태 선택 후 검색 | 상태 필터 반영 |
| TC-DEMO-017 | P1 | PW | CRUD 검색-기간 | 기간 설정 후 검색 | 기간 필터 반영 |
| TC-DEMO-018 | P1 | PW | CRUD 초기화 | 필터 입력 후 초기화 클릭 | 필터 값 리셋 + 전체 목록 복원 |
| TC-DEMO-019 | P1 | PW | CRUD 빈 상태 | 필터로 0건 유도 | 빈 상태 메시지 노출 |
| TC-DEMO-020 | P1 | PW | CRUD 로딩 상태 | 데이터 로딩 구간 관찰 | 로딩/스켈레톤 후 콘텐츠 전환 |
| TC-DEMO-021 | P1 | PW | 폼 비인증 접근 | `/sample/form` 접속 | 페이지 렌더링 성공 |
| TC-DEMO-022 | P0 | PW | 폼 Step1 유효성 차단 | 필수값 비우고 다음 단계 | 진행 차단 + 에러 표시 |
| TC-DEMO-023 | P0 | PW | 폼 Step3 제출 성공 | 필수값 입력 후 최종 제출 | 성공 Toast + 폼 초기화 |
| TC-DEMO-024 | P1 | PW | 폼 단계 이동 | 이전/다음 버튼 반복 | 단계 상태와 인디케이터 일치 |
| TC-DEMO-025 | P1 | PW | 관리자 비인증 접근 | `/sample/admin` 접속 | 페이지 렌더링 성공 |
| TC-DEMO-026 | P1 | PW | 관리자 탭 전환 | 탭 3개 순회 클릭 | 탭 콘텐츠 즉시 전환 |
| TC-DEMO-027 | P1 | PW | 관리자 사용자 Drawer 저장 | 사용자 탭 저장 | 저장 성공 알림 |
| TC-DEMO-028 | P1 | PW | 관리자 사용자 Drawer 취소 | 수정 후 취소 | 원본 유지 |
| TC-DEMO-029 | P1 | PW | 관리자 시스템 설정 저장 | 시스템 설정 탭 저장 | `설정이 저장되었습니다` Toast |
| TC-DEMO-030 | P1 | PW | 샘플 공통 에러 복원력 | API 실패/예외 모킹 | Alert/Toast 노출 + 레이아웃 유지 |

## 3) 인증 템플릿 경로 (`TC-AUTH-*`)
| ID | Pri | 자동화 | 시나리오 | 절차 | 기대 결과 |
| --- | --- | --- | --- | --- | --- |
| TC-AUTH-001 | P0 | PW | 로그인 하단 링크 집합 | `/login` 접속 | 회원가입/비밀번호찾기 링크 노출 |
| TC-AUTH-002 | P0 | PW | 로그인 성공(next 없음) | 유효 계정 로그인 | `/dashboard` 이동 |
| TC-AUTH-003 | P0 | PW | 로그인 성공(next 있음) | `/login?next=/dashboard/tasks` 진입 후 로그인 | `/dashboard/tasks` 이동 |
| TC-AUTH-004 | P0 | PW | 로그인 실패-401 | 잘못된 비번 제출 | 사용자 에러 + `AUTH_401_INVALID` 처리 |
| TC-AUTH-005 | P0 | PW | 로그인 입력 유효성-422 | 짧은 비번/아이디 제출 | 제출 차단 또는 422 처리 |
| TC-AUTH-006 | P1 | PW | 로그인 Enter 제출 | 비번 필드에서 Enter | 로그인 요청 1회 전송 |
| TC-AUTH-007 | P1 | PW | 로그인 접근성 레이블 | 스크린리더 점검 | 레이블/에러 문구 읽힘 |
| TC-AUTH-008 | P0 | PW | 로그아웃 동작 | 로그인 후 로그아웃 클릭 | 쿠키 삭제 + `/login` 이동 |
| TC-AUTH-009 | P0 | PW | invalid next 방어 | `/login?next=https://evil.com` | 로그인 후 `/dashboard` 이동 |
| TC-AUTH-010 | P1 | PW | 리프레시 토큰 복구 | access 만료 + refresh 유효 상태 | `/api/session/bootstrap` 경유 복귀 |
| TC-AUTH-011 | P0 | PW | 보호 경로 직접 접근(비인증) | `/dashboard` 직접 접근 | `/login` 리다이렉트 |
| TC-AUTH-012 | P1 | PW | 인증 상태에서 /login 접근 | 로그인 상태 `/login` 접근 | `/dashboard` 리다이렉트 |
| TC-AUTH-013 | P1 | PW | 비밀번호찾기 공개 접근 | `/forgot-password` 접속 | 리다이렉트 없이 렌더링 |
| TC-AUTH-014 | P1 | PW | 비밀번호찾기 이메일 유효성 | 빈값/형식오류 제출 | 필드 에러 표시 |
| TC-AUTH-015 | P1 | PW | 비밀번호찾기 성공/실패 문구 동일 | 존재/비존재 이메일 제출 | 계정 존재 여부 노출 없는 안내 |
| TC-AUTH-016 | P1 | PW | 비밀번호찾기 키보드 조작 | Tab/Enter로 조작 | 키보드만으로 제출 가능 |
| TC-AUTH-017 | P0 | PW | 회원가입 공개 접근 | `/signup` 접속 | 리다이렉트 없이 렌더링 |
| TC-AUTH-018 | P0 | PW | 회원가입 필수 유효성 | 필수 누락/패턴 오류 제출 | 항목별 에러 노출 |
| TC-AUTH-019 | P0 | PW | 회원가입 성공 | 유효값 제출 | `/login` 이동 + 성공 문구 |
| TC-AUTH-020 | P0 | PW | 회원가입 중복 이메일 | 동일 이메일 재시도 | 409 처리 + 중복 안내 |

## 4) 보호 대시보드/업무/설정 (`TC-DASH-*`)
| ID | Pri | 자동화 | 시나리오 | 절차 | 기대 결과 |
| --- | --- | --- | --- | --- | --- |
| TC-DASH-001 | P0 | PW | `/dashboard` SSR 초기 렌더링 | 로그인 후 `/dashboard` 접근 | 초기 통계/목록 서버렌더링 |
| TC-DASH-002 | P1 | PW | `/dashboard` 에러 상태 UI | API 실패 모킹 | 에러 UI + 레이아웃 유지 |
| TC-DASH-003 | P1 | PW | requestId 노출 | 에러 응답에 requestId 포함 | 사용자 메시지와 같이 표시 |
| TC-DASH-004 | P1 | PW | 대시보드 CTA로 tasks 이동 | 대시보드에서 업무관리 CTA 클릭 | `/dashboard/tasks` 이동 |
| TC-DASH-005 | P0 | PW | `/dashboard/tasks` 검색바 렌더링 | tasks 페이지 접속 | 키워드/상태/검색/초기화/등록 버튼 노출 |
| TC-DASH-006 | P0 | PW | `/dashboard/tasks` 테이블 컬럼 | 테이블 헤더 확인 | 제목/상태/금액/태그/등록일/관리 노출 |
| TC-DASH-007 | P1 | PW | tasks URL 쿼리 동기화 | 필터 조작 후 URL 확인 | `q/status/sort/page` 동기화 |
| TC-DASH-008 | P1 | PW | tasks URL 재진입 복원 | 쿼리 포함 URL 재접속 | 동일 필터 상태 재현 |
| TC-DASH-009 | P0 | PW | tasks 신규 생성 payload | 등록 Drawer 저장 | `DATA_NM/STAT_CD/AMT/TAG_JSON/DATA_DESC` 매핑 |
| TC-DASH-010 | P0 | PW | tasks 수정 payload | 수정 Drawer 저장 | 변경 필드 정상 매핑 |
| TC-DASH-011 | P0 | PW | tasks 삭제 | 삭제 수행 후 재조회 | 행 제거 + 목록 동기화 |
| TC-DASH-012 | P1 | PW | tasks TAG_JSON 직렬화 | 태그 `a,b,c` 입력 저장 | API payload JSON 배열 문자열 전송 |
| TC-DASH-013 | P1 | PW | tasks 생성 후 새로고침 | 생성 직후 F5 | 생성 데이터 유지 |
| TC-DASH-014 | P1 | PW | tasks 수정 후 새로고침 | 수정 직후 F5 | 수정 데이터 유지 |
| TC-DASH-015 | P1 | PW | tasks 0건 빈 상태 | 0건 조건 유도 | `업무가 없습니다` 노출 |
| TC-DASH-016 | P1 | PW | tasks 로딩 인디케이터 | 조회/저장 시점 관찰 | 로딩 표시 후 결과 전환 |
| TC-DASH-017 | P1 | PW | tasks 에러 처리 | API 500 모킹 | Alert/Toast + requestId 표시 |
| TC-DASH-018 | P0 | PW | `/dashboard/settings` 탭 구성 | settings 진입 | `내 프로필/시스템 설정` 탭 렌더링 |
| TC-DASH-019 | P1 | PW | 프로필 저장 | 이름/알림 설정 수정 후 저장 | 성공 피드백 + 재조회 일치 |
| TC-DASH-020 | P1 | PW | 시스템 설정 저장 UX | 시스템 탭 저장 | 성공 피드백 노출 |
| TC-DASH-021 | P1 | PW | 대시보드 landmark/a11y | 키보드/스크린리더 점검 | landmark/role/포커스 유효 |
| TC-DASH-022 | P1 | PW | SSR ↔ CSR 모드 전환 안정성 | 페이지 모드 전환 후 진입 | 라우팅/가드/데이터 계약 유지 |
| TC-DASH-023 | P1 | VT | 페이지 파일 설정 파싱 | `dynamic/runtime/revalidate` 정적 파싱 검증 | Next 경고 없이 동작 |
| TC-DASH-024 | P1 | VT | MODE 규약 준수 | initData 기반 SSR/CSR 테스트 | 동일 데이터 계약 유지 |
| TC-DASH-025 | P0 | PW | 보호경로 미인증 접근 | 로그아웃 후 `/dashboard/settings` 접근 | `/login` 리다이렉트 |
| TC-DASH-026 | P1 | PW | 보호경로 직접 URL 유지 | 로그인 후 deep-link 접근 | 원래 경로 렌더링 성공 |

## 5) 미들웨어/BFF/API 런타임 (`TC-API-*`)
| ID | Pri | 자동화 | 시나리오 | 절차 | 기대 결과 |
| --- | --- | --- | --- | --- | --- |
| TC-API-001 | P0 | VT | 미인증 보호경로 307 | 미들웨어 테스트에서 보호경로 호출 | `/login` 307 + `nx` 쿠키 저장 |
| TC-API-002 | P1 | VT | `/api/**` 미들웨어 제외 | `/api` 경로 매칭 확인 | 미들웨어 개입 없음 |
| TC-API-003 | P0 | VT | apiJSON credentials include | API 유틸 호출 검증 | `credentials:'include'` 강제 |
| TC-API-004 | P0 | VT | 401 refresh 1회 재시도 | 401→refresh→retry 모킹 | 성공 시 원요청 응답 반환 |
| TC-API-005 | P0 | VT | refresh 실패 리다이렉트 | refresh도 401 모킹 | `/login?next=...&reason=...` 이동 |
| TC-API-006 | P1 | VT | reason 쿠키 sanitize | 잘못된 reason 입력 | 안전 값만 cookie 저장 |
| TC-API-007 | P1 | VT | next sanitize | 절대URL next 입력 | 내부 경로만 허용 |
| TC-API-008 | P1 | VT | /login query 정리 | `/login?next=...` 접근 | 주소창 `/login` 정리 + `nx` 보관 |
| TC-API-009 | P1 | VT | prefetch bypass | purpose=prefetch 요청 | redirect 없이 통과 |
| TC-API-010 | P1 | VT | bootstrap 복구 체인 | refresh만 있고 access 없음 | `/api/session/bootstrap` 경유 복귀 |
| TC-API-011 | P0 | VT | BFF Set-Cookie 재작성 | 로그인 응답 프록시 | 프론트 도메인 기준 cookie 세팅 |
| TC-API-012 | P1 | VT | BFF 에러 표준 래핑 | 백엔드 에러 응답 프록시 | 표준 에러 처리 유지 |
| TC-API-013 | P1 | VT | openapi client operationId | operationId 호출 테스트 | 대응 엔드포인트 호출 성공 |
| TC-API-014 | P1 | VT | SSR/CSR 데이터 전략 동일성 | initData + fetch 모드 테스트 | 결과 포맷/오류 처리 일치 |
| TC-API-015 | P1 | VT | 세션 부트스트랩 라우트 | bootstrap route 직접 호출 | 성공 시 목적 경로 리다이렉트 |

## 6) 백엔드 API/DB/관측성 (`TC-BE-*`)
| ID | Pri | 자동화 | 시나리오 | 절차 | 기대 결과 |
| --- | --- | --- | --- | --- | --- |
| TC-BE-001 | P0 | PY | 로그인 성공 쿠키 발급 | `/api/v1/auth/login` 유효 계정 호출 | access/refresh 쿠키 + 토큰 본문 반환 |
| TC-BE-002 | P0 | PY | 로그인 실패 401 | 잘못된 비밀번호 호출 | 401 + `AUTH_401_INVALID` |
| TC-BE-003 | P0 | PY | 로그인 입력오류 422 | 짧은 아이디/비번 호출 | 422 + `AUTH_422_INVALID_INPUT` |
| TC-BE-004 | P1 | PY | 401 헤더 규약 | 보호 API 비인증 호출 | `WWW-Authenticate: Bearer` 포함 |
| TC-BE-005 | P0 | PY | refresh 성공 | 유효 refresh 쿠키로 refresh 호출 | access/refresh 재발급 |
| TC-BE-006 | P0 | PY | refresh 실패 | 만료/위조 refresh 쿠키 호출 | 401 + 쿠키 삭제 |
| TC-BE-007 | P0 | PY | logout 후 refresh 차단 | logout 후 refresh 호출 | 401 반환 |
| TC-BE-008 | P1 | PY | Bearer만 신뢰 | 쿠키만/헤더 누락 보호 API 호출 | 401 차단 |
| TC-BE-009 | P1 | PY | rate limit 동작 | 로그인 실패 반복 호출 | 429 + Retry-After |
| TC-BE-010 | P0 | PY | T_USER 존재 | DB 초기화 후 테이블 조회 | `T_USER` 존재 |
| TC-BE-011 | P0 | PY | demo 계정 seed | seed 스크립트 실행 후 조회 | demo 계정 생성 |
| TC-BE-012 | P1 | PY | seed idempotent | seed 2회 실행 | 중복 없이 유지 |
| TC-BE-013 | P0 | PY | 단일 트랜잭션 커밋 | `/transaction/test/single` 호출 | 성공 + 커밋 로그 |
| TC-BE-014 | P0 | PY | 유니크 위반 롤백 | `/transaction/test/unique-violation` 호출 | 실패 + 롤백 로그 |
| TC-BE-015 | P1 | PY | tx 로그 필드 | tx 로그 확인 | `requestId/txId/phase/latency_ms` 포함 |
| TC-BE-016 | P1 | PY | retry 성공 케이스 | retries 설정 후 일시 실패 유도 | 재시도 후 성공 |
| TC-BE-017 | P1 | PY | retry 실패 케이스 | retries 초과 유도 | 최종 실패 반환 |
| TC-BE-018 | P1 | PY | savepoint 부분 롤백 | savepoint API 테스트 | 부분 롤백 성공 |
| TC-BE-019 | P0 | PY | `/healthz` 200 | healthz 호출 | 200 + 정상 본문 |
| TC-BE-020 | P0 | PY | `/readyz` up/down | DB up/down 각각 호출 | up=200, down=503 |
| TC-BE-021 | P1 | PY | `X-Request-Id` 응답 | 임의 request id 전달 | 응답/본문/로그 동일 id |
| TC-BE-022 | P1 | PY | 구조적 JSON 로그 | 요청 1건 실행 후 로그 파싱 | 공통 키(ts,level,requestId 등) 존재 |
| TC-BE-023 | P1 | PY | maintenance mode | `MAINTENANCE_MODE=true`로 readyz 호출 | 503 반환 |
| TC-BE-024 | P2 | PY | Oracle ping 쿼리 | Oracle 모킹 환경 readyz | `SELECT 1 FROM DUAL` 사용 |
| TC-BE-025 | P1 | PY | OpenAPI 로그인 문서 | `/openapi.json` 조회 | login 200 + Set-Cookie 문서화 |
| TC-BE-026 | P2 | PY | CSRFToken optional 문서 | OpenAPI 파라미터 확인 | CSRF optional 표기 |
| TC-BE-027 | P2 | PY | openapi-client-axios 예제 | JS 클라이언트 예제 실행 | 엔드포인트 호출 성공 |
| TC-BE-028 | P0 | PY | SQL `-- name:` 키 강제 | query 로더 로딩 | 누락/중복 시 예외 |
| TC-BE-029 | P1 | PY | SQL watch reload | dev에서 sql 수정 | 1초 내 리로드 로그 |
| TC-BE-030 | P1 | PY | SQL 바인딩 강제 | 치환 문자열 시도 | 바인딩 규칙 위반 차단 |
| TC-BE-031 | P1 | PY | query load JSON 로그 | 쿼리 로딩 수행 | `file/keys/count/duration_ms` 기록 |
| TC-BE-032 | P2 | PY | query watcher 설정키 | on/off, debounce 변경 | 설정대로 동작 |
| TC-BE-033 | P0 | PY | dashboard 목록 조회 | 인증 후 `GET /api/v1/dashboard` | 200 + 목록 반환 |
| TC-BE-034 | P0 | PY | dashboard 상세 조회 | 존재 ID 조회 | 200 + 단건 반환 |
| TC-BE-035 | P0 | PY | dashboard 생성 | 유효 payload POST | 201 + 생성 데이터 |
| TC-BE-036 | P0 | PY | dashboard 수정 | 유효 payload PUT | 200 + 수정 데이터 |
| TC-BE-037 | P0 | PY | dashboard 삭제 | DELETE 호출 후 목록 조회 | 삭제 반영 |
| TC-BE-038 | P1 | PY | dashboard 미존재 ID | 없는 ID 상세/수정/삭제 | 404 + 표준 에러 |
| TC-BE-039 | P1 | PY | dashboard 입력오류 | 잘못된 payload | 422 + `DASH_422_INVALID_INPUT` |
| TC-BE-040 | P1 | PY | dashboard 인증 가드 | 비인증 CRUD 요청 | 401 차단 |
| TC-BE-041 | P1 | PY | dashboard SQL 파일기반 | CRUD 호출 시 query key 확인 | sql 파일 블록 사용 |
| TC-BE-042 | P0 | PY | profile 조회 | 인증 후 `GET /api/v1/profile/me` | 200 + 내 정보 |
| TC-BE-043 | P0 | PY | profile 수정 | `PUT /api/v1/profile/me` | 200 + 변경 반영 |
| TC-BE-044 | P1 | PY | profile 재조회 일치 | 수정 후 재조회 | 값 일치 |
| TC-BE-045 | P1 | PY | profile 비인증/권한오류 | 비인증/타유저 시도 | 401/403 구분 반환 |
| TC-BE-046 | P1 | PY | profile 에러 본문 | 오류 유도 | `code/requestId` 포함 |
| TC-BE-047 | P0 | PY | signup 성공 | 유효값 POST `/auth/signup` | 201 + 사용자 생성 |
| TC-BE-048 | P0 | PY | signup 중복 409 | 동일 이메일 재가입 | 409 + `AUTH_409_USER_EXISTS` |
| TC-BE-049 | P0 | PY | signup 422 | 필수 누락/형식오류 | 422 + `AUTH_422_INVALID_INPUT` |
| TC-BE-050 | P0 | PY | signup 비밀번호 해시 저장 | 가입 후 DB 확인 | 평문 미저장, hash 저장 |
| TC-BE-051 | P1 | PY | signup DB 미준비 503 | DB 연결 차단 상태 | 503 + `AUTH_503_DB_NOT_READY` |
| TC-BE-052 | P1 | PY | signup cache-control | signup 응답 헤더 확인 | `Cache-Control: no-store` |

## 7) 공통 NFR/접근성/반응형/보안 (`TC-NFR-*`)
| ID | Pri | 자동화 | 시나리오 | 절차 | 기대 결과 |
| --- | --- | --- | --- | --- | --- |
| TC-NFR-001 | P0 | PW | 키보드 전수-로그인/회원가입/비번찾기 | Tab/Shift+Tab/Enter 순회 | 마우스 없이 주요 동작 가능 |
| TC-NFR-002 | P1 | PW | 폼 에러 스크린리더 읽기 | 유효성 에러 발생 | 레이블+에러 문구 읽힘 |
| TC-NFR-003 | P1 | PW | 포커스 가시성 | 버튼/링크/인풋 포커스 확인 | `focus-visible` 명확 |
| TC-NFR-004 | P1 | PW | 대시보드 landmark/role | 주요 영역 role 확인 | header/nav/main/table 유효 |
| TC-NFR-005 | P1 | PW | contrast 공개 화면 | 랜딩/GNB/CTA 대비 확인 | WCAG AA 충족 |
| TC-NFR-006 | P1 | PW | contrast 보호 화면 | dashboard/tasks/settings 대비 | WCAG AA 충족 |
| TC-NFR-007 | P2 | VT | 컴포넌트 바인딩 회귀 | dataObj/dataKey 테스트 | 중첩 변경/삭제 반영 |
| TC-NFR-008 | P2 | VT | 컨트롤드/바운드 모드 동등성 | Input/Select 양 모드 테스트 | 동일 UX 보장 |
| TC-NFR-009 | P1 | PW | SSR 페이지 성능 스모크 | `/`, `/sample`, `/dashboard` 측정 | LCP<2.5s(로컬 기준), 레이아웃 안정 |
| TC-NFR-010 | P1 | PW | 마이그레이션 회귀 | 로그인→대시보드→로그아웃 플로우 | 콘솔 에러 0, 기능 동등 |
| TC-NFR-011 | P1 | PW | 모바일 레이아웃-샘플 허브 | 360x800에서 `/sample` 검수 | 텍스트/버튼 깨짐 없음 |
| TC-NFR-012 | P1 | PW | 모바일 레이아웃-CRUD | 360x800에서 `/sample/crud` 검수 | 스크롤/드로어/필터 동작 정상 |
| TC-NFR-013 | P1 | PW | 모바일 사이드바 오버레이 | 모바일에서 메뉴 오픈 | 본문 가림/클릭차단 정상 |
| TC-NFR-014 | P1 | PW | 모바일 메뉴 닫힘 동작 | 메뉴 항목 클릭/외부 클릭 | 메뉴 닫힘 및 포커스 복원 |
| TC-NFR-015 | P1 | MANUAL | 보안 헤더 점검 | 주요 응답 헤더 확인 | 민감 정보 노출 없음, 캐시 정책 적절 |
| TC-NFR-016 | P1 | MANUAL | 쿠키 속성 점검(prod) | Set-Cookie 확인 | HttpOnly/SameSite/Secure 정책 일치 |
| TC-NFR-017 | P1 | MANUAL | CORS allowlist 점검 | Origin 변경 요청 | 허용 Origin만 통과 |
| TC-NFR-018 | P1 | MANUAL | SQL 로그 민감정보 점검 | 쿼리 로그 확인 | 비밀번호/PII 평문 미노출 |
| TC-NFR-019 | P2 | MANUAL | requestId 상관관계 | 프론트 실패→백엔드 로그 추적 | 동일 requestId로 추적 가능 |
| TC-NFR-020 | P2 | MANUAL | 로그 JSON 파서 호환성 | 로그 파일 샘플 파싱 | 파싱 실패 없이 구조 유지 |
| TC-NFR-021 | P2 | PW | 브라우저 호환성-Chrome | 핵심 플로우 실행 | PASS |
| TC-NFR-022 | P2 | PW | 브라우저 호환성-Edge | 핵심 플로우 실행 | PASS |
| TC-NFR-023 | P2 | PW | 브라우저 호환성-Safari | 핵심 플로우 실행 | PASS |
| TC-NFR-024 | P2 | MANUAL | 네트워크 장애 복원력 | API 타임아웃/오프라인 시뮬레이션 | 사용자 안내 + 복구 가능 |
| TC-NFR-025 | P2 | MANUAL | 장기 세션 안정성 | 장시간 idle 후 재접속 | refresh/bootstrap 체인 정상 |

---

## 실행 순서 권장
1. `P0` 전체 우선 실행 (`TC-PUB`, `TC-AUTH`, `TC-DASH`, `TC-BE` 중심)
2. `P1` 회귀 + 모바일 + 접근성
3. `P2` 품질 강화(브라우저 매트릭스/장기 안정성)

## 실패 분류 규칙
- `BLOCKER`: P0 실패(배포 금지)
- `MAJOR`: 핵심 사용자 여정 차단(P1)
- `MINOR`: 우회 가능/UI 미세 오차(P2)

## 제품 정책 결정(2026-02-23)
1. `/sample/crud` 데이터는 복잡한 영속 저장을 추가하지 않고, 브라우저 새로고침 기준으로 초기화되는 현재 동작을 유지한다.
2. `/sample/dashboard` KPI/차트/최근목록은 `/sample/crud` 조작 결과를 반영한다.
3. `/sample/admin` 저장은 더미 단절 상태를 끝내고, 샘플 내부 공유 상태와 연결해 화면 이동 후에도 반영 상태를 유지한다.
4. `/forgot-password`는 실제 SMTP 발송 없이 “요청 접수” UX만 제공한다.
5. 공개 랜딩의 문의하기 외부 링크는 제거한다.
6. robots 정책은 공개 퍼널(`/, /sample/*, /component`) 인덱싱 허용, 템플릿 인증/보호 경로(`/login`, `/signup`, `/forgot-password`, `/dashboard*`)는 `noindex` 적용을 기본안으로 사용한다.
