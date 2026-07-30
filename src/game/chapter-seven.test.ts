import { describe, expect, it } from 'vitest'
import { createEmptyClues } from '../data/story'
import type { GameState } from '../types/game'
import { CHAPTER_SEVEN_BACKUP_FILE_ID, CHAPTER_SEVEN_FINAL_FILE_ID, CHAPTER_SEVEN_INCIDENT_HISTORY_URL } from './constants'
import { createDefaultSavedAccounts } from './savedAccounts'
import { createSave, createStudentAccountStates, migrateSave } from './storage'
import { completeChapterSeven, discoverStoryClue, evaluateStoryEvents, recordChapterSevenEvidence, resetChapterSevenProgress } from './story'
import { createSchoolTab, createStudentTab } from './tabs'

function state(): GameState {
  const school = createSchoolTab()
  const student = createStudentTab('stu.qiming-high.edu.cn/downloads', undefined, undefined, 'student-1', 'zhou_xun')
  return {
    isStarted: true, hasSave: true, tabs: [school, student], activeTabId: student.id,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [], clues: createEmptyClues(), triggeredEvents: [], unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [],
    chapterOneCompleted: true, chapterOneCompletedAt: '2026-01-01', chapterEndingPlayed: true,
    chapterTwoStarted: true, chapterTwoCompleted: true, chapterTwoCompletedAt: '2026-01-02', chapterTwoEndingPlayed: true,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: true, revealedFileSections: [],
    studentTabCaptchas: {}, currentUrl: student.currentUrl, history: student.history, historyIndex: 0, refreshToken: 0, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
    chapterThreeEndingVisible: false, chapterFourEndingVisible: false, chapterFiveEndingVisible: false, chapterFiveSessionGlitchActive: false,
    chapterSixEndingVisible: false, chapterSixSyncGlitchActive: false, chapterSevenEndingVisible: false,
  }
}

const core = [
  'original_class_roster', 'monitor_resubmission_notice', 'shenzhi_removed_after_incident',
  'zhou_questioned_monitor', 'monitor_unsent_statement', 'terminal_external_export',
  'external_backup_index', 'qiming_plan_name', 'external_backup_verified',
] as const

describe('第七章故事状态机', () => {
  it('第六章未完成不开放，完成后只启动一次并开放初始备份', () => {
    expect(evaluateStoryEvents(state()).triggeredEvents).not.toContain('chapter_seven_started')
    const started = evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_six_completed'] })
    expect(started.triggeredEvents).toContain('chapter_seven_started')
    expect(started.unlockedFileIds).toContain(CHAPTER_SEVEN_BACKUP_FILE_ID)
    expect(evaluateStoryEvents(started).triggeredEvents.filter((id) => id === 'chapter_seven_started')).toHaveLength(1)
  })

  it('页面动作在章节开始前无效', () => {
    const before = state()
    expect(recordChapterSevenEvidence(before, 'original-roster', 'test')).toBe(before)
  })

  it('解析本地引用只开放原始名单，不发现核心线索', () => {
    const started = evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_six_completed'] })
    const parsed = recordChapterSevenEvidence(started, 'local-reference', 'pending')
    expect(parsed.triggeredEvents).toContain('chapter_seven_class_archive_unlocked')
    expect(parsed.revealedFileSections).toContain('chapter-seven-local-reference-parsed')
    expect(core.some((id) => parsed.clues[id].discovered)).toBe(false)
  })

  it('班长记录和外部索引按集中条件逐步解锁', () => {
    let next = recordChapterSevenEvidence(evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_six_completed'] }), 'local-reference', 'pending')
    for (const id of ['original_class_roster', 'monitor_resubmission_notice'] as const) next = discoverStoryClue(next, id, 'test')
    expect(next.triggeredEvents).not.toContain('chapter_seven_monitor_records_unlocked')
    next = discoverStoryClue(next, 'shenzhi_removed_after_incident', 'test')
    expect(next.triggeredEvents).toContain('chapter_seven_monitor_records_unlocked')
    next = discoverStoryClue(next, 'zhou_questioned_monitor', 'test')
    expect(next.triggeredEvents).not.toContain('chapter_seven_external_index_unlocked')
    next = discoverStoryClue(next, 'monitor_unsent_statement', 'test')
    expect(next.triggeredEvents).toContain('chapter_seven_external_index_unlocked')
  })

  it('九条核心线索可乱序发现且只解锁最终文件', () => {
    let next = evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_six_completed', 'chapter_seven_class_archive_unlocked'] })
    for (const id of [...core].reverse()) next = discoverStoryClue(next, id, 'test')
    expect(next.triggeredEvents).toContain('chapter_seven_final_unlocked')
    expect(next.unlockedFileIds).toContain(CHAPTER_SEVEN_FINAL_FILE_ID)
    expect(next.triggeredEvents).not.toContain('chapter_seven_completed')
    expect(next.clues.outside_system_summary.discovered).toBe(false)
  })

  it('九条缺一不解锁最终文件', () => {
    let next = evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_six_completed', 'chapter_seven_class_archive_unlocked'] })
    for (const id of core.slice(0, -1)) next = discoverStoryClue(next, id, 'test')
    expect(next.triggeredEvents).not.toContain('chapter_seven_final_unlocked')
  })

  it('关闭最终文件原子完成、发现总结并只添加一次历史', () => {
    const ready = { ...state(), triggeredEvents: ['chapter_six_completed', 'chapter_seven_started', 'chapter_seven_final_unlocked'] as GameState['triggeredEvents'] }
    const completed = completeChapterSeven(ready, '2026-09-15T00:10:00.000Z')
    const repeated = completeChapterSeven(completed)
    expect(completed.triggeredEvents).toContain('chapter_seven_completed')
    expect(completed.clues.outside_system_summary).toMatchObject({ discovered: true, discoveredAt: '2026-09-15T00:10:00.000Z' })
    expect(completed.chapterSevenEndingVisible).toBe(true)
    expect(completed.tabs[1].history.filter((url) => url === CHAPTER_SEVEN_INCIDENT_HISTORY_URL)).toHaveLength(1)
    expect(repeated.triggeredEvents.filter((id) => id === 'chapter_seven_completed')).toHaveLength(1)
    expect(repeated.tabs[1].history.filter((url) => url === CHAPTER_SEVEN_INCIDENT_HISTORY_URL)).toHaveLength(1)
  })

  it('旧v5 final-read兼容完成事件但不自动播放结尾或添加历史', () => {
    const save = createSave(state())
    save.triggeredEvents.push('chapter_six_completed')
    save.revealedFileSections.push('chapter-seven-final-read')
    const migrated = migrateSave(save)
    expect(migrated?.triggeredEvents).toContain('chapter_seven_completed')
    expect(migrated).not.toHaveProperty('chapterSevenEndingVisible')
    expect(migrated?.tabs[1].history).not.toContain(CHAPTER_SEVEN_INCIDENT_HISTORY_URL)
  })

  it('重置只清理第七章并保留第六章与账号标签', () => {
    const progressed = completeChapterSeven({
      ...state(),
      triggeredEvents: ['chapter_six_completed', 'chapter_seven_started', 'chapter_seven_final_unlocked'],
      unlockedFileIds: [CHAPTER_SEVEN_BACKUP_FILE_ID, CHAPTER_SEVEN_FINAL_FILE_ID],
    })
    const reset = resetChapterSevenProgress(progressed)
    expect(reset.triggeredEvents).toContain('chapter_six_completed')
    expect(reset.triggeredEvents).toContain('chapter_seven_started')
    expect(reset.triggeredEvents).not.toContain('chapter_seven_completed')
    expect(reset.tabs).toHaveLength(2)
    expect(reset.tabs[1].studentSession?.accountId).toBe('zhou_xun')
  })
})
