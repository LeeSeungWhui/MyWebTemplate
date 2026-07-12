import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Checkbox from "../app/lib/component/Checkbox/Checkbox.jsx";
import CheckButton from "../app/lib/component/CheckButton.jsx";
import RadioButton from "../app/lib/component/RadioButton.jsx";
import Radiobox from "../app/lib/component/Radiobox/Radiobox.jsx";
import Switch from "../app/lib/component/Switch.jsx";

const callbackCaseList = [
  [
    "Checkbox",
    "checkbox",
    "Checkbox choice",
    "checkboxChoice",
    false,
    true,
    "on",
    true,
    (callbackProps) => <Checkbox label="Checkbox choice" {...callbackProps} />,
  ],
  [
    "CheckButton",
    "button",
    "CheckButton choice",
    "checkButtonChoice",
    false,
    true,
    "true",
    undefined,
    (callbackProps) => <CheckButton {...callbackProps}>CheckButton choice</CheckButton>,
  ],
  [
    "RadioButton",
    "radio",
    "RadioButton choice",
    "radioButtonChoice",
    "other",
    "selected",
    "selected",
    true,
    (callbackProps) => (
      <RadioButton value="selected" {...callbackProps}>
        RadioButton choice
      </RadioButton>
    ),
  ],
  [
    "Radiobox",
    "radio",
    "Radiobox choice",
    "radioboxChoice",
    "other",
    "selected",
    "selected",
    true,
    (callbackProps) => (
      <Radiobox label="Radiobox choice" value="selected" {...callbackProps} />
    ),
  ],
  [
    "Switch",
    "switch",
    "Switch choice",
    "switchChoice",
    false,
    true,
    "on",
    true,
    (callbackProps) => <Switch label="Switch choice" {...callbackProps} />,
  ],
];

describe("component callback payload contract", () => {
  it.each(callbackCaseList)(
    "%s independently emits native onChange and onValueChange payloads",
    (
      _componentName,
      role,
      accessibleName,
      dataKey,
      initialValue,
      expectedValue,
      expectedNativeValue,
      expectedChecked,
      renderControl,
    ) => {
      const dataObj = { [dataKey]: initialValue };
      let eventSnapshot;
      const onChange = vi.fn((event) => {
        eventSnapshot = {
          type: event.type,
          targetValue: event.target.value,
          targetChecked: event.target.checked,
          detailValue: event.detail?.value,
          detailCtx: event.detail?.ctx,
          hasPreventDefault: typeof event.preventDefault === "function",
          hasStopPropagation: typeof event.stopPropagation === "function",
        };
      });
      const onValueChange = vi.fn();
      render(
        renderControl({
          dataObj,
          dataKey,
          onChange,
          onValueChange,
        }),
      );

      fireEvent.click(screen.getByRole(role, { name: accessibleName }));

      expect(dataObj[dataKey]).toBe(expectedValue);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(eventSnapshot).toMatchObject({
        targetValue: expectedNativeValue,
        detailValue: expectedValue,
        hasPreventDefault: true,
        hasStopPropagation: true,
      });
      if (expectedChecked !== undefined) {
        expect(eventSnapshot.targetChecked).toBe(expectedChecked);
      }

      const [valuePayload, valueCtx] = onValueChange.mock.calls[0];
      expect(valuePayload).toBe(expectedValue);
      expect(valueCtx).toEqual({
        dataKey,
        modelType: "obj",
        dirty: true,
        valid: null,
        source: "user",
      });
      expect(eventSnapshot.detailCtx).toBe(valueCtx);
      expect(["change", "click"]).toContain(eventSnapshot.type);
    },
  );
});
