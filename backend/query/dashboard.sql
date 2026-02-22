-- name: dashboard.list
SELECT DATA_NO AS id
     , DATA_NM AS title
     , DATA_DESC AS description
     , STAT_CD AS status
     , AMT AS amount
     , TAG_JSON AS tags
     , REG_DT AS created_at
  FROM T_DATA
 ORDER BY REG_DT DESC
 LIMIT :limit
OFFSET :offset;

-- name: dashboard.statusSummary
SELECT STAT_CD AS status
     , COUNT(*) AS count
     , COALESCE(SUM(AMT), 0) AS amount_sum
  FROM T_DATA
 GROUP BY STAT_CD;
