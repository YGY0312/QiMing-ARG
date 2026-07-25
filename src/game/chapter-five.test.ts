import { describe, expect, it } from 'vitest'
import { createEmptyClues } from '../data/story'
import { createDefaultSavedAccounts } from './savedAccounts'
import { createStudentAccountStates } from './storage'
import { createSchoolTab, createStudentTab } from './tabs'
import { CHAPTER_FIVE_BACKUP_FILE_ID, CHAPTER_FIVE_FINAL_FILE_ID, TERM_OLD_03_HISTORY_URL } from './constants'
import { completeChapterFive, discoverStoryClue, evaluateStoryEvents, recordChapterFiveEvidence } from './story'
import type { GameState } from '../types/game'

function state(): GameState {
  const school = createSchoolTab()
  const student = createStudentTab('stu.qiming-high.edu.cn/downloads', undefined, undefined, 'student-1', 'zhou_xun')
  return {
    isStarted: true, hasSave: true, tabs: [school, student], activeTabId: student.id,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [], clues: createEmptyClues(),
    triggeredEvents: ['chapter_one_completed', 'chapter_two_started', 'chapter_two_completed', 'chapter_three_started', 'chapter_three_final_unlocked', 'chapter_three_completed', 'chapter_four_started', 'chapter_four_admin_unlocked', 'chapter_four_final_unlocked'],
    unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [],
    chapterOneCompleted: true, chapterOneCompletedAt: '2026-01-01', chapterEndingPlayed: true,
    chapterTwoStarted: true, chapterTwoCompleted: true, chapterTwoCompletedAt: '2026-01-02', chapterTwoEndingPlayed: true,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: true, revealedFileSections: [],
    studentTabCaptchas: {}, currentUrl: student.currentUrl, history: student.history, historyIndex: 0, refreshToken: 0, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
    chapterThreeEndingVisible: false, chapterFourEndingVisible: false, chapterFiveEndingVisible: false, chapterFiveSessionGlitchActive: false,
  }
}

describe('第五章故事状态机', () => {
  it('第四章未完成时不开放，完成后只启动一次并解锁初始备份', () => {
    const before = evaluateStoryEvents(state())
    expect(before.triggeredEvents).not.toContain('chapter_five_started')
    const completed = { ...before, triggeredEvents: [...before.triggeredEvents, 'chapter_four_completed'] as GameState['triggeredEvents'] }
    const once = evaluateStoryEvents(completed)
    const twice = evaluateStoryEvents(once)
    expect(once.triggeredEvents).toContain('chapter_five_started')
    expect(once.unlockedFileIds).toContain(CHAPTER_FIVE_BACKUP_FILE_ID)
    expect(twice.triggeredEvents.filter((id) => id === 'chapter_five_started')).toHaveLength(1)
  })

  it('停用终端与第四章权限组共同解锁缓存恢复', () => {
    let next = { ...state(), triggeredEvents: [...state().triggeredEvents, 'chapter_four_completed', 'chapter_five_started'] as GameState['triggeredEvents'] }
    next = recordChapterFiveEvidence(next, 'terminal-status', 'device')
    expect(next.triggeredEvents).not.toContain('chapter_five_cache_unlocked')
    next = discoverStoryClue(next, 'admin03_permission_group', 'history')
    expect(next.triggeredEvents).toContain('chapter_five_cache_unlocked')
  })

  it('缓存与终端关联线索乱序发现仍解锁关联查询', () => {
    let next = { ...state(), triggeredEvents: [...state().triggeredEvents, 'chapter_four_completed', 'chapter_five_started', 'chapter_five_cache_unlocked'] as GameState['triggeredEvents'] }
    next = discoverStoryClue(next, 'shenzhi_zhou_terminal_link', 'cache')
    next = discoverStoryClue(next, 'shenzhi_cache_recovered', 'cache')
    expect(next.triggeredEvents).toContain('chapter_five_relation_unlocked')
  })

  it('八条核心线索只解锁最终文件', () => {
    let next = { ...state(), triggeredEvents: [...state().triggeredEvents, 'chapter_four_completed', 'chapter_five_started', 'chapter_five_cache_unlocked', 'chapter_five_relation_unlocked'] as GameState['triggeredEvents'] }
    for (const id of ['account_relation_warning', 'zhou_post_disappearance_login', 'decommissioned_terminal_activity', 'shenzhi_cache_recovered', 'shenzhi_zhou_terminal_link', 'three_account_relation', 'zhou_last_draft', 'draft_modified_after_logout'] as const) {
      next = discoverStoryClue(next, id, 'test')
    }
    expect(next.triggeredEvents).toContain('chapter_five_final_unlocked')
    expect(next.unlockedFileIds).toContain(CHAPTER_FIVE_FINAL_FILE_ID)
    expect(next.triggeredEvents).not.toContain('chapter_five_completed')
  })

  it('关闭最终文件原子完成、发现总结并只添加一次异常历史', () => {
    const ready = {
      ...state(),
      triggeredEvents: [...state().triggeredEvents, 'chapter_four_completed', 'chapter_five_started', 'chapter_five_cache_unlocked', 'chapter_five_relation_unlocked', 'chapter_five_final_unlocked'] as GameState['triggeredEvents'],
    }
    const completed = completeChapterFive(ready)
    const repeated = completeChapterFive(completed)
    expect(completed.triggeredEvents).toContain('chapter_five_completed')
    expect(completed.clues.zhou_last_login_summary.discovered).toBe(true)
    expect(completed.chapterFiveEndingVisible).toBe(true)
    expect(completed.tabs.find((tab) => tab.id === 'student-1')?.history).toContain(TERM_OLD_03_HISTORY_URL)
    expect(repeated.triggeredEvents.filter((id) => id === 'chapter_five_completed')).toHaveLength(1)
    expect(repeated.tabs.find((tab) => tab.id === 'student-1')?.history.filter((url) => url === TERM_OLD_03_HISTORY_URL)).toHaveLength(1)
  })
})
