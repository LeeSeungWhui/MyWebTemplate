from typing import Any, Optional

from pydantic import BaseModel


class StandardResponse(BaseModel):
    status: bool = True
    message: str = "success"
    result: Optional[Any] = None
    count: int = 0


def successResponse(result: Any = None, message: str = "success") -> dict:
    count = len(result) if isinstance(result, list) else 1 if result is not None else 0
    return StandardResponse(
        status=True, message=message, result=result, count=count
    ).model_dump()


def errorResponse(message: str = "error", result: Any = None) -> dict:
    return StandardResponse(
        status=False, message=message, result=result, count=0
    ).model_dump()
