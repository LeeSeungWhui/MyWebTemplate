import {
  buildTasksQueryString,
  DEFAULT_SORT,
  normalizeTasksQuery,
} from "@/app/dashboard/tasks/initData";

describe("tasks query state", () => {
  test("검색 파라미터를 안전하게 정규화한다", () => {
    const result = normalizeTasksQuery({
      q: "  백엔드  ",
      status: "RUNNING",
      sort: "AMT_DESC",
      page: "3",
    });

    expect(result).toEqual({
      keyword: "백엔드",
      status: "running",
      sort: "amt_desc",
      page: 3,
    });
  });

  test("허용되지 않은 값은 기본값으로 보정한다", () => {
    const result = normalizeTasksQuery({
      q: ["first", "second"],
      status: "UNKNOWN",
      sort: "DROP_TABLE",
      page: "0",
    });

    expect(result).toEqual({
      keyword: "first",
      status: "",
      sort: DEFAULT_SORT,
      page: 1,
    });
  });

  test("기본 정렬/1페이지는 쿼리 문자열에서 생략한다", () => {
    const query = buildTasksQueryString({
      keyword: "테스트",
      status: "ready",
      sort: DEFAULT_SORT,
      page: 1,
    });

    expect(query).toBe("q=%ED%85%8C%EC%8A%A4%ED%8A%B8&status=ready");
  });

  test("정렬/페이지가 기본값과 다르면 쿼리에 포함한다", () => {
    const query = buildTasksQueryString({
      keyword: "",
      status: "pending",
      sort: "amt_desc",
      page: 4,
    });

    expect(query).toBe("status=pending&sort=amt_desc&page=4");
  });
});
