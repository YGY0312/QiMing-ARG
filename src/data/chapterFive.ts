export const TERM_OLD_03_DEVICE_ID = 'TERM-OLD-03'

export interface LoginRecord {
  id: string
  date: string
  time: string
  device: string
  deviceId?: string
  location: string
  status: '成功' | '会话中断'
}

export const zhouLoginRecords: LoginRecord[] = [
  { id: 'mobile-0913', date: '2026-09-13', time: '07:11', device: '校园移动端', location: '教学楼', status: '成功' },
  { id: 'web-0914', date: '2026-09-14', time: '21:06', device: 'Web端', location: '旧实验楼', status: '成功' },
  { id: 'terminal-login', date: '2026-09-14', time: '23:48', device: '维护终端03', deviceId: TERM_OLD_03_DEVICE_ID, location: '旧实验楼', status: '成功' },
  { id: 'terminal-interrupted', date: '2026-09-15', time: '00:02', device: '维护终端03', deviceId: TERM_OLD_03_DEVICE_ID, location: '旧实验楼', status: '会话中断' },
  { id: 'mobile-0908', date: '2026-09-08', time: '18:20', device: '校园移动端', location: '宿舍区', status: '成功' },
]

export interface LoginFilters { date: string; device: string; status: string }
export function filterLoginRecords(filters: LoginFilters): LoginRecord[] {
  return zhouLoginRecords.filter((record) =>
    (!filters.date || record.date === filters.date)
    && (!filters.device || record.device === filters.device)
    && (!filters.status || record.status === filters.status))
}

export function isPostDisappearancePair(ids: string[]): boolean {
  return ids.length === 2 && ids.includes('terminal-login') && ids.includes('terminal-interrupted')
}

export const terminalOld03 = {
  name: '维护终端03',
  id: TERM_OLD_03_DEVICE_ID,
  location: '旧实验楼三层',
  status: '已停用',
  decommissionedAt: '2026-06-18',
  lastActivityAt: '2026-09-15 00:02',
} as const

export function isDecommissionedTerminalActivity(): boolean {
  return new Date(`${terminalOld03.lastActivityAt.replace(' ', 'T')}:00`).getTime()
    > new Date(`${terminalOld03.decommissionedAt}T23:59:59`).getTime()
}

export const cacheRecoveryFields = {
  studentNumber: '2024010318',
  maintenanceNumber: 'SYS-0616',
  terminalNumber: TERM_OLD_03_DEVICE_ID,
} as const

export function validateCacheRecovery(fields: Record<keyof typeof cacheRecoveryFields, string>): boolean {
  return (Object.keys(cacheRecoveryFields) as (keyof typeof cacheRecoveryFields)[])
    .every((key) => fields[key].trim().toUpperCase() === cacheRecoveryFields[key])
}

export const accountRelationRecords = {
  '2024010318': { label: '历史档案对象', name: '沈栀', relation: `关联终端：${TERM_OLD_03_DEVICE_ID}` },
  '2024010312': { label: '异常账号', name: '周寻', relation: `关联终端：${TERM_OLD_03_DEVICE_ID}` },
  '2024010307': { label: '当前监测对象', name: '林默', relation: '关联来源：2024010312' },
} as const
export type RelationAccountId = keyof typeof accountRelationRecords

export function hasCompleteAccountRelation(ids: string[]): boolean {
  return (Object.keys(accountRelationRecords) as RelationAccountId[]).every((id) => ids.includes(id))
}

export const zhouLastActivities = [
  ['2026-09-14 23:51', '消息中心', '创建草稿'],
  ['2026-09-14 23:54', '账号安全', '移除已保存设备'],
  ['2026-09-15 00:02', '账号会话', '会话异常结束'],
] as const

export type DraftTimeKey = 'sessionInterrupted' | 'draftModified' | 'draftCreated'
export const draftTimes: Record<DraftTimeKey, { label: string; value: string }> = {
  draftCreated: { label: '草稿创建时间', value: '2026-09-14 23:51' },
  sessionInterrupted: { label: '会话中断时间', value: '2026-09-15 00:02' },
  draftModified: { label: '草稿最后修改时间', value: '2026-09-15 00:04' },
}

export function isDraftTimeAnomaly(keys: DraftTimeKey[]): boolean {
  return keys.length === 2 && keys.includes('sessionInterrupted') && keys.includes('draftModified')
}
