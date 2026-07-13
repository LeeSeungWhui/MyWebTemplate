import { describe, expect, it } from "vitest";

import LANDING_LANG_KO from "../app/lang.ko.js";
import SAMPLE_LANG_KO from "../app/sample/lang.ko.js";
import DASHBOARD_LANG_KO from "../app/sample/dashboard/lang.ko.js";
import CRUD_LANG_KO from "../app/sample/crud/lang.ko.js";
import FORM_LANG_KO from "../app/sample/form/lang.ko.js";
import ADMIN_LANG_KO from "../app/sample/admin/lang.ko.js";
import PORTFOLIO_LANG_KO from "../app/sample/portfolio/lang.ko.js";

describe("public sample copy contract", () => {
  const copyText = JSON.stringify([
    SAMPLE_LANG_KO,
    DASHBOARD_LANG_KO,
    CRUD_LANG_KO,
    FORM_LANG_KO,
    ADMIN_LANG_KO,
    PORTFOLIO_LANG_KO,
  ]);

  it("uses a customer-facing project story without internal task jargon", () => {
    expect(copyText).not.toMatch(/숨고|크몽|AUTH_409|postman|\.fig\b/iu);
    expect(copyText).not.toMatch(/진행중|일반사용자|웹개발|앱개발|API개발/u);
    expect(CRUD_LANG_KO.initData.rowList[0].title).toBe("신규 상담 요청 검토");
  });

  it("warns visitors that public demo data is shared and may reset", () => {
    expect(SAMPLE_LANG_KO.layoutMeta.publicDemoNotice).toContain("공개 체험용 샘플");
    expect(SAMPLE_LANG_KO.layoutMeta.publicDemoNotice).toContain("다른 방문자에게 표시");
    expect(SAMPLE_LANG_KO.layoutMeta.publicDemoNotice).toContain("실제 개인정보는 입력하지 마세요");
    expect(FORM_LANG_KO.view.card.submissionDescription).toContain("샘플 DB에 저장");
  });

  it("uses realistic reserved example identities for the admin sample", () => {
    ADMIN_LANG_KO.initData.userRows.forEach((user) => {
      expect(user.email).toMatch(/@example\.com$/u);
    });
  });

  it("describes the active Web and Backend stack without the SQLite example fallback", () => {
    expect(LANDING_LANG_KO.initData.stackList).toEqual([
      "Node.js 26.3.0",
      "Next.js 16.2.7",
      "React 19.2.7",
      "Tailwind CSS 4.3.0",
      "Python 3.14.5",
      "FastAPI 0.136.3",
      "PostgreSQL",
      "Vitest 4.1.8 · pytest 9.0.3",
    ]);

    const technicalNotesText = PORTFOLIO_LANG_KO.initData.content.technicalNotes.join("\n");
    expect(technicalNotesText).toContain("Next.js 16.2.7(App Router·Turbopack)");
    expect(technicalNotesText).toContain("FastAPI 0.136.3");
    expect(technicalNotesText).toContain("PostgreSQL 운영·테스트 구성");
    expect(technicalNotesText).not.toContain("PostgreSQL/SQLite");
  });
});
