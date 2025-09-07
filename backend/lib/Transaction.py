from __future__ import annotations

from functools import wraps
from typing import List, Union, Tuple
import time
import uuid

from lib.Database import dbManagers
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
                connections = []
                started = time.perf_counter()
                try:
                    for name in db_list:
                        if name not in dbManagers:
                            raise TransactionError(f"database not found: {name}")
                        conn = await dbManagers[name].database.transaction()
                        connections.append(conn)
                        await conn.start()
                        try:
                            logger.info(
                                f"tx.begin tx_id={tx_id} db={name} isolation={isolation} timeout_ms={timeout_ms}"
                            )
                        except Exception:
                            pass

                    result = await func(*args, **kwargs)

                    for conn in connections:
                        await conn.commit()
                    try:
                        elapsed_ms = int((time.perf_counter() - started) * 1000)
                        logger.info(f"tx.commit tx_id={tx_id} latency_ms={elapsed_ms}")
                    except Exception:
                        pass
                    return result

                except BaseException as e:
                    for conn in connections:
                        try:
                            await conn.rollback()
                        except Exception:
                            pass
                    try:
                        logger.error(f"tx.rollback tx_id={tx_id} error={e}")
                    except Exception:
                        pass
                    last_exc = e
                    if retry_on and not isinstance(e, retry_on):
                        break
                    if attempt > retries:
                        break
                    await _sleep_backoff(attempt)
                finally:
                    try:
                        elapsed_ms = int((time.perf_counter() - started) * 1000)
                        logger.info(f"tx.end tx_id={tx_id} latency_ms={elapsed_ms}")
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

