import { describe, expect, it } from 'vitest'
import {
  adminOperators, aliveConclusionEvidence, aliveSignature, behaviorSources, exitTimeline,
  exportEvidence, identifyAdminOperator, localSessionIdentity, localSessionTimeline,
  monitoringEvidence, packageTimes, sessionVerification, validateAliveConclusion,
  validateAliveSignature, validateBehaviorSources, validateExitOrder, validateExportEvidence,
  validateLocalSessionIdentity, validateMonitoringEvidence, validatePackageTimes,
  validateSessionVerification, validateTaskPairs, verificationTaskPairs,
} from './chapterNine'

describe('第九章调查纯函数', () => {
  it('0914校验要求账号、终端和导出对象全部正确', () => {
    expect(validateSessionVerification({ ...sessionVerification })).toBe(true)
    expect(validateSessionVerification({ ...sessionVerification, account: '2024010307' })).toBe(false)
    expect(validateSessionVerification({ ...sessionVerification, terminal: 'IC-SEC-02' })).toBe(false)
    expect(validateSessionVerification({ ...sessionVerification, exportObject: 'OTHER' })).toBe(false)
  })
  it('本地会话身份必须同时匹配三项特征', () => {
    expect(validateLocalSessionIdentity({ ...localSessionIdentity })).toBe(true)
    expect(validateLocalSessionIdentity({ ...localSessionIdentity, type: 'PROXY_SESSION' })).toBe(false)
    expect(localSessionTimeline.at(-1)).toEqual(['00:02:00', 'LOCAL_SESSION异常中断'])
  })
  it('外部导出需要开始、完成和密钥写入记录', () => {
    expect(validateExportEvidence([...exportEvidence])).toBe(true)
    expect(validateExportEvidence(exportEvidence.slice(0, 2))).toBe(false)
  })
  it('验证任务配对错误不会通过', () => {
    expect(validateTaskPairs({ ...verificationTaskPairs })).toBe(true)
    expect(validateTaskPairs({ ...verificationTaskPairs, '原始名单': 'pending目录' })).toBe(false)
  })
  it('五项行为严格区分三类来源', () => {
    expect(validateBehaviorSources({ ...behaviorSources })).toBe(true)
    expect(validateBehaviorSources({ ...behaviorSources, draftModification: 'LOCAL_SESSION' })).toBe(false)
  })
  it('监测证据链要求隐藏字段、阅读和查询三项', () => {
    expect(validateMonitoringEvidence([...monitoringEvidence])).toBe(true)
    expect(validateMonitoringEvidence(monitoringEvidence.slice(1))).toBe(false)
  })
  it('只有许承安同时匹配门禁、终端和授权', () => {
    expect(adminOperators).toHaveLength(3)
    expect(identifyAdminOperator('xu-chengan')).toMatchObject({ name: '许承安', staffId: 'T-041' })
    expect(identifyAdminOperator('security-service')).toBeNull()
  })
  it('离校时间线必须保持五个节点顺序', () => {
    const ids = exitTimeline.map((item) => item.id)
    expect(validateExitOrder(ids)).toBe(true)
    expect(validateExitOrder([...ids].reverse())).toBe(false)
  })
  it('文件袋时间、存活签名和结论均需完整证据', () => {
    expect(validatePackageTimes({ ...packageTimes })).toBe(true)
    expect(validatePackageTimes({ ...packageTimes, received: packageTimes.deposited })).toBe(false)
    expect(validateAliveSignature({ ...aliveSignature })).toBe(true)
    expect(validateAliveSignature({ ...aliveSignature, signature: 'BAD' })).toBe(false)
    expect(validateAliveConclusion([...aliveConclusionEvidence])).toBe(true)
    expect(validateAliveConclusion(aliveConclusionEvidence.slice(0, 2))).toBe(false)
  })
})
