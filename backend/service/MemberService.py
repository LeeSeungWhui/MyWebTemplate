import bcrypt
from lib.Database import dbManagers
from lib.Logger import logger


class MemberService:
    _instance = None

    @classmethod
    def getInstance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        return

    # 로그인
    async def loginCheckProc(self, param: dict):
        dbManager = dbManagers["mariaDb"]
        data = await dbManager.fetchOneQuery("select.logincheck", param)

        # 아이디 확인
        if not data:
            return {
                "data": data,
                "code": "FAIL",
                "msg": "해당 사용자를 찾을 수 없습니다.",
            }

        # 비밀번호 확인
        pwChk = bcrypt.checkpw(param["LOGIN_PWD"].encode(), data["LOGIN_PWD"].encode())
        if not pwChk:
            return {
                "data": data,
                "code": "FAIL",
                "msg": "아이디 또는 비밀번호를 잘못 입력했습니다.",
            }

        # 아이디 사용 상태 확인
        joinStatus = data["CD_JOIN_STATUS"]
        if joinStatus != "10":
            return {"data": data, "code": "FAIL", "msg": "사용 중지된 계정입니다."}

        # 거래 가능한 사업장 있는지 확인
        approValCount = data["CD_APPROVAL_STATUS_CNT"]
        if approValCount == "0":
            return {
                "data": data,
                "code": "FAIL",
                "msg": "거래 가능한 사업장이 없습니다.",
            }

        # 로그인 성공!
        return {"data": data, "code": "SUCC", "msg": ""}

    # 사업자번호로 업체 조회
    async def searchPartnerProc(self, param: dict):
        dbManager = dbManagers["mariaDb"]
        data = await dbManager.fetchOneQuery("select.searchpartner", param)
        if not data:
            return {"data": data, "code": "FAIL", "msg": "등록된 업체가 없습니다."}

        return {"data": data, "code": "SUCC", "msg": ""}

    # 업체별 거래가능 공장 목록 조회
    async def searchCompanyListProc(self, param: dict):
        dbManager = dbManagers["mariaDb"]
        data = await dbManager.fetchAllQuery("select.searchcompanylist", param)
        if not data:
            return {
                "data": data,
                "code": "FAIL",
                "msg": "거래 가능한 사업장이 없습니다.",
            }
        for item in data:
            item["type"] = "toggle-check"
        return {"data": data, "code": "SUCC", "msg": ""}

    # 아이디 중복 조회
    async def idCheckProc(self, param: dict):
        dbManager = dbManagers["mariaDb"]
        data = await dbManager.fetchOneQuery("select.idcheck", param)
        if not data:
            return {"data": "VALID", "code": "SUCC", "msg": "사용 가능한 아이디입니다."}

        return {
            "data": "INVALID",
            "code": "SUCC",
            "msg": "사용할 수 없는 아이디입니다. 다른 아이디를 입력해주세요.",
        }

    # 회원 가입
    async def signUpProc(self, param: dict):
        dbManager = dbManagers["mariaDb"]
        # 거래사업장 정보(법인코드, 거래품목) 가져오기
        partnerBizList = await dbManager.fetchAllQuery("select.partnerbizlist", param)

        #####################################
        # [{'CD_COMPANY': '6000', 'CD_REG_BIZ_AREA': '6300', 'CLS_ITEM1': '20'}]
        # 이 배열을
        # ['6300', {'CD_COMPANY':'6000', 'CLS_ITEM1':'20'}]
        # 이렇게 변환
        #####################################
        partnerBizDict = []
        for item in partnerBizList:
            # 'CD_REG_BIZ_AREA' 값을 추출
            bizInfo = item["CD_REG_BIZ_AREA"]
            # 나머지 딕셔너리와 함께 새로운 리스트에 추가
            partnerBizDict.append([bizInfo, item])

        # 아아디 생성 파라미터
        memberSignParam = param.copy()
        memberSignParam["LOGIN_PWD"] = bcrypt.hashpw(
            param["LOGIN_PWD"].encode(), bcrypt.gensalt()
        )
        memberSignParam["CD_DFLT_COMPANY"] = (
            memberSignParam["CD_DFLT_REG_BIZ_AREA"][0] + "000"
        )
        # CD_DFLT_REG_BIZ_AREA 값으로 partnerBizDict 내의 해당 요소 찾기
        matchedItem = next(
            (
                item
                for bizInfo, item in partnerBizDict
                if bizInfo == memberSignParam["CD_DFLT_REG_BIZ_AREA"]
            ),
            None,
        )
        # 찾은 item을 CD_DFLT_ITEM에 할당
        memberSignParam["CD_DFLT_ITEM"] = matchedItem["CLS_ITEM1"]
        memberSignParam["CD_JOIN_STATUS"] = "10"

        # 아아디 생성
        signUpResult = await self.dbManager.executeQuery(
            "insert.signup", memberSignParam
        )
        if not signUpResult:
            return {
                "data": "INVALID",
                "code": "FAIL",
                "msg": "회원 가입에 실패했습니다. 관리자에게 문의해주세요.",
            }

        # m_map_partner 파라미터
        mapPartnerParam = partnerBizList.copy()
        for item in mapPartnerParam:
            item["ID_MEMBER"] = param["ID_MEMBER"]
            item["CD_PARTNER"] = param["CD_PARTNER"]
            item["CD_APPROVAL_STATUS"] = "10"
            mapPartnerResult = await self.dbManager.executeQuery(
                "insert.mappartner", item
            )
            if not mapPartnerResult:
                logger.info("사업장 승인 요청 실패: \n" + item)
                return {
                    "data": "INVALID",
                    "code": "FAIL",
                    "msg": "사업장 승인요청에 실패했습니다. 관리자에게 문의해주세요.",
                }

        return {
            "data": "VALID",
            "code": "SUCC",
            "msg": "회원 가입에 성공했습니다. 로그인 페이지로 이동합니다.",
        }
