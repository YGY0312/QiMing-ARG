export interface DutyScheduleRecord {
  date: string
  building: string
  period: string
  teacher: string
}

export const dutyScheduleRecords: DutyScheduleRecord[] = [
  { date: '2026-06-15', building: '新实验楼', period: '晚间', teacher: '赵闻远' },
  { date: '2026-06-16', building: '旧实验楼', period: '晚间', teacher: '陈启明' },
  { date: '2026-06-17', building: '新实验楼', period: '晚间', teacher: '宋文清' },
]

export function queryDutySchedule(date: string, building: string): DutyScheduleRecord[] {
  return dutyScheduleRecords.filter((record) => record.date === date && record.building === building)
}

export interface LaboratoryAccessRecord {
  date: string
  time: string
  place: string
  event: string
  operationSource?: string
  account?: string
}

export const laboratoryAccessRecords: LaboratoryAccessRecord[] = [
  { date: '2026-06-16', time: '19:18', place: '旧实验楼东门', event: '检测到门体开启' },
  { date: '2026-06-16', time: '19:21', place: '旧实验楼东门', event: '沈栀进入旧实验楼' },
  { date: '2026-06-16', time: '19:45', place: '旧实验楼A-302', event: '门禁异常' },
  { date: '2026-06-16', time: '22:30', place: '旧实验楼A-302', event: '异常解除', operationSource: '管理员', account: '未记录' },
]

export function queryLaboratoryAccessRecords(date: string, building: string): LaboratoryAccessRecord[] {
  return laboratoryAccessRecords.filter((record) => record.date === date && (
    building === '全部' || record.place.startsWith(building)
  ))
}

export function isChapterThreeAccessQuery(date: string, building: string): boolean {
  return date === '2026-06-16' && building === '旧实验楼'
}
