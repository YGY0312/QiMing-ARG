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

export interface LaboratoryReservationRecord {
  applicationDate: string
  useDate: string
  place: string
  purpose: string
  applicant: string
  approvalStatus: string
  approvalDepartment: string
}

export const laboratoryReservationRecords: LaboratoryReservationRecord[] = [
  {
    applicationDate: '2026-06-15',
    useDate: '2026-06-16',
    place: '旧实验楼 A-302',
    purpose: '资料整理',
    applicant: '沈栀',
    approvalStatus: '通过',
    approvalDepartment: '信息中心',
  },
]

export function queryLaboratoryReservations(useDate: string, applicant: string): LaboratoryReservationRecord[] {
  return laboratoryReservationRecords.filter((record) => record.useDate === useDate && record.applicant === applicant)
}

export interface EquipmentLoanRecord {
  date: string
  borrower: string
  equipment: string[]
  status: string
}

export const equipmentLoanRecords: EquipmentLoanRecord[] = [
  { date: '2026-06-16', borrower: '沈栀', equipment: ['便携摄像设备', '存储卡', '数据线'], status: '未归还' },
]

export function queryEquipmentLoans(date: string, borrower: string): EquipmentLoanRecord[] {
  return equipmentLoanRecords.filter((record) => record.date === date && record.borrower === borrower)
}

export interface DutyLogRecord {
  date: string
  time: string
  event: string
}

export const dutyLogRecords: DutyLogRecord[] = [
  { date: '2026-06-16', time: '19:10', event: '旧实验楼开放' },
  { date: '2026-06-16', time: '19:21', event: '发现学生进入A区' },
  { date: '2026-06-16', time: '21:45', event: '收到系统维护通知' },
  { date: '2026-06-16', time: '22:30', event: '执行系统同步' },
  { date: '2026-06-16', time: '23:00', event: '值班结束' },
]

export function queryDutyLogs(date: string): DutyLogRecord[] {
  return dutyLogRecords.filter((record) => record.date === date)
}

export interface CameraExceptionRecord {
  date: string
  device: string
  exceptionTime: string
  exceptionType: string
  status: string
}

export const cameraExceptionRecords: CameraExceptionRecord[] = [
  {
    date: '2026-06-16',
    device: '旧实验楼东门摄像头',
    exceptionTime: '22:25-22:40',
    exceptionType: '数据覆盖',
    status: '已恢复',
  },
]

export function queryCameraExceptions(date: string, device: string): CameraExceptionRecord[] {
  return cameraExceptionRecords.filter((record) => record.date === date && record.device === device)
}

export interface MaintenanceTicketRecord {
  id: string
  time: string
  type: string
  scope: string
  department: string
}

export const maintenanceTicketRecords: MaintenanceTicketRecord[] = [
  { id: 'SYS-0616', time: '2026-06-16 22:20', type: '数据同步维护', scope: '学生信息系统', department: '信息中心' },
]

export function queryMaintenanceTickets(id: string): MaintenanceTicketRecord[] {
  return maintenanceTicketRecords.filter((record) => record.id === id.trim().toUpperCase())
}
