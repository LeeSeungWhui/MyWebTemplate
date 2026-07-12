/**
 * 파일명: EasyEditorHtmlMode.test.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-04
 * 설명: EasyEditor HTML 모드 전환 및 내용 동기화 시나리오 검증
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

let EasyEditor;
let editorStub;

const createEditorStub = (initialHtml = '<p>Hello</p>') => {
  const stub = {
    content: initialHtml,
    getHTML: vi.fn(() => stub.content),
    setEditable: vi.fn(),
    getAttributes: vi.fn(() => ({})),
    isActive: vi.fn(() => false),
    commands: {
      setContent: vi.fn((nextHtml) => {
        stub.content = nextHtml;
      }),
    },
  };

  const chainApi = {};
  for (const commandName of [
    'focus',
    'toggleBold',
    'toggleItalic',
    'toggleUnderline',
    'unsetLink',
    'extendMarkRange',
    'setLink',
    'setImage',
    'insertContent',
    'setMark',
    'removeEmptyTextStyle',
    'setColor',
    'setTextAlign',
  ]) {
    chainApi[commandName] = vi.fn(() => chainApi);
  }
  chainApi.run = vi.fn(() => true);

  stub.chain = () => chainApi;
  stub.chainApi = chainApi;

  return stub;
};

const mockUseEditorUpload = vi.fn(() => ({
  uploadImage: vi.fn(),
  uploadFile: vi.fn(),
  alertElement: null,
}));

const mockUseEasyEditor = vi.fn(() => {
  editorStub = createEditorStub();
  return { editor: editorStub };
});

vi.mock('../app/lib/component/EasyEditor/useEditorUpload', () => ({
  __esModule: true,
  default: mockUseEditorUpload,
}));

vi.mock('@tiptap/react', () => ({
  __esModule: true,
  EditorContent: ({ editor, ...props }) => <div data-testid="editor-content" data-editor={Boolean(editor)} {...props} />,
}));

vi.mock('../app/lib/component/EasyEditor/useEditor', () => ({
  __esModule: true,
  default: mockUseEasyEditor,
}));

beforeAll(async () => {
  ({ default: EasyEditor } = await import('../app/lib/component/EasyEditor/EasyEditor.jsx'));
});

describe('EasyEditor HTML mode', () => {
  beforeEach(() => {
    editorStub = null;
    mockUseEasyEditor.mockImplementation(() => {
      if (!editorStub) {
        editorStub = createEditorStub();
      }
      return { editor: editorStub };
    });
  });

  afterEach(() => {
    mockUseEasyEditor.mockReset();
    mockUseEditorUpload.mockClear();
  });

  it('syncs textarea edits back to the editor content', async () => {
    render(<EasyEditor value="<p>Hello</p>" serialization="html" />);

    const htmlButton = screen.getByRole('button', { name: /HTML/i });
    fireEvent.click(htmlButton);

    const textarea = screen.getByRole('textbox');
    expect(textarea.value).toBe('<p>Hello</p>');

    fireEvent.change(textarea, { target: { value: '<p>Updated</p>' } });

    const editorButton = screen.getByRole('button', { name: /Editor|에디터/ });
    fireEvent.click(editorButton);

    expect(screen.queryByDisplayValue('<p>Updated</p>')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(editorStub.getHTML()).toBe('<p>Updated</p>');
    });
  });

  it('associates the label with generated editor and HTML mode ids', () => {
    render(<EasyEditor label="본문" value="<p>Hello</p>" serialization="html" />);

    const editor = screen.getByLabelText('본문');
    expect(editor).toHaveAttribute('id');
    expect(editor.id).not.toBe('');

    fireEvent.click(screen.getByRole('button', { name: /HTML/i }));

    const htmlEditor = screen.getByLabelText('본문');
    expect(htmlEditor.tagName).toBe('TEXTAREA');
    expect(htmlEditor.id).toBe(`${editor.id}-html`);
  });

  it('keeps the supplied id authoritative in both modes', () => {
    render(<EasyEditor id="article-body" label="본문" value="<p>Hello</p>" serialization="html" />);

    expect(screen.getByLabelText('본문')).toHaveAttribute('id', 'article-body');

    fireEvent.click(screen.getByRole('button', { name: /HTML/i }));

    expect(screen.getByLabelText('본문')).toHaveAttribute('id', 'article-body-html');
  });

  it('opens the attachment chooser exactly once per toolbar click', () => {
    const { container } = render(<EasyEditor value="<p>Hello</p>" />);
    const attachmentInput = container.querySelector('input[type="file"]:not([accept])');
    const inputClickSpy = vi.spyOn(attachmentInput, 'click').mockImplementation(() => {});

    fireEvent.click(screen.getByText('📎').closest('button'));

    expect(inputClickSpy).toHaveBeenCalledTimes(1);
  });

  it('escapes uploaded attachment URL and name before inserting link HTML', async () => {
    const onUploadFile = vi.fn(async () => ({
      url: 'https://files.test/report?name="quarterly"&mode=view',
      name: '<script>alert("unsafe")</script>',
    }));
    const { container } = render(<EasyEditor value="<p>Hello</p>" onUploadFile={onUploadFile} />);
    const attachmentInput = container.querySelector('input[type="file"]:not([accept])');
    const attachment = new File(['report'], 'report.pdf', { type: 'application/pdf' });

    fireEvent.change(attachmentInput, { target: { files: [attachment] } });

    await waitFor(() => expect(editorStub.chainApi.insertContent).toHaveBeenCalledTimes(1));
    const insertedHtml = editorStub.chainApi.insertContent.mock.calls[0][0];
    expect(insertedHtml).toContain('name=&quot;quarterly&quot;&amp;mode=view');
    expect(insertedHtml).toContain('&lt;script&gt;alert(&quot;unsafe&quot;)&lt;/script&gt;');
    expect(insertedHtml).not.toContain('<script>');
  });

  it('covers image upload and core toolbar command paths', async () => {
    const onUploadImage = vi.fn(async () => 'https://images.test/photo.png');
    const { container } = render(<EasyEditor value="<p>Hello</p>" onUploadImage={onUploadImage} />);

    fireEvent.click(screen.getByText('B').closest('button'));
    expect(editorStub.chainApi.toggleBold).toHaveBeenCalledTimes(1);

    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('https://example.test');
    fireEvent.click(screen.getByText('🔗').closest('button'));
    expect(promptSpy).toHaveBeenCalledTimes(1);
    expect(editorStub.chainApi.setLink).toHaveBeenCalledWith({ href: 'https://example.test' });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '20px' } });
    expect(editorStub.chainApi.setMark).toHaveBeenCalledWith('textStyle', { fontSize: '20px' });

    const colorInput = container.querySelector('input[type="color"]');
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    expect(editorStub.chainApi.setColor).toHaveBeenCalledWith('#ff0000');

    fireEvent.click(screen.getByText('L').closest('button'));
    expect(editorStub.chainApi.setTextAlign).toHaveBeenCalledWith('left');

    const imageInput = container.querySelector('input[type="file"][accept="image/*"]');
    const image = new File(['image'], 'photo.png', { type: 'image/png' });
    fireEvent.change(imageInput, { target: { files: [image] } });
    await waitFor(() => expect(editorStub.chainApi.setImage).toHaveBeenCalledWith({ src: 'https://images.test/photo.png' }));
  });

  it.each([
    ['readOnly', { readOnly: true }],
    ['loading', { status: 'loading' }],
  ])('locks toolbar, mode, editor, and upload inputs for %s state', (_label, stateProps) => {
    const { container } = render(<EasyEditor value="<p>Hello</p>" {...stateProps} />);
    const editorContent = screen.getByTestId('editor-content');
    const editorShell = editorContent.parentElement;

    expect(editorContent).toHaveAttribute('aria-readonly', 'true');
    expect(screen.getByRole('button', { name: /HTML/i })).toBeDisabled();
    expect(container.querySelectorAll('input[type="file"]')).toHaveLength(2);
    for (const uploadInput of container.querySelectorAll('input[type="file"]')) {
      expect(uploadInput).toBeDisabled();
    }
    expect(editorStub.setEditable).toHaveBeenLastCalledWith(false);
    expect(editorShell).toHaveAttribute('aria-busy', stateProps.status === 'loading' ? 'true' : 'false');
  });

  it.each([
    ['error', true, 'border-rose-300'],
    ['success', false, 'border-emerald-300'],
  ])('exposes %s status semantics and styling', (status, invalidState, expectedClass) => {
    render(<EasyEditor value="<p>Hello</p>" status={status} />);
    const editorContent = screen.getByTestId('editor-content');

    expect(editorContent.parentElement).toHaveAttribute('data-status', status);
    expect(editorContent.parentElement).toHaveClass(expectedClass);
    if (invalidState) expect(editorContent).toHaveAttribute('aria-invalid', 'true');
    else expect(editorContent).not.toHaveAttribute('aria-invalid');
  });
});
