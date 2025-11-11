from __future__ import annotations

from functools import wraps
from contextlib import AsyncExitStack
from typing import List, Union, Tuple
import time
import uuid

from lib.Database import dbManagers
from lib import Database as DB
from lib.RequestContext import getRequestId
from lib.Logger import logger


class TransactionError(Exception):
    pass


def transaction(
    dbNames: Union[str, List[str]],
    *,
    isolation: str | None = None,
    timeoutMs: int | None = None,
    retries: int = 0,
    retryOn: Tuple[type[BaseException], ...] = (),
):
    """
    설명: 단일/다중 DB 트랜잭션을 지원하는 데코레이터.

    Args:
      dbNames: lib.Database.dbManagers에 등록된 DB 이름 or 리스트
      isolation: 격리수준 힌트(데이터베이스 드라이버가 강제하진 않음)
      timeoutMs: 시간 경과 힌트(로그에만 활용)
      retries: retryOn 매칭 시 재시도 횟수
      retryOn: 재시도 대상 예외 타입 튜플
    """
    if isinstance(dbNames, str):
        dbList = [dbNames]
    else:
        dbList = list(dbNames)

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            attempt = 0
            lastExc: BaseException | None = None
            while attempt <= max(0, retries):
                attempt += 1
                txId = uuid.uuid4().hex[:12]
                stack: AsyncExitStack | None = None
                started = time.perf_counter()
                try:
                    stack = AsyncExitStack()
                    # enter all transactions (nested) so all DB ops use the same connections via contextvars
                    for name in dbList:
                        if name not in dbManagers:
                            raise TransactionError(f"database not found: {name}")
                        await stack.enter_async_context(dbManagers[name].database.transaction())
                        try:
                            logger.info(
                                f"tx.begin txId={txId} db={name} isolation={isolation} timeoutMs={timeoutMs} requestId={getRequestId()}"
                            )
                        except Exception:
                            pass

                    startCount = DB.getSqlCount()
                    result = await func(*args, **kwargs)

                    try:
                        elapsedMs = int((time.perf_counter() - started) * 1000)
                        sqlCount = max(0, DB.getSqlCount() - startCount)
                        logger.info(f"tx.commit txId={txId} latency_ms={elapsedMs} sql_count={sqlCount} requestId={getRequestId()}")
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
                        sqlCount = max(0, DB.getSqlCount() - startCount)
                        logger.error(f"tx.rollback txId={txId} error={e} sql_count={sqlCount} requestId={getRequestId()}")
                    except Exception:
                        pass
                    lastExc = e
                    if retryOn and not isinstance(e, retryOn):
                        break
                    if attempt > retries:
                        break
                    await _sleepBackoff(attempt)
                finally:
                    if stack is not None:
                        try:
                            await stack.aclose()
                        except Exception:
                            pass
                    try:
                        elapsedMs = int((time.perf_counter() - started) * 1000)
                        logger.info(f"tx.end txId={txId} latency_ms={elapsedMs} requestId={getRequestId()}")
                    except Exception:
                        pass
            assert lastExc is not None
            raise lastExc

        return wrapper

    return decorator


async def _sleepBackoff(attempt: int) -> None:
    try:
        import anyio

        await anyio.sleep(min(0.05 * attempt, 0.5))
    except Exception:
        return


class _Savepoint:
    def __init__(self, dbName: str, name: str):
        self.dbName = dbName
        self.name = name

    async def __aenter__(self):
        if self.dbName not in dbManagers:
            raise TransactionError(f"database not found: {self.dbName}")
        await dbManagers[self.dbName].execute(f"SAVEPOINT {self.name}")
        return self

    async def __aexit__(self, exc_type, exc, tb):
        if exc:
            # rollback partial work then release
            try:
                await dbManagers[self.dbName].execute(f"ROLLBACK TO SAVEPOINT {self.name}")
            finally:
                await dbManagers[self.dbName].execute(f"RELEASE SAVEPOINT {self.name}")
            # Suppress the exception to keep outer transaction usable
            return True
        else:
            await dbManagers[self.dbName].execute(f"RELEASE SAVEPOINT {self.name}")
            return False


def savepoint(dbName: str, name: str) -> _Savepoint:
    """Create an async savepoint context for partial rollback.

    Usage:
      async with savepoint('main_db', 'sp1'):
          ...
    """
    return _Savepoint(dbName, name)


def transactionDefault():
    """Shortcut transaction decorator using the primary DB name.

    Example:
        @transactionDefault()
        async def handler():
            ...
    """
    return transaction(DB.getPrimaryDbName())
