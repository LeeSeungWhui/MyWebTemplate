from fastapi import APIRouter
from lib.Database import dbManagers
from lib.Response import successResponse
from lib.Transaction import transaction

router = APIRouter(prefix="/transaction", tags=["트랜잭션 테스트"])


@router.post("/test/single")
@transaction("main_db")
async def testSingleTransaction():
    """단일 DB 트랜잭션 테스트"""
    # 테스트용 쿼리 실행
    query = """
    CREATE TABLE IF NOT EXISTS test_transaction (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT
    )
    """
    await dbManagers["main_db"].execute(query)

    # 데이터 입력
    query = "INSERT INTO test_transaction (value) VALUES ('test1')"
    await dbManagers["main_db"].execute(query)

    return successResponse(message="단일 트랜잭션 테스트 완료")


@router.post("/test/error")
@transaction("main_db")
async def testTransactionError():
    """트랜잭션 롤백 테스트"""
    # 데이터 입력
    query = "INSERT INTO test_transaction (value) VALUES ('test2')"
    await dbManagers["main_db"].execute(query)

    # 의도적 에러 발생
    raise Exception("트랜잭션 롤백 테스트")
