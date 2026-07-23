import { APP_VERSION, PROJECT_CREATOR, SAVE_SCHEMA_VERSION } from '../config/app'
import { createSave, migrateSave } from '../game/storage'
import type { GameSaveV5, GameState } from '../types/game'

export type ImportSaveResult =
  | { ok: true; save: GameSaveV5 }
  | { ok: false; error: string }

export function exportSaveText(state: GameState): string {
  return JSON.stringify(createSave(state), null, 2)
}

export function importSaveText(text: string): ImportSaveResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: '无法解析 JSON，请检查文本格式。' }
  }
  const migrated = migrateSave(parsed)
  if (!migrated) return { ok: false, error: '存档结构无效，当前进度未被覆盖。' }
  return { ok: true, save: migrated }
}

export interface FeedbackInput {
  nickname?: string
  page: string
  chapter: string
  discoveredClues: number
  severity: string
  description: string
  browser: string
}

export function createFeedbackText(input: FeedbackInput): string {
  return [
    '项目：QiMing ARG',
    `创建者：${PROJECT_CREATOR}`,
    `测试版本：${APP_VERSION}`,
    `存档版本：${SAVE_SCHEMA_VERSION}`,
    `测试人员：${input.nickname?.trim() || '未填写'}`,
    `测试页面：${input.page}`,
    `当前章节：${input.chapter}`,
    `已发现线索：${input.discoveredClues}`,
    `问题严重度：${input.severity}`,
    `问题描述：${input.description.trim() || '未填写'}`,
    `浏览器：${input.browser}`,
  ].join('\n')
}
