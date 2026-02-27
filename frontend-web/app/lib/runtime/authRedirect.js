/**
 * 파일명: authRedirect.js
 * 작성자: LSH
 * 갱신일: 2026-01-19
 * 설명: next(nx) 경로 sanitize + auth_reason(base64url JSON) 인코딩/디코딩 공용 유틸(SSR/CSR/미들웨어 공통).
 */

export const DEFAULT_NEXT_PATH = "/dashboard";
export const NX_COOKIE = "nx";
export const NEXT_QUERY_PARAM = "next";
export const AUTH_REASON_COOKIE = "auth_reason";
export const AUTH_REASON_QUERY_PARAM = "reason";
export const AUTH_REASON_MAXLEN = 900;

/**
 * 설명: 내부 경로(절대 경로)만 허용하고, 아니면 fallback을 반환한다.
 * 갱신일: 2026-01-19
 */
export function sanitizeInternalPath(candidate, fallback = DEFAULT_NEXT_PATH) {
  if (!candidate || typeof candidate !== "string") return fallback;
  if (!candidate.startsWith("/")) return fallback;
  if (candidate.startsWith("//")) return fallback;
  return candidate;
}

/**
 * 설명: cookie/query 값이 URL 인코딩된 경우 안전하게 디코딩한다.
 * 갱신일: 2026-01-19
 */
export function safeDecodeURIComponent(value) {
  if (typeof value !== "string") return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * 설명: base64url 문자셋/길이 규칙을 확인해 허용 가능한 토큰만 통과시킨다.
 * 갱신일: 2026-01-19
 */
export function sanitizeBase64Url(value, maxLen = AUTH_REASON_MAXLEN) {
  if (!value || typeof value !== "string") return null;
  if (maxLen && value.length > maxLen) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  return value;
}

/**
 * 설명: UTF-8 문자열을 base64url로 인코딩한다(브라우저/Node/테스트 환경 호환).
 * 갱신일: 2026-01-19
 */
export function base64UrlEncodeUtf8(text) {
  if (typeof text !== "string") return null;
  try {
    if (typeof TextEncoder !== "undefined" && typeof btoa === "function") {
      const bytes = new TextEncoder().encode(text);
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      const base64 = btoa(binary);
      return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }
  } catch {
    // 한글설명: fall through
  }
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(text, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * 설명: base64url(UTF-8) 문자열을 디코딩한다(브라우저/Edge/Node 호환).
 * 갱신일: 2026-01-19
 */
export function base64UrlDecodeUtf8(input) {
  if (!input || typeof input !== "string") return null;
  const safe = sanitizeBase64Url(input, 0);
  if (!safe) return null;
  const base64 = safe.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);

  try {
    if (typeof atob === "function" && typeof TextDecoder !== "undefined") {
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }
  } catch {
    // 한글설명: fall through
  }

  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(padded, "base64").toString("utf8");
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * 설명: null/배열을 제외한 plain object 여부를 판별한다.
 * 갱신일: 2026-02-27
 */
function isPlainObject(value) {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  return true;
}

/**
 * 설명: auth_reason(base64url JSON)을 안전하게 파싱해 code/requestId/message만 반환한다.
 * 갱신일: 2026-01-19
 */
export function parseAuthReason(encoded, maxLen = AUTH_REASON_MAXLEN) {
  const safeEncoded = sanitizeBase64Url(encoded, maxLen);
  if (!safeEncoded) return null;
  const text = base64UrlDecodeUtf8(safeEncoded);
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    if (!isPlainObject(parsed)) return null;
    const code = typeof parsed.code === "string" ? parsed.code : null;
    const requestId =
      typeof parsed.requestId === "string" ? parsed.requestId : null;
    const message = typeof parsed.message === "string" ? parsed.message : null;
    if (!code && !requestId && !message) return null;
    return {
      ...(code ? { code } : {}),
      ...(requestId ? { requestId } : {}),
      ...(message ? { message } : {}),
    };
  } catch {
    return null;
  }
}

/**
 * 설명: 401 응답 본문에서 code/requestId/message를 추출한다(JSON만).
 * 갱신일: 2026-01-19
 */
export async function extractUnauthorizedReason(response) {
  if (!response || typeof response.clone !== "function") return null;
  try {
    const body = await response.clone().json();
    if (!isPlainObject(body)) return null;
    const code = typeof body.code === "string" ? body.code : null;
    const requestId =
      typeof body.requestId === "string" ? body.requestId : null;
    const message = typeof body.message === "string" ? body.message : null;
    if (!code && !requestId && !message) return null;
    return {
      ...(code ? { code } : {}),
      ...(requestId ? { requestId } : {}),
      ...(message ? { message } : {}),
    };
  } catch {
    return null;
  }
}
