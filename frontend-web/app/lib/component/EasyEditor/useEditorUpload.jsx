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

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';
const toStringOrNull = (value) => (isNonEmptyString(value) ? value.trim() : null);

const unwrapPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  if ('result' in payload) return unwrapPayload(payload.result);
  if ('data' in payload) return unwrapPayload(payload.data);
  return payload;
};

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
 * @description useEditorUpload 구성 데이터를 반환한다.
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
