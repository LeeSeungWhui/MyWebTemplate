import { describe, expect, it } from "vitest";

import COMPONENT_LANG_KO from "../app/component/lang.ko.js";

describe("component catalog copy contract", () => {
  it("introduces the catalog before the technical reference", () => {
    expect(COMPONENT_LANG_KO.metadata.title).toContain("UI 컴포넌트 카탈로그");
    expect(COMPONENT_LANG_KO.metadata.description).toContain("33가지");
    expect(COMPONENT_LANG_KO.view.introTitle).toContain("33가지 UI 구성 요소");
    expect(COMPONENT_LANG_KO.view.introDescription).toContain("동작하는 예시와 구현 코드");
  });

  it("uses readable Korean labels for technical interaction modes", () => {
    expect(COMPONENT_LANG_KO.view.tocLabels.numberUnbound).toContain("독립형");
    expect(COMPONENT_LANG_KO.view.tocLabels.comboboxBound).toContain("데이터 연결");
    expect(COMPONENT_LANG_KO.view.tocLabels.tableControlled).toContain("외부 상태 제어");
    expect(COMPONENT_LANG_KO.view.tocLabels.comboboxMulti).toContain("다중 선택");
  });
});
