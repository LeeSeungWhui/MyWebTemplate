-- name: auth.ensureUserTable
CREATE TABLE IF NOT EXISTS T_USER (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  email TEXT,
  role TEXT,
  last_login_at TIMESTAMP
);

-- name: auth.insertDemoUser
INSERT INTO T_USER (username, password_hash, name, email, role)
VALUES (:u, :p, :n, :e, :r);
