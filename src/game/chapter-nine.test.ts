import { describe, expect, it } from 'vitest'
import { chapterNineClueIds, createEmptyClues } from '../data/story'
import type { GameState } from '../types/game'
import { CHAPTER_NINE_BACKUP_FILE_ID, CHAPTER_NINE_FINAL_FILE_ID } from './constants'
import { createDefaultSavedAccounts } from './savedAccounts'
import { createSave, createStudentAccountStates, migrateSave } from './storage'
import {
  completeChapterNine, discoverStoryClue, evaluateStoryEvents, openChapterNineFinal,
  recordChapterNineEvidence, resetChapterNineProgress, unlockChapterNineSession,
} from './story'
import { createSchoolTab, createStudentTab } from './tabs'

function state(): GameState {
  const school = createSchoolTab()
  const student = createStudentTab('archive.qm-node.local/EXT-BACKUP-QM-0616/session/0914', undefined, undefined, 'student-1', 'zhou_xun')
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
    chapterSevenEndingVisible: false, chapterEightEndingVisible: false, chapterNineEndingVisible: false,
  }
}
const core = chapterNineClueIds.filter((id) => id !== 'last_account_summary')

describe('第九章故事状态机', () => {
  it('第八章完成后只启动一次并开放初始备份', () => {
    expect(evaluateStoryEvents(state()).triggeredEvents).not.toContain('chapter_nine_started')
    const started = evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_eight_completed'] })
    expect(started.triggeredEvents).toContain('chapter_nine_started')
    expect(started.unlockedFileIds).toContain(CHAPTER_NINE_BACKUP_FILE_ID)
    expect(evaluateStoryEvents(started).triggeredEvents.filter((id) => id === 'chapter_nine_started')).toHaveLength(1)
  })
  it('会话只能在章节开始后解锁，页面动作不能提前发现线索', () => {
    const before = state()
    expect(unlockChapterNineSession(before)).toBe(before)
    expect(recordChapterNineEvidence(before, 'local-session', 'test')).toBe(before)
    const unlocked = unlockChapterNineSession(evaluateStoryEvents({ ...before, triggeredEvents: ['chapter_eight_completed'] }))
    expect(unlocked.triggeredEvents).toContain('chapter_nine_session_unlocked')
  })
  it('本地会话和导出完成后开放分类，验证任务后开放代理追踪', () => {
    let next = unlockChapterNineSession(evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_eight_completed'] }))
    next = discoverStoryClue(next, 'zhou_local_session_verified', 'test')
    expect(next.triggeredEvents).not.toContain('chapter_nine_source_classification_unlocked')
    next = discoverStoryClue(next, 'zhou_export_completed', 'test')
    expect(next.triggeredEvents).toContain('chapter_nine_source_classification_unlocked')
    next = { ...next, revealedFileSections: [...next.revealedFileSections, 'chapter-nine-source-classified'] }
    next = discoverStoryClue(next, 'delayed_verification_tasks', 'test')
    expect(next.triggeredEvents).toContain('chapter_nine_admin_trace_unlocked')
  })
  it('九条线索可乱序发现，只解锁最终文件而不完成章节', () => {
    let next = unlockChapterNineSession(evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_eight_completed'] }))
    for (const id of [...core].reverse()) next = discoverStoryClue(next, id, 'test')
    expect(next.triggeredEvents).toContain('chapter_nine_certificate_chain_unlocked')
    expect(next.triggeredEvents).toContain('chapter_nine_final_unlocked')
    expect(next.unlockedFileIds).toContain(CHAPTER_NINE_FINAL_FILE_ID)
    expect(next.triggeredEvents).not.toContain('chapter_nine_completed')
  })
  it('九条缺一不会解锁最终文件', () => {
    let next = unlockChapterNineSession(evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_eight_completed'] }))
    for (const id of core.slice(0, -1)) next = discoverStoryClue(next, id, 'test')
    expect(next.triggeredEvents).not.toContain('chapter_nine_final_unlocked')
  })
  it('打开最终文件不完成，关闭后原子完成并发现总结', () => {
    const ready = { ...state(), triggeredEvents: ['chapter_eight_completed', 'chapter_nine_started', 'chapter_nine_final_unlocked'] as GameState['triggeredEvents'] }
    const opened = openChapterNineFinal(ready)
    expect(opened.triggeredEvents).toContain('chapter_nine_final_opened')
    expect(opened.triggeredEvents).not.toContain('chapter_nine_completed')
    const completed = completeChapterNine(opened, '2026-09-18T04:20:00Z')
    expect(completed.triggeredEvents).toContain('chapter_nine_completed')
    expect(completed.clues.last_account_summary).toMatchObject({ discovered: true, discoveredAt: '2026-09-18T04:20:00Z' })
    expect(completed.chapterNineEndingVisible).toBe(true)
    expect(completeChapterNine(completed)).toBe(completed)
  })
  it('旧v5 final-read兼容完成事件但不自动播放结尾', () => {
    const save = createSave(state())
    save.triggeredEvents.push('chapter_eight_completed')
    save.revealedFileSections.push('chapter-nine-final-read')
    const migrated = migrateSave(save)
    expect(migrated?.triggeredEvents).toContain('chapter_nine_completed')
    expect(migrated).not.toHaveProperty('chapterNineEndingVisible')
  })
  it('重置第九章保留第八章和账号标签', () => {
    const progressed = completeChapterNine(openChapterNineFinal({
      ...state(), triggeredEvents: ['chapter_eight_completed', 'chapter_nine_started', 'chapter_nine_final_unlocked'],
      unlockedFileIds: [CHAPTER_NINE_BACKUP_FILE_ID, CHAPTER_NINE_FINAL_FILE_ID],
    }))
    const reset = resetChapterNineProgress(progressed)
    expect(reset.triggeredEvents).toContain('chapter_eight_completed')
    expect(reset.triggeredEvents).toContain('chapter_nine_started')
    expect(reset.triggeredEvents).not.toContain('chapter_nine_completed')
    expect(reset.tabs[1].studentSession?.accountId).toBe('zhou_xun')
  })
})
