import os
from typing import Dict

from lib.Logger import logger


def loadSqlQueries(folderPath: str) -> Dict[str, str]:
    """
    지정된 폴더에서 SQL 파일들을 읽어 쿼리 딕셔너리를 생성합니다.
    -- name: 을 기준으로 쿼리를 구분합니다.
    """
    queries = {}

    if not os.path.exists(folderPath):
        os.makedirs(folderPath)
        return queries

    for fileName in os.listdir(folderPath):
        if fileName.endswith(".sql"):
            filePath = os.path.join(folderPath, fileName)

            try:
                with open(filePath, "r", encoding="utf-8") as f:
                    currentQueryName = None
                    currentQuery = []

                    for line in f:
                        if "-- name:" in line:
                            # 이전 쿼리 저장
                            if currentQueryName:
                                queries[currentQueryName] = "".join(
                                    currentQuery
                                ).strip()
                                currentQuery = []
                            # 새로운 쿼리 이름 설정
                            currentQueryName = line.split("-- name:")[1].strip()
                        else:
                            if currentQueryName:
                                currentQuery.append(line)

                    # 마지막 쿼리 저장
                    if currentQueryName and currentQuery:
                        queries[currentQueryName] = "".join(currentQuery).strip()

            except Exception as e:
                logger.error(f"SQL 파일 로드 실패 ({fileName}): {str(e)}")

    return queries
