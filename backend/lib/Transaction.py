from __future__ import annotations

from functools import wraps
from contextlib import AsyncExitStack
from typing import List, Union, Tuple
import time
import uuid

from lib.Database import dbManagers
from lib import Database as DB
from lib.RequestContext import get_request_id
from lib.Logger import logger


class TransactionError(Exception):
    pass


def transaction(
    db_names: Union[str, List[str]],
    *,
    isolation: str | None = None,
    timeout_ms: int | None = None,
    retries: int = 0,
    retry_on: Tuple[type[BaseException], ...] = (),
):
    """
    Transaction decorator supporting single/multi DB transactions.

    Args:
      db_names: database name or list of names found in lib.Database.dbManagers
      isolation: hint only (not enforced by databases library)
      timeout_ms: hint only, logged
      retries: number of retries on exceptions matching retry_on
      retry_on: tuple of exception types eligible for retry
    """
    if isinstance(db_names, str):
        db_list = [db_names]
    else:
        db_list = list(db_names)

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            attempt = 0
            last_exc: BaseException | None = None
            while attempt <= max(0, retries):
                attempt += 1
                tx_id = uuid.uuid4().hex[:12]
                stack: AsyncExitStack | None = None
                started = time.perf_counter()
                try:
                    stack = AsyncExitStack()
                    # enter all transactions (nested) so all DB ops use the same connections via contextvars
                    for name in db_list:
                        if name not in dbManagers:
                            raise TransactionError(f"database not found: {name}")
                        await stack.enter_async_context(dbManagers[name].database.transaction())
                        try:
                            logger.info(
                                f"tx.begin tx_id={tx_id} db={name} isolation={isolation} timeout_ms={timeout_ms} requestId={get_request_id()}"
                            )
                        except Exception:
                            pass

                    start_count = DB.getSqlCount()
                    start_rows = DB.getRowCount()
                    result = await func(*args, **kwargs)

                    try:
                        elapsed_ms = int((time.perf_counter() - started) * 1000)
                        sql_count = max(0, DB.getSqlCount() - start_count)
                        rows = max(0, DB.getRowCount() - start_rows)
                        logger.info(
                            f"tx.commit tx_id={tx_id} latency_ms={elapsed_ms} sql_count={sql_count} rows={rows} requestId={get_request_id()}"
                        )
                    except Exception:
                        pass
                    return result

                except BaseException as e:
                    # ensure underlying transaction contexts see the exception -> rollback
                    if stack is not None:
                        try:
                            await stack.__aexit__(type(e), e, e.__traceback__)
                        except Exception:
                            pass
                        finally:
                            stack = None
                    try:
                        sql_count = max(0, DB.getSqlCount() - start_count)
                        rows = max(0, DB.getRowCount() - start_rows)
                        logger.error(
                            f"tx.rollback tx_id={tx_id} error={e} sql_count={sql_count} rows={rows} requestId={get_request_id()}"
                        )
                    except Exception:
                        pass
                    last_exc = e
                    if retry_on and not isinstance(e, retry_on):
                        break
                    if attempt > retries:
                        break
                    await _sleep_backoff(attempt)
                finally:
                    if stack is not None:
                        try:
                            await stack.aclose()
                        except Exception:
                            pass
                    try:
                        elapsed_ms = int((time.perf_counter() - started) * 1000)
                        logger.info(f"tx.end tx_id={tx_id} latency_ms={elapsed_ms} requestId={get_request_id()}")
                    except Exception:
                        pass
            assert last_exc is not None
            raise last_exc

        return wrapper

    return decorator


async def _sleep_backoff(attempt: int) -> None:
    try:
        import anyio

        await anyio.sleep(min(0.05 * attempt, 0.5))
    except Exception:
        return


class _Savepoint:
    def __init__(self, db_name: str, name: str):
        self.db_name = db_name
        self.name = name

    async def __aenter__(self):
        if self.db_name not in dbManagers:
            raise TransactionError(f"database not found: {self.db_name}")
        await dbManagers[self.db_name].execute(f"SAVEPOINT {self.name}")
        return self

    async def __aexit__(self, exc_type, exc, tb):
        if exc:
            # rollback partial work then release
            try:
                await dbManagers[self.db_name].execute(f"ROLLBACK TO SAVEPOINT {self.name}")
            finally:
                await dbManagers[self.db_name].execute(f"RELEASE SAVEPOINT {self.name}")
            # Suppress the exception to keep outer transaction usable
            return True
        else:
            await dbManagers[self.db_name].execute(f"RELEASE SAVEPOINT {self.name}")
            return False


def savepoint(db_name: str, name: str) -> _Savepoint:
    """Create an async savepoint context for partial rollback.

    Usage:
      async with savepoint('main_db', 'sp1'):
          ...
    """
    return _Savepoint(db_name, name)
