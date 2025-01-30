from lib.Database import dbManagers


class HeaderService:
    _instance = None

    @classmethod
    def getInstance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.itemNmDict = {"A": "전체", "S": "원단", "B": "상자"}

    # 헤더 데이터 만들기
    async def makeHeaderDataProc(self, param: dict):
        dbManager = dbManagers["mariaDb"]
        # m_map_partner에서 거래 사업장 정보 가져오기
        bizInfoList = await dbManager.fetchAllQuery("select.mappartner", param)
        if not bizInfoList:
            return {
                "data": None,
                "code": "FAIL",
                "msg": "거래 가능한 사업장이 없습니다.",
            }
        cdDfltRegBizArea = param["CD_DFLT_REG_BIZ_AREA"]
        cdDfltItem = param["CD_DFLT_ITEM"]

        # 각 selectList 생성
        bizList = self.getBizSelectList(bizInfoList, cdDfltRegBizArea, cdDfltItem)

        return {"data": bizList, "code": "SUCC", "msg": ""}

    # 사업장 리스트 생성(set을 이용하여 중복제거)
    def getBizSelectList(self, bizInfoList, cdDfltRegBizArea, cdDfltItem):
        uniqBizCdSet = set()
        result = []
        for bizInfoItem in bizInfoList:
            # CD_REG_BIZ_AREA 값이 있는지 확인하고, 있다면 set에 추가
            bizCd = bizInfoItem["CD_REG_BIZ_AREA"]
            if bizCd is not None and bizCd not in uniqBizCdSet:
                uniqBizCdSet.add(bizCd)
                resultItem = {
                    "CD_REG_BIZ_AREA": bizCd,
                    "NM_REG_BIZ_AREA": bizInfoItem["NM_REG_BIZ_AREA"],
                    "CD_COMPANY": bizInfoItem["CD_COMPANY"],
                    "SELECTED": bizCd == cdDfltRegBizArea,
                    "type": "select",
                    # 추가된 itemList 속성
                    "itemList": self.getItemSelectList(
                        bizInfoList,
                        bizCd,
                        cdDfltItem if bizCd == cdDfltRegBizArea else None,
                    ),
                }
                result.append(resultItem)
        return result

    # 품목 리스트 생성(사업장 코드에 종속)
    def getItemSelectList(self, bizInfoList, cdRegBizArea, cdDfltItem=None):
        result = []
        # 해당하는 CD_REG_BIZ_AREA의 품목 가져오기
        for bizInfoItem in bizInfoList:
            if bizInfoItem["CD_REG_BIZ_AREA"] == cdRegBizArea:
                itemCd = bizInfoItem["CD_BOX_SRC_DIV"]
                resultItem = {
                    "CD_BOX_SRC_DIV": itemCd,
                    "NM_BOX_SRC_DIV": self.itemNmDict.get(itemCd, "Unknown"),
                    "SELECTED": itemCd == cdDfltItem,
                    "type": "select",
                }
                result.append(resultItem)
        # result 품목코드가 "A"를 제외한 모든게 들어가 있다면 "A" 추가
        if len(result) == len(self.itemNmDict) - 1:
            result.insert(
                0,
                {
                    "CD_BOX_SRC_DIV": "A",
                    "NM_BOX_SRC_DIV": self.itemNmDict["A"],
                    "SELECTED": "A" == cdDfltItem,
                    "type": "select",
                },
            )
        return result

    async def updateHeaderDataProc(self, param: dict):
        dbManager = dbManagers["mariaDb"]
        result = await dbManager.executeQuery("update.dfltbizinfo", param)
        if not result:
            return {
                "data": "INVALID",
                "code": "NONE",
                "msg": "업데이트 할 항목이 없습니다.",
            }
        return {"data": "VALID", "code": "SUCC", "msg": "업데이트에 성공했습니다."}
