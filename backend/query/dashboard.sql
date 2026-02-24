-- name: dashboard.list
SELECT DATA_NO AS id
     , DATA_NM AS title
     , DATA_DESC AS description
     , STAT_CD AS status
     , AMT AS amount
     , TAG_JSON AS tags
     , REG_DT AS created_at
  FROM T_DATA
 WHERE ( :q = ''
         OR LOWER(DATA_NM) LIKE LOWER(:qLike)
         OR LOWER(COALESCE(DATA_DESC, '')) LIKE LOWER(:qLike)
       )
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
SELECT COUNT(*) AS total_count
  FROM T_DATA
 WHERE ( :q = ''
         OR LOWER(DATA_NM) LIKE LOWER(:qLike)
         OR LOWER(COALESCE(DATA_DESC, '')) LIKE LOWER(:qLike)
       )
   AND ( :status = ''
         OR STAT_CD = :status
       );

-- name: dashboard.detail
SELECT DATA_NO AS id
     , DATA_NM AS title
     , DATA_DESC AS description
     , STAT_CD AS status
     , AMT AS amount
     , TAG_JSON AS tags
     , REG_DT AS created_at
  FROM T_DATA
 WHERE DATA_NO = :id;

-- name: dashboard.create
INSERT INTO T_DATA
     ( DATA_NM
     , DATA_DESC
     , STAT_CD
     , AMT
     , TAG_JSON
     )
VALUES ( :title
       , :description
       , :status
       , :amount
       , :tags
       );

-- name: dashboard.findCreatedCandidate
SELECT DATA_NO AS id
     , DATA_NM AS title
     , DATA_DESC AS description
     , STAT_CD AS status
     , AMT AS amount
     , TAG_JSON AS tags
     , REG_DT AS created_at
  FROM T_DATA
 WHERE DATA_NM = :title
   AND COALESCE(DATA_DESC, '') = COALESCE(:description, '')
   AND STAT_CD = :status
   AND COALESCE(AMT, 0) = COALESCE(:amount, 0)
   AND COALESCE(TAG_JSON, '') = COALESCE(:tags, '')
 ORDER BY DATA_NO DESC
 LIMIT 1;

-- name: dashboard.update
UPDATE T_DATA
   SET DATA_NM = :title
     , DATA_DESC = :description
     , STAT_CD = :status
     , AMT = :amount
     , TAG_JSON = :tags
 WHERE DATA_NO = :id;

-- name: dashboard.delete
DELETE
  FROM T_DATA
 WHERE DATA_NO = :id;

-- name: dashboard.statusSummary
SELECT STAT_CD AS status
     , COUNT(*) AS count
     , COALESCE(SUM(AMT), 0) AS amount_sum
  FROM T_DATA
 GROUP BY STAT_CD;
