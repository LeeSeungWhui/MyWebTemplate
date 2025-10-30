"use client";

import { useCallback, useMemo, useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import clsx from 'clsx';
import useEasyEditor from './useEditor';
import { buildCtx } from '../../binding';

const ToolbarButton = ({ active, label, onClick, children }) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={active}
    className={clsx(
      'px-2 py-1 text-sm rounded transition-colors',
      active
        ? 'bg-blue-100 text-blue-600 border border-blue-200'
        : 'text-gray-600 hover:bg-gray-100 border border-transparent',
    )}
    onClick={onClick}
  >
    {children}
  </button>
);

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const baseContainer =
  'flex flex-col border rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition';

const editorBody =
  'prose max-w-none min-h-[200px] p-4 outline-none text-gray-900';

const toolbarClass =
  'flex items-center gap-2 border-b px-3 py-2 bg-gray-50';

const statusStyles = {
  idle: '',
  loading: 'opacity-70 pointer-events-none',
  error: 'border-red-300 focus-within:ring-red-500',
  success: 'border-green-300 focus-within:ring-green-500',
};

function buildSyntheticEvent(value, ctx, editor) {
  return {
    type: 'easyeditor:image-insert',
    target: { value },
    detail: { value, ctx, editor },
    preventDefault() {},
    stopPropagation() {},
  };
}

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
  extensions = [],
  autofocus = false,
  onUploadImage,
  toolbar = true,
  minHeight = '240px',
}) => {
  const fileInputRef = useRef(null);

  const { editor } = useEasyEditor({
    dataObj,
    dataKey,
    value,
    onChange,
    onValueChange,
    placeholder,
    readOnly,
    serialization,
    extensions,
    autofocus,
  });

  const handleToggle = useCallback(
    (command) => {
      if (!editor || readOnly) return;
      editor.chain().focus()[command]().run();
    },
    [editor, readOnly],
  );

  const handleSetLink = useCallback(() => {
    if (!editor || readOnly) return;
    const previous = editor.getAttributes('link')?.href;
    const url = window.prompt('링크 URL을 입력하세요', previous || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor, readOnly]);

  const handleImageSelect = useCallback(async (event) => {
    if (!editor || readOnly) return;
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      try {
        let src = null;
        if (onUploadImage) {
          src = await onUploadImage(file);
        } else {
          src = await readFileAsDataUrl(file);
        }
        if (src) {
          editor.chain().focus().setImage({ src }).run();
          if (dataObj && dataKey) {
            const ctx = buildCtx({ dataObj, dataKey, source: 'user', dirty: true, valid: null });
            const event = buildSyntheticEvent(src, ctx, editor);
            onChange?.(src, { editor, event });
            onValueChange?.(src, { editor, event });
          }
        }
      } catch (error) {
        console.error('[EasyEditor] 이미지 업로드 실패', error);
      }
    }

    event.target.value = '';
  }, [editor, readOnly, onUploadImage, dataObj, dataKey, onChange, onValueChange]);

  const triggerImageDialog = useCallback(() => {
    if (readOnly) return;
    fileInputRef.current?.click();
  }, [readOnly]);

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
            <ToolbarButton
              label="굵게"
              active={editor.isActive('bold')}
              onClick={() => handleToggle('toggleBold')}
            >
              B
            </ToolbarButton>
            <ToolbarButton
              label="기울임"
              active={editor.isActive('italic')}
              onClick={() => handleToggle('toggleItalic')}
            >
              I
            </ToolbarButton>
            <ToolbarButton
              label="밑줄"
              active={editor.isActive('underline')}
              onClick={() => handleToggle('toggleUnderline')}
            >
              U
            </ToolbarButton>
            <ToolbarButton
              label="링크"
              active={editor.isActive('link')}
              onClick={handleSetLink}
            >
              🔗
            </ToolbarButton>
            <ToolbarButton
              label="이미지 추가"
              active={false}
              onClick={triggerImageDialog}
            >
              🖼️
            </ToolbarButton>
          </div>
        )}
        <EditorContent
          id={id}
          editor={editor}
          role="textbox"
          aria-multiline="true"
          aria-invalid={invalid || undefined}
          aria-readonly={readOnly || undefined}
          data-name={name}
          style={{ minHeight }}
          className={editorBody}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleImageSelect}
        />
      </div>
      {helperText && (
        <p className={clsx('text-sm', invalid ? 'text-red-600' : 'text-gray-500')}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default EasyEditor;
