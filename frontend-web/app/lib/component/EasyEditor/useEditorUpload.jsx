"use client";
/**
 * 파일명: useEditorUpload.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: EasyEditor 이미지 업로드 훅
 */

import { useMemo } from 'react';
import easyUploadRequest from '@/app/lib/hooks/useEasyUpload.jsx';

const DEFAULT_IMAGE_FIELD = 'image';
const DEFAULT_FILE_FIELD = 'file';

/**
 * @description 값이 공백이 아닌 문자열인지 판별
 * 반환값: trim 기준으로 비어 있지 않은 문자열이면 true.
 * @updated 2026-02-27
 */
const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

/**
 * @description  값을 trim된 문자열 또는 null로 정규화한다. 입력/출력 계약을 함께 명시
 * 처리 규칙: 비어 있지 않은 문자열만 반환하고 그 외 타입은 null로 처리한다.
 * @updated 2026-02-27
 */
const toStringOrNull = (value) => (isNonEmptyString(value) ? value.trim() : null);

/**
 * @description 업로드 응답 래퍼(result/data)를 재귀적으로 벗겨 실제 payload를 얻는다.
 * 반환값: 더 이상 래핑 키가 없는 원본 payload 객체/값.
 * @updated 2026-02-27
 */
const unwrapPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  if ('result' in payload) return unwrapPayload(payload.result);
  if ('data' in payload) return unwrapPayload(payload.data);
  return payload;
};

/**
 * @description uploadFileInfo 구조에서 URL 후보 필드를 우선순위대로 추출
 * 처리 규칙: 배열이면 첫 요소를 재귀 처리하고, 객체면 known URL 키를 순차 탐색한다.
 * @updated 2026-02-27
 */
const extractFromUploadInfo = (info) => {
  if (!info) return null;
  if (Array.isArray(info) && info.length > 0) {
    return extractFromUploadInfo(info[0]);
  }
  if (typeof info === 'object') {
    const candidate = toStringOrNull(
      info.fileUrl
        ?? info.file_url
        ?? info.url
        ?? info.previewUrl
        ?? info.preview_url
        ?? info.httpUrl
        ?? info.http_url
        ?? info.cdnUrl
        ?? info.cdn_url
        ?? info.path
        ?? info.filePath
        ?? info.file_path,
    );
    if (candidate) return candidate;
  }
  return toStringOrNull(info);
};

/**
 * @description 다양한 업로드 응답 형태에서 최종 파일 URL을 추출
 * 반환값: 찾은 URL 문자열 또는 null.
 * @updated 2026-02-27
 */
const extractUrl = (payload) => {
  if (isNonEmptyString(payload)) return payload.trim();
  const primary = unwrapPayload(payload);
  if (isNonEmptyString(primary)) return String(primary).trim();
  if (!primary || typeof primary !== 'object') return null;

  const directKeys = [
    'url',
    'fileUrl',
    'file_url',
    'imageUrl',
    'image_url',
    'previewUrl',
    'preview_url',
    'httpUrl',
    'http_url',
    'cdnUrl',
    'cdn_url',
    'path',
    'filePath',
    'file_path',
  ];
  for (const key of directKeys) {
    const candidate = toStringOrNull(primary[key]);
    if (candidate) return candidate;
  }

  const viaUploadInfo = extractFromUploadInfo(primary.uploadFileInfo ?? primary.file);
  if (viaUploadInfo) return viaUploadInfo;

  return null;
};

/**
 * @description 파일 첨부 payload를 `{url, name}` 형태로 변환
 * 실패 동작: URL을 찾지 못하면 null을 반환한다.
 * @updated 2026-02-27
 */
const toAttachmentDescriptor = (payload, fallbackName) => {
  if (isNonEmptyString(payload)) {
    return { url: payload.trim(), name: fallbackName || '' };
  }
  const primary = unwrapPayload(payload);
  if (isNonEmptyString(primary)) {
    return { url: String(primary).trim(), name: fallbackName || '' };
  }
  if (!primary || typeof primary !== 'object') return null;

  const url = extractUrl(primary);
  if (!url) return null;

  const name =
    primary.name
    ?? primary.fileName
    ?? primary.file_name
    ?? primary.originalName
    ?? primary.originalFileName
    ?? primary.originalFilename
    ?? primary.original_filename
    ?? fallbackName
    ?? '';

  return { url, name };
};

/**
 * @description  업로드 URL/필드명/변환 함수를 조합해 단일 파일 업로더를 생성한다. 입력/출력 계약을 함께 명시
 * 처리 규칙: uploadUrl이 없으면 no-op 업로더(null 반환)를 제공한다.
 * @updated 2026-02-27
 */
const createUploader = (uploadUrl, fieldName, transform) => {
  if (!uploadUrl) {
    return async () => null;
  }
  return async (file) => {
    if (!file) return null;
    const response = await easyUploadRequest(file, {
      fileUploadUrl: uploadUrl,
      singleFieldName: fieldName,
      loading: true,
    });
    return transform(response, file);
  };
};

/**
 * @description  useEditorUpload 구성 데이터를 반환한다. 입력/출력 계약을 함께 명시
 * 반환값: EasyEditor에서 사용하는 uploadImage/uploadFile/alertElement API 집합.
 * @updated 2026-02-24
 */
export default function useEditorUpload({ imageUploadUrl = '', fileUploadUrl = '' } = {}) {

  const uploadImage = useMemo(
    () => createUploader(imageUploadUrl, DEFAULT_IMAGE_FIELD, (payload) => extractUrl(payload)),
    [imageUploadUrl],
  );

  const uploadFile = useMemo(
    () => createUploader(fileUploadUrl, DEFAULT_FILE_FIELD, (payload, file) => toAttachmentDescriptor(payload, file?.name)),
    [fileUploadUrl],
  );

  return {
    uploadImage,
    uploadFile,
    alertElement: null,
  };
}
