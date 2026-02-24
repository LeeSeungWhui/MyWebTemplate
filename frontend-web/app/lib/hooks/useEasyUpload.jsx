/**
 * 파일명: useEasyUpload.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 파일 업로드 유틸. BFF/백엔드 호스트를 자동 해석해 FormData 업로드를 수행한다.
 */

import { getGlobalUiActionsSnapshot } from "@/app/common/store/SharedStore";
import { getBackendHost } from "@/app/common/config/getBackendHost.client";
import {
  parseJsonPayload,
  normalizeNestedJsonFields,
} from "@/app/lib/runtime/jsonPayload";

const DEFAULT_OPTIONS = {
  fileUploadUrl: "",
  singleFieldName: "file",
  multiFieldName: "files",
  credentials: "include",
  extraFormData: null,
  headers: {},
};

const normalizeErrorMessage = async (response) => {
  const text = await response.text().catch(() => "");
  if (!text) return `${response.status} 업로드 실패`;
  try {
    const json = JSON.parse(text);
    return json?.message || json?.result || text;
  } catch (_) {
    return text;
  }
};

const resolveUploadUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/api/bff/")) {
    return url;
  }
  try {
    const backend = getBackendHost();
    if (!backend) return url;
    const normalizedBackend = backend.endsWith("/")
      ? backend.slice(0, -1)
      : backend;
    if (url.startsWith("/")) return `${normalizedBackend}${url}`;
    return `${normalizedBackend}/${url}`;
  } catch (_) {
    return url;
  }
};

const toArray = (filesInput) => {
  if (!filesInput) return [];
  if (filesInput instanceof File || filesInput instanceof Blob)
    return [filesInput];
  const result = [];
  if (typeof filesInput.forEach === "function") {
    filesInput.forEach((item) => {
      if (item) result.push(item);
    });
    return result;
  }
  if (typeof filesInput.length === "number") {
    for (let idx = 0; idx < filesInput.length; idx += 1) {
      const value = filesInput[idx];
      if (value) result.push(value);
    }
    return result;
  }
  return [];
};

/**
 * @description FormData 기반 파일 업로드를 수행하고 공통 응답 형식으로 정규화한다.
 * @param {File|Blob|File[]|FileList|ArrayLike<File>|null} filesInput
 * @param {Object} [options]
 * @returns {Promise<any>}
 */
export default async function useEasyUpload(filesInput, options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  if (!config.fileUploadUrl) {
    throw new Error("fileUploadUrl is required.");
  }
  const extraPayloadCandidates = [];
  if (config.extraFormData && typeof config.extraFormData === "object") {
    extraPayloadCandidates.push(config.extraFormData);
  }
  if (config.etc && typeof config.etc === "object") {
    extraPayloadCandidates.push(config.etc);
  }

  const files = toArray(filesInput);
  if (!files.length) return null;

  const { updateLoading, showAlert } = getGlobalUiActionsSnapshot();

  const formData = new FormData();
  const fieldName =
    files.length === 1 ? config.singleFieldName : config.multiFieldName;
  files.forEach((file) => {
    if (file) formData.append(fieldName, file);
  });

  extraPayloadCandidates.forEach((payload) => {
    Object.entries(payload).forEach(([key, value]) => {
      if (value == null) return;
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item != null) formData.append(key, item);
        });
        return;
      }
      formData.append(key, value);
    });
  });

  const shouldTrackLoading = Boolean(options.loading);
  if (shouldTrackLoading) {
    updateLoading(1);
  }
  try {
    const targetUrl = resolveUploadUrl(config.fileUploadUrl);
    const response = await fetch(targetUrl, {
      method: "POST",
      body: formData,
      credentials: config.credentials,
      headers: config.headers,
    });

    if (!response.ok) {
      const message = await normalizeErrorMessage(response);
      showAlert(message || "파일 업로드에 실패했습니다.", {
        title: "업로드 실패",
        type: "error",
      });
      throw new Error(message || "업로드 실패");
    }

    const contentType = (
      response.headers.get("content-type") || ""
    ).toLowerCase();
    const rawText = await response.text().catch(() => "");

    if (!contentType.includes("application/json")) {
      return rawText || null;
    }

    const parsed = parseJsonPayload(rawText, { context: "EasyUpload" });
    return normalizeNestedJsonFields(parsed);
  } catch (error) {
    if (!error?.message) {
      showAlert("파일 업로드 중 알 수 없는 오류가 발생했습니다.", {
        title: "업로드 실패",
        type: "error",
      });
    }
    throw error;
  } finally {
    if (shouldTrackLoading) {
      updateLoading(-1);
    }
  }
}
