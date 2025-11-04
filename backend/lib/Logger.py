"""
파일명: backend/lib/Logger.py
작성자: LSH
갱신일: 2025-09-07
설명: 콘솔/파일 로거 설정. 포맷은 시간/레벨/메시지.
"""

import logging
import os
from datetime import datetime

# 로그 디렉토리 생성
logDir = "logs"
if not os.path.exists(logDir):
    os.makedirs(logDir)

# 로그 파일명 생성 (현재 날짜/시간 기준)
logFilename = os.path.join(logDir, f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")

# 로거 설정
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 파일 핸들러 설정 (UTF-8 인코딩)
fileHandler = logging.FileHandler(logFilename, encoding="utf-8")
fileHandler.setLevel(logging.INFO)

# 콘솔 핸들러 설정
consoleHandler = logging.StreamHandler()
consoleHandler.setLevel(logging.INFO)

# 포맷터 설정
formatter = logging.Formatter(
    "%(asctime)s %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",  # 마이크로초 제거
)
fileHandler.setFormatter(formatter)
consoleHandler.setFormatter(formatter)

# 핸들러 추가
logger.addHandler(fileHandler)
logger.addHandler(consoleHandler)
