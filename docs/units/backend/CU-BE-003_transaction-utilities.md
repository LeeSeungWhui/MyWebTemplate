---
id: CU-BE-003
name: Transaction Utilities
module: backend
status: implemented
priority: P1
links: [CU-BE-006]
---

### Purpose
- DB 而ㅻ꽖???좏떥怨??⑥씪/?ㅼ쨷 DB ?몃옖??뀡 ?곗퐫?덉씠?곕줈 CRUD ?섑뵆???쒓났?쒕떎.

### Scope
- ?ы븿
  - `@transaction(engine)` ?⑥씪 DB ?몃옖??뀡(?쒖?)
  - ?듭뀡: `isolation`, `timeout_ms`, `retries`, `retry_on`(serialization/deadlock)
  - ?섑뵆 CRUD ?붾뱶?ъ씤???앹꽦/議고쉶) 1?명듃
  - ?ㅽ뻾/而ㅻ컠/濡ㅻ갚 濡쒓퉭(requestId, tx_id, phase, latency_ms, rows, sql_count)
- ?쒖쇅
  - ?ㅼ쨷 DB/XA ?몃옖??뀡???댁쁺 ?섏? 蹂댁옣(李④린)

### Interface
- API(?덉떆)
  - POST `/api/v1/transaction/test/single` ???깃났 ??而ㅻ컠(?⑥씪 insert + 議고쉶)
  - POST `/api/v1/transaction/test/unique-violation` ??UNIQUE ?쒖빟 ?꾨컲 ?좊룄 ??濡ㅻ갚 寃利?
### Data & Rules
```
{
  "table": "test_transaction",
  "fields": [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "value TEXT UNIQUE"
  ]
}
```
- 洹쒖튃: 紐⑤뱺 ?곗씠??蹂寃쎌? `@transaction(engine)` ?섏뿉???섑뻾

### NFR & A11y
- ?깅뒫: CRUD P95 < 200ms(濡쒖뺄 sqlite 湲곗?)
- 濡쒓퉭: `requestId, tx_id, phase(start|commit|rollback), latency_ms, rows, sql_count` 湲곕줉

### Acceptance Criteria
- AC-1: `/api/v1/transaction/test/single`??而ㅻ컠?섍퀬, `/api/v1/transaction/test/unique-violation`? 濡ㅻ갚?섏뼱 以묐났 ?됱씠 ?⑥? ?딅뒗??
- AC-2: ?몃옖??뀡 ?쒖옉/而ㅻ컠/濡ㅻ갚 濡쒓렇??`requestId, tx_id, phase, latency_ms`媛 湲곕줉?쒕떎.
- AC-3: ?쒖? ?묐떟 ?ㅽ궎留덈줈 寃곌낵媛 諛섑솚?쒕떎.
- AC-4: 吏곷젹??異⑸룎/?곕뱶??諛쒖깮 ???ㅼ젙??`retries` 踰붿쐞 ???ъ떆?????깃났 ?먮뒗 紐낇솗???먮윭濡?醫낅즺?쒕떎.
- AC-5: 以묒꺽 ?몃옖??뀡(savepoint) ?곕え?먯꽌 ?대? ?ㅽ뙣 ???몃? ?몃옖??뀡? ?좎??쒕떎.

### Tasks
- T1: ?섑뵆 CRUD ?붾뱶?ъ씤??蹂댁셿(`/api/v1/transaction/test/single`, `/api/v1/transaction/test/unique-violation`)
- T2: `@transaction(engine, isolation="READ COMMITTED", timeout_ms=5000, retries=2, retry_on=["serialization","deadlock"])` ?듭뀡 泥섎━
- T3: ?ㅽ뻾 ?쒓컙(ms)/sql_count 濡쒓퉭 諛??먮윭 留ㅽ븨
- T4: savepoint 湲곕컲 以묒꺽 ?몃옖??뀡 ?곕え ?붾뱶?ъ씤??異붽?
- T5: ?⑥씪 DB ?몃옖??뀡 寃쎈줈?????pytest(而ㅻ컠/濡ㅻ갚/?ъ떆???몄씠釉뚰룷?명듃)

