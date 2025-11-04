"""
파일명: backend/router/AuthRouter.py
작성자: LSH
갱신일: 2025-09-07
설명: 인증 API 라우터. 서비스 계층 호출만 수행.
"""

from fastapi import APIRouter, Depends, Request

from lib.Auth import getCurrentUser
from service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", status_code=204)
async def login(request: Request):
    return await AuthService.login(request)


@router.post("/logout", status_code=204)
async def logout(request: Request):
    return await AuthService.logout(request)


@router.get("/session")
async def get_session(request: Request):
    return await AuthService.get_session(request)


@router.post("/token")
async def issue_token(request: Request):
    return await AuthService.issue_token(request)


@router.get("/csrf")
async def issue_csrf(request: Request):
    return await AuthService.issue_csrf(request)


@router.get("/me")
async def me(user=Depends(getCurrentUser)):
    return await AuthService.me(user)
