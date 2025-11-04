import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

const chainApi = {
  focus: () => chainApi,
  toggleBold: () => chainApi,
  toggleItalic: () => chainApi,
  toggleUnderline: () => chainApi,
  unsetLink: () => chainApi,
  setLink: () => chainApi,
  setImage: () => chainApi,
  setMark: () => chainApi,
  removeEmptyTextStyle: () => chainApi,
  setColor: () => chainApi,
  setTextAlign: () => chainApi,
  insertContent: () => chainApi,
  run: () => chainApi,
};

const stubEditor = {
  chain: () => chainApi,
  commands: {
    setContent: () => {},
  },
  setEditable: () => {},
  getHTML: () => "<p></p>",
  getAttributes: () => ({}),
  isActive: () => false,
};

vi.mock("@tiptap/react", () => ({
  EditorContent: (props) => <div data-testid="editor-content" {...props} />,
}));

vi.mock("../app/lib/component/EasyEditor/useEditor", () => ({
  __esModule: true,
  default: () => ({ editor: stubEditor }),
}));

vi.mock("../app/lib/component/EasyEditor/useEasyUpload", () => ({
  __esModule: true,
  default: () => ({
    uploadImage: () => Promise.resolve(null),
    uploadFile: () => Promise.resolve(null),
    alertElement: null,
  }),
}));

import EasyEditor from "../app/lib/component/EasyEditor/EasyEditor.jsx";

describe("EasyEditor accessibility status presets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("links helper and status descriptions when loading", () => {
    render(<EasyEditor status="loading" helperText="Helper copy" label="Body" />);

    const editor = screen.getByRole("textbox");
    const describedBy = editor.getAttribute("aria-describedby");
    expect(describedBy).toMatch(/-status/);
    expect(describedBy).toMatch(/-helper/);

    const container = editor.closest("[data-status]");
    expect(container).toHaveAttribute("aria-busy", "true");

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Content is loading");
  });

  it("announces error state via alert", () => {
    render(<EasyEditor status="error" />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("We could not load the editor content.");

    const editor = screen.getByRole("textbox");
    const describedBy = editor.getAttribute("aria-describedby");
    expect(describedBy).toMatch(/-status/);
    expect(describedBy).not.toMatch(/-helper/);
  });
});
