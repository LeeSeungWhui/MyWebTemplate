-- name: profile.me
SELECT USER_NO AS user_no
     , USER_ID AS user_id
     , USER_NM AS user_nm
     , USER_EML AS user_eml
     , ROLE_CD AS role_cd
  FROM T_USER
 WHERE USER_ID = :userId;

-- name: profile.updateMe
UPDATE T_USER
   SET USER_NM = :userNm
 WHERE USER_ID = :userId;
