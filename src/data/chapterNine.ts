export const SESSION_0914_URL = 'archive.qm-node.local/EXT-BACKUP-QM-0616/session/0914'

export const sessionVerification = {
  account: '2024010312',
  terminal: 'TERM-OLD-03',
  exportObject: 'ARCHIVE_0616',
} as const

export function validateSessionVerification(fields: Record<keyof typeof sessionVerification, string>) {
  return fields.account.trim() === sessionVerification.account
    && fields.terminal.trim().toUpperCase() === sessionVerification.terminal
    && fields.exportObject.trim().toUpperCase() === sessionVerification.exportObject
}

export const localSessionTimeline = [
  ['23:47:32', 'TERM-OLD-03网络接入恢复'],
  ['23:48:06', '本地凭证验证成功'],
  ['23:51:18', '创建草稿《别再登录我的账号》'],
  ['23:54:09', '移除已保存设备'],
  ['23:56:03', 'ARCHIVE_0616外部导出开始'],
  ['23:58:11', '写入2024010312.pending'],
  ['00:00:26', '建立ZX-VERIFY-01验证任务'],
  ['00:01:07', 'ARCHIVE_0616外部导出完成'],
  ['00:01:32', '写入ZX-KEY-01'],
  ['00:02:00', 'LOCAL_SESSION异常中断'],
] as const

export const localSessionIdentity = { type: 'LOCAL_SESSION', terminal: 'TERM-OLD-03', auth: '本地凭证' } as const
export function validateLocalSessionIdentity(fields: Record<keyof typeof localSessionIdentity, string>) {
  return fields.type === localSessionIdentity.type && fields.terminal === localSessionIdentity.terminal && fields.auth === localSessionIdentity.auth
}

export const exportEvidence = ['23:56:03 导出开始', '00:01:07 导出完成', '00:01:32 写入ZX-KEY-01'] as const
export function validateExportEvidence(selected: string[]) {
  return exportEvidence.every((item) => selected.includes(item))
}

export const verificationTaskPairs = {
  '原始名单': '外部索引',
  'TERM-OLD-03证据': 'pending目录',
  '0616身份确认': '医疗记录',
} as const
export function validateTaskPairs(pairs: Record<keyof typeof verificationTaskPairs, string>) {
  return (Object.keys(verificationTaskPairs) as Array<keyof typeof verificationTaskPairs>).every((key) => pairs[key] === verificationTaskPairs[key])
}

export const behaviorSources = {
  draft: 'LOCAL_SESSION',
  export: 'LOCAL_SESSION',
  externalIndex: 'DELAYED_JOB',
  draftModification: 'PROXY_SESSION',
  linmoQuery: 'PROXY_SESSION',
} as const
export function validateBehaviorSources(values: Record<keyof typeof behaviorSources, string>) {
  return (Object.keys(behaviorSources) as Array<keyof typeof behaviorSources>).every((key) => values[key] === behaviorSources[key])
}

export const proxyTimeline = [
  ['00:03:41', 'IC-SEC-02建立2024010312代理会话'],
  ['00:04:12', '修改草稿元数据并追加隐藏追踪标记'],
  ['00:05:03', '读取ARCHIVE_0616导出状态：目标节点无法回收'],
  ['00:07:18', '重新建立账号活动状态'],
  ['00:09:44', '查询关联账号2024010307'],
  ['00:11:02', '将2024010307加入监测队列'],
] as const

export const monitoringEvidence = ['TRACE_TARGET=LAST_READER', '林默查看草稿', 'ADMIN_03查询2024010307'] as const
export function validateMonitoringEvidence(selected: string[]) {
  return monitoringEvidence.every((item) => selected.includes(item))
}

export const adminOperators = [
  { id: 'xu-chengan', name: '许承安', staffId: 'T-041', role: '信息中心副主任', access: true, terminal: true, authorized: true },
  { id: 'security-service', name: '安保系统服务账户', staffId: 'SVC-SEC', role: '服务账户', access: false, terminal: false, authorized: true },
  { id: 'records-service', name: '学籍数据服务账户', staffId: 'SVC-REG', role: '服务账户', access: false, terminal: false, authorized: true },
] as const
export function identifyAdminOperator(id: string) {
  const operator = adminOperators.find((item) => item.id === id)
  return operator?.access === true && operator.terminal === true && operator.authorized === true ? operator : null
}

export const exitTimeline = [
  { id: 'session', time: '00:02', label: '本地会话中断' },
  { id: 'service-exit', time: '00:13–00:20', label: '旧实验楼服务出口离开' },
  { id: 'witness', time: '00:37', label: '顾言在东门外目击周寻' },
  { id: 'deposit', time: '01:12', label: '文件袋进入寄存柜' },
  { id: 'node', time: '01:17', label: '外部节点首次确认' },
] as const
export function validateExitOrder(ids: string[]) {
  return ids.length === exitTimeline.length && ids.every((id, index) => id === exitTimeline[index].id)
}

export const packageTimes = { deposited: '2026-09-15 01:12', received: '2026-09-15 01:17' } as const
export function validatePackageTimes(fields: Record<keyof typeof packageTimes, string>) {
  return fields.deposited === packageTimes.deposited && fields.received === packageTimes.received
}

export const aliveSignature = { signature: 'ZX-KEY-01', account: '2024010312', exportObject: 'ARCHIVE_0616' } as const
export function validateAliveSignature(fields: Record<keyof typeof aliveSignature, string>) {
  return fields.signature.trim().toUpperCase() === aliveSignature.signature
    && fields.account.trim() === aliveSignature.account
    && fields.exportObject.trim().toUpperCase() === aliveSignature.exportObject
}

export const aliveConclusionEvidence = ['顾言东门目击', '文件袋投递确认', 'ZX-KEY-01签名通过'] as const
export function validateAliveConclusion(selected: string[]) {
  return aliveConclusionEvidence.every((item) => selected.includes(item))
}
