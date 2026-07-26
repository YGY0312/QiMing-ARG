export const terminalHeartbeats = [
  { time: '2026-09-15 00:05', status: '离线' },
  { time: '2026-09-15 00:07', status: '在线' },
  { time: '2026-09-15 00:08', status: '未知' },
] as const

export function hasTerminalStatusFluctuation(): boolean {
  return terminalHeartbeats.some((row) => row.status === '在线')
}

export const decommissionRecord = {
  name: '旧实验楼维护终端03', id: 'TERM-OLD-03', date: '2026-06-18',
  status: '原地封存', location: '旧实验楼三层设备间', method: '保留存储介质，断开业务网络',
}
export function searchDecommissionRecords(query: string) {
  const normalized = query.trim().toLowerCase()
  return ['term-old-03', '旧实验楼维护终端03', '旧实验楼终端'].some((term) => normalized.includes(term.toLowerCase()))
    ? [decommissionRecord] : []
}

export const floorPlanAreas = ['A-302', '广播设备室', '弱电间', '三层设备间', '东侧楼梯', '西侧楼梯', '封闭通道', '走廊'] as const
export function isValidFloorRoute(selected: string[]): boolean {
  const expected = ['A-302', '广播设备室', '三层设备间']
  return selected.length === expected.length && expected.every((area) => selected.includes(area))
}

export interface NetworkAccessFilters { startDate: string; endDate: string; device: string; accessPoint: string; status: string }
export const networkAccessRecords = [
  { id: 'net-0616-2227', date: '2026-06-16', time: '22:27', device: 'TERM-OLD-03', accessPoint: 'OLD-BLDG-3F-SW02', status: '在线' },
  { id: 'net-0616-2231', date: '2026-06-16', time: '22:31', device: 'TERM-OLD-03', accessPoint: 'OLD-BLDG-3F-SW02', status: '数据同步' },
  { id: 'net-0702', date: '2026-07-02', time: '14:10', device: 'TERM-NEW-08', accessPoint: 'NEW-BLDG-2F-SW01', status: '在线' },
  { id: 'net-0914-2347', date: '2026-09-14', time: '23:47', device: 'TERM-OLD-03', accessPoint: 'OLD-BLDG-3F-SW02', status: '在线' },
  { id: 'net-0915-0005', date: '2026-09-15', time: '00:05', device: 'TERM-OLD-03', accessPoint: 'OLD-BLDG-3F-SW02', status: '离线' },
] as const
function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return month >= 1 && month <= 12 && day >= 1 && day <= days
}
export function queryNetworkAccess(filters: NetworkAccessFilters): { records: typeof networkAccessRecords[number][]; error: 'incomplete-range' | 'invalid-date' | 'reversed-range' | null } {
  if (!filters.startDate || !filters.endDate) return { records: [], error: 'incomplete-range' }
  if (!validDate(filters.startDate) || !validDate(filters.endDate)) return { records: [], error: 'invalid-date' }
  if (filters.startDate > filters.endDate) return { records: [], error: 'reversed-range' }
  const records = networkAccessRecords.filter((row) =>
    row.date >= filters.startDate && row.date <= filters.endDate
    && (!filters.device || row.device === filters.device)
    && (!filters.accessPoint || row.accessPoint === filters.accessPoint)
    && (!filters.status || row.status === filters.status))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
  return { records, error: null }
}
export function isSameNetworkPortPair(ids: string[]): boolean {
  return ids.length === 2 && ids.includes('net-0616-2227') && ids.includes('net-0914-2347')
}

export const networkArchive = {
  node: 'OLD-BLDG-3F-SW02', area: '旧实验楼三层西侧',
  rooms: ['A-302', '广播设备室', '三层设备间'], status: '停用', date: '2026-06-18',
}
export function searchNetworkArchive(query: string) { return query.trim().toUpperCase() === networkArchive.node ? [networkArchive] : [] }

export const cameraRecoveryFields = { borrower: '2024010318', device: 'CAM-07', terminal: 'TERM-OLD-03' }
export function validateCameraRecovery(fields: typeof cameraRecoveryFields) {
  return fields.borrower.trim() === cameraRecoveryFields.borrower && fields.device.trim().toUpperCase() === cameraRecoveryFields.device && fields.terminal.trim().toUpperCase() === cameraRecoveryFields.terminal
}
export const cameraFiles = [
  { name: '192104.jpg', type: '图片', createdAt: '2026-06-16 19:21:04', status: '可读取缩略信息' },
  { name: '205817.mp4', type: '视频', createdAt: '2026-06-16 20:58:17', status: '画面损坏，元数据可读取' },
  { name: '221936.mp4', type: '视频', createdAt: '2026-06-16 22:19:36', status: '画面损坏，部分音轨索引可读取' },
  { name: '222801.tmp', type: '临时文件', createdAt: '2026-06-16 22:28:01', status: '格式未知' },
] as const
export const mediaMetadata = {
  '205817.mp4': { createdAt: '2026-06-16 20:58:17', device: 'CAM-07', location: 'OLD-BLDG-3F', video: '不可恢复', audio: '存在但损坏' },
  '221936.mp4': { createdAt: '2026-06-16 22:19:36', device: 'CAM-07', location: '缺失', video: '不可恢复', audio: '部分索引可恢复' },
} as const
export const recoveredAudioIndex = [['22:19:41', '门锁声'], ['22:19:46', '无法识别的人声'], ['22:19:52', '“……终端……”'], ['22:20:03', '数据中断']] as const

export const pendingObjects = [
  { id: '2024010318', source: '历史档案同步', status: '等待同步' },
  { id: '2024010312', source: '本地会话', status: '等待同步' },
  { id: '2024010307', source: '关联访问', status: '等待同步' },
] as const
export function hasAllPendingObjects(ids: string[]) { return pendingObjects.every((item) => ids.includes(item.id)) }
