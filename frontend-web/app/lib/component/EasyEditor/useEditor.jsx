"use client";

import { useEffect, useMemo, useRef } from 'react';
import { useEditor as useTiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../../binding';

const createEmptyDoc = () => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [],
    },
  ],
});

const serialise = (editor, format) => {
  if (format === 'html') return editor.getHTML();
  if (format === 'text') return editor.getText();
  return editor.getJSON();
};

const normaliseExternalValue = (value, format) => {
  if (format === 'html' || format === 'text') return value ? String(value) : '';

  if (!value) return createEmptyDoc();

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn('[EasyEditor] Failed to parse JSON content, using empty document instead.', error);
      return createEmptyDoc();
    }
  }

  if (typeof value === 'object') {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return createEmptyDoc();
    }
  }

  return createEmptyDoc();
};

const fingerprint = (value, format) => {
  if (format === 'html' || format === 'text') return String(value ?? '');
  try {
    return JSON.stringify(value ?? createEmptyDoc());
  } catch (error) {
    return JSON.stringify(createEmptyDoc());
  }
};

const cloneForStorage = (value, format) => {
  if (format === 'html' || format === 'text') return String(value ?? '');
  try {
    return JSON.parse(JSON.stringify(value ?? createEmptyDoc()));
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
  extensions = [],
  autofocus = false,
  onReady,
} = {}) {
  const isBound = Boolean(dataObj && dataKey);
  const lastFingerprint = useRef(null);

  const resolvedExtensions = useMemo(() => {
    const base = [
      StarterKit.configure({ history: true }),
      Underline,
      Placeholder.configure({ placeholder }),
      Image.configure({ inline: false }),
    ];
    if (extensions?.length) base.push(...extensions);
    return base;
  }, [placeholder, extensions]);

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

        const ctx = isBound
          ? buildCtx({ dataObj, dataKey, source: 'user', dirty: true, valid: null })
          : { dataKey: dataKey ?? null, modelType: null, dirty: true, valid: null, source: 'user' };
        const event = {
          type: 'easyeditor:update',
          target: { value: nextValue },
          detail: { value: nextValue, ctx, editor },
          preventDefault() {},
          stopPropagation() {},
        };

        if (isBound) {
          const stored = cloneForStorage(nextValue, serialization);
          const current = normaliseExternalValue(getBoundValue(dataObj, dataKey), serialization);
          const currentPrint = fingerprint(current, serialization);
          if (currentPrint !== nextPrint) {
            setBoundValue(dataObj, dataKey, stored, { source: 'user' });
          }
          lastFingerprint.current = nextPrint;
          fireValueHandlers({
            onChange,
            onValueChange,
            value: stored,
            ctx,
            event,
          });
        } else {
          lastFingerprint.current = nextPrint;
          fireValueHandlers({
            onChange,
            onValueChange,
            value: nextValue,
            ctx,
            event,
          });
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
