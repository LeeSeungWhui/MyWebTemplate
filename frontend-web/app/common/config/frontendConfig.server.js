/**
 * 파일명: frontendConfig.server.js
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 프론트엔드 config.ini 로더
 */

let cachedConfig = null

const isServerRuntime = () => typeof window === 'undefined'

/**
 * 설명: config.ini 파일을 읽어 JSON 객체로 변환한다.
 * 우선순위: config.ini > config_prod.ini > config_dev.ini (env 변수 미사용)
 */
export async function loadFrontendConfig() {
  if (!isServerRuntime()) {
    return cachedConfig ?? {}
  }
  if (cachedConfig) return cachedConfig

  const { existsSync, readFileSync } = await import('node:fs')
  const { join } = await import('node:path')

  const cwd = process.cwd()
  // 환경 변수 의존 제거. 운영/개발 선택은 배포 환경에서 config.ini 계열 파일로 결정한다.
  // 존재 순서: config.ini > config_prod.ini > config_dev.ini
  const candidates = [
    join(cwd, 'config.ini'),
    join(cwd, 'config_prod.ini'),
    join(cwd, 'config_qa.ini'),
    join(cwd, 'config_dev.ini'),
  ]

  for (const p of candidates) {
    try {
      if (existsSync(p)) {
        const iniText = readFileSync(p, 'utf-8')
        cachedConfig = parseIni(iniText)
        if (typeof globalThis !== 'undefined') {
          globalThis.__APP_RUNTIME_CONFIG__ = cachedConfig
        }
        return cachedConfig
      }
    } catch (error) {
      console.warn('[config] 읽기 실패, 다음 후보로 진행:', p, error)
    }
  }
  cachedConfig = {}
  if (typeof globalThis !== 'undefined') {
    globalThis.__APP_RUNTIME_CONFIG__ = cachedConfig
  }
  return cachedConfig
}

/**
 * 설명: INI 문자열을 객체로 변환한다.
 * 섹션([SECTION])은 객체 키가 되고, 섹션 밖 키는 최상위에 매핑한다.
 */
export function parseIni(iniText) {
  const result = {}
  let currentSection = result
  const lines = iniText.split(/\r?\n/)
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || line.startsWith(';')) continue
    if (line.startsWith('[') && line.endsWith(']')) {
      const sectionName = line.slice(1, -1).trim()
      if (!sectionName) continue
      if (!result[sectionName]) result[sectionName] = {}
      currentSection = result[sectionName]
      continue
    }
    const equalsIndex = line.indexOf('=')
    if (equalsIndex === -1) continue
    const key = line.slice(0, equalsIndex).trim()
    const valueRaw = line.slice(equalsIndex + 1).trim()
    if (!key) continue
    currentSection[key] = coerceValue(valueRaw)
  }
  return result
}

/**
 * 설명: INI 값 문자열을 타입에 맞게 변환한다.
 * true/false, 숫자, JSON 객체/배열 포맷을 자동 변환하고 실패 시 문자열로 유지한다.
 */
function coerceValue(valueRaw) {
  if (valueRaw === '') return ''
  // Strip wrapping quotes if present (e.g., 'DEV' or "DEV")
  if ((valueRaw.startsWith("'") && valueRaw.endsWith("'")) || (valueRaw.startsWith('"') && valueRaw.endsWith('"'))) {
    const inner = valueRaw.slice(1, -1)
    return coerceValue(inner)
  }
  const lower = valueRaw.toLowerCase()
  if (lower === 'true') return true
  if (lower === 'false') return false
  const num = Number(valueRaw)
  if (!Number.isNaN(num) && valueRaw.trim() !== '') return num
  try {
    if ((valueRaw.startsWith('{') && valueRaw.endsWith('}')) || (valueRaw.startsWith('[') && valueRaw.endsWith(']')))
      return JSON.parse(valueRaw)
  } catch (error) {
    console.warn('[config] JSON 파싱 실패', valueRaw, error)
  }
  return valueRaw
}
