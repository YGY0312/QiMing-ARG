import { createEmptyClues } from '../data/story'
import {
  isChapterThreeAccessQuery,
  queryCameraExceptions,
  queryDutyLogs,
  queryDutySchedule,
  queryEquipmentLoans,
  queryLaboratoryAccessRecords,
  queryLaboratoryReservations,
  queryMaintenanceTickets,
} from '../data/chapterThree'
import { virtualFiles } from '../data/virtualFiles'
import type { GameState } from '../types/game'
import { CHAPTER_THREE_BACKUP_FILE_ID, CHAPTER_THREE_FINAL_FILE_ID, CHAPTER_TWO_FINAL_FILE_ID } from './constants'
import { createDefaultSavedAccounts } from './savedAccounts'
import { createStudentAccountStates } from './storage'
import { createSchoolTab } from './tabs'
import { evaluateStoryEvents, recordChapterThreeEvidence } from './story'

function state(): GameState {
  const tab = createSchoolTab()
  return {
    isStarted: true, hasSave: true, tabs: [tab], activeTabId: tab.id,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [], clues: createEmptyClues(), triggeredEvents: ['chapter_one_completed', 'chapter_two_started', 'chapter_two_completed'],
    unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [],
    chapterOneCompleted: true, chapterOneCompletedAt: '2026-09-16', chapterEndingPlayed: true,
    chapterTwoStarted: true, chapterTwoCompleted: true, chapterTwoCompletedAt: '2026-09-17', chapterTwoEndingPlayed: true,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: true, revealedFileSections: [],
    studentTabCaptchas: {}, currentUrl: tab.currentUrl, history: tab.history, historyIndex: 0, refreshToken: 0, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
  }
}

describe('第三章《值班记录》状态机', () => {
  it('第二章完成后开启第三章并解锁调查备份02', () => {
    const next = evaluateStoryEvents(state(), '2026-09-17T12:00:00Z')
    expect(next.triggeredEvents).toContain('chapter_three_started')
    expect(next.unlockedFileIds).toContain(CHAPTER_THREE_BACKUP_FILE_ID)
  })

  it('原有四项线索仍正常发现，但不足以提前解锁最终备份', () => {
    let next = evaluateStoryEvents(state())
    next = recordChapterThreeEvidence(next, 'duty-record', 'school-duty', '2026-09-17T13:00:00Z')
    expect(next.clues.old_building_duty_record.discovered).toBe(true)
    next = recordChapterThreeEvidence(next, 'access-log', 'student-access', '2026-09-17T13:10:00Z')
    expect(next.clues.old_building_access_log.discovered).toBe(true)
    next = recordChapterThreeEvidence(next, 'admin-trace', 'student-access', '2026-09-17T13:20:00Z')
    expect(next.clues.admin_permission_trace.discovered).toBe(true)
    expect(next.unlockedFileIds).not.toContain(CHAPTER_THREE_FINAL_FILE_ID)
    next = recordChapterThreeEvidence(next, 'system-upgrade', 'school-news', '2026-09-17T13:30:00Z')
    expect(next.clues.system_upgrade_notice.discovered).toBe(true)
    expect(next.triggeredEvents).not.toContain('chapter_three_final_unlocked')
    expect(next.unlockedFileIds).not.toContain(CHAPTER_THREE_FINAL_FILE_ID)
  })

  it('九项主动调查线索全部完成后解锁最终备份内容', () => {
    let next = evaluateStoryEvents(state())
    const actions = [
      'duty-record', 'access-log', 'reservation-record', 'equipment-record', 'duty-log',
      'camera-exception', 'maintenance-ticket', 'admin-trace', 'system-upgrade',
    ] as const
    for (const action of actions) next = recordChapterThreeEvidence(next, action, `source-${action}`, action)
    expect(next.clues.old_building_reservation.discovered).toBe(true)
    expect(next.clues.equipment_missing_record.discovered).toBe(true)
    expect(next.clues.duty_log_record.discovered).toBe(true)
    expect(next.clues.camera_exception_record.discovered).toBe(true)
    expect(next.clues.system_maintenance_ticket.discovered).toBe(true)
    expect(next.triggeredEvents).toContain('chapter_three_final_unlocked')
    expect(next.unlockedFileIds).toContain(CHAPTER_THREE_FINAL_FILE_ID)
  })

  it('乱序发现全部线索不会软锁第三章', () => {
    let next = evaluateStoryEvents(state())
    const reversedActions = [
      'system-upgrade', 'admin-trace', 'maintenance-ticket', 'camera-exception', 'duty-log',
      'equipment-record', 'reservation-record', 'access-log', 'duty-record',
    ] as const
    for (const action of reversedActions) next = recordChapterThreeEvidence(next, action, 'out-of-order')
    expect(next.triggeredEvents).toContain('chapter_three_final_unlocked')
    expect(next.unlockedFileIds).toContain(CHAPTER_THREE_FINAL_FILE_ID)
  })

  it('重复调查不会重复添加线索或改变首次发现时间', () => {
    const started = evaluateStoryEvents(state())
    const first = recordChapterThreeEvidence(started, 'duty-record', 'school-duty', 'first')
    const repeated = recordChapterThreeEvidence(first, 'duty-record', 'school-duty', 'later')
    expect(repeated.clues.old_building_duty_record.discoveredAt).toBe('first')
    expect(Object.keys(repeated.clues).filter((id) => id === 'old_building_duty_record')).toHaveLength(1)
  })

  it('最后记录0616保持第二章结尾内容', () => {
    expect(virtualFiles[CHAPTER_TWO_FINAL_FILE_ID].content).toBe(
      '沈栀不是正常转学。\n\n6月16日晚，她进入了旧实验楼。\n\n6月17日，她的学籍变更已经生效。\n\n退学申请文件是在之后创建的。\n\n门禁系统里有她的进入记录。\n\n没有查到离开记录。\n\n下一步：找当晚的值班记录。',
    )
  })

  it('调查备份02的初始和最终内容形成递进且不会因打开直接添加线索', () => {
    const initial = virtualFiles[CHAPTER_THREE_BACKUP_FILE_ID]
    const final = virtualFiles[CHAPTER_THREE_FINAL_FILE_ID]
    expect(initial.onOpenClueId).toBeUndefined()
    expect(final.onOpenClueId).toBeUndefined()
    expect(initial.content).toBe('我找到了一些东西。\n\n6月16日晚，\n\n沈栀提前申请进入旧实验楼。\n\n她不是临时过去。\n\n她在那里寻找某个东西。\n\n继续查访问记录。')
    expect(initial.content).not.toContain('ADMIN_03')
    expect(final.content).toBe('我还原了6月16日晚。\n\n沈栀19:21进入旧实验楼A区。\n\n她提前申请了实验室，\n\n借用了设备。\n\n22点以后，\n\n有人处理了现场记录。\n\n监控被覆盖。\n\n门禁记录被修改。\n\n执行操作的不是普通教师。\n\n系统只留下：\n\nADMIN_03\n\n但我还不知道这个账号是谁。')
    expect(final.content).toContain('ADMIN_03')
  })

  it('新增调查文件不通过打开动作直接授予线索', () => {
    for (const id of ['lab-reservation-0616', 'equipment-loan-0616', 'duty-log-0616', 'camera-exception-0616', 'maintenance-ticket-sys-0616']) {
      expect(virtualFiles[id]).toBeDefined()
      expect(virtualFiles[id].onOpenClueId).toBeUndefined()
    }
  })
})

describe('第三章查询数据', () => {
  it('6月16日晚旧实验楼值班教师为陈启明', () => {
    expect(queryDutySchedule('2026-06-16', '旧实验楼')).toEqual([
      expect.objectContaining({ teacher: '陈启明', period: '晚间' }),
    ])
  })

  it('实验楼访问查询保留异常时间线和匿名管理员来源', () => {
    const records = queryLaboratoryAccessRecords('2026-06-16', '旧实验楼')
    expect(records.map((record) => record.time)).toEqual(['19:18', '19:21', '19:45', '22:30'])
    expect(records.at(-1)).toMatchObject({ event: '异常解除', operationSource: '管理员', account: '未记录' })
    expect(isChapterThreeAccessQuery('2026-06-16', '旧实验楼')).toBe(true)
  })

  it('新增资料查询返回6月16日关联记录', () => {
    expect(queryLaboratoryReservations('2026-06-16', '沈栀')[0]).toMatchObject({ place: '旧实验楼 A-302', approvalDepartment: '信息中心' })
    expect(queryEquipmentLoans('2026-06-16', '沈栀')[0]).toMatchObject({ status: '未归还' })
    expect(queryDutyLogs('2026-06-16').map((record) => record.time)).toEqual(['19:10', '19:21', '21:45', '22:30', '23:00'])
    expect(queryCameraExceptions('2026-06-16', '旧实验楼东门摄像头')[0]).toMatchObject({ exceptionType: '数据覆盖', status: '已恢复' })
    expect(queryMaintenanceTickets('sys-0616')[0]).toMatchObject({ time: '2026-06-16 22:20', scope: '学生信息系统' })
  })
})
