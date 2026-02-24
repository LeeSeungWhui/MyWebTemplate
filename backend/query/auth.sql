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
