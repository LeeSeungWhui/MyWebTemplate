-- name: profile.me
SELECT USER_NO AS "userNo"
     , USER_ID AS "userId"
     , USER_NM AS "userNm"
     , USER_EML AS "userEml"
     , ROLE_CD AS "roleCd"
     , NOTIFY_EMAIL AS "notifyEmail"
     , NOTIFY_SMS AS "notifySms"
     , NOTIFY_PUSH AS "notifyPush"
  FROM T_USER
 WHERE USER_ID = :userId;

-- name: profile.updateMe
UPDATE T_USER
   SET USER_NM = :userNm
 WHERE USER_ID = :userId;

-- name: profile.updateNotify
UPDATE T_USER
   SET NOTIFY_EMAIL = CASE WHEN :setNotifyEmail THEN :notifyEmail ELSE NOTIFY_EMAIL END
     , NOTIFY_SMS = CASE WHEN :setNotifySms THEN :notifySms ELSE NOTIFY_SMS END
     , NOTIFY_PUSH = CASE WHEN :setNotifyPush THEN :notifyPush ELSE NOTIFY_PUSH END
 WHERE USER_ID = :userId;
