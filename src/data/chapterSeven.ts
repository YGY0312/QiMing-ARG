import { classStudents } from './studentRecords'

export const LOCAL_CLASS_ARCHIVE_REF = 'CLS-ARCHIVE-18'
export const EXTERNAL_BACKUP_REF = 'EXT-BACKUP-QM-0616'
export const EXTERNAL_NODE_URL = `archive.qm-node.local/${EXTERNAL_BACKUP_REF}`

export function parseLocalClassReference(value: string) {
  return value.trim().toUpperCase() === `LOCAL_REF: ${LOCAL_CLASS_ARCHIVE_REF}`
    || value.trim().toUpperCase() === LOCAL_CLASS_ARCHIVE_REF
}

export const legacyClassIndex = {
  id: LOCAL_CLASS_ARCHIVE_REF,
  title: '高二（3）班公共资料索引',
  status: '已归档',
  lastSync: '2026-06-17 08:12',
  source: '班级公共文件夹',
  access: '索引可见，文件不可直接访问',
  fileName: '高二（3）班学生信息核对表_原始版.xlsx',
  sourceAccount: '班级事务账号',
  lastEditorRole: '班长',
  storage: '外部公共文件缓存',
} as const

export function searchLegacyArchive(query: string) {
  const normalized = query.trim().toUpperCase().replace(/\s+/g, ' ')
  const matched = normalized.includes(LOCAL_CLASS_ARCHIVE_REF)
    || (normalized.includes('CLASS') && normalized.includes('18'))
    || normalized.includes('高二（3）班')
    || normalized.includes('高二(3)班')
  return matched ? [legacyClassIndex] : []
}

export const rosterRecoveryFields = { className: '高二（3）班', historicalCount: '18', submitterRole: '班长' } as const
export function validateRosterRecovery(fields: Record<keyof typeof rosterRecoveryFields, string>) {
  return fields.className.trim().replace(/[()]/g, (char) => char === '(' ? '（' : '）') === rosterRecoveryFields.className
    && fields.historicalCount.trim() === rosterRecoveryFields.historicalCount
    && fields.submitterRole.trim() === rosterRecoveryFields.submitterRole
}

export const originalClassRoster = [
  ...classStudents.map((row) => ({ order: row[0], name: row[1], studentNumber: row[2], status: row[1] === '周寻' ? '在籍' : row[3] })),
  { order: '18', name: '沈栀', studentNumber: '2024010318', status: '在籍' },
] as const

export const originalRosterMetadata = {
  createdAt: '2026-05-30',
  savedAt: '2026-06-16 18:42',
  submitterRole: '班长',
  status: '未提交版本',
} as const

export const rosterTimeline = [
  { id: 'original', label: '原始名单保存', time: '2026-06-16 18:42' },
  { id: 'notice', label: '重新提交通知', time: '2026-06-17 07:46' },
  { id: 'resubmitted', label: '新名单提交', time: '2026-06-17 08:12' },
] as const
export function isCorrectRosterTimeline(ids: string[]) {
  return ids.length === 3 && ids.every((id, index) => id === rosterTimeline[index].id)
}

export const resubmissionNotice = {
  sentAt: '2026-06-17 07:46',
  recipient: '班长',
  title: '重新提交班级信息核对表',
  body: '请重新核对本班当前在籍学生信息。\n\n个别学生已完成学籍手续调整，请以系统当前名单为准重新提交。\n\n请勿继续使用此前导出的历史版本。',
  deadline: '2026-06-17 09:00前',
  attachment: '当前名单模板.xlsx',
} as const

export const rosterDifference = {
  originalCount: 18,
  submittedCount: 17,
  removed: { studentNumber: '2024010318', name: '沈栀' },
  modifiedAt: '2026-06-17 08:12',
  role: '班长',
  template: '系统当前名单',
} as const

export const monitorCacheFacts = ['历史人数为18', '沈栀出现在原始名单', '6月17日重新提交名单'] as const
export function validateMonitorCacheFacts(selected: string[]) {
  return monitorCacheFacts.every((fact) => selected.includes(fact))
}

export const monitorChat = [
  ['周寻', '名单是你改的吗？'],
  ['班长', '系统里已经没有她了。'],
  ['周寻', '我问的不是系统。是谁让你重新交名单的？'],
  ['班长', '辅导员发的通知。说她已经办完手续。'],
  ['周寻', '你见过手续吗？'],
  ['班长', '没有。'],
  ['周寻', '原来的名单还在吗？'],
  ['班长', '我不知道。'],
  ['周寻', '别删。'],
] as const

export const monitorStatement = {
  title: '关于班级名单的说明',
  status: '草稿 · 未发送',
  time: '2026-09-14 21:36',
  content: '我不知道这份说明应该交给谁。\n\n六月十七日早上，辅导员让我重新提交班级名单。\n\n他说沈栀已经办完手续，让我不要再用旧表。\n\n但六月十六日晚上，她的名字还在名单里。\n\n我没有见过退学申请，也没有见过转学手续。\n\n周寻后来找过我。\n\n他问的不是沈栀为什么离开，而是谁让我删掉她。\n\n我当时知道不对。但我还是照做了。\n\n如果周寻也从名单里消失，那就不是巧合。',
} as const

export const externalIndexRecord = {
  viewedAt: '2026-09-13 22:16',
  note: '旧站不走学生系统。',
  reference: EXTERNAL_BACKUP_REF,
} as const

export interface TransferFilters { startDate: string; endDate: string; device: string; targetType: string; status: string }
export const transferRecords = [
  { id: 'write-0616', timestamp: '2026-06-16 22:27', source: 'TERM-OLD-03', targetType: 'LOCAL_CACHE', object: '2024010318', status: '写入完成', targetId: '', checksum: '' },
  { id: 'export-start', timestamp: '2026-09-14 23:56', source: 'TERM-OLD-03', targetType: 'EXTERNAL_NODE', object: 'ARCHIVE_0616', status: '导出开始', targetId: 'EXT-NODE-04', checksum: 'QM-0616' },
  { id: 'export-complete', timestamp: '2026-09-15 00:01', source: 'TERM-OLD-03', targetType: 'EXTERNAL_NODE', object: 'ARCHIVE_0616', status: '导出完成', targetId: 'EXT-NODE-04', checksum: 'QM-0616' },
] as const

export function queryTransferRecords(filters: TransferFilters) {
  if (!filters.startDate || !filters.endDate || filters.startDate > filters.endDate) return []
  return transferRecords.filter((row) => {
    const date = row.timestamp.slice(0, 10)
    return date >= filters.startDate && date <= filters.endDate
      && (!filters.device || row.source === filters.device.trim().toUpperCase())
      && (!filters.targetType || row.targetType === filters.targetType)
      && (!filters.status || row.status === filters.status)
  }).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}
export function isExternalExportPair(ids: string[]) {
  return ids.length === 2 && ids.includes('export-start') && ids.includes('export-complete')
}

export const externalNodeFields = { historicalObject: '2024010318', sourceTerminal: 'TERM-OLD-03', originalCount: '18' } as const
export function validateExternalNode(fields: Record<keyof typeof externalNodeFields, string>) {
  return fields.historicalObject.trim() === externalNodeFields.historicalObject
    && fields.sourceTerminal.trim().toUpperCase() === externalNodeFields.sourceTerminal
    && fields.originalCount.trim() === externalNodeFields.originalCount
}

export const externalManifest = {
  archiveId: 'ARCHIVE_0616',
  source: 'TERM-OLD-03',
  account: 'LOCAL_SESSION',
  exportedAt: '2026-09-15 00:01',
  contents: ['班级原始名单', 'CAM-07媒体索引', '内部计划目录', '事件记录包'],
  integrity: '71%',
} as const

export const qimingPlanIndex = {
  files: ['QM_PROJECT_OVERVIEW.pdf', 'QM_OBJECT_RULES.dat', 'QM_ACCOUNT_MAPPING.csv', 'QM_INCIDENT_0616.ref'],
  name: '启明学生风险干预计划',
  code: 'QM',
  status: '试运行',
} as const
