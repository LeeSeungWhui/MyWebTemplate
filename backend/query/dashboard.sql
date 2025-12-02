-- name: dashboard.list
SELECT
  id,
  title,
  description,
  status,
  amount,
  tags,
  created_at
FROM data_template
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;

-- name: dashboard.statusSummary
SELECT
  status,
  COUNT(*) AS count,
  COALESCE(SUM(amount), 0) AS amount_sum
FROM data_template
GROUP BY status;
