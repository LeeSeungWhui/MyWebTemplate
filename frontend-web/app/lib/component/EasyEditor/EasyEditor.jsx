"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { EditorContent } from '@tiptap/react';
import clsx from 'clsx';
import useEasyEditor from './useEditor';
import useEasyUpload from '../../hooks/useEasyUpload';

const ToolbarButton = ({ active, label, onClick, children, disabled }) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={active}
    aria-disabled={disabled || undefined}
    disabled={disabled}
    className={clsx(
      'px-2 py-1 text-sm rounded transition-colors',
      disabled && 'opacity-40 cursor-not-allowed',
      !disabled && (active
        ? 'bg-blue-100 text-blue-600 border border-blue-200'
        : 'text-gray-600 hover:bg-gray-100 border border-transparent'),
    )}
    onClick={disabled ? undefined : onClick}
  >
    {children}
  </button>
);

const baseContainer =
  'flex flex-col border rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition';

const editorBody =
  'prose max-w-none min-h-[200px] p-4 outline-none text-gray-900';

const toolbarClass =
  'flex flex-wrap items-center gap-2 border-b px-3 py-2 bg-gray-50';

const statusStyles = {
  idle: '',
  loading: 'opacity-70 pointer-events-none',
  error: 'border-red-300 focus-within:ring-red-500',
  success: 'border-green-300 focus-within:ring-green-500',
};

const fontSizeOptions = [
  { label: '기본', value: 'default' },
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
];

const alignments = [
  { label: '좌', value: 'left', icon: 'L' },
  { label: '중앙', value: 'center', icon: 'C' },
  { label: '우', value: 'right', icon: 'R' },
  { label: '양끝', value: 'justify', icon: 'J' },
];

const EMPTY_EXTENSIONS = [];

const EasyEditor = ({
  dataObj,
  dataKey,
  value,
  onChange,
  onValueChange,
  placeholder = '내용을 입력하세요',
  readOnly = false,
  className = '',
  status = 'idle',
  invalid = false,
  helperText,
  label,
  id,
  name,
  serialization = 'json',
  extensions,
  autofocus = false,
  onUploadImage,
  onUploadFile,
  imageUploadUrl,
  fileUploadUrl,
  toolbar = true,
  minHeight = '240px',
}) => {
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const extensionList = useMemo(() => extensions ?? EMPTY_EXTENSIONS, [extensions]);

  const { uploadImage, uploadFile, alertElement } = useEasyUpload({ imageUploadUrl, fileUploadUrl });

  const { editor } = useEasyEditor({
    dataObj,
    dataKey,
    value,
    onChange,
    onValueChange,
    placeholder,
    readOnly,
    serialization,
    extensions: extensionList,
    autofocus,
  });

  const [mode, setMode] = useState('editor');
  const [htmlDraft, setHtmlDraft] = useState('');

  const isHtmlMode = mode === 'html';
  const toolbarDisabled = readOnly || isHtmlMode;

  useEffect(() => {
    if (!editor) return;
    if (mode === 'html') {
      setHtmlDraft(editor.getHTML());
    }
  }, [mode, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editor || mode !== 'html') return;
    editor.commands.setContent(htmlDraft || '<p></p>', false);
  }, [htmlDraft, mode, editor]);

  const handleToggle = useCallback(
    (command) => {
      if (!editor || toolbarDisabled) return;
      editor.chain().focus()[command]().run();
    },
    [editor, toolbarDisabled],
  );

  const handleSetLink = useCallback(() => {
    if (!editor || toolbarDisabled) return;
    const previous = editor.getAttributes('link')?.href;
    const url = window.prompt('링크 URL을 입력하세요', previous || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor, toolbarDisabled]);

  const imageUploadHandler = onUploadImage ?? uploadImage;
  const fileUploadHandler = onUploadFile ?? uploadFile;

  const handleImageSelect = useCallback(async (event) => {
    if (!editor || readOnly) return;
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      try {
        const src = await imageUploadHandler(file);
        if (src) {
          editor.chain().focus().setImage({ src }).run();
        }
      } catch (error) {
        console.error('[EasyEditor] 이미지 업로드 실패', error);
      }
    }

    event.target.value = '';
  }, [editor, readOnly, imageUploadHandler]);

  const handleFileSelect = useCallback(async (event) => {
    if (!editor || readOnly) return;
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      try {
        const response = await fileUploadHandler(file);
        if (!response) continue;
        const descriptor = typeof response === 'string'
          ? { url: response, name: file.name }
          : { url: response.url, name: response.name ?? file.name };
        if (descriptor?.url) {
          editor.chain().focus().insertContent(
            `<a href="${descriptor.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${descriptor.name}</a>`
          ).run();
        }
      } catch (error) {
        console.error('[EasyEditor] 파일 업로드 실패', error);
      }
    }

    event.target.value = '';
  }, [editor, readOnly, fileUploadHandler]);

  const triggerImageDialog = useCallback(() => {
    if (toolbarDisabled) return;
    fileInputRef.current?.click();
  }, [toolbarDisabled]);

  const triggerFileDialog = useCallback(() => {
    if (toolbarDisabled) return;
    attachmentInputRef.current?.click();
  }, [toolbarDisabled]);

  const containerClasses = useMemo(
    () =>
      clsx(
        baseContainer,
        invalid ? 'border-red-300 focus-within:ring-red-500' : 'border-gray-200',
        statusStyles[status] || statusStyles.idle,
        className,
      ),
    [invalid, status, className],
  );

  const currentFontSize = editor?.getAttributes('textStyle')?.fontSize || 'default';
  const fontSizeValue = fontSizeOptions.some((option) => option.value === currentFontSize)
    ? currentFontSize
    : 'default';

  const handleFontSizeChange = useCallback((event) => {
    if (!editor || toolbarDisabled) return;
    const value = event.target.value;
    if (value === 'default') {
      editor.chain().focus().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
    } else {
      editor.chain().focus().setMark('textStyle', { fontSize: value }).run();
    }
  }, [editor, toolbarDisabled]);

  const currentColor = editor?.getAttributes('textStyle')?.color || '#000000';

  const handleColorChange = useCallback((event) => {
    if (!editor || toolbarDisabled) return;
    editor.chain().focus().setColor(event.target.value).run();
  }, [editor, toolbarDisabled]);

  const handleResetColor = useCallback(() => {
    if (!editor || toolbarDisabled) return;
    editor.chain().focus().setColor(null).removeEmptyTextStyle().run();
  }, [editor, toolbarDisabled]);

  const handleTextAlign = useCallback((value) => {
    if (!editor || toolbarDisabled) return;
    editor.chain().focus().setTextAlign(value).run();
  }, [editor, toolbarDisabled]);

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className={containerClasses}>
        {toolbar && editor && (
          <div className={toolbarClass}>
            <div className="flex items-center gap-2">
              <ToolbarButton
                label="굵게"
                active={editor.isActive('bold')}
                onClick={() => handleToggle('toggleBold')}
                disabled={toolbarDisabled}
              >
                B
              </ToolbarButton>
              <ToolbarButton
                label="기울임"
                active={editor.isActive('italic')}
                onClick={() => handleToggle('toggleItalic')}
                disabled={toolbarDisabled}
              >
                I
              </ToolbarButton>
              <ToolbarButton
                label="밑줄"
                active={editor.isActive('underline')}
                onClick={() => handleToggle('toggleUnderline')}
                disabled={toolbarDisabled}
              >
                U
              </ToolbarButton>
              <ToolbarButton
                label="링크"
                active={editor.isActive('link')}
                onClick={handleSetLink}
                disabled={toolbarDisabled}
              >
                🔗
              </ToolbarButton>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="h-8 rounded border border-gray-300 px-2 text-sm"
                value={fontSizeValue}
                onChange={handleFontSizeChange}
                disabled={toolbarDisabled}
              >
                {fontSizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={currentColor}
                  onChange={handleColorChange}
                  disabled={toolbarDisabled}
                  className="h-8 w-10 border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={handleResetColor}
                  disabled={toolbarDisabled}
                  className="text-xs text-gray-500 underline"
                >
                  초기화
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {alignments.map((item) => (
                <ToolbarButton
                  key={item.value}
                  label={`${item.label} 정렬`}
                  active={editor.isActive({ textAlign: item.value })}
                  onClick={() => handleTextAlign(item.value)}
                  disabled={toolbarDisabled}
                >
                  {item.icon}
                </ToolbarButton>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <ToolbarButton
                label="이미지 첨부"
                active={false}
                onClick={triggerImageDialog}
                disabled={toolbarDisabled}
              >
                🖼️
              </ToolbarButton>
              <ToolbarButton
                label="파일 첨부"
                active={false}
                onClick={triggerFileDialog}
                disabled={toolbarDisabled}
              >
                📎
              </ToolbarButton>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <ToolbarButton
                label="에디터 모드"
                active={mode === 'editor'}
                onClick={() => setMode('editor')}
                disabled={mode === 'editor'}
              >
                Editor
              </ToolbarButton>
              <ToolbarButton
                label="HTML 모드"
                active={mode === 'html'}
                onClick={() => setMode('html')}
                disabled={mode === 'html'}
              >
                HTML
              </ToolbarButton>
            </div>
          </div>
        )}
        <EditorContent
          id={id}
          editor={editor}
          role="textbox"
          aria-multiline="true"
          aria-invalid={invalid || undefined}
          aria-readonly={readOnly || undefined}
          aria-hidden={isHtmlMode ? 'true' : undefined}
          data-name={name}
          style={{ minHeight }}
          className={clsx(editorBody, isHtmlMode && 'hidden')}
        />
        {isHtmlMode && (
          <textarea
            className="font-mono text-sm w-full min-h-[200px] border-t border-gray-200 focus:outline-none p-3"
            value={htmlDraft}
            onChange={(event) => setHtmlDraft(event.target.value)}
            disabled={readOnly}
          />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleImageSelect}
        />
        <input
          ref={attachmentInputRef}
          type="file"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleFileSelect}
        />
      </div>
      {helperText && (
        <p className={clsx('text-sm', invalid ? 'text-red-600' : 'text-gray-500')}>
          {helperText}
        </p>
      )}
      {alertElement}
    </div>
  );
};

export default EasyEditor;
