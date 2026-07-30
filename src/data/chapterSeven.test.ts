import { describe, expect, it } from 'vitest'
import {
  externalManifest, externalNodeFields, isCorrectRosterTimeline, isExternalExportPair,
  legacyClassIndex, monitorCacheFacts, originalClassRoster, originalRosterMetadata,
  parseLocalClassReference, qimingPlanIndex, queryTransferRecords, rosterDifference,
  rosterRecoveryFields, searchLegacyArchive, validateExternalNode, validateMonitorCacheFacts,
  validateRosterRecovery,
} from './chapterSeven'

describe('第七章调查纯函数', () => {
  it('本地索引只识别稳定归档编号', () => {
    expect(parseLocalClassReference('LOCAL_REF: CLS-ARCHIVE-18')).toBe(true)
    expect(parseLocalClassReference('CLS-ARCHIVE-18')).toBe(true)
    expect(parseLocalClassReference('CLS-ARCHIVE-17')).toBe(false)
  })

  it('旧服务支持编号、CLASS 18和班级名检索', () => {
    expect(searchLegacyArchive('CLS-ARCHIVE-18')).toEqual([legacyClassIndex])
    expect(searchLegacyArchive('class 18')).toEqual([legacyClassIndex])
    expect(searchLegacyArchive('高二（3）班')).toEqual([legacyClassIndex])
    expect(searchLegacyArchive('高一（3）班')).toEqual([])
  })

  it('原始名单恢复要求三个字段全部正确', () => {
    expect(validateRosterRecovery({ ...rosterRecoveryFields })).toBe(true)
    expect(validateRosterRecovery({ ...rosterRecoveryFields, historicalCount: '17' })).toBe(false)
    expect(validateRosterRecovery({ ...rosterRecoveryFields, submitterRole: '管理员' })).toBe(false)
  })

  it('原始名单保持18人及三名关键学生编号', () => {
    expect(originalClassRoster).toHaveLength(18)
    expect(originalClassRoster).toEqual(expect.arrayContaining([
      expect.objectContaining({ studentNumber: '2024010307', name: '林默' }),
      expect.objectContaining({ studentNumber: '2024010312', name: '周寻' }),
      expect.objectContaining({ studentNumber: '2024010318', name: '沈栀' }),
    ]))
    expect(originalRosterMetadata.savedAt).toBe('2026-06-16 18:42')
  })

  it('名单时间线必须按原始、通知、重提交排序', () => {
    expect(isCorrectRosterTimeline(['original', 'notice', 'resubmitted'])).toBe(true)
    expect(isCorrectRosterTimeline(['notice', 'original', 'resubmitted'])).toBe(false)
    expect(isCorrectRosterTimeline(['original', 'notice'])).toBe(false)
  })

  it('名单差异只删除沈栀并从18变17', () => {
    expect(rosterDifference).toMatchObject({
      originalCount: 18,
      submittedCount: 17,
      removed: { studentNumber: '2024010318', name: '沈栀' },
    })
  })

  it('班长缓存恢复需要三项事实', () => {
    expect(validateMonitorCacheFacts([...monitorCacheFacts])).toBe(true)
    expect(validateMonitorCacheFacts(monitorCacheFacts.slice(0, 2))).toBe(false)
  })

  it('传输查询按文字时间稳定升序且不依赖时区', () => {
    const rows = queryTransferRecords({ startDate: '2026-06-16', endDate: '2026-09-15', device: 'term-old-03', targetType: '', status: '' })
    expect(rows.map((row) => row.timestamp)).toEqual(['2026-06-16 22:27', '2026-09-14 23:56', '2026-09-15 00:01'])
    expect(queryTransferRecords({ startDate: '2026-09-15', endDate: '2026-06-16', device: '', targetType: '', status: '' })).toEqual([])
  })

  it('外部导出必须同时选择开始和完成', () => {
    expect(isExternalExportPair(['export-start'])).toBe(false)
    expect(isExternalExportPair(['write-0616', 'export-complete'])).toBe(false)
    expect(isExternalExportPair(['export-complete', 'export-start'])).toBe(true)
  })

  it('外部节点要求历史对象、来源终端和原始人数一致', () => {
    expect(validateExternalNode({ ...externalNodeFields })).toBe(true)
    expect(validateExternalNode({ ...externalNodeFields, originalCount: '17' })).toBe(false)
  })

  it('清单和计划索引只暴露本章允许的信息', () => {
    expect(externalManifest).toMatchObject({ archiveId: 'ARCHIVE_0616', source: 'TERM-OLD-03', account: 'LOCAL_SESSION', integrity: '71%' })
    expect(qimingPlanIndex).toMatchObject({ name: '启明学生风险干预计划', code: 'QM', status: '试运行' })
    expect(JSON.stringify(qimingPlanIndex)).not.toContain('死亡')
  })
})
