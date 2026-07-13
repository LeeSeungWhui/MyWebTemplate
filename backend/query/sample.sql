-- name: sampleBootstrap.createConfigTable
CREATE TABLE IF NOT EXISTS T_SAMPLE_CONFIG (
       CONFIG_KEY TEXT PRIMARY KEY,
       CONFIG_JSON TEXT NOT NULL,
       REG_DT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
       UPD_DT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- name: sampleBootstrap.createTaskTable
CREATE TABLE IF NOT EXISTS T_SAMPLE_TASK (
       TASK_NO BIGSERIAL PRIMARY KEY,
       DATA_NM TEXT NOT NULL,
       DATA_DESC TEXT,
       OWNER_NM TEXT,
       STAT_CD TEXT NOT NULL,
       AMT REAL,
       ATTACH_NM TEXT,
       REG_DT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- name: sampleBootstrap.createFormTable
CREATE TABLE IF NOT EXISTS T_SAMPLE_FORM_SUBMIT (
       FORM_NO BIGSERIAL PRIMARY KEY,
       USER_NM TEXT NOT NULL,
       USER_EML TEXT NOT NULL,
       PHONE_TXT TEXT NOT NULL,
       CATEGORY_CD TEXT NOT NULL,
       START_DT TEXT NOT NULL,
       END_DT TEXT NOT NULL,
       BUDGET_RANGE_TXT TEXT NOT NULL,
       REQUIREMENT_TXT TEXT,
       FEATURE_JSON TEXT,
       REF_URL TEXT,
       ATTACH_NM TEXT,
       REG_DT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- name: sampleBootstrap.createAdminUserTable
CREATE TABLE IF NOT EXISTS T_SAMPLE_ADMIN_USER (
       USER_NO BIGSERIAL PRIMARY KEY,
       USER_NM TEXT NOT NULL,
       USER_EML TEXT NOT NULL UNIQUE,
       ROLE_CD TEXT NOT NULL,
       STAT_CD TEXT NOT NULL,
       NOTIFY_EMAIL INTEGER NOT NULL DEFAULT 0,
       NOTIFY_SMS INTEGER NOT NULL DEFAULT 0,
       NOTIFY_PUSH INTEGER NOT NULL DEFAULT 0,
       PROFILE_IMG_URL TEXT,
       REG_DT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- name: sampleBootstrap.seedTasks
INSERT INTO T_SAMPLE_TASK (
       DATA_NM,
       DATA_DESC,
       OWNER_NM,
       STAT_CD,
       AMT,
       ATTACH_NM,
       REG_DT
)
VALUES ( '신규 상담 요청 검토', '요청 목적과 필요한 주요 기능 정리', '상담팀', 'done', 1200000, '프로젝트_요청서.pdf', :taskDate01 ),
       ( '요구사항 상세 정리', '화면 구성과 핵심 업무 범위 정리', '기획팀', 'running', 800000, '요구사항_정리본.docx', :taskDate02 ),
       ( '상담 일정 확정', '담당자와 온라인 미팅 일정 조율', '상담팀', 'pending', 950000, '상담_일정.ics', :taskDate03 ),
       ( '예상 일정 및 예산 검토', '개발 범위에 맞춘 일정과 예산 초안 작성', '기획팀', 'ready', 500000, '일정_예산_초안.xlsx', :taskDate04 ),
       ( '프로젝트 제안서 작성', '범위, 일정, 산출물을 정리한 제안서 준비', '기획팀', 'running', 670000, '프로젝트_제안서.pdf', :taskDate05 ),
       ( '계약 일정 조율', '착수 일정과 계약 진행 절차 안내', '운영팀', 'done', 420000, '계약_안내.pdf', :taskDate06 ),
       ( '디자인 시안 검토 요청', '주요 화면 시안 공유 및 의견 요청', '디자인팀', 'pending', 730000, '화면_시안.pdf', :taskDate07 ),
       ( '고객 피드백 반영', '검수 의견을 화면 구성과 문구에 반영', '디자인팀', 'done', 390000, '피드백_정리.xlsx', :taskDate08 ),
       ( '개발 진행 상황 공유', '완료 기능과 다음 작업 일정 정리', '개발팀', 'running', 610000, '주간_진행보고.pdf', :taskDate09 ),
       ( '기능 검수 결과 확인', '주요 사용 흐름과 수정 요청 사항 확인', '검수팀', 'ready', 250000, '기능_검수표.xlsx', :taskDate10 ),
       ( '최종 검수 일정 확정', '최종 확인 항목과 서비스 공개 일정 조율', '운영팀', 'done', 540000, '최종_검수_일정.pdf', :taskDate11 ),
       ( '서비스 공개 준비', '도메인, 안내 자료, 운영 체크리스트 정리', '운영팀', 'pending', 460000, '서비스_공개_체크리스트.pdf', :taskDate12 );

-- name: sampleBootstrap.seedAdminUsers
INSERT INTO T_SAMPLE_ADMIN_USER (
       USER_NM,
       USER_EML,
       ROLE_CD,
       STAT_CD,
       NOTIFY_EMAIL,
       NOTIFY_SMS,
       NOTIFY_PUSH,
       PROFILE_IMG_URL,
       REG_DT
)
VALUES ( '김민지', 'minji.kim@example.com', 'admin', 'active', 1, 0, 1, '', '2026-01-15' ),
       ( '박서준', 'seojun.park@example.com', 'editor', 'active', 1, 1, 0, '', '2026-01-20' ),
       ( '이하늘', 'haneul.lee@example.com', 'user', 'inactive', 0, 0, 0, '', '2026-02-03' );

-- name: sample.overview
SELECT ( SELECT COUNT(*)
           FROM T_SAMPLE_TASK
       ) AS "taskCount"
     , ( SELECT COUNT(*)
           FROM T_SAMPLE_ADMIN_USER
       ) AS "adminUserCount"
     , ( SELECT COUNT(*)
           FROM T_SAMPLE_FORM_SUBMIT
       ) AS "formSubmissionCount";

-- name: sample.dashboardStatusSummary
SELECT STAT_CD AS "statCd"
     , COUNT(*) AS "count"
     , COALESCE(SUM(AMT), 0) AS "amountSum"
  FROM T_SAMPLE_TASK
 GROUP BY STAT_CD;

-- name: sample.dashboardMonthlyTrend
SELECT TO_CHAR(REG_DT, 'YYYY-MM') AS "monthKey"
     , COUNT(*) AS "count"
     , COALESCE(SUM(AMT), 0) AS "amountSum"
  FROM T_SAMPLE_TASK
 GROUP BY TO_CHAR(REG_DT, 'YYYY-MM')
 ORDER BY "monthKey" ASC;

-- name: sample.dashboardRecent
SELECT TASK_NO AS "taskNo"
     , DATA_NM AS "dataNm"
     , DATA_DESC AS "dataDesc"
     , OWNER_NM AS "ownerNm"
     , STAT_CD AS "statCd"
     , AMT AS "amt"
     , ATTACH_NM AS "attachNm"
     , REG_DT AS "regDt"
  FROM T_SAMPLE_TASK
 ORDER BY REG_DT DESC,
       TASK_NO DESC
 LIMIT 5;

-- name: sample.taskList
SELECT TASK_NO AS "taskNo"
     , DATA_NM AS "dataNm"
     , DATA_DESC AS "dataDesc"
     , OWNER_NM AS "ownerNm"
     , STAT_CD AS "statCd"
     , AMT AS "amt"
     , ATTACH_NM AS "attachNm"
     , REG_DT AS "regDt"
  FROM T_SAMPLE_TASK
 WHERE ( :q = ''
         OR LOWER(DATA_NM) LIKE LOWER(:qLike)
         OR LOWER(COALESCE(DATA_DESC, '')) LIKE LOWER(:qLike)
         OR LOWER(COALESCE(OWNER_NM, '')) LIKE LOWER(:qLike)
         OR DATA_NM IN ( :publicTitleMatch01,
                         :publicTitleMatch02,
                         :publicTitleMatch03,
                         :publicTitleMatch04,
                         :publicTitleMatch05,
                         :publicTitleMatch06,
                         :publicTitleMatch07,
                         :publicTitleMatch08,
                         :publicTitleMatch09,
                         :publicTitleMatch10,
                         :publicTitleMatch11,
                         :publicTitleMatch12,
                         :publicTitleMatch13,
                         :publicTitleMatch14,
                         :publicTitleMatch15
                       )
       )
   AND ( :status = ''
         OR STAT_CD = :status
       )
   AND REG_DT >= :fromDate
   AND REG_DT < :toDateExclusive
 ORDER BY REG_DT DESC,
       TASK_NO DESC
 LIMIT :limit
OFFSET :offset;

-- name: sample.taskListCount
SELECT COUNT(*) AS "totalCount"
  FROM T_SAMPLE_TASK
 WHERE ( :q = ''
         OR LOWER(DATA_NM) LIKE LOWER(:qLike)
         OR LOWER(COALESCE(DATA_DESC, '')) LIKE LOWER(:qLike)
         OR LOWER(COALESCE(OWNER_NM, '')) LIKE LOWER(:qLike)
         OR DATA_NM IN ( :publicTitleMatch01,
                         :publicTitleMatch02,
                         :publicTitleMatch03,
                         :publicTitleMatch04,
                         :publicTitleMatch05,
                         :publicTitleMatch06,
                         :publicTitleMatch07,
                         :publicTitleMatch08,
                         :publicTitleMatch09,
                         :publicTitleMatch10,
                         :publicTitleMatch11,
                         :publicTitleMatch12,
                         :publicTitleMatch13,
                         :publicTitleMatch14,
                         :publicTitleMatch15
                       )
       )
   AND ( :status = ''
         OR STAT_CD = :status
       )
   AND REG_DT >= :fromDate
   AND REG_DT < :toDateExclusive;

-- name: sample.taskDetail
SELECT TASK_NO AS "taskNo"
     , DATA_NM AS "dataNm"
     , DATA_DESC AS "dataDesc"
     , OWNER_NM AS "ownerNm"
     , STAT_CD AS "statCd"
     , AMT AS "amt"
     , ATTACH_NM AS "attachNm"
     , REG_DT AS "regDt"
  FROM T_SAMPLE_TASK
 WHERE TASK_NO = :id;

-- name: sample.taskCreate
INSERT INTO T_SAMPLE_TASK (
       DATA_NM,
       DATA_DESC,
       OWNER_NM,
       STAT_CD,
       AMT,
       ATTACH_NM
)
VALUES ( :title,
         :description,
         :owner,
         :status,
         :amount,
         :attachmentName
       );

-- name: sample.taskFindCreatedCandidate
SELECT TASK_NO AS "taskNo"
     , DATA_NM AS "dataNm"
     , DATA_DESC AS "dataDesc"
     , OWNER_NM AS "ownerNm"
     , STAT_CD AS "statCd"
     , AMT AS "amt"
     , ATTACH_NM AS "attachNm"
     , REG_DT AS "regDt"
  FROM T_SAMPLE_TASK
 WHERE DATA_NM = :title
   AND COALESCE(DATA_DESC, '') = COALESCE(:description, '')
   AND COALESCE(OWNER_NM, '') = COALESCE(:owner, '')
   AND STAT_CD = :status
   AND COALESCE(AMT, 0) = COALESCE(:amount, 0)
   AND COALESCE(ATTACH_NM, '') = COALESCE(:attachmentName, '')
 ORDER BY TASK_NO DESC
 LIMIT 1;

-- name: sample.taskUpdate
UPDATE T_SAMPLE_TASK
   SET DATA_NM = :title,
       DATA_DESC = :description,
       OWNER_NM = :owner,
       STAT_CD = :status,
       AMT = :amount,
       ATTACH_NM = :attachmentName
 WHERE TASK_NO = :id;

-- name: sample.taskDelete
DELETE
  FROM T_SAMPLE_TASK
 WHERE TASK_NO = :id;

-- name: sample.formSubmitCreate
INSERT INTO T_SAMPLE_FORM_SUBMIT (
       USER_NM,
       USER_EML,
       PHONE_TXT,
       CATEGORY_CD,
       START_DT,
       END_DT,
       BUDGET_RANGE_TXT,
       REQUIREMENT_TXT,
       FEATURE_JSON,
       REF_URL,
       ATTACH_NM
)
VALUES ( :name,
         :email,
         :phone,
         :category,
         :startDate,
         :endDate,
         :budgetRange,
         :requirement,
         :selectedFeatures,
         :referenceUrl,
         :attachmentName
       );

-- name: sample.formSubmitLatest
SELECT FORM_NO AS "formNo"
     , USER_NM AS "userNm"
     , USER_EML AS "userEml"
     , PHONE_TXT AS "phoneTxt"
     , CATEGORY_CD AS "categoryCd"
     , START_DT AS "startDt"
     , END_DT AS "endDt"
     , BUDGET_RANGE_TXT AS "budgetRangeTxt"
     , REQUIREMENT_TXT AS "requirementTxt"
     , FEATURE_JSON AS "featureJson"
     , REF_URL AS "refUrl"
     , ATTACH_NM AS "attachNm"
     , REG_DT AS "regDt"
  FROM T_SAMPLE_FORM_SUBMIT
 ORDER BY FORM_NO DESC
 LIMIT 1;

-- name: sample.formSubmitCount
SELECT COUNT(*) AS "totalCount"
  FROM T_SAMPLE_FORM_SUBMIT;

-- name: sample.adminUserList
SELECT USER_NO AS "userNo"
     , USER_NM AS "userNm"
     , USER_EML AS "userEml"
     , ROLE_CD AS "roleCd"
     , STAT_CD AS "statCd"
     , NOTIFY_EMAIL AS "notifyEmail"
     , NOTIFY_SMS AS "notifySms"
     , NOTIFY_PUSH AS "notifyPush"
     , PROFILE_IMG_URL AS "profileImgUrl"
     , REG_DT AS "regDt"
  FROM T_SAMPLE_ADMIN_USER
 ORDER BY USER_NO DESC
 LIMIT :limit
OFFSET :offset;

-- name: sample.adminUserListCount
SELECT COUNT(*) AS "totalCount"
  FROM T_SAMPLE_ADMIN_USER;

-- name: sample.adminUserDetail
SELECT USER_NO AS "userNo"
     , USER_NM AS "userNm"
     , USER_EML AS "userEml"
     , ROLE_CD AS "roleCd"
     , STAT_CD AS "statCd"
     , NOTIFY_EMAIL AS "notifyEmail"
     , NOTIFY_SMS AS "notifySms"
     , NOTIFY_PUSH AS "notifyPush"
     , PROFILE_IMG_URL AS "profileImgUrl"
     , REG_DT AS "regDt"
  FROM T_SAMPLE_ADMIN_USER
 WHERE USER_NO = :id;

-- name: sample.adminUserExistsByEmail
SELECT USER_NO AS "userNo"
  FROM T_SAMPLE_ADMIN_USER
 WHERE LOWER(USER_EML) = LOWER(:email)
 LIMIT 1;

-- name: sample.adminUserExistsByEmailExcludingId
SELECT USER_NO AS "userNo"
  FROM T_SAMPLE_ADMIN_USER
 WHERE LOWER(USER_EML) = LOWER(:email)
   AND USER_NO <> :id
 LIMIT 1;

-- name: sample.adminUserCreate
INSERT INTO T_SAMPLE_ADMIN_USER (
       USER_NM,
       USER_EML,
       ROLE_CD,
       STAT_CD,
       NOTIFY_EMAIL,
       NOTIFY_SMS,
       NOTIFY_PUSH,
       PROFILE_IMG_URL
)
VALUES ( :name,
         :email,
         :role,
         :status,
         :notifyEmail,
         :notifySms,
         :notifyPush,
         :profileImageUrl
       );

-- name: sample.adminUserFindCreatedCandidate
SELECT USER_NO AS "userNo"
     , USER_NM AS "userNm"
     , USER_EML AS "userEml"
     , ROLE_CD AS "roleCd"
     , STAT_CD AS "statCd"
     , NOTIFY_EMAIL AS "notifyEmail"
     , NOTIFY_SMS AS "notifySms"
     , NOTIFY_PUSH AS "notifyPush"
     , PROFILE_IMG_URL AS "profileImgUrl"
     , REG_DT AS "regDt"
  FROM T_SAMPLE_ADMIN_USER
 WHERE LOWER(USER_EML) = LOWER(:email)
 LIMIT 1;

-- name: sample.adminUserUpdate
UPDATE T_SAMPLE_ADMIN_USER
   SET USER_NM = :name,
       USER_EML = :email,
       ROLE_CD = :role,
       STAT_CD = :status,
       NOTIFY_EMAIL = :notifyEmail,
       NOTIFY_SMS = :notifySms,
       NOTIFY_PUSH = :notifyPush,
       PROFILE_IMG_URL = :profileImageUrl
 WHERE USER_NO = :id;

-- name: sample.configByKey
SELECT CONFIG_KEY AS "configKey"
     , CONFIG_JSON AS "configJson"
     , REG_DT AS "regDt"
     , UPD_DT AS "updDt"
  FROM T_SAMPLE_CONFIG
 WHERE CONFIG_KEY = :configKey;

-- name: sample.configInsert
INSERT INTO T_SAMPLE_CONFIG (
       CONFIG_KEY,
       CONFIG_JSON
)
VALUES ( :configKey,
         :configJson
       );

-- name: sample.configUpdate
UPDATE T_SAMPLE_CONFIG
   SET CONFIG_JSON = :configJson,
       UPD_DT = CURRENT_TIMESTAMP
 WHERE CONFIG_KEY = :configKey;
