from functools import wraps
from typing import List, Union

from lib.Database import dbManagers
from lib.Logger import logger


class TransactionError(Exception):
    pass


def transaction(db_names: Union[str, List[str]]):
    """
    트랜잭션 데코레이터
    단일 DB 또는 다중 DB 트랜잭션을 지원합니다.

    사용 예:
    @transaction('main_db')
    async def single_db_operation():
        pass

    @transaction(['main_db', 'legacy_db'])
    async def multi_db_operation():
        pass
    """
    if isinstance(db_names, str):
        db_names = [db_names]

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 트랜잭션에 사용될 DB 연결들을 가져옴
            connections = []
            try:
                for db_name in db_names:
                    if db_name not in dbManagers:
                        raise TransactionError(
                            f"데이터베이스를 찾을 수 없습니다: {db_name}"
                        )
                    conn = await dbManagers[db_name].database.transaction()
                    connections.append(conn)
                    await conn.start()
                    logger.info(f"트랜잭션 시작: {db_name}")

                # 실제 함수 실행
                result = await func(*args, **kwargs)

                # 모든 트랜잭션 커밋
                for conn in connections:
                    await conn.commit()
                    logger.info("트랜잭션 커밋 완료")

                return result

            except Exception as e:
                # 에러 발생 시 모든 트랜잭션 롤백
                for conn in connections:
                    await conn.rollback()
                    logger.error(f"트랜잭션 롤백: {str(e)}")
                raise

        return wrapper

    return decorator
