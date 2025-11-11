/**
 * 파일명: jsonPayload.js
 * 작성자: Codex
 * 갱신일: 2025-01-22
 * 설명: 백엔드가 반환하는 JSON 문자열을 보정/정규화하는 공용 유틸
 */

/**
 * JSON 문자열 내 특수문자/개행을 RFC7159 형태로 정규화
 * @param {string} text 원본 응답 텍스트
 * @returns {string} 정규화된 문자열
 */
const BROKEN_ARRAY_REGEX = /"([A-Za-z0-9_]+)"\s*:\s*](?=\s*[},])/g

/**
 * 서버가 [] 대신 ]만 내려보내는 경우를 감지해 자동 보정
 * @param {string} text
 * @returns {string}
 */
const autofixBrokenArrays = (text) => {
  if (!text || typeof text !== 'string') return text
  return text.replace(BROKEN_ARRAY_REGEX, '"$1": []')
}

export const sanitizeJsonString = (text) => {
  if (!text) return text

  const source = autofixBrokenArrays(text)

  const stack = []
  let sanitized = ''
  let inString = false
  let escapeNext = false
  let stringMode = 'value'

  const skipWhitespace = (input, start) => {
    for (let i = start; i < input.length; i += 1) {
      const ch = input[i]
      if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') continue
      return { ch, index: i }
    }
    return { ch: '', index: input.length }
  }

  for (let idx = 0; idx < source.length; idx += 1) {
    const ch = source[idx]

    if (inString) {
      if (escapeNext) {
        escapeNext = false
        sanitized += ch
        continue
      }
      if (ch === '\\') {
        escapeNext = true
        sanitized += '\\'
        continue
      }

      if (ch === '"') {
        const nextInfo = skipWhitespace(source, idx + 1)
        let shouldClose
        if (stringMode === 'key') {
          shouldClose = nextInfo.ch === ':'
        } else {
          shouldClose = nextInfo.ch === ',' || nextInfo.ch === '}' || nextInfo.ch === ']' || nextInfo.ch === ''
          if (nextInfo.ch === ']' || nextInfo.ch === '}') {
            const after = skipWhitespace(source, nextInfo.index + 1)
            if (after.ch === '"') {
              shouldClose = false
            }
          }
        }

        if (shouldClose) {
          inString = false
          stringMode = 'value'
          sanitized += '"'
          continue
        }

        sanitized += '\\"'
        continue
      }

      const code = ch.charCodeAt(0)
      if (code <= 0x1F) {
        if (ch === '\n') sanitized += '\\n'
        else if (ch === '\r') sanitized += '\\r'
        else if (ch === '\t') sanitized += '\\t'
        else sanitized += `\\u${code.toString(16).padStart(4, '0')}`
        continue
      }

      sanitized += ch
      continue
    }

    if (ch === '"') {
      inString = true
      const top = stack[stack.length - 1]
      stringMode = top && top.type === 'object' && top.expectKey ? 'key' : 'value'
      sanitized += '"'
      continue
    }

    if (ch === '{') {
      stack.push({ type: 'object', expectKey: true })
      sanitized += ch
      continue
    }

    if (ch === '[') {
      stack.push({ type: 'array' })
      sanitized += ch
      continue
    }

    if (ch === '}') {
      stack.pop()
      sanitized += ch
      if (stack.length && stack[stack.length - 1].type === 'object') {
        stack[stack.length - 1].expectKey = false
      }
      continue
    }

    if (ch === ']') {
      stack.pop()
      sanitized += ch
      continue
    }

    if (ch === ':') {
      sanitized += ch
      if (stack.length && stack[stack.length - 1].type === 'object') {
        stack[stack.length - 1].expectKey = false
      }
      continue
    }

    if (ch === ',') {
      sanitized += ch
      if (stack.length && stack[stack.length - 1].type === 'object') {
        stack[stack.length - 1].expectKey = true
      }
      continue
    }

    sanitized += ch
  }

  return sanitized
}

/**
 * JSON 응답을 파싱하되, 실패 시 보정 뒤 재시도
 * @param {string} rawText 서버 응답 텍스트
 * @param {object} [options]
 * @param {string} [options.context='API'] 로깅용 컨텍스트
 * @param {Console} [options.logger=console] 로깅 대상
 * @returns {object|null} 파싱된 객체 또는 null
 */
export const parseJsonPayload = (rawText, options = {}) => {
  if (!rawText) return null
  const { context = 'API', logger = console } = options
  try {
    return JSON.parse(rawText)
  } catch (error) {
    try {
      return JSON.parse(sanitizeJsonString(rawText))
    } catch (inner) {
      const message = inner?.message || ''
      const posMatch = /position (\d+)/.exec(message)
      const pos = posMatch ? Number(posMatch[1]) : 0
      const start = pos > 120 ? pos - 120 : 0
      const end = pos + 120
      logger?.error?.(
        `[${context}] JSON parsing failed`,
        inner,
        rawText.slice(start, end),
      )
      return null
    }
  }
}

const JSON_STRING_KEYS = ['result', 'data', 'payload']

/**
 * result/data/payload 등의 문자열 필드가 JSON 문자열일 경우 자동 파싱
 * @param {object|null} payload 파싱된 초기 객체
 * @param {object} [options]
 * @param {string[]} [options.keys] 파싱 대상 필드 목록
 * @returns {object|null} 정규화된 객체
 */
export const normalizeNestedJsonFields = (payload, options = {}) => {
  if (!payload || typeof payload !== 'object') return payload
  const { keys = JSON_STRING_KEYS } = options

  keys.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(payload, key)) return
    const value = payload[key]
    if (typeof value !== 'string') return
    const trimmed = value.trim()
    if (!trimmed) return
    const parsed = parseJsonPayload(trimmed, { context: `Nested:${key}` })
    if (parsed && typeof parsed === 'object') {
      payload[key] = parsed
    }
  })

  return payload
}
