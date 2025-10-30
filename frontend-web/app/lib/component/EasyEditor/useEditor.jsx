"use client";

import { useEffect, useMemo, useRef } from 'react';
import { useEditor as useTiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../../binding';

const EMPTY_EXTENSIONS = [];

const createEmptyDoc = () => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [],
    },
  ],
});

const unwrap = (value) => {
  if (value && typeof value === 'object' && value.__rawObject) return value.__rawObject;
  return value;
};

const serialise = (editor, format) => {
  if (format === 'html') return editor.getHTML();
  if (format === 'text') return editor.getText();
  return editor.getJSON();
};

const normaliseExternalValue = (value, format) => {
  const raw = unwrap(value);

  if (format === 'html' || format === 'text') return raw ? String(raw) : '';

  if (!raw) return createEmptyDoc();

  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn('[EasyEditor] Failed to parse JSON content, using empty document instead.', error);
      return createEmptyDoc();
    }
  }

  if (typeof raw === 'object') {
    try {
      return JSON.parse(JSON.stringify(raw));
    } catch (error) {
      console.warn('[EasyEditor] Unable to clone document, using empty document instead.', error);
      return createEmptyDoc();
    }
  }

  return createEmptyDoc();
};

const fingerprint = (value, format) => {
  const raw = unwrap(value);
  if (format === 'html' || format === 'text') return String(raw ?? '');
  try {
    return JSON.stringify(raw ?? createEmptyDoc());
  } catch (error) {
    return JSON.stringify(createEmptyDoc());
  }
};

const cloneForStorage = (value, format) => {
  const raw = unwrap(value);
  if (format === 'html' || format === 'text') return String(raw ?? '');
  try {
    return JSON.parse(JSON.stringify(raw ?? createEmptyDoc()));
  } catch (error) {
    return createEmptyDoc();
  }
};

export function useEasyEditor({
  dataObj,
  dataKey,
  value,
  onChange,
  onValueChange,
  placeholder = '내용을 입력하세요',
  readOnly = false,
  serialization = 'json',
  extensions,
  autofocus = false,
  onReady,
} = {}) {
  const isBound = Boolean(dataObj && dataKey);
  const lastFingerprint = useRef(null);
  const extensionList = useMemo(() => extensions ?? EMPTY_EXTENSIONS, [extensions]);

  const resolvedExtensions = useMemo(() => {
    const base = [
      StarterKit.configure({ history: true }),
      Underline,
      Placeholder.configure({ placeholder }),
      Image.configure({ inline: false }),
    ];
    if (extensionList.length > 0) base.push(...extensionList);
    return base;
  }, [placeholder, extensionList]);

  const initialContent = useMemo(() => {
    const source = isBound ? getBoundValue(dataObj, dataKey) : value;
    return normaliseExternalValue(source, serialization);
  }, [isBound, dataObj, dataKey, value, serialization]);

  const editor = useTiptapEditor(
    {
      extensions: resolvedExtensions,
      content: initialContent,
      autofocus,
      editable: !readOnly,
      immediatelyRender: false,
      onCreate: ({ editor }) => {
        const initialValue = serialise(editor, serialization);
        lastFingerprint.current = fingerprint(initialValue, serialization);
        onReady?.(editor);
      },
      onUpdate: ({ editor }) => {
        const nextValue = serialise(editor, serialization);
        const nextPrint = fingerprint(nextValue, serialization);
        if (nextPrint === lastFingerprint.current) {
          return;
        }

        if (isBound) {
          const ctx = buildCtx({ dataObj, dataKey, source: 'user', dirty: true, valid: null });
          const stored = cloneForStorage(nextValue, serialization);
          const current = normaliseExternalValue(getBoundValue(dataObj, dataKey), serialization);
          const currentPrint = fingerprint(current, serialization);
          if (currentPrint !== nextPrint) {
            setBoundValue(dataObj, dataKey, stored, { source: 'user' });
          }
          lastFingerprint.current = nextPrint;
          const event = {
            type: 'easyeditor:update',
            target: { value: stored },
            detail: { value: stored, ctx, editor },
            preventDefault() {},
            stopPropagation() {},
          };
          fireValueHandlers({
            onChange,
            onValueChange,
            value: stored,
            ctx,
            event,
          });
        } else {
          lastFingerprint.current = nextPrint;
          const payload = { editor };
          onChange?.(nextValue, payload);
          onValueChange?.(nextValue, payload);
        }
      },
    },
    [resolvedExtensions, autofocus, readOnly, serialization, isBound, dataObj, dataKey],
  );

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editor) return;
    const external = isBound ? getBoundValue(dataObj, dataKey) : value;
    const normalised = normaliseExternalValue(external, serialization);
    const nextPrint = fingerprint(normalised, serialization);

    if (nextPrint === lastFingerprint.current) return;

    if (serialization === 'html' || serialization === 'text') {
      editor.commands.setContent(normalised || '<p></p>', false);
    } else {
      editor.commands.setContent(normalised || createEmptyDoc(), false);
    }
    lastFingerprint.current = nextPrint;
  }, [editor, isBound, dataObj, dataKey, value, serialization]);

  return { editor };
}

export default useEasyEditor;
