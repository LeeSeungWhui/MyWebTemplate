-- name: auth.userByUsername
SELECT id, username, password_hash, name, email, role
FROM user_template
WHERE username = :u;
