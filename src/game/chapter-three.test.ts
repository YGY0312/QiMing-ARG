import { createEmptyClues } from '../data/story'
import { isChapterThreeAccessQuery, queryDutySchedule, queryLaboratoryAccessRecords } from '../data/chapterThree'
import { virtualFiles } from '../data/virtualFiles'
import type { GameState } from '../types/game'
import { CHAPTER_THREE_BACKUP_FILE_ID, CHAPTER_THREE_FINAL_FILE_ID } from './constants'
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

  it('四项主动调查线索完成后解锁最终备份内容', () => {
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

  it('调查备份02的初始和最终文件都不会因打开直接添加线索', () => {
    expect(virtualFiles[CHAPTER_THREE_BACKUP_FILE_ID].onOpenClueId).toBeUndefined()
    expect(virtualFiles[CHAPTER_THREE_FINAL_FILE_ID].onOpenClueId).toBeUndefined()
    expect(virtualFiles[CHAPTER_THREE_FINAL_FILE_ID].content).toContain('ADMIN_03')
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
})
