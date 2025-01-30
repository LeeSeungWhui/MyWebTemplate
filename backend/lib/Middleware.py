from fastapi import Request
from lib.Logger import logger


async def logRequests(request: Request, call_next):
    """
    요청/응답 로깅 미들웨어
    """
    requestPath = request.url.path
    requestMethod = request.method
    logger.info(f"Request: {requestMethod} {requestPath}")

    response = await call_next(request)

    responseStatus = response.status_code
    logger.info(f"Response: {responseStatus}")

    return response
