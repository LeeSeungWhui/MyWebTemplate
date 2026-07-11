-- PostgreSQL source migration for BE-DASHBOARD-001.
-- Apply explicitly during deployment; profile request handlers must not run DDL.
-- name: migration.profileNotifyEmail
ALTER TABLE T_USER
    ADD COLUMN IF NOT EXISTS NOTIFY_EMAIL INTEGER NOT NULL DEFAULT 0;

-- name: migration.profileNotifySms
ALTER TABLE T_USER
    ADD COLUMN IF NOT EXISTS NOTIFY_SMS INTEGER NOT NULL DEFAULT 0;

-- name: migration.profileNotifyPush
ALTER TABLE T_USER
    ADD COLUMN IF NOT EXISTS NOTIFY_PUSH INTEGER NOT NULL DEFAULT 0;
