---
id: CU-APP-007
name: Error & Toast UX (코드 사전/전역 핸들러)
module: app
status: draft
priority: P1
links: [CU-APP-001, CU-APP-002, CU-APP-003, CU-APP-004, CU-APP-005, CU-APP-006, CU-APP-008, CU-BE-001, CU-BE-004]
---

### Purpose
- 모바일 전역 오류 처리와 토스트/배너/다이얼로그 UX 규약을 일원화한다. `{status:false, code, message, requestId}` 및 네트워크/포그라운드/오프라인 이벤트를 안정적으로 사용자 경험에 매핑한다.

### Scope
- 포함
  - 전역 오류 이벤트 구독 및 정규화(코드 사전 매핑, UI 출력, 선택적 로깅)
  - 토스트/배너/다이얼로그 출력 규칙(중복 억제, 우선순위, 지속시간/액션)
  - 코드 사전(code→문구/레벨/아이콘)과 로깅 포맷 정의
  - 재시도 UX(GET 백오프/취소/재시도 버튼)
  - 오프라인/복귀 배너, 딥링크 가이드
- 제외
  - 크래시 리포팅 연동(Sentry 등; 차기)
  - 사용자 피드백/설문 양식(차기)

### Interface
- UI: 
  - Toast(일시적 경고/정보, 기본 3.5s, 액션 1개까지)
  - Banner(화면 상단 고정, 오프라인/장기 상태 안내)
  - Dialog(치명/파괴적 작업 확인)
- API: 
  - API Client 실패 `{status:false, code, message, requestId, httpStatus}` (웹/백엔드 공통 응답을 기반으로 정규화된 형태)
  - 네트워크: NET_TIMEOUT, NET_OFFLINE, NET_ABORTED, NET_DNS 등
  - 가드(004): AUTH_401_INVALID 수신 시 토큰 파기→전환

### Data & Rules
- 주요 데이터모델(JSON)
{
  "error": {
    "code": "string",
    "level": "error|warn|info|success",
    "message": "string",
    "requestId": "string"
  }
}
- 비즈니스 규칙
  - 코드 사전 예: AUTH_401_INVALID, AUTH_403_BLOCKED, AUTH_429_RATE_LIMIT, VALID_422_FIELD, API_500_UNKNOWN, API_503_UNAVAILABLE, NET_OFFLINE, NET_TIMEOUT
  - 레벨 매핑: code→level(예: AUTH_401_INVALID→error, AUTH_429_RATE_LIMIT→warn)
  - 중복 억제: 동일 code+path는 단시간 1회만 표시, 동시 다건 최대 2개
  - 표시 정책: GET은 최대 2회 백오프 + 재시도/취소 제공, 비동기 변이 요청은 자동재시도 금지
  - 오프라인: 배너 즉시 표시, 복귀 시 자동 해제 + 재검증(008)
  - 접근성: 경고는 라이브리전/포커스 이동, 스크린리더 문구
  - 로깅: ts, code, message(masked), requestId, httpStatus, method, path, latency_ms, retry_count

### NFR & A11y
- 성능 목표: 전역 핸들링 오버헤드 < 3ms, 전환/배너 표시 < 100ms
- 품질: 중복 토스트 방지 100%, 콘솔 에러 0, 비밀정보 마스킹
- i18n: 서버 메시지 직노출 금지, 코드 기반 번역

### Acceptance Criteria
- AC-1: AUTH_401_INVALID 수신 시 토큰 파기→AuthStack 전환이 안정적으로 동작한다(CU-APP-004/005).
- AC-2: NET_OFFLINE에서 상단 배너가 즉시 표시되고, 복귀 시 자동 해제/재검증이 수행된다(CU-APP-008).
- AC-3: 동일 code+path 반복에도 토스트는 1회만 표시된다(동시 최대 2개 제한).
- AC-4: GET 실패는 최대 2회 백오프 후 재시도/취소 UI가 제공되고, 변이 요청은 자동 재시도가 없다.
- AC-5: 실패 응답은 code·requestId가 포함되고 서버 원문은 직접 노출되지 않는다.
- AC-6: 모든 오류 이벤트가 표준 로깅 포맷으로 기록되며 민감정보는 마스킹된다.

### Tasks
- T1: 코드 사전 정의(코드/문구/레벨/아이콘/출력단)
- T2: 전역 오류 이벤트 구독(API Client 실패정규화→UI 출력)
- T3: 출력 컴포넌트(Toast/Banner/Dialog) 규격 및 중복 억제/우선순위
- T4: 재시도 UX(GET 백오프/취소/재시도 버튼)
- T5: 오프라인 감지(NetInfo) 및 복귀 재검증 훅(CU-APP-008)
- T6: 로깅(requestId 추적, 마스킹 규칙) 구현
- T7: 통합 시나리오(401 전환/오프라인/백오프/로깅) 테스트
- T8: 문서화(코드 사전, UX 가이드, 금지 사항)
