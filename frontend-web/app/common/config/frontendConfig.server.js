/**
 * 파일명: frontendConfig.server.js
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 프론트엔드 config.ini 로더
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * 설명: config.ini 파일을 읽어 JSON으로 변환한다.
 * 갱신일: 2025-09-13
 */
export function loadFrontendConfig() {
  const configPath = path.join(process.cwd(), 'config.ini')
  let iniText = ''
  try {
    iniText = fs.readFileSync(configPath, 'utf-8')
  } catch (error) {
    console.warn('[config] config.ini 읽기 실패, 기본 빈 객체 사용', error)
    return {}
  }
  return parseIni(iniText)
}

/**
 * 설명: INI 문자열을 객체로 파싱한다.
 * 갱신일: 2025-09-13
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
      if (!result[sectionName]) {
        result[sectionName] = {}
      }
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
 * 갱신일: 2025-09-13
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
