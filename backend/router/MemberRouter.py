from fastapi import APIRouter, Body, Request, Response
from lib.Logger import logger
from service.MemberService import MemberService

router = APIRouter()

# 로그인 시도


@router.post("/dyscm/member/loginProc.do")
async def loginProc(request: Request, response: Response, param: dict = Body(...)):
    try:
        memberService = MemberService.getInstance()
        loginResult = await memberService.loginCheckProc(param)
        if loginResult["code"] == "SUCC":
            # 세션 설정
            request.session["ID_MEMBER"] = loginResult["data"]["ID_MEMBER"]
            request.session["NM_MEMBER"] = loginResult["data"]["NM_MEMBER"]
            request.session["CD_PARTNER"] = loginResult["data"]["CD_PARTNER"]
            request.session["CD_DFLT_COMPANY"] = loginResult["data"]["CD_DFLT_COMPANY"]
            request.session["CD_DFLT_REG_BIZ_AREA"] = loginResult["data"][
                "CD_DFLT_REG_BIZ_AREA"
            ]
            request.session["CD_DFLT_ITEM"] = loginResult["data"]["CD_DFLT_ITEM"]
            if param["LOGIN_SAVE"] == True:
                response.set_cookie(
                    key="ID_MEMBER",
                    value=loginResult["ID_MEMBER"],
                    max_age=60 * 60 * 24 * 90,
                )
            else:
                response.delete_cookie(key="ID_MEMBER")

        return loginResult

    except Exception:
        # 에러 처리
        logger.exception("예외 발생...")
        return {
            "data": None,
            "code": "ERROR",
            "msg": "로그인 중 오류가 발생했습니다.\n관리자에게 문의해주세요.",
        }


# 사업자번호로 업체정보 검색


@router.post("/dyscm/member/signUp/searchPartnerProc.do")
async def searchPartnerProc(
    request: Request, response: Response, param: dict = Body(...)
):
    try:
        memberService = MemberService.getInstance()
        result = await memberService.searchPartnerProc(param)
        return result
    except Exception:
        logger.exception("예외 발생...")
        # 에러 처리
        return {
            "data": None,
            "code": "ERROR",
            "msg": "업체 조회 중 오류가 발생했습니다.\n관리자에게 문의해주세요.",
        }


# 거래처별 거래하는 공장 목록


@router.post("/dyscm/member/signUp/searchCompanyListProc.do")
async def searchCompanyListProc(
    request: Request, response: Response, param: dict = Body(...)
):
    try:
        memberService = MemberService.getInstance()
        result = await memberService.searchCompanyListProc(param)
        return result
    except Exception:
        logger.exception("예외 발생...")
        # 에러 처리
        return {
            "data": None,
            "code": "ERROR",
            "msg": "사업장 조회 중 오류가 발생했습니다.\n관리자에게 문의해주세요.",
        }


# 아이디 중복체크


@router.post("/dyscm/member/signUp/idCheckProc.do")
async def idCheckProc(request: Request, response: Response, param: dict = Body(...)):
    try:
        memberService = MemberService.getInstance()
        result = await memberService.idCheckProc(param)
        return result
    except Exception:
        logger.exception("예외 발생...")
        # 에러 처리
        return {
            "data": None,
            "code": "ERROR",
            "msg": "아이디 중복 확인 중 오류가 발생했습니다.\n관리자에게 문의해주세요.",
        }


# 회원 가입


@router.post("/dyscm/member/signUp/signUpProc.do")
async def signUpProc(request: Request, response: Response, param: dict = Body(...)):
    try:
        memberService = MemberService.getInstance()
        result = await memberService.signUpProc(param)
        return result
    except Exception:
        logger.exception("예외 발생...")
        # 에러 처리
        return {
            "data": None,
            "code": "ERROR",
            "msg": "회원 가입 중 오류가 발생했습니다.\n관리자에게 문의해주세요.",
        }
