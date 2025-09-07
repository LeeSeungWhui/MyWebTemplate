-- name: header.createTable
CREATE TABLE IF NOT EXISTS header (
  user_id TEXT NOT NULL,
  hkey TEXT NOT NULL,
  jvalue TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, hkey)
);

-- name: header.selectOne
SELECT hkey, jvalue, updated_at
FROM header
WHERE user_id = :u AND hkey = :k;

-- name: header.upsert
INSERT INTO header(user_id,hkey,jvalue,updated_at)
VALUES(:u,:k,:v,CURRENT_TIMESTAMP)
ON CONFLICT(user_id,hkey) DO UPDATE SET jvalue=:v, updated_at=CURRENT_TIMESTAMP;

