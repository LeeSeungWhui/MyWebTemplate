---
id: CU-APP-006
name: OTA & Runtime Config (EAS Update)
module: app
status: draft
priority: P2
links: [CU-APP-001, CU-APP-004, CU-APP-005, CU-APP-007, CU-APP-008, CU-BE-004]
---

### Purpose
- Expo EAS Update로 바이너리 릴리스와 분리된 JS/에셋의 배포/롤백을 제공하고, 런타임 구성(API Base/Feature 플래그)을 중앙관리해 리프레시 없는 환경 구성을 가능하게 한다.

### Scope
- 포함
  - OTA 채널/롤아웃 전략(프로덕션/스테이징/개발)
  - 런타임 구성 체계(EXPO_PUBLIC_* + 원격 컨피그 캐시/TTL)
  - 업데이트 UX: 무음 적용/백그라운드 다운로드/시점 제어/강제 업데이트 게이트
  - 메트릭/로깅: updateId/채널/빌드/적용시간
  - 롤백/차단 정책(블록리스트)
- 제외
  - 네이티브 모듈 배포(바이너리 릴리스는 별도 프로세스)

### Interface
- UI: 배너/다이얼로그로 필수 업데이트 공지, 무음 업데이트는 UI 변경 없이 적용
- API: /readyz 또는 별도 설정 API로 minAppVersion/원격 컨피그 제공(추후 합의)

### Data & Rules
- 주요 데이터모델(JSON)
{
  "runtime": {
    "apiBase": "string",
    "features": { "FEATURE_X": true },
    "minAppVersion": "1.2.3"
  }
}
- 비즈니스 규칙
  - 버전: 바이너리(buildVersion) / JS(updateId) / semver 기준 분리
  - 민감정보는 런타임 컨피그에 포함 금지(토큰 등)
  - OTA로 네이티브 인터페이스 변경은 금지(필요 시 바이너리)
  - 원격 컨피그 TTL 기본 15분, 세션당 최소 1회 강제 재검증 가능
  - 실패 시 마지막 유효 컨피그 사용(백업 로그 기록)
  - FEATURE_*는 로컬 ENV 기본값 후 원격 컨피그로 덮어쓰기
  - API Base 변경은 세션/캐시에 영향 → 세션 재검증 및 SWR 무효화(CU-APP-001/004/005)

### NFR & A11y
- 성능 목표: 복귀 시 업데이트 체크 오버헤드 < 80ms, 콜드 스타트 적용 지연 < 200ms
- 품질: 다운로드 실패 시 최대 2회 백오프, UI 프리즈 0
- 접근성: 강제 업데이트 시 포커스/읽기 순서 보장, 배너 명확한 안내

### Acceptance Criteria
- AC-1: production/staging/development 채널이 분리되어 OTA 배포/롤백이 정상 동작한다.
- AC-2: 복귀(포그라운드) 시 무음 업데이트가 백그라운드에서 다운로드되고 다음 콜드 스타트에 적용된다.
- AC-3: minAppVersion 초과 시 보호 스택 진입이 차단되고 업데이트 유도 UI가 표시된다.
- AC-4: EXPO_PUBLIC_API_BASE 변경 시 세션 재검증과 SWR 무효화가 수행되고 깜빡임이 최소화된다.
- AC-5: 모든 업데이트/컨피그 이벤트에 updateId/channel/buildVersion/appliedAt가 로깅된다.
- AC-6: 실패 시 마지막 유효 컨피그로 안전하게 구동된다.

### Tasks
- T1: 채널/릴리스 전략 문서화(채널 정의/롤아웃/롤백 체크리스트)
- T2: 업데이트 처리(무음/시점/강제) 로직 및 타이밍 훅 구현
- T3: 런타임 컨피그 로더(EXPO_PUBLIC_* + 원격 로더/캐시/TTL/백업)
- T4: API Base 변경 핸들링(세션 재검증 + SWR 무효화 + 경량 리프레시)
- T5: 로깅(updateId/channel/buildVersion/latency/결과 코드) 구현(CU-APP-007)
- T6: 실패/롤백 처리 케이스 정의 및 사용자 메시지/가이드 구현
- T7: QA 시나리오(채널 배포/롤백, 강제 업데이트, API Base 변경)
- T8: 운영 가이드(릴리스 절차/롤백 요건/한계) 문서화

