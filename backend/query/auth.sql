-- name: auth.userByUsername
SELECT USER_NO AS id
     , USER_ID AS username
     , USER_PW AS password_hash
     , USER_NM AS name
     , USER_EML AS email
     , ROLE_CD AS role
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
DELETE FROM T_AUTH_TOKEN_STATE
 WHERE EXPIRES_AT_MS <= :nowMs;

-- name: auth.getTokenState
SELECT STATE_TP AS stateType
     , TOKEN_JTI AS tokenJti
     , EXPIRES_AT_MS AS expiresAtMs
     , TOKEN_PAYLOAD_JSON AS tokenPayloadJson
  FROM T_AUTH_TOKEN_STATE
 WHERE STATE_TP = :stateType
   AND TOKEN_JTI = :tokenJti
 LIMIT 1;

-- name: auth.updateTokenState
UPDATE T_AUTH_TOKEN_STATE
   SET EXPIRES_AT_MS = :expiresAtMs
     , TOKEN_PAYLOAD_JSON = :tokenPayloadJson
 WHERE STATE_TP = :stateType
   AND TOKEN_JTI = :tokenJti;

-- name: auth.insertTokenState
INSERT INTO T_AUTH_TOKEN_STATE
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
DELETE FROM T_AUTH_TOKEN_STATE
 WHERE STATE_TP = :stateType
   AND TOKEN_JTI = :tokenJti;
