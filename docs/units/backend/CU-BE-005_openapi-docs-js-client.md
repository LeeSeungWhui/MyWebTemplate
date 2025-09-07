---
id: CU-BE-005
name: OpenAPI Docs & JS Client
module: backend
status: implemented
priority: P1
links: [CU-BE-001]
---

### Purpose
- Swagger/OpenAPI ?ㅽ궎留덈? ?뺣룉?섍퀬, ?꾨윴?몄뿏?쒖뿉???ъ슜?섎뒗 JS ?대씪?댁뼵???곕룞???먰솢?섍쾶 ?쒕떎(TypeScript 湲덉?).

### Scope
- ?ы븿
  - 蹂댁븞 ?ㅽ궎留?2醫?蹂묓뻾: Cookie(Session) + Bearer瑜?components.securitySchemes???뺤쓽?섍퀬, 寃쎈줈 security??OR 愿怨꾨줈 ?ъ슜
  - 204 + Set-Cookie 臾몄꽌?? /api/v1/auth/login ?묐떟??response.headers濡?Set-Cookie 紐낆떆
  - ?묐떟 ?ㅽ궎留? {status, message, result, count?, code?, requestId} ??StandardResponse, ErrorResponse 遺꾨━
  - 401 ?ㅻ뜑: WWW-Authenticate瑜?401 responses???ы븿
  - CSRF ?뚮씪誘명꽣: components.parameters.CSRFToken濡?X-CSRF-Token ?ㅻ뜑 ?뺤쓽, 鍮꾨㈀??硫붿꽌?쒖뿉 李몄“
  - Servers/Tags/operationId: dev/prod servers, x-tagGroups ?뱀뀡, operationId ?ㅼ엫?ㅽ럹?댁뒪(auth_login ??
  - JS ?대씪?댁뼵??x-codeSamples: openapi-client-axios ?몄쬆 ???먮윭 ?몃뱾 ?쒖? ?ㅻ땲???ы븿(JS ?꾩슜)
- ?쒖쇅
  - TypeScript ?꾩엯/肄붾뱶???뺤콉??湲덉?)
  - ?몃? 踰꾩????꾨왂(李④린)

### Interface
- Export
  - OpenAPI JSON: GET /openapi.json
  - Swagger UI: GET /docs
  - 蹂댁븞 ?ㅽ궎留? components.securitySchemes
  - ?묐떟 ?ㅽ궎留? components.schemas.StandardResponse, ErrorResponse
  - ?뚮씪誘명꽣: components.parameters.CSRFToken
  - ?쒕쾭: servers: [{url:"http://localhost:8000"}, {url:"https://api.example.com"}]
  - ?쒓렇 洹몃９: x-tagGroups濡??뱀뀡 ?뺣━
  - 肄붾뱶 ?섑뵆: x-codeSamples??openapi-client-axios JS ?ㅻ땲???ы븿

### Data & Rules
- ?묐떟/?먮윭 ?ㅽ궎留?紐⑤뜽怨?1:1 諛섏쁺
- 204 + Set-Cookie??response headers 紐낆떆
- 401 ?묐떟? WWW-Authenticate ?ы븿, ErrorResponse ?ㅽ궎留??ъ슜
- 鍮꾨㈀??硫붿꽌?쒖뿉 CSRFToken ?뚮씪誘명꽣 李몄“
- 誘쇨컧?뺣낫/?먮윭 ?곸꽭???ㅽ궎留덉뿉 留덉뒪???덉떆 理쒖냼??- Swagger UI?먯꽌 荑좏궎 ?몄쬆? ?숈씪 湲곗썝 ?먮뒗 ??봽濡앹떆濡쒕쭔 ?쒗뿕(credentials ?꾨떖)

### NFR & A11y
- OpenAPI ?ㅽ궎留??좏슚??寃??寃쎄퀬/?먮윭 0) 諛?臾몄꽌 鍮뚮뱶 ?깃났

### CI(검증 & JS 클라이언트 스모크)
- OpenAPI 유효성검사: GitHub Actions에서 openapi-spec-validator로 스키마 유효성 검증(`scripts/openapi_validate.py`)
- JS 스모크: Node 22 + openapi-client-axios로 서버 기동 후 `/healthz` 호출(`scripts/js_smoke.mjs`)
- 워크플로: `.github/workflows/ci.yml`에 Python 테스트 → 스키마 검증 → 서버 기동 → JS 스모크 순서로 실행

### Defaults
- JS ?대씪?댁뼵??湲곕낯 ?쇱씠釉뚮윭由? openapi-client-axios

### Acceptance Criteria
- AC-1: 濡쒓렇??API媛 204 + Set-Cookie(?ㅻ뜑)濡?臾몄꽌?붾릺怨??묐떟/?먮윭 ?ㅽ궎留덇? ?쒓렇/?뱀뀡怨??④퍡 異쒕젰?쒕떎.
- AC-2: CSRFToken ?뚮씪誘명꽣媛 鍮꾨㈀??硫붿꽌?쒖뿉 ?곸슜?섎ŉ, Try it out?먯꽌 ?꾨씫 ??403 ?ы쁽??媛?ν븯??
- AC-3: JS ?대씪?댁뼵???ㅻ땲??openapi-client-axios)???몄쬆 ???먮윭 ?몃뱾 ?쒖??쇰줈 ?숈옉?쒕떎(JS ?꾩슜).
- AC-4: ?ㅽ궎留??좏슚??寃??룸Ц??鍮뚮뱶媛 CI?먯꽌 ?듦낵?쒕떎.
- AC-5: JS ?대씪?댁뼵???ㅻえ???몄퐫?쒖젨, openapi-client-axios)濡?1媛??댁긽 ?붾뱶?ъ씤???몄텧???깃났?쒕떎.

### Tasks
- T1: 蹂댁븞 ?ㅽ궎留?2醫?Cookie/Bearer) ?뺤쓽, 寃쎈줈 security OR ?ъ슜
- T2: StandardResponse/ErrorResponse 紐⑤뜽 遺꾨━, 401 WWW-Authenticate ?ы븿
- T3: components.parameters.CSRFToken ?뺤쓽 諛?鍮꾨㈀??硫붿꽌?쒖뿉 李몄“
- T4: /api/v1/auth/login 204 + Set-Cookie header 臾몄꽌??- T5: servers/x-tagGroups/operationId ?ㅼ엫?ㅽ럹?댁뒪 諛섏쁺
- T6: x-codeSamples(openapi-client-axios) 異붽?(JS ?꾩슜)
- T7: CI?먯꽌 ?ㅽ궎留??좏슚??寃???④퀎 異붽?
- T8: Swagger UI 荑좏궎 ?몄쬆 二쇱쓽?ы빆(?숈씪 湲곗썝/??봽濡앹떆) 臾몄꽌??



