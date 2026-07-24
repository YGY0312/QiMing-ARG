export type ClassHistoryPeriod = 'current' | 'may' | 'june'

export interface ClassHistoryView {
  period: ClassHistoryPeriod
  label: string
  countLabel: string
  rows: string[][]
}

const currentNames = ['陈嘉禾','许宁','王澄','苏晴','江唯','方可','林默','赵清遥','严希','贺闻','顾言','周寻','唐雨','宋乔','叶臻','程夏','温宁']
const mayNames = ['陈嘉禾','许宁','王澄','苏晴','江唯','方可','林默','赵清遥','严希','贺闻','顾言',null,'周寻','唐雨','宋乔','叶臻','程夏','温宁']

export const classHistoryViews: Record<ClassHistoryPeriod, ClassHistoryView> = {
  current: { period: 'current', label: '当前', countLabel: '共17人', rows: currentNames.map((name, index) => [String(index + 1).padStart(2, '0'), name, index === 11 ? '已退学' : '在籍']) },
  may: { period: 'may', label: '2026年5月', countLabel: '共18条记录', rows: mayNames.map((name, index) => [String(index + 1).padStart(2, '0'), name ?? '姓名字段缺失', name ? '历史记录' : '数据读取异常']) },
  june: { period: 'june', label: '2026年6月', countLabel: '加载结果：17人', rows: currentNames.map((name, index) => [String(index + 1).padStart(2, '0'), name, '历史记录']) },
}

export interface GroupHistoryRecord { date: string; member: string; action: '加入群聊' | '移出群聊'; source: string; administrator: string }
export const groupHistoryRecords: GroupHistoryRecord[] = [
  { date: '2026-06-04 16:30', member: '宋乔', action: '加入群聊', source: '学籍同步', administrator: '系统' },
  { date: '2026-06-12 09:06', member: '程夏', action: '加入群聊', source: '管理员操作', administrator: '顾言' },
  { date: '2026-06-18 08:12', member: '沈栀', action: '移出群聊', source: '管理员操作', administrator: '顾言' },
  { date: '2026-06-20 13:44', member: '温宁', action: '加入群聊', source: '数据迁移', administrator: '系统' },
]

export function filterGroupHistory(name: string, date: string, action: string): GroupHistoryRecord[] {
  const normalized = name.trim()
  return groupHistoryRecords.filter((record) => (!normalized || record.member.includes(normalized)) && (!date || record.date.startsWith(date)) && (!action || record.action === action))
}

export type StatusDateKey = 'effective' | 'entered' | 'application'
export const statusCacheProfile = { name: '周寻', status: '已退学', reason: '家庭原因' } as const
export const statusDateFields: { key: StatusDateKey; label: string; value: string }[] = [
  { key: 'effective', label: '生效日期', value: '2026-06-17' },
  { key: 'entered', label: '记录录入时间', value: '2026-06-20 14:42' },
  { key: 'application', label: '退学申请文件创建时间', value: '2026-06-19 09:18' },
]
export function isBackdatedDatePair(selected: StatusDateKey[]): boolean {
  return selected.length === 2 && selected.includes('effective') && selected.includes('application')
}

export type AccessPerson = '全部' | '沈栀' | '林默' | '顾言' | '何岚' | '唐棠'
export type AccessDirection = '全部' | '进入' | '离开'
export interface AccessRecord { date: string; time: string; person: string; place: string; direction: '进入' | '离开' }
export interface AccessQuery { date: string; place: string; person: AccessPerson; direction: AccessDirection }
export const accessRecords: AccessRecord[] = [
  { date: '2026-06-16', time: '18:30', person: '林默', place: '新实验楼东门', direction: '进入' },
  { date: '2026-06-16', time: '18:52', person: '林默', place: '新实验楼东门', direction: '离开' },
  { date: '2026-06-16', time: '19:21', person: '沈栀', place: '旧实验楼东门', direction: '进入' },
  { date: '2026-06-16', time: '19:26', person: '顾言', place: '旧实验楼东门', direction: '进入' },
  { date: '2026-06-16', time: '19:29', person: '何岚', place: '旧实验楼东门', direction: '进入' },
  { date: '2026-06-16', time: '19:31', person: '唐棠', place: '旧实验楼东门', direction: '进入' },
  { date: '2026-06-16', time: '22:09', person: '何岚', place: '旧实验楼东门', direction: '离开' },
  { date: '2026-06-16', time: '22:11', person: '唐棠', place: '旧实验楼东门', direction: '离开' },
  { date: '2026-06-16', time: '22:14', person: '顾言', place: '旧实验楼东门', direction: '离开' },
]
export function filterAccessRecords(query: AccessQuery): AccessRecord[] {
  return accessRecords.filter((record) => record.date === query.date && (query.place === '全部' || record.place === query.place) && (query.person === '全部' || record.person === query.person) && (query.direction === '全部' || record.direction === query.direction))
}
export function accessComparisonComplete(added: AccessDirection[]): boolean { return added.includes('进入') && added.includes('离开') }

export function checkedAccessDirection(query: AccessQuery, results: AccessRecord[]): Exclude<AccessDirection, '全部'> | null {
  if (query.date !== '2026-06-16' || query.direction === '全部') return null
  if (query.place !== '全部' && query.place !== '旧实验楼东门') return null
  if (query.person !== '全部' && query.person !== '沈栀') return null
  if (query.direction === '进入') {
    return results.some((record) => record.person === '沈栀' && record.direction === '进入') ? '进入' : null
  }
  return results.some((record) => record.person === '沈栀' && record.direction === '离开') ? null : '离开'
}
