-- name: dashboard.list
SELECT DATA_NO AS "dataNo"
     , DATA_NM AS "dataNm"
     , DATA_DESC AS "dataDesc"
     , STAT_CD AS "statCd"
     , AMT AS "amt"
     , TAG_JSON AS "tagJson"
     , REG_DT AS "regDt"
  FROM T_DATA
 WHERE ( :q = ''
         OR LOWER(DATA_NM) LIKE LOWER(:qLike)
         OR LOWER(COALESCE(DATA_DESC, '')) LIKE LOWER(:qLike)
       )
   AND USER_ID = :userId
   AND ( :status = ''
         OR STAT_CD = :status
       )
 ORDER BY CASE WHEN :sort = 'reg_dt_asc' THEN REG_DT END ASC
        , CASE WHEN :sort = 'reg_dt_desc' THEN REG_DT END DESC
        , CASE WHEN :sort = 'amt_asc' THEN AMT END ASC
        , CASE WHEN :sort = 'amt_desc' THEN AMT END DESC
        , CASE WHEN :sort = 'title_asc' THEN DATA_NM END ASC
        , CASE WHEN :sort = 'title_desc' THEN DATA_NM END DESC
        , DATA_NO DESC
 LIMIT :limit
OFFSET :offset;

-- name: dashboard.listCount
SELECT COUNT(*) AS "totalCount"
  FROM T_DATA
 WHERE ( :q = ''
         OR LOWER(DATA_NM) LIKE LOWER(:qLike)
         OR LOWER(COALESCE(DATA_DESC, '')) LIKE LOWER(:qLike)
       )
   AND USER_ID = :userId
   AND ( :status = ''
         OR STAT_CD = :status
       );

-- name: dashboard.detail
SELECT DATA_NO AS "dataNo"
     , DATA_NM AS "dataNm"
     , DATA_DESC AS "dataDesc"
     , STAT_CD AS "statCd"
     , AMT AS "amt"
     , TAG_JSON AS "tagJson"
     , REG_DT AS "regDt"
  FROM T_DATA
 WHERE DATA_NO = :id
   AND USER_ID = :userId;

-- name: dashboard.create
INSERT INTO T_DATA
     ( USER_ID
     , DATA_NM
     , DATA_DESC
     , STAT_CD
     , AMT
     , TAG_JSON
     )
VALUES ( :userId
       , :title
       , :description
       , :status
       , :amount
       , :tags
       );

-- name: dashboard.createReturning
INSERT INTO T_DATA
     ( USER_ID
     , DATA_NM
     , DATA_DESC
     , STAT_CD
     , AMT
     , TAG_JSON
     )
VALUES ( :userId
       , :title
       , :description
       , :status
       , :amount
       , :tags
       )
RETURNING DATA_NO AS "dataNo";

-- name: dashboard.update
UPDATE T_DATA
   SET DATA_NM = CASE WHEN :setTitle THEN :title ELSE DATA_NM END
     , DATA_DESC = CASE WHEN :setDescription THEN :description ELSE DATA_DESC END
     , STAT_CD = CASE WHEN :setStatus THEN :status ELSE STAT_CD END
     , AMT = CASE WHEN :setAmount THEN :amount ELSE AMT END
     , TAG_JSON = CASE WHEN :setTags THEN :tags ELSE TAG_JSON END
 WHERE DATA_NO = :id
   AND USER_ID = :userId;

-- name: dashboard.delete
DELETE
  FROM T_DATA
 WHERE DATA_NO = :id
   AND USER_ID = :userId;

-- name: dashboard.deleteReturning
DELETE
  FROM T_DATA
 WHERE DATA_NO = :id
   AND USER_ID = :userId
RETURNING DATA_NO AS "dataNo";

-- name: dashboard.sqliteAffectedRows
SELECT changes() AS "affectedRows";

-- name: dashboard.mysqlAffectedRows
SELECT ROW_COUNT() AS "affectedRows";

-- name: dashboard.statusSummary
SELECT STAT_CD AS "statCd"
     , COUNT(*) AS "count"
     , COALESCE(SUM(AMT), 0) AS "amountSum"
  FROM T_DATA
 WHERE USER_ID = :userId
 GROUP BY STAT_CD;
