"""
파일명: backend/lib/ServiceError.py
작성자: LSH
갱신일: 2026-02-27
설명: 서비스 계층의 코드 기반 예외를 표현하는 공통 타입.
"""


class ServiceError(Exception):
    """
    설명: 서비스 계층에서 API 에러 코드를 명시적으로 전달
    갱신일: 2026-02-27
    """

    def __init__(self, code: str):
        """
        설명: 에러 코드를 보관하고 부모 예외 메시지로도 설정한다. 호출 맥락의 제약을 기준으로 동작 기준을 확정
        갱신일: 2026-02-27
        """
        self.code = str(code or "").strip()
        super().__init__(self.code)
