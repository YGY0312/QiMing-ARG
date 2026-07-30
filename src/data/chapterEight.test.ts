import { describe, expect, it } from 'vitest'
import {
  accessComparison, calculateDelay, cleanupEvidence, completeIncidentTimeline,
  incidentVerification, isCorrectEmergencyOrder, isCorrectLastRoute, lastRouteNodes,
  medicalIdentity, reportDifferences, rescueTimes, tmpRecoverySources,
  validateAccessComparison, validateCleanupEvidence, validateIncidentVerification,
  validateMedicalIdentity, validateReportDifferences, validateTmpRecovery,
} from './chapterEight'

describe('第八章调查纯函数', () => {
  it('incident校验要求对象、日期、设备全部正确', () => {
    expect(validateIncidentVerification({ ...incidentVerification })).toBe(true)
    expect(validateIncidentVerification({ ...incidentVerification, objectId: '2024010312' })).toBe(false)
    expect(validateIncidentVerification({ ...incidentVerification, date: '2026-06-17' })).toBe(false)
    expect(validateIncidentVerification({ ...incidentVerification, device: 'TERM-OLD-03' })).toBe(false)
  })

  it('最后路线严格保持五个节点顺序', () => {
    const ids = lastRouteNodes.map((node) => node.id)
    expect(isCorrectLastRoute(ids)).toBe(true)
    expect(isCorrectLastRoute([...ids].reverse())).toBe(false)
    expect(lastRouteNodes.map((node) => node.time)).toEqual(['19:21:04', '20:58:17', '22:19:36', '22:27:00', '22:28:01'])
  })

  it('门禁核对固定录音、覆盖和急救时间', () => {
    expect(validateAccessComparison({ ...accessComparison })).toBe(true)
    expect(validateAccessComparison({ ...accessComparison, override: '22:20:03' })).toBe(false)
  })

  it('tmp恢复必须选择三个稳定来源', () => {
    expect(validateTmpRecovery([...tmpRecoverySources])).toBe(true)
    expect(validateTmpRecovery(tmpRecoverySources.slice(0, 2))).toBe(false)
  })

  it('紧急记录按触发、查看、处置排序', () => {
    expect(isCorrectEmergencyOrder(['triggered', 'received', 'handled'])).toBe(true)
    expect(isCorrectEmergencyOrder(['received', 'triggered', 'handled'])).toBe(false)
  })

  it('紧急按钮至外部急救间隔为14分34秒', () => {
    expect(calculateDelay(rescueTimes.start, rescueTimes.end)).toEqual({ seconds: 874, label: '14分34秒' })
    expect(calculateDelay(rescueTimes.end, rescueTimes.start)).toBeNull()
  })

  it('医疗身份匹配三个字段', () => {
    expect(validateMedicalIdentity({ ...medicalIdentity })).toBe(true)
    expect(validateMedicalIdentity({ ...medicalIdentity, source: '新实验楼' })).toBe(false)
  })

  it('报告差异和清理证据链都要求全部项目', () => {
    expect(validateReportDifferences([...reportDifferences])).toBe(true)
    expect(validateReportDifferences(reportDifferences.slice(1))).toBe(false)
    expect(validateCleanupEvidence([...cleanupEvidence])).toBe(true)
    expect(validateCleanupEvidence(cleanupEvidence.slice(0, 2))).toBe(false)
  })

  it('完整时间线回收固定后续时间', () => {
    expect(completeIncidentTimeline).toEqual(expect.arrayContaining([
      ['次日07:46', '班长收到重新提交名单通知'],
      ['次日08:12', '17人名单提交'],
      ['6月18日', 'TERM-OLD-03停用并归档相关记录'],
    ]))
  })
})
