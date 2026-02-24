# MyWebTemplate — 페이지 구성 디자인 스펙

> **목적:** 숨고/크몽에 "포트폴리오 URL" 하나로 공유 시, 고객이 로그인 없이도 샘플 화면을 연속 체험하고 개발 역량을 파악할 수 있는 구조 설계
>
> **대상:** Codex가 구현할 수 있도록 페이지별 레이아웃/섹션/동선을 명시

## Compact CST 매핑

- CU-WEB-011: Public Sample Funnel (Landing → Sample Hub)
- CU-WEB-010: Forgot Password (Request Reset)
- CU-WEB-012: Landing & Public GNB
- CU-WEB-013: Public Sample Pages (Dashboard / CRUD / Form / Admin)
- CU-WEB-014: Dashboard Expansion (Tasks CRUD + Settings)
- CU-WEB-015: Sample Portfolio Page Refresh (Visual + Trust)
- CU-WEB-016: Signup Page (Template Route, Login-linked)
- CU-BE-007: Dashboard Tasks CRUD API (웹 `/dashboard/tasks` 대응)
- CU-BE-008: Profile & Settings API (웹 `/dashboard/settings` 대응)
- CU-BE-009: Auth Signup API (웹 `/signup` 대응)

---

## 현재 상태 (AS-IS)

| 경로 | 공개 | 현재 상태 |
|---|---|---|
| `/login`, `/signup`, `/forgot-password` | ⚙️ 템플릿 | 인증 흐름용 라우트, 공개 네비 비노출 대상 |
| `/dashboard` | ⚙️ 템플릿 | 보호 경로, 템플릿 검증용으로 유지 |
| `/sample`, `/sample/dashboard`, `/sample/crud`, `/sample/form`, `/sample/admin` | 🌐 | 공개 샘플 페이지 구현됨 |
| `/sample/portfolio`, `/component` | 🌐 | 공개 페이지 구현됨(포트폴리오는 `/sample/portfolio`, 컴포넌트는 `/component` 유지) |
| `/portfolio` | ⚙️ 템플릿 | 레거시 호환 라우트 유지(공개 네비 비노출) |
| `/` | 🌐 | 랜딩 공개 전환 완료 |

---

## 목표 구조 (TO-BE)

### 사이트맵

```
                                 / (랜딩, 공개)
                                       |
                                  /sample (허브)
          ┌───────────────┬───────────────┬───────────────┬───────────────────┬───────────────────┐
     /sample/dashboard   /sample/crud      /sample/form      /sample/admin         /component       /sample/portfolio
        (공개)           (공개)          (공개)           (공개)              (공개)               (공개)

      [템플릿 전용/비노출 경로: 직접 URL 진입만]
      /login, /signup, /forgot-password, /dashboard, /dashboard/tasks, /dashboard/settings, /portfolio
```

### 고객 동선

```
숨고/크몽 고객이 URL 클릭
      ↓
  / (랜딩) — 3초 안에 "이 사람 뭐하는 사람인지" 파악
      ↓ CTA 클릭
  /sample (허브) — 어떤 샘플을 볼지 빠르게 선택
      ↓
  /sample/dashboard — 대시보드 품질 확인
  /sample/crud      — CRUD 실사용 화면 체험
  /sample/form      — 복합 폼 UX 체험
  /sample/admin     — 관리자 화면 체험
      ↓ 더 보기
  /component — 컴포넌트 문서
  /sample/portfolio — 아키텍처/구현 요약
```

---

## Page 1: `/` 랜딩 페이지 (신규, 공개)

> 핵심 목적: URL 공유 시 첫 화면. "이 개발자가 뭘 할 수 있는지" 3초 안에 전달

### 레이아웃

**공개 GNB (글로벌 네비게이션 바)** — 모든 공개 페이지 공통
- 좌: 로고 `MyWebTemplate`
- 우: `샘플` | `컴포넌트` | `포트폴리오`
- 스크롤 시 상단 고정 (sticky), 배경 blur
- 인증 경로(`/login`, `/signup`, `/forgot-password`)는 GNB에 노출하지 않음

#### 섹션 1: Hero

| 항목 | 내용 |
|---|---|
| 배경 | 딥 블루 → 인디고 그라디언트 (`#1e3a5f` → `#312e81`) |
| 제목 | **"웹 개발, 깔끔하게 만들어드립니다"** (2xl~3xl bold, white) |
| 부제 | "관리자 화면부터 반응형 웹까지, 이 페이지가 포트폴리오입니다." (sm, white/70%) |
| CTA 버튼 | `샘플 체험하기` (파란 solid) + `컴포넌트 보기` (흰 outline) |
| 우측 | 대시보드 스크린샷을 살짝 기울여서 플로팅 (그림자 + 라운드) |

#### 섹션 2: 제공 서비스 (4카드 그리드)

| 카드 제목 | 아이콘 | 설명 |
|---|---|---|
| 관리자 대시보드 | `RiDashboardLine` | KPI/차트/테이블을 실시간으로 시각화하는 관리자 화면 |
| CRUD 관리 화면 | `RiTableLine` | 데이터 등록, 조회, 수정, 삭제를 효율적으로 관리 |
| 반응형 웹사이트 | `RiSmartphoneLine` | 모바일/태블릿/데스크톱 모두에 최적화된 레이아웃 |
| API 개발 | `RiCodeSSlashLine` | RESTful API와 백엔드 시스템 구축으로 안정적 서비스 |

- 스타일: 흰 카드, 라운드 xl, 호버 시 그림자 확대 + 아이콘 색상 변경
- 간격: `gap-6`, 모바일 1열 / 태블릿 2열 / 데스크톱 4열

#### 섹션 3: 샘플 스크린샷 갤러리

- 3개 카드: 샘플 대시보드 / 복합 폼 / 관리자 화면
- 각 카드: 스크린샷 이미지 + 하단 캡션 텍스트
- 카드 클릭 시 해당 샘플 페이지로 이동

#### 섹션 4: 기술 스택

- 한 줄에 기술 뱃지 나열: `Next.js 15` `React 19` `Python` `FastAPI` `SQLAlchemy` `Vitest`
- 스타일: 라운드 pill, 연한 배경 + 텍스트, 호버 시 살짝 떠오름

#### 섹션 5: CTA (Call To Action)

- 배경: 연한 블루 (`bg-blue-50`)
- 텍스트: "직접 체험해 보세요"
- 버튼: `샘플 보기`

#### 섹션 6: Footer

- 다크 배경 (`bg-gray-900`)
- 로고 + 카피라이트 + 링크(샘플 허브, 컴포넌트, 포트폴리오)

---

## Page 2: `/sample/dashboard` 샘플 대시보드 (신규, 공개)

> 핵심 목적: 로그인 없이도 "대시보드 품질"을 먼저 체험하게 하는 첫 샘플 화면

### 레이아웃

대시보드와 동일한 레이아웃(Header + Sidebar + Footer) 사용. 로그인 불필요, 읽기 전용 또는 더미 데이터 기준.

#### 구성

1. **KPI 카드 영역**
   - 카드 3~4개(총 건수, 상태별 건수, 합계 금액 등)
2. **요약 차트 영역**
   - 월별/상태별 추이 시각화(EasyChart)
3. **최근 항목 테이블**
   - 최근 5~10건 표시(제목/상태/금액/등록일)
4. **CTA**
   - `CRUD 샘플 보기`(`/sample/crud`)
   - `관리자 화면 보기`(`/sample/admin`)

#### 동작 규칙

- 기본값은 읽기 전용(등록/수정/삭제 버튼 없음)
- 비인증 사용자 접근 허용
- 데이터 소스는 더미 또는 읽기 전용 API 허용

---

## Page 3: `/sample/crud` CRUD 관리 화면 (신규, 공개)

> 핵심 목적: "관리자 화면 이렇게 만들어드립니다"의 실물 증거

### 레이아웃

대시보드와 동일한 레이아웃(Header + Sidebar + Footer) 사용. 단, 로그인 불필요 — 더미 데이터로 동작.

#### 상단: 검색/필터 바

| 요소 | 스펙 |
|---|---|
| 키워드 검색 | `Input` (placeholder: "검색어를 입력하세요") |
| 상태 필터 | `Select` (전체/ready/pending/running/done/failed) |
| 날짜 범위 | `DateInput` × 2 (시작일 ~ 종료일) |
| 검색 버튼 | `Button` variant=primary |
| 신규 등록 | `Button` variant=primary, 우측 정렬 |

#### 중앙: 데이터 테이블 (`EasyTable`)

| 컬럼 | 타입 | 비고 |
|---|---|---|
| ☐ | 체크박스 | 일괄 선택 |
| 번호 | 숫자 | 자동 카운트 |
| 제목 | 텍스트 | 클릭 → 상세 Drawer |
| 상태 | Badge | 색상별 분류 |
| 담당자 | 텍스트 | |
| 금액 | 숫자 (포맷) | `toLocaleString` |
| 등록일 | 날짜 | `YYYY-MM-DD` |
| 관리 | 아이콘 | ✏️ 수정 / 🗑️ 삭제 |

- 페이지네이션: `Pagination` (4~5행/페이지)
- 더미 데이터: 10~15건 (하드코딩 or initData.jsx)

#### 등록/수정: Drawer (우측 슬라이드)

| 필드 | 컴포넌트 | 비고 |
|---|---|---|
| 제목 | `Input` | required |
| 상태 | `Select` | ready/pending/running/done/failed |
| 담당자 | `Input` | |
| 금액 | `NumberInput` | 원 단위 |
| 설명 | `Textarea` | |
| 첨부파일 | 파일 업로드 영역 | 드래그앤드롭 UI |
| 하단 | `저장` + `취소` 버튼 | |

> 상태 저장은 영문 코드(`ready/pending/running/done/failed`)로 통일하고, 화면 텍스트만 한글 라벨로 매핑한다.

#### 삭제: Confirm 다이얼로그

- "정말 삭제하시겠습니까?" + 확인/취소

> 참고: 백엔드 API 연동 없이 프론트 상태(EasyList)만으로 CRUD 동작시킴. 새로고침하면 초기화 OK.

---

## Page 4: `/sample/form` 복합 폼 (신규, 공개)

> 핵심 목적: "폼이 복잡해도 깔끔하게 만들어드립니다" 증거

### 레이아웃

대시보드 레이아웃(Header + Sidebar + Footer) 동일. 공개 페이지.

#### 상단: 스텝 인디케이터

```
● 1. 기본 정보  ─────  ○ 2. 상세 정보  ─────  ○ 3. 확인/제출
   (활성, blue)         (비활성, gray)         (비활성, gray)
```

#### Step 1: 기본 정보

| 필드 | 컴포넌트 | 비고 |
|---|---|---|
| 이름 | `Input` | required |
| 이메일 | `Input` type=email | 유효성 검증 (빨간 에러 메시지) |
| 연락처 | `Input` mask=phone | `010-****-****` |
| 분류 | `Select` | 웹개발/앱개발/API개발/기타 |
| 시작일~종료일 | `DateInput` × 2 | 2컬럼 배치 |
| 예산 범위 | `NumberInput` | ₩ 포맷 |

#### Step 2: 상세 정보

| 필드 | 컴포넌트 | 비고 |
|---|---|---|
| 요청사항 | `Textarea` | 여러 줄 |
| 우선기능 | `CheckButton` 그룹 | 로그인/게시판/결제/차트/관리자 |
| 참고 URL | `Input` | optional |
| 파일 첨부 | 드래그 앤 드롭 | dashed border 영역 |

#### Step 3: 확인 / 제출

- 입력 내용 읽기 전용 요약 (카드 형태)
- `이전` + `제출하기` 버튼
- 제출 시 Toast: "신청이 완료되었습니다" (성공 토스트)

> 참고: 실제 전송 없이 프론트 상태만으로 동작. 제출 후 성공 Toast + 초기화.

---

## Page 5: `/sample/admin` 관리자 화면 (신규, 공개)

> 핵심 목적: "사용자/권한/시스템 설정 화면도 만듭니다" 증거. 의뢰 유형 중 매우 흔한 어드민 패널.

### 레이아웃

대시보드 레이아웃(Header + Sidebar + Footer) 동일. 공개, 더미 데이터.

사이드바 메뉴를 관리자용으로 구성:
- 사용자 관리 (활성)
- 역할/권한
- 시스템 설정
- 로그 조회

#### 상단: 탭 네비게이션 (`Tab`)

| 탭 | 내용 |
|---|---|
| **사용자 목록** (기본) | 사용자 테이블 |
| 역할 관리 | 역할별 권한 매트릭스 |
| 시스템 설정 | 설정값 폼 (Switch/Input) |

#### 탭 1: 사용자 목록

검색바 + "사용자 추가" 버튼 (우 정렬)

| 컬럼 | 타입 | 비고 |
|---|---|---|
| 프로필 | 아바타 (원형) | 이니셜 or 아이콘 |
| 이름 | 텍스트 | |
| 이메일 | 텍스트 | |
| 역할 | Badge | 관리자(파랑)/일반(회색)/편집자(초록) |
| 상태 | Switch | 활성/비활성 토글 |
| 가입일 | 날짜 | `YYYY-MM-DD` |
| 관리 | 아이콘 | ✏️ 수정 / 🗑️ 삭제 |

- 더미 사용자: 5~8명
- 페이지네이션: `Pagination`

#### 사용자 수정: Drawer (우측)

| 필드 | 컴포넌트 | 비고 |
|---|---|---|
| 프로필 이미지 | 아바타 업로드 (원형 + 카메라 아이콘) | |
| 이름 | `Input` | required |
| 이메일 | `Input` | readonly (회색 배경) |
| 역할 | `Select` | 관리자/일반사용자/편집자 |
| 상태 | `Switch` | 활성/비활성 |
| 알림 설정 | `Switch` × 3 | 이메일 알림 / SMS 알림 / 푸시 알림 |
| 하단 | `저장` + `취소` 버튼 | |

#### 탭 2: 역할 관리

| 구성 | 내용 |
|---|---|
| 역할 카드 3개 | 관리자 / 편집자 / 일반사용자 |
| 각 카드 | 역할명 + 설명 + 권한 체크박스 리스트 |
| 권한 항목 | 사용자 관리, 콘텐츠 편집, 설정 변경, 로그 조회, 데이터 삭제 |

#### 탭 3: 시스템 설정

| 필드 | 컴포넌트 | 비고 |
|---|---|---|
| 사이트명 | `Input` | |
| 관리자 이메일 | `Input` type=email | |
| 점검 모드 | `Switch` | on/off |
| 세션 타임아웃 | `NumberInput` | 분 단위 |
| 최대 업로드 크기 | `NumberInput` | MB 단위 |
| 하단 | `저장` 버튼 | Toast: "설정이 저장되었습니다" |

> 참고: 백엔드 연동 없이 프론트 상태만으로 동작. 새로고침하면 초기화 OK.

---

## Page 6: `/sample/portfolio` 리뉴얼 (기존 개선)

> 핵심 목적: 텍스트벽 → 비주얼 강화, 신뢰 어필

### 변경 포인트

| Before | After |
|---|---|
| 텍스트만 나열 | 아이콘 + 컬러 포인트 추가 |
| 단순 소개 위주 | 접기/펼치기 `Developer Profile`로 경력 정보 요약 |
| 샘플 동선 (텍스트 링크) | 스크린샷 카드 + 버튼 |
| Mode/Path 뱃지 | 제거 (고객에겐 불필요) |

### 섹션 구성

1. **Hero**: 그라디언트 배경 + 제목 + 한줄 소개 (현재보다 큼직하게)
2. **프로젝트 개요**: 3개 Stat 카드 (프로젝트 형태/핵심 도메인/샘플 경로)
3. **Developer Profile**: 접기/펼치기 + 경력/학력/경험 요약
4. **주요 강점**: 3개 카드
5. **작동 흐름**: `사용자 화면 → 접근 제어 → 서비스 처리` 3단계
6. **샘플 동선**: 스크린샷 3장 + 각각 CTA 버튼
7. **기술 상세 노트**: 접기/펼치기 유지

---

## Page 7: `/signup` 회원가입 페이지 (템플릿 전용 경로)

> 핵심 목적: 템플릿 인증 플로우를 보존하기 위한 보조 경로. 고객 공개 퍼널에서는 직접 노출하지 않는다.

### 동선 규칙

- 공개 GNB에는 회원가입/로그인 메뉴를 추가하지 않는다.
- `/login` 하단 링크로만 진입한다.
  - `계정이 없으신가요? 회원가입` → `/signup`
  - `비밀번호를 잊으셨나요?` → `/forgot-password`

### 레이아웃

- 로그인 페이지와 동일 톤의 단일 카드 레이아웃(모바일 중심, 가운데 정렬)
- 상단 제목: `회원가입`
- 하단 링크: `이미 계정이 있으신가요? 로그인`

### 입력 필드

| 필드 | 컴포넌트 | 규칙 |
|---|---|---|
| 이름 | `Input` | 필수, 2자 이상 |
| 이메일 | `Input` type=email | 필수, 이메일 형식 |
| 비밀번호 | `Input` type=password | 필수, 8자 이상 |
| 비밀번호 확인 | `Input` type=password | 비밀번호와 일치 |
| 약관 동의 | `Checkbox` | 필수 |
| 제출 | `Button` | 로딩 중 disabled |

### API 연동

| 메서드 | 경로 | 설명 |
|---|---|---|
| `POST` | `/api/v1/auth/signup` | 신규 계정 생성 |

- 성공: `/login` 이동 + 성공 안내 메시지
- 실패: 필드 에러 또는 공통 에러 메시지 + `requestId` 노출

---

## 공통 사항

### 공개 페이지 GNB (Global Navigation Bar)

| 요소 | 스펙 |
|---|---|
| GNB | 로고(좌) + 메뉴(우): 샘플 ▾, 컴포넌트, 포트폴리오 |
| 인증 동선 | 공개 GNB 미노출. `/login` 하단 보조 링크로만 접근 |
| 샘플 드롭다운 | 샘플 홈, 샘플 대시보드, CRUD 관리, 복합 폼, 관리자 화면 |
| 스타일 | sticky top, `backdrop-blur`, 흰 배경 80% |
| 모바일 | 햄버거 메뉴 → Drawer |

### 공개 페이지 레이아웃 선택지

- **랜딩 `/`**: GNB만 (사이드바 없음, 풀 와이드)
- **샘플 허브 `/sample` + 샘플 상세 `/sample/*`**: 대시보드 레이아웃 재사용 (Header + Sidebar + Footer)
- **포트폴리오 `/sample/portfolio`**: GNB + 풀 와이드 (사이드바 없음)
- **컴포넌트 `/component`**: 기존 Docs UI 재사용

### publicRoutes.js 변경

```diff
 export const publicRoutes = [
   '/',
   '/sample/:path*',
   '/sample',
   '/login',
   '/signup',
   '/forgot-password',
   '/component',
 ]
```

### 미들웨어 변경

- `/` (루트)를 공개로 전환: 비인증 시 랜딩 표시, 인증 시 `/dashboard` 리다이렉트 유지

---

## 우선순위

| 순위 | 페이지 | 이유 |
|---|---|---|
| **P0** | `/` 랜딩 | 숨고 URL 첫인상의 전부 |
| **P0** | `/sample` 허브 | 샘플 진입점 통합 |
| **P0** | `/sample/dashboard` | 대시보드 품질을 로그인 없이 증명 |
| **P0** | `/sample/crud` | 가장 흔한 의뢰 유형 증거 |
| **P1** | `/sample/form` | 복잡한 폼 역량 증거 |
| **P1** | `/sample/admin` | 어드민 패널 구현 역량 증거 |
| **P1** | `/component` | 컴포넌트 문서 가시성 확보 |
| **P2** | `/sample/portfolio` 리뉴얼 | 현재도 동작, 비주얼 강화 |
| **P2** | `/login`/`/signup`/`/forgot-password` | 템플릿 보조 동선 유지(공개 네비 비노출) |

---

## 템플릿 전용 대시보드 확장 (기존 `/dashboard` 보강)

> 핵심 목적: 템플릿 인증 경로(`/dashboard*`)의 완성도를 높이기 위해, 공개 퍼널과 분리된 상태에서 **백엔드 API 포함 CRUD 동작**을 유지한다.

### 현재 → 목표

| 메뉴 | 현재 | 목표 |
|---|---|---|
| 메뉴1 "대시보드" | 지표카드+차트+테이블 (동작함 ✅) | 유지, 차트 쪽 소폭 보강 |
| 메뉴2 "업무 관리" | `href: "#"` (빈 페이지) | **실제 CRUD 동작** (API 연동) |
| 메뉴3 "설정" | `href: "#"` (빈 페이지) | **프로필 수정 + 시스템 설정** |

### 사이드바 메뉴 재구성

```
📊 대시보드       /dashboard           ← 기존 유지
📋 업무 관리      /dashboard/tasks      ← 신규
   ├ 업무 목록    /dashboard/tasks
   └ 업무 등록    (Drawer)
⚙️ 설정          /dashboard/settings   ← 신규
   ├ 내 프로필    (탭)
   └ 시스템 설정  (탭)
```

---

### 메뉴2: `/dashboard/tasks` 업무 관리 (신규)

> **이것이 핵심.** 백엔드 `T_DATA` 테이블을 그대로 CRUD하는 페이지. 실제 DB에 저장/수정/삭제됨.

#### 백엔드 API 추가 필요

| 메서드 | 경로 | 설명 |
|---|---|---|
| `GET` | `/api/v1/dashboard` | 기존 목록 (검색/필터 파라미터 추가) |
| `POST` | `/api/v1/dashboard` | 신규 등록 |
| `PUT` | `/api/v1/dashboard/{id}` | 수정 |
| `DELETE` | `/api/v1/dashboard/{id}` | 삭제 |
| `GET` | `/api/v1/dashboard/{id}` | 상세 조회 |

기존 `T_DATA` 테이블 스키마:
```sql
DATA_NO, DATA_NM, DATA_DESC, STAT_CD, AMT, TAG_JSON, REG_DT
```

#### 프론트엔드 레이아웃

1. **검색/필터 바**
   - 키워드 검색 (`Input`, title/description 대상)
   - 상태 필터 (`Select`: 전체/ready/pending/running/done/failed)
   - 검색 버튼 + 초기화 버튼
   - "업무 등록" 버튼 (우측)

2. **목록 테이블** (`EasyTable`)

   | 컬럼 | 타입 | 비고 |
   |---|---|---|
   | 제목 | 텍스트 | 클릭 → 상세 Drawer |
   | 상태 | Badge | 색상 분류 (ready=회색, running=파랑, done=초록, failed=빨강) |
   | 금액 | 숫자 | `toLocaleString` |
   | 태그 | Badge 여러 개 | 쉼표 구분 → pill 뱃지 |
   | 등록일 | 날짜 | `YYYY-MM-DD` |
   | 관리 | 아이콘 | ✏️ 수정 / 🗑️ 삭제 |

   - 페이지네이션: API의 limit/offset 활용
   - 검색 시 API에 쿼리 파라미터 전달

3. **등록/수정 Drawer**

   | 필드 | 컴포넌트 | DB 컬럼 |
   |---|---|---|
   | 제목 | `Input` (required) | `DATA_NM` |
   | 상태 | `Select` | `STAT_CD` |
   | 금액 | `NumberInput` | `AMT` |
   | 태그 | `Input` (콤마 구분) | `TAG_JSON` |
   | 설명 | `Textarea` | `DATA_DESC` |
   | 하단 | `저장` + `취소` | |

   - **저장 시**: `POST /api/v1/dashboard` or `PUT /api/v1/dashboard/{id}` → 성공 Toast → 목록 새로고침
   - **수정 모드**: `GET /api/v1/dashboard/{id}`로 기존 데이터 로드

4. **삭제**: Confirm → `DELETE /api/v1/dashboard/{id}` → 성공 Toast → 목록 새로고침

> ⚠️ **실제 API 연동**: 이 페이지는 더미 데이터가 아닌 실제 백엔드 API와 통신. DB에 CRUD가 반영됨.

---

### 메뉴3: `/dashboard/settings` 설정 (신규)

> 프로필 수정 + 시스템 설정을 탭으로 구분

#### 탭 구성 (`Tab`)

##### 탭 1: 내 프로필

| 필드 | 컴포넌트 | 비고 |
|---|---|---|
| 이름 | `Input` | 현재 세션 값 바인딩 |
| 이메일 | `Input` (readonly) | 변경 불가 |
| 역할 | `Badge` (표시만) | 현재 유저 role |
| 알림 설정 | `Switch` × 3 | 이메일/SMS/푸시 알림 |
| 하단 | `저장` 버튼 | Toast: "프로필이 저장되었습니다" |

##### 탭 2: 시스템 설정

| 필드 | 컴포넌트 | 비고 |
|---|---|---|
| 사이트명 | `Input` | |
| 점검 모드 | `Switch` | |
| 세션 타임아웃 | `NumberInput` (분) | |
| 최대 업로드 크기 | `NumberInput` (MB) | |
| 하단 | `저장` 버튼 | Toast |

> 참고: 프로필은 백엔드 API(`PUT /api/v1/profile/me`) 기준으로 연동. 시스템 설정은 프론트 상태만으로도 OK.

---

### 메뉴1 대시보드 소폭 보강

현재 잘 되어있지만, 신규 업무 관리 데이터와 연동해서 의미가 살도록:

- 지표 카드 3개는 **실제 API 데이터** 반영 (현재도 됨 ✅)
- 차트 데이터가 "월별 추이"인데, 현재 더미 데이터 날짜가 제대로 분포되어 있는지 확인
- "최근 업무" 테이블에서 **제목 클릭 → `/dashboard/tasks`로 이동** 링크 추가
- "전체보기" 버튼 `href="/dashboard/tasks"` 연결

---

## 템플릿 재사용성 가이드

> 이 프로젝트는 포트폴리오이면서 동시에 **새 프로젝트의 시작 코드(boilerplate)**로 사용 가능해야 함.

### 현재 재사용 가능 요소

| 영역 | 재사용 가능 | 비고 |
|---|---|---|
| 인증 흐름 | ✅ | 로그인/로그아웃/세션/미들웨어 가드 |
| API 유틸 | ✅ | `apiJSON`/`apiRequest` SSR/CSR 통합 |
| 컴포넌트 | ✅ | 33개+ (Input, Table, Chart, Modal 등) |
| 데이터 클래스 | ✅ | EasyObj/EasyList 바인딩 패턴 |
| 레이아웃 | ✅ | Header/Sidebar/Footer 조합 |
| 백엔드 구조 | ✅ | 라우터 자동 로드, 쿼리 로더, 트랜잭션 |
| DB 커넥션 | ✅ | SQLite(dev) / MySQL(prod) 전환 가능 |

### 새 프로젝트 시작 시나리오

```
1. git clone → 프로젝트 복사
2. source ./env.sh → 환경 세팅
3. 도메인별 라우터/서비스/쿼리 추가 (기존 패턴 복사)
4. 프론트 페이지 추가 (dashboard 레이아웃 복사)
5. 포트폴리오/샘플 페이지 제거 (선택)
```

### Codex 구현 시 확인 사항

- [ ] 새 프론트 페이지 추가 시 기존 `initData.jsx` 패턴 동일하게 따르는지
- [ ] 새 백엔드 라우터 추가 시 `router/` 아래 배치만으로 자동 로드되는지
- [ ] `.sql` 쿼리 로더가 새 쿼리 파일을 잘 읽는지
- [ ] `EasyObj/EasyList` 바인딩 패턴으로 폼 ↔ API 연동이 자연스러운지
