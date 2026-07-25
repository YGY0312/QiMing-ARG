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
  it('单日闭区间返回当天记录', () => {
    const result = filterLoginRecords({ startDate: '2026-09-14', endDate: '2026-09-14', device: '', status: '' })
    expect(result.error).toBeNull()
    expect(result.records.map((record) => record.date)).toEqual(['2026-09-14', '2026-09-14'])
  })

  it('跨日闭区间同时包含首日和末日记录', () => {
    const result = filterLoginRecords({ startDate: '2026-09-14', endDate: '2026-09-15', device: '维护终端03', status: '' })
    expect(result.error).toBeNull()
    expect(result.records.map((record) => `${record.date} ${record.time}`)).toEqual([
      '2026-09-14 23:48',
      '2026-09-15 00:02',
    ])
  })

  it('开始日期晚于结束日期时返回校验错误', () => {
    expect(filterLoginRecords({ startDate: '2026-09-15', endDate: '2026-09-14', device: '', status: '' })).toEqual({
      records: [],
      error: 'reversed-range',
    })
  })

  it('日期范围缺失或无效时返回校验错误', () => {
    expect(filterLoginRecords({ startDate: '', endDate: '2026-09-15', device: '', status: '' }).error).toBe('incomplete-range')
    expect(filterLoginRecords({ startDate: '2026-09-14', endDate: '', device: '', status: '' }).error).toBe('incomplete-range')
    expect(filterLoginRecords({ startDate: '2026-02-30', endDate: '2026-09-15', device: '', status: '' }).error).toBe('invalid-date')
  })

  it('设备和状态筛选可与日期范围组合', () => {
    const success = filterLoginRecords({ startDate: '2026-09-14', endDate: '2026-09-15', device: '维护终端03', status: '成功' })
    const interrupted = filterLoginRecords({ startDate: '2026-09-14', endDate: '2026-09-15', device: '维护终端03', status: '会话中断' })
    expect(success.records.map((record) => record.time)).toEqual(['23:48'])
    expect(interrupted.records.map((record) => record.time)).toEqual(['00:02'])
  })

  it('筛选结果按完整日期时间升序排列且不依赖时区解析', () => {
    const result = filterLoginRecords({ startDate: '2026-09-08', endDate: '2026-09-15', device: '', status: '' })
    expect(result.records.map((record) => `${record.date} ${record.time}`)).toEqual([
      '2026-09-08 18:20',
      '2026-09-13 07:11',
      '2026-09-14 21:06',
      '2026-09-14 23:48',
      '2026-09-15 00:02',
    ])
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
