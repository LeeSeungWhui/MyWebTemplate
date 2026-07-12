import { describe, expect, it } from "vitest";

import * as Lib from "../app/lib/index.jsx";

const publicComponentNames = [
  "Alert",
  "Badge",
  "Button",
  "Card",
  "CheckButton",
  "Checkbox",
  "Combobox",
  "Confirm",
  "DateInput",
  "Drawer",
  "Dropdown",
  "EasyChart",
  "EasyEditor",
  "EasyTable",
  "Empty",
  "Icon",
  "Input",
  "Loading",
  "Modal",
  "NumberInput",
  "Pagination",
  "PdfViewer",
  "RadioButton",
  "Radiobox",
  "Select",
  "Skeleton",
  "Stat",
  "Switch",
  "Tab",
  "Textarea",
  "TimeInput",
  "Toast",
  "Tooltip",
];

const publicHelperNames = ["EasyList", "EasyObj", "useEasyEditor"];
const expectedPublicNames = [...publicComponentNames, ...publicHelperNames].sort();

describe("public component library inventory", () => {
  it("keeps the exact 33 component and three helper exports", () => {
    expect(Object.keys(Lib).sort()).toEqual(expectedPublicNames);
    expect(publicComponentNames).toHaveLength(33);
    expect(publicHelperNames).toHaveLength(3);

    for (const name of publicComponentNames) {
      expect(Lib[name], `${name} must remain a defined public component`).toBeDefined();
      expect(["function", "object"], `${name} must be renderable`).toContain(typeof Lib[name]);
    }

    for (const name of publicHelperNames) {
      expect(Lib[name], `${name} must remain callable`).toBeTypeOf("function");
    }

    expect(Lib).not.toHaveProperty("Slider");
  });
});
