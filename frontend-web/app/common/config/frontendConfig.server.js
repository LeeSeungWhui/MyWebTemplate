/**
 * ?뚯씪紐? frontendConfig.server.js
 * ?묒꽦?? LSH
 * 媛깆떊?? 2025-09-13
 * ?ㅻ챸: ?꾨윴?몄뿏??config.ini 濡쒕뜑
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * ?ㅻ챸: config.ini ?뚯씪???쎌뼱 JSON 媛앹껜濡?蹂?섑븳??
 * ?곗꽑?쒖쐞: FRONTEND_CONFIG_PATH > config_prod.ini(?꾨줈?뺤뀡) > config_dev.ini > config.ini
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
      console.warn('[config] ?쎄린 ?ㅽ뙣, ?ㅼ쓬 ?꾨낫濡?吏꾪뻾:', p, error)
    }
  }
  return {}
}

/**
 * ?ㅻ챸: INI 臾몄옄?댁쓣 媛앹껜濡??뚯떛?쒕떎.
 * ?뱀뀡([SECTION])? 媛앹껜 ?ㅺ? ?섎ŉ, ?뱀뀡 諛??ㅻ뒗 理쒖긽?꾩뿉 留ㅽ븨?쒕떎.
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
 * ?ㅻ챸: INI 媛?臾몄옄?댁쓣 ??낆뿉 留욊쾶 蹂?섑븳??
 * true/false, ?レ옄, JSON 媛앹껜/諛곗뿴 ?뺥깭瑜??먮룞 蹂?섑븯怨??섎㉧吏??臾몄옄?대줈 ?좎??쒕떎.
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


