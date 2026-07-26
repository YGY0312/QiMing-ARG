import { describe, expect, it } from 'vitest'
import { createEmptyClues } from '../data/story'
import { CHAPTER_SIX_BACKUP_FILE_ID, CHAPTER_SIX_FINAL_FILE_ID, TERM_OLD_03_SYNC_HISTORY_URL } from './constants'
import { createDefaultSavedAccounts } from './savedAccounts'
import { createSave, createStudentAccountStates, migrateSave } from './storage'
import { completeChapterSix, discoverStoryClue, evaluateStoryEvents, recordChapterSixEvidence } from './story'
import { createSchoolTab, createStudentTab } from './tabs'
import type { GameState } from '../types/game'

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
    chapterSixEndingVisible: false, chapterSixSyncGlitchActive: false,
  }
}
const core = ['terminal_status_fluctuation', 'terminal_decommission_record', 'third_floor_route', 'terminal_same_network_port', 'network_port_location', 'camera_storage_index', 'damaged_recording_metadata', 'pending_object_records', 'zhou_local_session_note'] as const

describe('第六章故事状态机', () => {
  it('第五章未完成不开放，完成后启动一次并开放初始备份', () => {
    expect(evaluateStoryEvents(state()).triggeredEvents).not.toContain('chapter_six_started')
    const start = evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_five_completed'] })
    expect(start.triggeredEvents).toContain('chapter_six_started')
    expect(start.unlockedFileIds).toContain(CHAPTER_SIX_BACKUP_FILE_ID)
    expect(evaluateStoryEvents(start).triggeredEvents.filter((id) => id === 'chapter_six_started')).toHaveLength(1)
  })
  it('页面动作在章节开始前无效', () => {
    const before = state()
    expect(recordChapterSixEvidence(before, 'status-fluctuation', 'test')).toBe(before)
  })
  it('状态与报废记录解锁平面图', () => {
    let next = evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_five_completed'] })
    next = recordChapterSixEvidence(next, 'status-fluctuation', 'device')
    expect(next.triggeredEvents).not.toContain('chapter_six_map_unlocked')
    next = recordChapterSixEvidence(next, 'decommission-record', 'school')
    expect(next.triggeredEvents).toContain('chapter_six_map_unlocked')
  })
  it('九条核心线索乱序发现只解锁最终文件', () => {
    let next = evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_five_completed'] })
    for (const id of [...core].reverse()) next = discoverStoryClue(next, id, 'test')
    expect(next.triggeredEvents).toContain('chapter_six_final_unlocked')
    expect(next.unlockedFileIds).toContain(CHAPTER_SIX_FINAL_FILE_ID)
    expect(next.triggeredEvents).not.toContain('chapter_six_completed')
  })
  it('九条不足不解锁最终文件', () => {
    let next = evaluateStoryEvents({ ...state(), triggeredEvents: ['chapter_five_completed'] })
    for (const id of core.slice(0, -1)) next = discoverStoryClue(next, id, 'test')
    expect(next.triggeredEvents).not.toContain('chapter_six_final_unlocked')
  })
  it('关闭最终文件原子完成、发现总结并只添加一次历史', () => {
    const ready = { ...state(), triggeredEvents: ['chapter_five_completed', 'chapter_six_started', 'chapter_six_final_unlocked'] as GameState['triggeredEvents'] }
    const completed = completeChapterSix(ready)
    const repeated = completeChapterSix(completed)
    expect(completed.triggeredEvents).toContain('chapter_six_completed')
    expect(completed.clues.terminal03_summary.discovered).toBe(true)
    expect(completed.chapterSixEndingVisible).toBe(true)
    expect(completed.chapterSixSyncGlitchActive).toBe(true)
    expect(completed.tabs[1].history.filter((url) => url === TERM_OLD_03_SYNC_HISTORY_URL)).toHaveLength(1)
    expect(repeated.triggeredEvents.filter((id) => id === 'chapter_six_completed')).toHaveLength(1)
    expect(repeated.tabs[1].history.filter((url) => url === TERM_OLD_03_SYNC_HISTORY_URL)).toHaveLength(1)
  })
  it('旧v5 final-read兼容完成事件且不保存结尾可见状态', () => {
    const save = createSave(state())
    save.revealedFileSections.push('chapter-six-final-read')
    const migrated = migrateSave(save)
    expect(migrated?.triggeredEvents).toContain('chapter_six_completed')
    expect(migrated).not.toHaveProperty('chapterSixEndingVisible')
  })
})
