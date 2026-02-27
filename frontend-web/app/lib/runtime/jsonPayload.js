/**
 * 파일명: jsonPayload.js
 * 작성자: LSH
 * 갱신일: 2025-01-22
 * 설명: 백엔드가 반환하는 JSON 문자열을 보정/정규화하는 공용 유틸
 */

const BROKEN_ARRAY_REGEX = /"([A-Za-z0-9_]+)"\s*:\s*](?=\s*[},])/g;

/**
 * 서버가 [] 대신 ]만 내려보내는 경우를 감지해 자동 보정
 * @param {string} text
 * @returns {string}
 * @description 깨진 배열 토큰 교체 기반 파싱 실패 완화
 * @updated 2026-02-27
 */
const autofixBrokenArrays = (text) => {
  if (!text || typeof text !== "string") return text;
  return text.replace(BROKEN_ARRAY_REGEX, '"$1": []');
};

/**
 * @description 문자열 JSON을 보정 가능한 형태로 정규화. 입력/출력 계약을 함께 명시
 * @param {string} text
 * @returns {string}
 */
export const sanitizeJsonString = (text) => {
  if (!text) return text;

  const source = autofixBrokenArrays(text);

  const stack = [];
  let sanitized = "";
  let inString = false;
  let escapeNext = false;
  let stringMode = "value";

  /**
   * @description start 인덱스 이후 첫 비공백 문자와 위치를 반환해 문자열 종료 판단에 사용
   * @param {string} input
   * @param {number} start
   * @returns {{ ch: string, index: number }}
   * @updated 2026-02-27
   */
  const skipWhitespace = (input, start) => {
    for (let i = start; i < input.length; i += 1) {
      if (input[i] === " " || input[i] === "\t" || input[i] === "\r" || input[i] === "\n") continue;
      return { ch: input[i], index: i };
    }
    return { ch: "", index: input.length };
  };

  for (let idx = 0; idx < source.length; idx += 1) {
    const ch = source.charAt(idx);

    if (inString) {
      if (escapeNext) {
        escapeNext = false;
        sanitized += ch;
        continue;
      }
      if (ch === "\\") {
        escapeNext = true;
        sanitized += "\\";
        continue;
      }

      if (ch === '"') {
        const nextInfo = skipWhitespace(source, idx + 1);
        let shouldClose;
        if (stringMode === "key") {
          shouldClose = nextInfo.ch === ":";
        } else {
          shouldClose =
            nextInfo.ch === "," ||
            nextInfo.ch === "}" ||
            nextInfo.ch === "]" ||
            nextInfo.ch === "";
          if (nextInfo.ch === "]" || nextInfo.ch === "}") {
            const after = skipWhitespace(source, nextInfo.index + 1);
            if (after.ch === '"') {
              shouldClose = false;
            }
          }
        }

        if (shouldClose) {
          inString = false;
          stringMode = "value";
          sanitized += '"';
          continue;
        }

        sanitized += '\\"';
        continue;
      }

      const code = ch.charCodeAt(0);
      if (code <= 0x1f) {
        if (ch === "\n") sanitized += "\\n";
        else if (ch === "\r") sanitized += "\\r";
        else if (ch === "\t") sanitized += "\\t";
        else sanitized += `\\u${code.toString(16).padStart(4, "0")}`;
        continue;
      }

      sanitized += ch;
      continue;
    }

    if (ch === '"') {
      inString = true;
      const top = stack.at(-1);
      stringMode =
        top && top.type === "object" && top.expectKey ? "key" : "value";
      sanitized += '"';
      continue;
    }

    if (ch === "{") {
      stack.push({ type: "object", expectKey: true });
      sanitized += ch;
      continue;
    }

    if (ch === "[") {
      stack.push({ type: "array" });
      sanitized += ch;
      continue;
    }

    if (ch === "}") {
      stack.pop();
      sanitized += ch;
      if (stack.length && stack[stack.length - 1].type === "object") {
        stack[stack.length - 1].expectKey = false;
      }
      continue;
    }

    if (ch === "]") {
      stack.pop();
      sanitized += ch;
      continue;
    }

    if (ch === ":") {
      sanitized += ch;
      if (stack.length && stack[stack.length - 1].type === "object") {
        stack[stack.length - 1].expectKey = false;
      }
      continue;
    }

    if (ch === ",") {
      sanitized += ch;
      if (stack.length && stack[stack.length - 1].type === "object") {
        stack[stack.length - 1].expectKey = true;
      }
      continue;
    }

    sanitized += ch;
  }

  return sanitized;
};

/**
 * @description JSON 응답을 파싱하되, 실패 시 보정 뒤 재시도
 * @param {string} rawText 서버 응답 텍스트
 * @param {object} [options]
 * @param {string} [options.context='API'] 로깅용 컨텍스트
 * @param {Console} [options.logger=console] 로깅 대상
 * @returns {object|null} 파싱된 객체 또는 null
 */
export const parseJsonPayload = (rawText, options = {}) => {

  if (!rawText) return null;
  const { context = "API", logger = console } = options;
  try {
    return JSON.parse(rawText);
  } catch (error) {
    try {
      return JSON.parse(sanitizeJsonString(rawText));
    } catch (inner) {
      const message = inner?.message || "";
      const posMatch = /position (\d+)/.exec(message);
      const pos = posMatch ? Number(posMatch[1]) : 0;
      const start = pos > 120 ? pos - 120 : 0;
      const end = pos + 120;
      logger?.error?.(
        `[${context}] JSON parsing failed`,
        inner,
        rawText.slice(start, end),
      );
      return null;
    }
  }
};

const JSON_STRING_KEYS = ["result", "data", "payload"];

/**
 * @description result/data/payload 문자열 필드를 JSON 객체로 자동 파싱
 * @param {object|null} payload 파싱된 초기 객체
 * @param {object} [options]
 * @param {string[]} [options.keys] 파싱 대상 필드 목록
 * @returns {object|null} 정규화된 객체
 */
export const normalizeNestedJsonFields = (payload, options = {}) => {

  if (!payload || typeof payload !== "object") return payload;
  const { keys = JSON_STRING_KEYS } = options;

  keys.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(payload, key)) return;
    const payloadValue = Reflect.get(payload, key);
    if (typeof payloadValue !== "string") return;
    const trimmed = payloadValue.trim();
    if (!trimmed) return;
    const parsed = parseJsonPayload(trimmed, { context: `Nested:${key}` });
    if (parsed && typeof parsed === "object") {
      payload[key] = parsed;
    }
  });

  return payload;
};
