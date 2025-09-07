-- name: user.selectByUsername
SELECT id, username, name, email, role
FROM T_USER
WHERE username = :u;

-- name: user.count
SELECT COUNT(*) AS cnt FROM T_USER;

-- name: sys.ping
SELECT 1;

