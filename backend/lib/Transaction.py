from __future__ import annotations

from functools import wraps
from contextlib import AsyncExitStack
from typing import List, Union, Tuple
import time
import uuid
import re

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
    인자: dbNames/isolation/timeoutMs/retries/retryOn.
    갱신일: 2025-11-12
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
                    # 중첩된 모든 DB 트랜잭션을 열어 동일 커넥션을 보장
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
                    # 하위 트랜잭션이 예외를 인지해 롤백하도록 보장
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
                    await sleepBackoff(attempt)
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


async def sleepBackoff(attempt: int) -> None:
    """설명: 재시도 간 백오프(최대 0.5초)를 수행. 갱신일: 2025-11-12"""
    try:
        import anyio

        await anyio.sleep(min(0.05 * attempt, 0.5))
    except Exception:
        return


class Savepoint:
    """설명: SAVEPOINT 관리용 컨텍스트. 갱신일: 2025-11-12"""

    def __init__(self, dbName: str, name: str):
        self.dbName = dbName
        self.name = self.validateName(name)

    @staticmethod
    def validateName(name: str) -> str:
        """설명: SAVEPOINT 이름을 SQL 식별자 규칙으로 검증. 갱신일: 2026-02-22"""
        if not isinstance(name, str):
            raise TransactionError("invalid savepoint name")
        normalizedName = name.strip()
        if not normalizedName:
            raise TransactionError("invalid savepoint name")
        if not re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", normalizedName):
            raise TransactionError("invalid savepoint name")
        return normalizedName

    async def __aenter__(self):
        """설명: savepoint를 생성하고 self를 반환. 갱신일: 2025-11-12"""
        if self.dbName not in dbManagers:
            raise TransactionError(f"database not found: {self.dbName}")
        await dbManagers[self.dbName].execute(f"SAVEPOINT {self.name}")
        return self

    async def __aexit__(self, exc_type, exc, tb):
        """설명: 예외 여부에 따라 롤백/해제를 수행. 갱신일: 2025-11-12"""
        if exc:
            # 부분 작업을 롤백한 뒤 savepoint 해제
            try:
                await dbManagers[self.dbName].execute(f"ROLLBACK TO SAVEPOINT {self.name}")
            finally:
                await dbManagers[self.dbName].execute(f"RELEASE SAVEPOINT {self.name}")
            # 외부 트랜잭션을 유지하기 위해 예외를 삼킨다
            return True
        else:
            await dbManagers[self.dbName].execute(f"RELEASE SAVEPOINT {self.name}")
            return False


def savepoint(dbName: str, name: str) -> Savepoint:
    """설명: 부분 롤백용 SAVEPOINT 컨텍스트를 생성. 갱신일: 2025-11-12"""
    return Savepoint(dbName, name)


def transactionDefault():
    """설명: 기본 DB에 대한 transaction() 데코레이터 숏컷. 갱신일: 2025-11-12"""
    return transaction(DB.getPrimaryDbName())
