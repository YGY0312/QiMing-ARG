export const INCIDENT_0616_URL = 'archive.qm-node.local/EXT-BACKUP-QM-0616/incident/0616'

export const incidentVerification = {
  objectId: '2024010318',
  date: '2026-06-16',
  device: 'CAM-07',
} as const

export function validateIncidentVerification(fields: Record<keyof typeof incidentVerification, string>) {
  return fields.objectId.trim() === incidentVerification.objectId
    && fields.date.trim() === incidentVerification.date
    && fields.device.trim().toUpperCase() === incidentVerification.device
}

export const lastRouteNodes = [
  { id: 'entrance', time: '19:21:04', source: 'CAM-07', label: '东侧入口' },
  { id: 'broadcast', time: '20:58:17', source: 'CAM-07', label: '广播设备室' },
  { id: 'equipment', time: '22:19:36', source: 'CAM-07', label: '三层设备间' },
  { id: 'terminal', time: '22:27:00', source: 'TERM-OLD-03', label: 'TERM-OLD-03写入' },
  { id: 'temporary', time: '22:28:01', source: 'CAM-07', label: '临时文件生成' },
] as const
export function isCorrectLastRoute(ids: string[]) {
  return ids.length === lastRouteNodes.length && ids.every((id, index) => id === lastRouteNodes[index].id)
}

export const accessRecords = [
  { time: '22:18:52', area: '三层设备间', action: '常规状态', status: '正常开放', permission: '—' },
  { time: '22:21:14', area: '三层设备间及封闭通道', action: '维护覆盖', status: '出口锁定', permission: 'ADMIN_03' },
  { time: '22:47:03', area: '三层设备间及封闭通道', action: '解除维护覆盖', status: '出口恢复', permission: 'ADMIN_03' },
] as const
export const accessComparison = { audioBreak: '22:20:03', override: '22:21:14', rescueCall: '22:46:18' } as const
export function validateAccessComparison(fields: Record<keyof typeof accessComparison, string>) {
  return fields.audioBreak === accessComparison.audioBreak
    && fields.override === accessComparison.override
    && fields.rescueCall === accessComparison.rescueCall
}

export const tmpRecoverySources = ['221936.mp4', 'TERM-OLD-03', '2024010318'] as const
export function validateTmpRecovery(selected: string[]) {
  return selected.length === tmpRecoverySources.length && tmpRecoverySources.every((item) => selected.includes(item))
}

export const emergencySteps = [
  { id: 'triggered', time: '22:31:44', label: '紧急按钮触发' },
  { id: 'received', time: '22:32:06', label: '校园安保查看' },
  { id: 'handled', time: '22:34:12', label: '内部处置记录' },
] as const
export function isCorrectEmergencyOrder(ids: string[]) {
  return ids.length === emergencySteps.length && ids.every((id, index) => id === emergencySteps[index].id)
}

export const rescueTimes = { start: '22:31:44', end: '22:46:18' } as const
export function calculateDelay(start: string, end: string) {
  const parse = (value: string) => {
    const [hour, minute, second] = value.split(':').map(Number)
    return hour * 3600 + minute * 60 + second
  }
  const seconds = parse(end) - parse(start)
  return seconds < 0 ? null : { seconds, label: `${Math.floor(seconds / 60)}分${seconds % 60}秒` }
}

export const medicalIdentity = { studentNumber: '2024010318', device: 'CAM-07', source: '旧实验楼' } as const
export function validateMedicalIdentity(fields: Record<keyof typeof medicalIdentity, string>) {
  return fields.studentNumber.trim() === medicalIdentity.studentNumber
    && fields.device.trim().toUpperCase() === medicalIdentity.device
    && fields.source.trim() === medicalIdentity.source
}

export const reportDifferences = ['发生地点', '门禁覆盖', '紧急按钮', '校外属性', '死亡结论', '对象编号'] as const
export function validateReportDifferences(selected: string[]) {
  return reportDifferences.every((item) => selected.includes(item))
}

export const cleanupEvidence = ['沈栀死亡确认', 'ADMIN_03清理任务', '顾言名单重新提交通知'] as const
export function validateCleanupEvidence(selected: string[]) {
  return cleanupEvidence.every((item) => selected.includes(item))
}

export const completeIncidentTimeline = [
  ['19:21', '沈栀进入旧实验楼'], ['20:58', 'CAM-07记录广播设备室'],
  ['22:19', '沈栀进入三层设备间区域'], ['22:20', '录音中断'],
  ['22:21', 'ADMIN_03维护覆盖锁定出口'], ['22:27', 'TERM-OLD-03写入沈栀缓存'],
  ['22:28', 'CAM-07临时文件记录求助与撞击'], ['22:31', '封闭通道紧急按钮触发'],
  ['22:32', '校园安保查看紧急信号'], ['22:34', '内部记录为设备故障，未呼叫外部急救'],
  ['22:46', '呼叫外部急救'], ['22:55', '救护车辆到达'],
  ['23:16', '沈栀送医'], ['23:58', '沈栀抢救无效死亡'],
  ['次日06:40', '对外事件改写为校外个人意外'], ['次日07:46', '班长收到重新提交名单通知'],
  ['次日08:12', '17人名单提交'], ['6月18日', 'TERM-OLD-03停用并归档相关记录'],
] as const
