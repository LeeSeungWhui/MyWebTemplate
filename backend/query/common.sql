-- 공통(헬스/레디니스) 관련 쿼리가 필요할 경우 이 파일을 사용한다.
-- 현재는 DB ping 용으로 users.sql의 sys.ping/sys.oraclePing 키를 사용한다.
-- name: common.userAccessLogInsert
INSERT INTO T_USER_LOG (
    LOG_ID
  , USER_ID
  , REQ_ID
  , REQ_MTHD
  , REQ_PATH
  , RES_CD
  , LATENCY_MS
  , SQL_CNT
  , CLIENT_IP
  , IP_LOC_TXT
  , IP_LOC_SRC
)
VALUES (
    :logId
  , :userId
  , :reqId
  , :reqMthd
  , :reqPath
  , :resCd
  , :latencyMs
  , :sqlCnt
  , :clientIp
  , :ipLocTxt
  , :ipLocSrc
);
