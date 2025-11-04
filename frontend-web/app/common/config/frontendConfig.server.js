/**
 * ?뚯씪紐? frontendConfig.server.js
 * ?묒꽦?? LSH
 * 媛깆떊?? 2025-09-13
 * ?ㅻ챸: ?꾨줎?몄뿏??config.ini 濡쒕뜑
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * ?ㅻ챸: config.ini ?뚯씪???쎌뼱 JSON?쇰줈 蹂?섑븳??
 * 媛깆떊?? 2025-09-13
 */
export function loadFrontendConfig() {
  const configPath = path.join(process.cwd(), 'config.ini')
  let iniText = ''
  try {
    iniText = fs.readFileSync(configPath, 'utf-8')
  } catch (error) {
    console.warn('[config] config.ini ?쎄린 ?ㅽ뙣, 湲곕낯 鍮?媛앹껜 ?ъ슜', error)
    return {}
  }
  return parseIni(iniText)
}

/**
 * ?ㅻ챸: INI 臾몄옄?댁쓣 媛앹껜濡??뚯떛?쒕떎.
 * 媛깆떊?? 2025-09-13
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
 * ?ㅻ챸: INI 媛?臾몄옄?댁쓣 ??낆뿉 留욊쾶 蹂?섑븳??
 * 媛깆떊?? 2025-09-13
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
    console.warn('[config] JSON ?뚯떛 ?ㅽ뙣', valueRaw, error)
  }
  return valueRaw
}



