import { describe, expect, it } from 'vitest'
import { chapterEightClueIds, createEmptyClues } from '../data/story'
import type { GameState } from '../types/game'
import { CHAPTER_EIGHT_BACKUP_FILE_ID, CHAPTER_EIGHT_FINAL_FILE_ID } from './constants'
import { createDefaultSavedAccounts } from './savedAccounts'
import { createSave, createStudentAccountStates, migrateSave } from './storage'
import {
  completeChapterEight, discoverStoryClue, evaluateStoryEvents, openChapterEightFinal,
  recordChapterEightEvidence, resetChapterEightProgress, unlockChapterEightIncident,
} from './story'
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
    chapterThreeEndingVisible: false, chapterFourEndingVisible: false, chapterFiveEndingVisible: false,
    chapterFiveSessionGlitchActive: false, chapterSixEndingVisible: false, chapterSixSyncGlitchActive: false,
    chapterSevenEndingVisible: false, chapterEightEndingVisible: false,
  }
}

const core = chapterEightClueIds.filter((id) => id !== 'june_sixteenth_summary')

describe('第八章故事状态机', () => {
  it('第七章完成后只启动一次并开放初始备份', () => {
    expect(evaluateStoryEvents(state()).triggeredEvents).not.toContain('chapter_eight_started')
    const started = evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_seven_completed'] })
    expect(started.triggeredEvents).toContain('chapter_eight_started')
    expect(started.unlockedFileIds).toContain(CHAPTER_EIGHT_BACKUP_FILE_ID)
    expect(evaluateStoryEvents(started).triggeredEvents.filter((id) => id === 'chapter_eight_started')).toHaveLength(1)
  })

  it('目录校验只能在章节开始后解锁且不发现线索', () => {
    const before = state()
    expect(unlockChapterEightIncident(before)).toBe(before)
    const started = evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_seven_completed'] })
    const unlocked = unlockChapterEightIncident(started)
    expect(unlocked.triggeredEvents).toContain('chapter_eight_incident_unlocked')
    expect(core.some((id) => unlocked.clues[id].discovered)).toBe(false)
  })

  it('页面动作在incident解锁前无效', () => {
    const started = evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_seven_completed'] })
    expect(recordChapterEightEvidence(started, 'last-route', 'test')).toBe(started)
  })

  it('门禁和tmp齐全后开放紧急目录，四条前置线索开放医疗目录', () => {
    let next = unlockChapterEightIncident(evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_seven_completed'] }))
    next = discoverStoryClue(next, 'equipment_room_override', 'test')
    expect(next.triggeredEvents).not.toContain('chapter_eight_emergency_records_unlocked')
    next = discoverStoryClue(next, 'cam_tmp_recovered', 'test')
    expect(next.triggeredEvents).toContain('chapter_eight_emergency_records_unlocked')
    for (const id of ['shenzhi_last_route', 'emergency_signal_received', 'external_rescue_delayed'] as const) next = discoverStoryClue(next, id, 'test')
    expect(next.triggeredEvents).toContain('chapter_eight_medical_records_unlocked')
  })

  it('九条线索可乱序发现且只解锁最终文件', () => {
    let next = unlockChapterEightIncident(evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_seven_completed'] }))
    for (const id of [...core].reverse()) next = discoverStoryClue(next, id, 'test')
    expect(next.triggeredEvents).toContain('chapter_eight_final_unlocked')
    expect(next.unlockedFileIds).toContain(CHAPTER_EIGHT_FINAL_FILE_ID)
    expect(next.triggeredEvents).not.toContain('chapter_eight_completed')
    expect(next.clues.june_sixteenth_summary.discovered).toBe(false)
  })

  it('九条缺一不解锁最终文件', () => {
    let next = unlockChapterEightIncident(evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_seven_completed'] }))
    for (const id of core.slice(0, -1)) next = discoverStoryClue(next, id, 'test')
    expect(next.triggeredEvents).not.toContain('chapter_eight_final_unlocked')
  })

  it('打开最终文件不完成，关闭后原子完成并发现总结', () => {
    const ready = { ...state(), triggeredEvents: ['chapter_seven_completed', 'chapter_eight_started', 'chapter_eight_final_unlocked'] as GameState['triggeredEvents'] }
    const opened = openChapterEightFinal(ready)
    expect(opened.triggeredEvents).toContain('chapter_eight_final_opened')
    expect(opened.triggeredEvents).not.toContain('chapter_eight_completed')
    const completed = completeChapterEight(opened, '2026-09-15T01:00:00.000Z')
    expect(completed.triggeredEvents).toContain('chapter_eight_completed')
    expect(completed.clues.june_sixteenth_summary).toMatchObject({ discovered: true, discoveredAt: '2026-09-15T01:00:00.000Z' })
    expect(completed.chapterEightEndingVisible).toBe(true)
    expect(completeChapterEight(completed)).toBe(completed)
  })

  it('旧v5 final-read兼容完成事件但不自动播放结尾', () => {
    const save = createSave(state())
    save.triggeredEvents.push('chapter_seven_completed')
    save.revealedFileSections.push('chapter-eight-final-read')
    const migrated = migrateSave(save)
    expect(migrated?.triggeredEvents).toContain('chapter_eight_completed')
    expect(migrated).not.toHaveProperty('chapterEightEndingVisible')
  })

  it('重置第八章保留前七章与账号标签', () => {
    const progressed = completeChapterEight(openChapterEightFinal({
      ...state(),
      triggeredEvents: ['chapter_seven_completed', 'chapter_eight_started', 'chapter_eight_final_unlocked'],
      unlockedFileIds: [CHAPTER_EIGHT_BACKUP_FILE_ID, CHAPTER_EIGHT_FINAL_FILE_ID],
    }))
    const reset = resetChapterEightProgress(progressed)
    expect(reset.triggeredEvents).toContain('chapter_seven_completed')
    expect(reset.triggeredEvents).toContain('chapter_eight_started')
    expect(reset.triggeredEvents).not.toContain('chapter_eight_completed')
    expect(reset.tabs[1].studentSession?.accountId).toBe('zhou_xun')
  })
})
