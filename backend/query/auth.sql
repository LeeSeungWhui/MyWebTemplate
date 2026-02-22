-- name: auth.userByUsername
SELECT USER_NO AS id
     , USER_ID AS username
     , USER_PW AS password_hash
     , USER_NM AS name
     , USER_EML AS email
     , ROLE_CD AS role
  FROM T_USER
 WHERE USER_ID = :u;
