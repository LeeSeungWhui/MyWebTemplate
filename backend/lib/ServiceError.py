"""
파일명: backend/lib/ServiceError.py
작성자: LSH
갱신일: 2026-02-27
설명: 서비스 계층의 코드 기반 예외를 표현하는 공통 타입
"""


class ServiceError(Exception):
    """
    설명: 서비스 계층에서 API 에러 코드를 명시적으로 전달
    갱신일: 2026-02-27
    """

    def __init__(self, code: str):
        """
        설명: 서비스 에러 코드를 정규화해 예외 메시지로 설정
        처리 규칙: code 입력은 문자열로 강제 변환 후 trim 처리
        부작용: self.code 보관 및 부모 Exception 메시지 초기화
        갱신일: 2026-02-28
        """
        self.code = str(code or "").strip()
        super().__init__(self.code)
