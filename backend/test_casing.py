from lib.Casing import toCamelCaseKey

def test():
    cases = {
        "user_no": "userNo",
        "USER_NO": "userNo",  # Expected userNo, but current implementation might return USERNo
        "id": "id",
        "long_snake_case_name": "longSnakeCaseName",
        "LONG_SNAKE_CASE_NAME": "longSnakeCaseName"
    }
    for k, expected in cases.items():
        actual = toCamelCaseKey(k)
        print(f"Input: {k}, Expected: {expected}, Actual: {actual}, Match: {actual == expected}")

if __name__ == "__main__":
    test()
