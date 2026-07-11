from lib.I18n import MESSAGES, detectLocale


class LocaleRequest:
    def __init__(self, acceptLanguage):
        self.headers = {"Accept-Language": acceptLanguage}


def testDetectLocaleHonorsQualityAndZeroExclusion():
    assert detectLocale(LocaleRequest("ko-KR;q=0, en-US;q=0.5")) == "en"
    assert detectLocale(LocaleRequest("en-US;q=0.4, ko-KR;q=0.9")) == "ko"


def testDetectLocalePreservesHeaderOrderForEqualQuality():
    assert detectLocale(LocaleRequest("ko;q=0.7, en;q=0.7")) == "ko"
    assert detectLocale(LocaleRequest("en;q=0.7, ko;q=0.7")) == "en"


def testDetectLocaleFallsBackToEnglishForUnsupportedRanges():
    assert detectLocale(LocaleRequest("*")) == "en"
    assert detectLocale(LocaleRequest("ja-JP, fr;q=0.8")) == "en"
    assert detectLocale(LocaleRequest("ko;q=invalid, en;q=0")) == "en"


def testDetectLocaleRejectsMalformedRangesAndDuplicateQuality():
    assert detectLocale(LocaleRequest("ko-;q=1, en;q=0.5")) == "en"
    assert detectLocale(LocaleRequest("ko--KR;q=1, en;q=0.5")) == "en"
    assert detectLocale(LocaleRequest("ko;q=0.8;q=0, en;q=0.5")) == "en"
    assert detectLocale(LocaleRequest("ko;q=+0.8, en;q=0.5")) == "en"
    assert detectLocale(LocaleRequest("ko;q=1e-1, en;q=0.5")) == "en"
    assert detectLocale(LocaleRequest("ko;q=0.1234, en;q=0.5")) == "en"
    assert detectLocale(LocaleRequest("ko-한글;q=1, en;q=0.5")) == "en"
    assert detectLocale(LocaleRequest("ko;q=0.², en;q=0.5")) == "en"


def testDetectLocaleAcceptsRfcQualityWithEmptyFraction():
    assert detectLocale(LocaleRequest("ko;q=1., en;q=0.5")) == "ko"
    assert detectLocale(LocaleRequest("ko;q=0., en;q=0.5")) == "en"


def testAuthMessageCatalogContainsExactEnglishAndKoreanValues():
    expected = {
        "error.db_not_ready": (
            "database not ready",
            "데이터베이스가 준비되지 않았습니다",
        ),
        "error.server_error": ("server error", "서버 오류가 발생했습니다"),
        "auth.user_exists": ("user already exists", "이미 가입된 사용자입니다"),
        "auth.refresh_missing": ("refresh token missing", "리프레시 토큰이 없습니다"),
        "auth.refresh_invalid": (
            "invalid refresh token",
            "유효하지 않은 리프레시 토큰입니다",
        ),
    }

    for key, (english, korean) in expected.items():
        assert MESSAGES["en"][key] == english
        assert MESSAGES["ko"][key] == korean
