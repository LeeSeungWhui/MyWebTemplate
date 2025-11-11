"""
파일: backend/lib/SqlLoader.py
작성: LSH
갱신: 2025-09-07
설명: .sql 파일에서 `-- name:` 블록을 파싱하여 쿼리 레지스트리를 구성.
"""

import os
from typing import Dict, List, Tuple, Set, Optional

from lib.Logger import logger


NAME_MARK = "-- name:"


def parseSqlFile(filePath: str) -> List[Tuple[str, str]]:
    """
    이름: parseSqlFile
    설명: 단일 .sql 파일을 "-- name:" 마커 기준으로 (name, sql) 목록으로 파싱.
    제약: 파일 내 중복 name 금지. UTF-8 가정.
    """
    entries: List[Tuple[str, str]] = []
    if not os.path.exists(filePath):
        return entries

    current_name: Optional[str] = None
    current_buf: List[str] = []
    with open(filePath, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.rstrip("\n")
            if NAME_MARK in line:
                # flush previous
                if current_name is not None:
                    sql = ("\n".join(current_buf)).strip()
                    if sql:
                        entries.append((current_name, sql))
                    current_buf = []
                # extract name after marker
                name = line.split(NAME_MARK, 1)[1].strip()
                if not name:
                    raise ValueError(f"empty query name in file: {filePath}")
                # check duplication within same file
                if any(n == name for (n, _) in entries):
                    raise ValueError(f"duplicate query name in {filePath}: {name}")
                current_name = name
            else:
                if current_name is not None:
                    current_buf.append(raw)

    if current_name is not None and current_buf:
        sql = ("\n".join(current_buf)).strip()
        if sql:
            entries.append((current_name, sql))

    return entries


def scanSqlQueries(folderPath: str) -> Tuple[Dict[str, str], Dict[str, str], Dict[str, Set[str]]]:
    """
    이름: scanSqlQueries
    설명: 폴더를 재귀 스캔해 .sql 파일을 읽고 {name: sql} 레지스트리를 생성하며,
         name→file, file→names 매핑을 함께 구축한다.
    제약: 파일 간 중복 키 발견 시 즉시 예외로 실패(fail-fast).
    """
    queries: Dict[str, str] = {}
    nameToFile: Dict[str, str] = {}
    fileToNames: Dict[str, Set[str]] = {}

    if not os.path.exists(folderPath):
        os.makedirs(folderPath, exist_ok=True)
        return queries, nameToFile, fileToNames

    for root, _, files in os.walk(folderPath):
        for fileName in files:
            if not fileName.lower().endswith(".sql"):
                continue
            filePath = os.path.join(root, fileName)
            try:
                pairs = parseSqlFile(filePath)
                for name, sql in pairs:
                    if name in queries and nameToFile.get(name) != filePath:
                        # duplicate across files -> fail-fast
                        raise ValueError(
                            f"duplicate query key detected: {name} from {filePath}"
                        )
                    queries[name] = sql
                    nameToFile[name] = filePath
                fileToNames[filePath] = set(n for n, _ in pairs)
            except Exception as e:
                logger.error(f"sql.load.error file={filePath} msg={str(e)}")
                raise

    return queries, nameToFile, fileToNames


def loadSqlQueries(folderPath: str) -> Dict[str, str]:
    """
    이름: loadSqlQueries
    설명: scanSqlQueries의 호환 래퍼. {name: sql}만 반환.
    """
    queries, _, _ = scanSqlQueries(folderPath)
    return queries
