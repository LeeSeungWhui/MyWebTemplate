"""
?뚯씪: backend/service/HeaderDataService.py
?묒꽦: Codex CLI
媛깆떊: 2025-09-07
?ㅻ챸: Header ?꾨찓???쒕퉬?? DB ?묎렐/ETag 怨꾩궛/?낆꽌??濡쒖쭅.
"""

from __future__ import annotations

import hashlib
import json
from typing import Dict, List, Optional, Tuple

from lib import Database as DB


ALLOWED_KEYS = {"company", "regBiz", "item"}


async def ensure_tables() -> None:
    if "main_db" not in DB.dbManagers:
        return
    db = DB.dbManagers["main_db"]
    await db.executeQuery("header.createTable")


def _calc_etag(user_id: str, keys: List[str], max_updated_at: Optional[str]) -> str:
    src = f"{user_id}|{','.join(sorted(keys))}|{max_updated_at or ''}"
    return 'W/"' + hashlib.sha256(src.encode("utf-8")).hexdigest()[:16] + '"'


async def list_header_data(user_id: str, keys: List[str]) -> Tuple[Dict[str, dict], str]:
    """
    諛섑솚: (key->obj 寃곌낵, etag)
    援ы쁽: ?ㅻ떦 ?④굔 議고쉶 荑쇰━瑜??ъ슜???⑥닚/紐낆떆??諛붿씤??蹂댁옣.
    """
    db = DB.dbManagers.get("main_db")
    if db is None:
        return {}, _calc_etag(user_id, keys, None)

    result: Dict[str, dict] = {}
    max_updated = None
    for k in keys:
        row = await db.fetchOneQuery("header.selectOne", {"u": user_id, "k": k})
        if row is None:
            continue
        try:
            val = json.loads(row["jvalue"]) if isinstance(row["jvalue"], str) else row["jvalue"]
        except Exception:
            val = {}
        result[row["hkey"]] = val
        ts = row.get("updated_at")
        max_updated = ts if (max_updated is None or (ts and ts > max_updated)) else max_updated

    etag = _calc_etag(user_id, keys, str(max_updated) if max_updated else None)
    return result, etag


async def upsert_header_data(user_id: str, key: str, value: dict) -> None:
    db = DB.dbManagers.get("main_db")
    if db is None:
        return
    payload = json.dumps(value, ensure_ascii=False)
    await db.executeQuery("header.upsert", {"u": user_id, "k": key, "v": payload})


