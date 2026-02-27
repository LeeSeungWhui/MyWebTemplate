-- name: auth.userByUsername
SELECT USER_NO AS USER_NO
     , USER_ID AS USER_ID
     , USER_PW AS PASSWORD_HASH
     , USER_NM AS USER_NM
     , USER_EML AS USER_EML
     , ROLE_CD AS ROLE_CD
  FROM T_USER
 WHERE USER_ID = :u;

-- name: auth.insertUser
INSERT INTO T_USER
     ( USER_ID
     , USER_PW
     , USER_NM
     , USER_EML
     , ROLE_CD
     )
VALUES ( :userId
       , :userPw
       , :userNm
       , :userEml
       , :roleCd
       );

-- name: auth.deleteExpiredTokenState
DELETE FROM T_TOKEN
 WHERE EXPIRES_AT_MS <= :nowMs;

-- name: auth.ensureTokenStateTable
CREATE TABLE IF NOT EXISTS T_TOKEN (
    STATE_TP VARCHAR(32) NOT NULL
  , TOKEN_JTI VARCHAR(191) NOT NULL
  , EXPIRES_AT_MS BIGINT NOT NULL
  , TOKEN_PAYLOAD_JSON TEXT
  , PRIMARY KEY (STATE_TP, TOKEN_JTI)
);

-- name: auth.getTokenState
SELECT STATE_TP AS STATE_TYPE
     , TOKEN_JTI AS TOKEN_JTI
     , EXPIRES_AT_MS AS EXPIRES_AT_MS
     , TOKEN_PAYLOAD_JSON AS TOKEN_PAYLOAD_JSON
  FROM T_TOKEN
 WHERE STATE_TP = :stateType
   AND TOKEN_JTI = :tokenJti
 LIMIT 1;

-- name: auth.updateTokenState
UPDATE T_TOKEN
   SET EXPIRES_AT_MS = :expiresAtMs
     , TOKEN_PAYLOAD_JSON = :tokenPayloadJson
 WHERE STATE_TP = :stateType
   AND TOKEN_JTI = :tokenJti;

-- name: auth.insertTokenState
INSERT INTO T_TOKEN
     ( STATE_TP
     , TOKEN_JTI
     , EXPIRES_AT_MS
     , TOKEN_PAYLOAD_JSON
     )
VALUES ( :stateType
       , :tokenJti
       , :expiresAtMs
       , :tokenPayloadJson
       );

-- name: auth.deleteTokenState
DELETE FROM T_TOKEN
 WHERE STATE_TP = :stateType
   AND TOKEN_JTI = :tokenJti;
