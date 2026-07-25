import { describe, expect, it } from 'vitest'
import {
  filterLoginRecords,
  hasCompleteAccountRelation,
  isDecommissionedTerminalActivity,
  isDraftTimeAnomaly,
  isPostDisappearancePair,
  validateCacheRecovery,
} from './chapterFive'

describe('第五章调查纯函数', () => {
  it('按日期、设备与状态筛选登录记录', () => {
    expect(filterLoginRecords({ date: '2026-09-14', device: '维护终端03', status: '成功' })).toHaveLength(1)
    expect(filterLoginRecords({ date: '2026-09-15', device: '维护终端03', status: '会话中断' })[0]?.time).toBe('00:02')
  })

  it('仅正确两条终端记录构成退学后登录核对', () => {
    expect(isPostDisappearancePair(['terminal-login'])).toBe(false)
    expect(isPostDisappearancePair(['terminal-login', 'web-0914'])).toBe(false)
    expect(isPostDisappearancePair(['terminal-interrupted', 'terminal-login'])).toBe(true)
  })

  it('识别停用后仍活动的终端', () => {
    expect(isDecommissionedTerminalActivity()).toBe(true)
  })

  it('仅正确三个字段恢复缓存', () => {
    expect(validateCacheRecovery({ studentNumber: '2024010318', maintenanceNumber: 'SYS-0616', terminalNumber: 'term-old-03' })).toBe(true)
    expect(validateCacheRecovery({ studentNumber: '2024010318', maintenanceNumber: 'SYS-0615', terminalNumber: 'TERM-OLD-03' })).toBe(false)
  })

  it('三个账号缺一不可', () => {
    expect(hasCompleteAccountRelation(['2024010318', '2024010312'])).toBe(false)
    expect(hasCompleteAccountRelation(['2024010307', '2024010318', '2024010312'])).toBe(true)
  })

  it('仅会话中断与最后修改构成草稿时间异常', () => {
    expect(isDraftTimeAnomaly(['draftCreated', 'draftModified'])).toBe(false)
    expect(isDraftTimeAnomaly(['draftModified', 'sessionInterrupted'])).toBe(true)
  })
})
