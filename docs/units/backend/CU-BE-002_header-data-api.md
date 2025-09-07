---
id: CU-BE-002
name: Header Data API
module: backend
status: implemented
priority: P2
links: [CU-BE-001, CU-BE-005]
---

### Purpose
- 怨듯넻 ?ㅻ뜑 ?곸뿭(?뚯궗/?ъ뾽???덈ぉ ?? ?뚮뜑留곸뿉 ?꾩슂??寃쎈웾 怨듯넻 ?곗씠?곕? ?쒓났?쒕떎.

### Scope
- ?ы븿: 議고쉶/?낅뜲?댄듃(API), ?몄뀡/?좏겙 ?몄쬆 ?곕룞, ETag 罹먯떛, ?낆꽌???몃옖??뀡
- ?쒖쇅: 蹂듭옟 沅뚰븳/?꾪꽣(李④린), ??⑸웾 紐⑸줉(蹂꾨룄 ?꾨찓??

### Interface
- GET `/api/v1/header-data?keys=company,regBiz,item`
  - Auth: Cookie(Session) ?먮뒗 Bearer
  - Resp(200): `{ status:true, message:"", result:{ company:{...}, regBiz:{...}, item:{...} }, requestId, count:3 }`
  - Headers: `ETag: W/"<sha256-16>"`, `Cache-Control: private, max-age=60`
  - If `If-None-Match` ?쇱튂 ??304 (諛붾뵒 ?놁쓬)

- POST `/api/v1/header-data` (upsert)
  - Auth: Cookie/Bearer, CSRF ?꾩닔(荑좏궎 ?뚮줈??
  - Body: `{ key: "company"|"regBiz"|"item", value: object }`
  - Resp(200): `{ status:true, message:"", result:{ key, value }, requestId }`

- (?덇굅??留ㅽ븨 李멸퀬留?
  - GET `/dyscm/common/makeHeaderDataProc.do` ??GET `/api/v1/header-data`
  - POST `/dyscm/common/updateHeaderDataProc.do` ??POST `/api/v1/header-data`

二쇱쓽: ?좉퇋 援ы쁽? ?ㅼ쭅 `/api/v1/header-data` 寃쎈줈留??ъ슜?쒕떎. `.do` 寃쎈줈??留덉씠洹몃젅?댁뀡 李멸퀬?⑹씠硫???肄붾뱶?먯꽌??湲덉??쒕떎.

### Data & Rules
- ?붿씠?몃━?ㅽ듃 ???ㅽ궎留?珥덇린)
  - `company`: `{ code: string, name?: string }`
  - `regBiz` : `{ code: string, name?: string }`
  - `item`   : `{ code: string, name?: string }`

- 紐⑤뜽(沅뚯옣)
  - ?뚯씠釉? `header(user_id, hkey, jvalue JSON, updated_at TIMESTAMP, UNIQUE(user_id, hkey))`
  - ?몃뜳?? `(user_id, hkey)`

- ?낆꽌??洹쒖빟
  - PG: `insert().on_conflict_do_update(...)`
  - MySQL/Maria: `INSERT ... ON DUPLICATE KEY UPDATE`
  - SQLite: `INSERT ... ON CONFLICT(user_id,hkey) DO UPDATE`
  - Oracle: `MERGE INTO ...`
  - 怨듯넻 ?ы띁: `upsert_header(engine, user_id, key, jvalue)`濡?諛⑹뼵 遺꾧린

- 寃利?  - `key ??{"company","regBiz","item"}` ?꾨땲硫?400 + `code=HD_400_INVALID_KEY`
  - `value.code`??non-empty string, 湲몄씠 ?쒗븳(?? ??64)

- 罹먯떛/ETag
  - ETag 怨꾩궛: `hash(user_id + keys + max(updated_at))`

- 蹂댁븞
  - 誘몄씤利???401/403 (Bearer 蹂댄샇 401?먮뒗 `WWW-Authenticate: Bearer` ?ы븿)
  - POST??荑좏궎 ?뚮줈?곗뿉??`X-CSRF-Token` ?꾩닔

### NFR & A11y
- ?깅뒫: P95 < 400ms
- ?덉젙?? ?몃옖??뀡 寃쎄퀎 `@transaction(engine)` ?꾩닔
- 濡쒓퉭 留덉뒪?? PII ?쒓굅/留덉뒪?? 援ъ“??濡쒓렇??`requestId,user_id,keys,rows,latency_ms` ?ы븿

### Acceptance Criteria
- AC-1: ?몄쬆???ъ슜?먭? GET `/api/v1/header-data` ?몄텧 ???붿껌 ?ㅼ뿉 ?대떦?섎뒗 媛앹껜?ㅼ씠 諛섑솚?쒕떎(湲곕낯 3??.
- AC-2: ETag ?쒓났 諛?`If-None-Match` ?쇱튂 ??304瑜?諛섑솚?쒕떎.
- AC-3: POST `/api/v1/header-data` ?낆꽌???깃났 ??利됱떆 ?ъ“?뚯뿉 諛섏쁺?쒕떎(?⑥씪 ?몃옖??뀡).
- AC-4: ?섎せ?????ㅽ궎留덉뿉??400/422 + `{status:false, code, requestId}`濡??묐떟?쒕떎.
- AC-5: 荑좏궎 ?뚮줈?곗뿉??`X-CSRF-Token` ?꾨씫 ??403??諛섑솚?쒕떎.

### Tasks
- T1: GET/POST `/api/v1/header-data` ?쇱슦??+ ?ㅽ궎留?寃利?- T2: ?낆꽌???ы띁 援ы쁽(諛⑹뼵 遺꾧린) + ?몃옖??뀡 ?곗퐫?덉씠???곸슜
- T3: ETag ?앹꽦/寃利?+ `Cache-Control` ?ㅻ뜑
- T4: Swagger ?쒓렇 `header-data`, ?붿껌/?묐떟 ?덉떆(links: CU-BE-005)
- T5: pytest(?깃났/寃利앹떎??ETag304/CSRF403/?낆꽌?몃컲??, ?ㅻえ??- T6: 濡쒓퉭: `requestId, user_id, keys, rows, latency_ms` 湲곕줉

