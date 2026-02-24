-- name: transaction.pingTestTable
SELECT 1
  FROM TEST_TRANSACTION
 LIMIT 1;

-- name: transaction.insertValue
INSERT INTO TEST_TRANSACTION
     (VALUE)
VALUES (:val);
