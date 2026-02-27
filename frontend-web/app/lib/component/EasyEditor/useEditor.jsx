"use client";
/**
 * 파일명: useEditor.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: EasyEditor 전용 훅
 */

import { useEffect, useMemo, useRef } from 'react';
import { useEditor as useTiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { Extension } from '@tiptap/core';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../../binding';
import { deepCloneValue, safeJsonParse } from '@/app/lib/runtime/json';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';

const EMPTY_EXTENSIONS = [];

const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size) => ({ chain }) => chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize:
        () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

/**
 * @description  TipTap JSON 스키마의 기본 빈 문서 구조를 생성한다. 입력/출력 계약을 함께 명시
 * 반환값: paragraph 1개를 가진 최소 doc 객체.
 * @updated 2026-02-27
 */
const createEmptyDoc = () => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [],
    },
  ],
});

/**
 * @description  EasyObj 래퍼 값에서 raw object를 꺼내거나 원본 값을 그대로 반환한다. 입력/출력 계약을 함께 명시
 * 처리 규칙: `__rawObject` 필드가 있으면 해당 값을 우선 사용한다.
 * @updated 2026-02-27
 */
const unwrap = (value) => {
  if (value && typeof value === 'object' && value.__rawObject) return value.__rawObject;
  return value;
};

/**
 * @description editor 내용을 지정된 serialization(html/text/json) 형태로 직렬화
 * 반환값: format에 따라 HTML 문자열, plain text, JSON doc 객체.
 * @updated 2026-02-27
 */
const serialise = (editor, format) => {
  if (format === 'html') return editor.getHTML();
  if (format === 'text') return editor.getText();
  return editor.getJSON();
};

/**
 * @description  외부 입력 값을 에디터 setContent 가능한 형태로 정규화한다. 입력/출력 계약을 함께 명시
 * 실패 동작: JSON 파싱/복제 실패 시 빈 문서(createEmptyDoc)로 대체한다.
 * @updated 2026-02-27
 */
const normaliseExternalValue = (value, format) => {
  const raw = unwrap(value);

  if (format === 'html' || format === 'text') return raw ? String(raw) : '';

  if (!raw) return createEmptyDoc();

  if (typeof raw === 'string') {
    const parsedValue = safeJsonParse(raw, null);
    if (parsedValue && typeof parsedValue === 'object') return parsedValue;
    console.warn('[EasyEditor] Failed to parse JSON content, using empty document instead.');
    return createEmptyDoc();
  }

  if (typeof raw === 'object') {
    const clonedValue = deepCloneValue(raw, null);
    if (clonedValue && typeof clonedValue === 'object') return clonedValue;
    console.warn('[EasyEditor] Unable to clone document, using empty document instead.');
    return createEmptyDoc();
  }

  return createEmptyDoc();
};

/**
 * @description  값 변경 감지를 위해 직렬화 가능한 fingerprint 문자열을 생성한다. 입력/출력 계약을 함께 명시
 * 처리 규칙: html/text는 문자열화, json은 JSON.stringify 실패 시 빈 문서 기준 문자열을 사용한다.
 * @updated 2026-02-27
 */
const fingerprint = (value, format) => {
  const raw = unwrap(value);
  if (format === 'html' || format === 'text') return String(raw ?? '');
  try {
    return JSON.stringify(raw ?? createEmptyDoc());
  } catch (error) {
    return JSON.stringify(createEmptyDoc());
  }
};

/**
 * @description  바인딩 저장 전에 값을 안전하게 복제/정규화한다. 입력/출력 계약을 함께 명시
 * 반환값: html/text는 문자열, json은 deep clone된 문서 객체.
 * @updated 2026-02-27
 */
const cloneForStorage = (value, format) => {
  const raw = unwrap(value);
  if (format === 'html' || format === 'text') return String(raw ?? '');
  return deepCloneValue(raw ?? createEmptyDoc(), createEmptyDoc());
};

/**
 * @description  EasyEditor 상태를 바인딩/동기화하는 훅을 반환한다. 입력/출력 계약을 함께 명시
 * 처리 규칙: bound 모드에서는 dataObj[dataKey]와 동기화하고, unbound 모드에서는 onChange/onValueChange 콜백으로 전달한다.
 * @updated 2026-02-24
 */
export function useEasyEditor({
  dataObj,
  dataKey,
  value,
  onChange,
  onValueChange,
  placeholder = COMMON_COMPONENT_LANG_KO.easyEditor.placeholder,
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
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      FontSize,
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
            preventDefault() { },
            stopPropagation() { },
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

/**
 * @description useEasyEditor 훅을 default export로 노출
 * 반환값: useEasyEditor 함수 export.
 */
export default useEasyEditor;
