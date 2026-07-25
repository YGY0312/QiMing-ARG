export interface AdminHistoryResult {
  query: string
  title: string
  rows: [string, string][]
}

export function isAdminReferenceQuery(value: string): boolean {
  return value.trim().toUpperCase() === 'ADMIN_03'
}

export function queryAdminHistory(value: string): AdminHistoryResult | null {
  const query = value.trim().toUpperCase()
  if (query === '2024010318' || query === '沈栀') {
    return { query, title: '学生状态修改记录', rows: [['姓名', '沈栀'], ['原状态', '正常在籍'], ['修改', '异常注销']] }
  }
  if (query === 'ADMIN_03') {
    return { query, title: '权限组记录', rows: [['标识', 'ADMIN_03'], ['权限', 'StudentStatusModify'], ['权限', 'ArchiveAccess'], ['权限', 'RecordCleanup']] }
  }
  if (query === '2024010307' || query === '林默') {
    return { query, title: '目标记录', rows: [['目标', '2024010307'], ['状态', '调查中']] }
  }
  return null
}
