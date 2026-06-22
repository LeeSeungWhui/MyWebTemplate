-- name: profile.ensureNotifyEmailColumn
ALTER TABLE T_USER
  ADD COLUMN IF NOT EXISTS NOTIFY_EMAIL INTEGER NOT NULL DEFAULT 0;

-- name: profile.ensureNotifySmsColumn
ALTER TABLE T_USER
  ADD COLUMN IF NOT EXISTS NOTIFY_SMS INTEGER NOT NULL DEFAULT 0;

-- name: profile.ensureNotifyPushColumn
ALTER TABLE T_USER
  ADD COLUMN IF NOT EXISTS NOTIFY_PUSH INTEGER NOT NULL DEFAULT 0;

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
   SET NOTIFY_EMAIL = :notifyEmail
     , NOTIFY_SMS = :notifySms
     , NOTIFY_PUSH = :notifyPush
 WHERE USER_ID = :userId;
