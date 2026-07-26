import { describe, expect, it } from 'vitest'
import { cameraFiles, cameraRecoveryFields, floorPlanAreas, hasAllPendingObjects, hasTerminalStatusFluctuation, isSameNetworkPortPair, isValidFloorRoute, mediaMetadata, pendingObjects, queryNetworkAccess, recoveredAudioIndex, searchDecommissionRecords, searchNetworkArchive, validateCameraRecovery } from './chapterSix'

describe('第六章调查纯函数', () => {
  it('终端心跳包含在线状态', () => expect(hasTerminalStatusFluctuation()).toBe(true))
  it('资产检索支持编号和名称但不自动产生状态', () => {
    expect(searchDecommissionRecords('TERM-OLD-03')[0]).toMatchObject({ status: '原地封存', location: '旧实验楼三层设备间' })
    expect(searchDecommissionRecords('旧实验楼终端')).toHaveLength(1)
    expect(searchDecommissionRecords('CAM-07')).toHaveLength(0)
  })
  it('平面图含所有必要区域且仅正确组合有效', () => {
    expect(floorPlanAreas).toEqual(expect.arrayContaining(['A-302', '广播设备室', '三层设备间', '弱电间', '走廊']))
    expect(isValidFloorRoute(['A-302', '广播设备室'])).toBe(false)
    expect(isValidFloorRoute(['三层设备间', 'A-302', '广播设备室'])).toBe(true)
  })
  it('网络范围跨月、闭区间且按字符串时间升序', () => {
    const result = queryNetworkAccess({ startDate: '2026-06-16', endDate: '2026-09-14', device: 'TERM-OLD-03', accessPoint: '', status: '' })
    expect(result.error).toBeNull()
    expect(result.records.map((row) => `${row.date} ${row.time}`)).toEqual(['2026-06-16 22:27', '2026-06-16 22:31', '2026-09-14 23:47'])
  })
  it('网络查询验证缺失、非法和反向日期', () => {
    expect(queryNetworkAccess({ startDate: '', endDate: '2026-09-14', device: '', accessPoint: '', status: '' }).error).toBe('incomplete-range')
    expect(queryNetworkAccess({ startDate: '2026-02-30', endDate: '2026-09-14', device: '', accessPoint: '', status: '' }).error).toBe('invalid-date')
    expect(queryNetworkAccess({ startDate: '2026-09-14', endDate: '2026-06-16', device: '', accessPoint: '', status: '' }).error).toBe('reversed-range')
  })
  it('仅六月与九月关键记录构成同端口比对', () => {
    expect(isSameNetworkPortPair(['net-0616-2227'])).toBe(false)
    expect(isSameNetworkPortPair(['net-0616-2231', 'net-0914-2347'])).toBe(false)
    expect(isSameNetworkPortPair(['net-0914-2347', 'net-0616-2227'])).toBe(true)
  })
  it('网络归档记录覆盖三个关键房间', () => {
    expect(searchNetworkArchive('old-bldg-3f-sw02')[0].rooms).toEqual(['A-302', '广播设备室', '三层设备间'])
  })
  it('CAM-07必须三个字段全部正确', () => {
    expect(validateCameraRecovery(cameraRecoveryFields)).toBe(true)
    expect(validateCameraRecovery({ ...cameraRecoveryFields, borrower: '2024010312' })).toBe(false)
    expect(cameraFiles.map((file) => file.name)).toEqual(['192104.jpg', '205817.mp4', '221936.mp4', '222801.tmp'])
  })
  it('媒体元数据与音轨文字索引保持剧情数据', () => {
    expect(mediaMetadata['205817.mp4'].location).toBe('OLD-BLDG-3F')
    expect(mediaMetadata['221936.mp4'].audio).toBe('部分索引可恢复')
    expect(recoveredAudioIndex).toContainEqual(['22:19:52', '“……终端……”'])
  })
  it('三个pending对象缺一不可', () => {
    expect(pendingObjects.map((item) => item.id)).toEqual(['2024010318', '2024010312', '2024010307'])
    expect(hasAllPendingObjects(['2024010318', '2024010312'])).toBe(false)
    expect(hasAllPendingObjects(['2024010307', '2024010318', '2024010312'])).toBe(true)
  })
})
