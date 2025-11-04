/**
 * 파일명: frontendConfig.server.js
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 프런트엔드 config.ini 로더
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * 설명: config.ini 파일을 읽어 JSON 객체로 변환한다.
 * 우선순위: FRONTEND_CONFIG_PATH > config_prod.ini(프로덕션) > config_dev.ini > config.ini
 */
export function loadFrontendConfig() {
  const cwd = process.cwd()
  const envPath = process.env.FRONTEND_CONFIG_PATH && path.isAbsolute(process.env.FRONTEND_CONFIG_PATH)
    ? process.env.FRONTEND_CONFIG_PATH
    : (process.env.FRONTEND_CONFIG_PATH ? path.join(cwd, process.env.FRONTEND_CONFIG_PATH) : null)

  const candidates = []
  if (envPath) candidates.push(envPath)
  if (process.env.NODE_ENV === 'production') {
    candidates.push(path.join(cwd, 'config_prod.ini'))
  }
  candidates.push(path.join(cwd, 'config_dev.ini'))
  candidates.push(path.join(cwd, 'config.ini'))

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const iniText = fs.readFileSync(p, 'utf-8')
        return parseIni(iniText)
      }
    } catch (error) {
      console.warn('[config] 읽기 실패, 다음 후보로 진행:', p, error)
    }
  }
  return {}
}

/**
 * 설명: INI 문자열을 객체로 파싱한다.
 * 섹션([SECTION])은 객체 키가 되며, 섹션 밖 키는 최상위에 매핑된다.
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
 * true/false, 숫자, JSON 객체/배열 형태를 자동 변환하고 나머지는 문자열로 유지한다.
 */
function coerceValue(valueRaw) {
  if (valueRaw === '') return ''
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

