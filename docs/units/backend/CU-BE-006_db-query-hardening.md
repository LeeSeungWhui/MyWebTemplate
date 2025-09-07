---
id: CU-BE-006
name: DB & Query Loader Hardening
module: backend
status: implemented
priority: P2
links: [CU-BE-003]
---

### Purpose
- DB 而ㅻ꽖???/寃⑸━?섏?/?뚮씪誘명꽣 諛붿씤??荑쇰━ ?ル━濡쒕뱶 濡쒓퉭??怨좊룄?뷀븳??

### Scope
- ?ы븿
  - query/ ?붾젆?곕━??.sql ?뚯씪 濡쒕뵫(-- name: ???뚯떛) 諛??덉??ㅽ듃由?愿由?  - 諛붿씤???뚮씪誘명꽣 媛뺤젣(臾몄옄??移섑솚 湲덉?)
  - Dev ?섍꼍?먯꽌 watchdog 湲곕컲 ?ル━濡쒕뱶(?붾컮?댁뒪, 遺遺??ъ쟻??
  - 濡쒕뵫 ?ㅽ뙣 ??留덉?留??뺤긽蹂??좎?, 珥덇린 濡쒕뵫 ?ㅽ뙣??遺???ㅽ뙣
  - 濡쒕뱶/由щ줈??濡쒓퉭(?덈꺼/硫뷀?: file, keys, count, duration_ms)
- ?쒖쇅
  - ORM 紐⑤뜽 ?먮룞?앹꽦, ?숈쟻 ?ㅽ궎留?留덉씠洹몃젅?댁뀡

### Interface
- ?뚯씪 洹쒖빟(.sql)
  - -- name: member.selectById
    SELECT * FROM member WHERE id = :id;
  - -- name: member.insert
    INSERT INTO member(id, name) VALUES(:id, :name);
- ?쒕퉬???ъ슜 洹쒖빟
  - service 怨꾩링?먯꽌 query_registry["member.selectById"]濡?議고쉶 ??SQLAlchemy Core text + bind params濡??ㅽ뻾
- ?뚯꽌 洹쒖빟
  - 釉붾줉 ?쒖옉 ??- name: key???ㅼ쓬 以꾨????ㅼ쓬 -- name: ?꾧퉴吏瑜?SQL濡?媛꾩＜(鍮덉쨪/二쇱꽍 ?ы븿). 以묐났 ?ㅻ뒗 ?먮윭, ?뚯씪 ?몄퐫??UTF-8

### Acceptance Criteria
- AC-1: ?쒕쾭 湲곕룞 ??query/??紐⑤뱺 -- name: 釉붾줉???뚯떛?섏뼱 ?덉??ㅽ듃由ъ뿉 ?곸옱?쒕떎(以묐났 ?ㅻ뒗 ?먮윭).
- AC-2: Dev?먯꽌 .sql ?섏젙 ??N<1s ???덉??ㅽ듃由ш? 媛깆떊?섍퀬, ?먮윭 ??留덉?留??뺤긽蹂몄쓣 ?좎??쒕떎.
- AC-3: 紐⑤뱺 ?ㅽ뻾? 諛붿씤???뚮씪誘명꽣留??ъ슜?쒕떎(臾몄옄??移섑솚 ?먯? ??寃쎄퀬/李⑤떒).
- AC-4: 濡쒕뱶/由щ줈???대깽?멸? JSON 濡쒓렇??湲곕줉?쒕떎(file, keys, count, duration_ms).
- AC-5: ?ㅼ젙 ?좉?濡?query_watch on/off, debounce_ms 蹂寃쎌씠 媛?ν븯??

### Tasks

### Notes
- Loader: query/ 디렉토리를 재귀 스캔하여 .sql의 `-- name:` 블록으로 {name: sql} 레지스트리를 구성한다. 이름 중복은 즉시 예외로 실패한다(fail-fast). 파일 인코딩은 UTF-8.
- Logging: 초기 로드 `event=query.load`, 변경 리로드 `event=query.reload` 구조적 JSON 로그를 남긴다(공통 필드: file, keys, count, duration_ms).
- Config: [DATABASE] `query_dir`(기본 `query` → backend/query), `query_watch`(기본 true), `query_watch_debounce_ms`(기본 150).
- Coding: 함수/변수는 camelCase, 파일/함수 헤더 주석을 포함한다(common-rules 준수).
- Partial Reload: 변경된 파일만 파싱하여 해당 파일의 키 집합을 레지스트리에서 교체한다(추가/수정/삭제 반영). 교차 파일 중복 충돌이 발생하면 리로드를 중단하고 마지막 정상본을 유지한다.
- Rollback Semantics: 핫리로드 실패 시 레지스트리는 변경되지 않으며 `event=query.reload.error` 로그만 남긴다.
