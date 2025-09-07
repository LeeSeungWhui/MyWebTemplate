-- name: tx.ensureTable
CREATE TABLE IF NOT EXISTS test_transaction (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value TEXT UNIQUE
);

-- name: tx.insertValue
INSERT INTO test_transaction (value) VALUES (:val);
