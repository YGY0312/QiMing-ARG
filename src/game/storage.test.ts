import { LEGACY_V2_SAVE_KEY, SAVE_KEY } from './constants'
import { createStudentAccountStates, migrateSave, readSave, resetGameStorage, writeSave } from './storage'
import type { GameState } from '../types/game'
import { createEmptyClues } from '../data/story'
import { createDefaultSavedAccounts } from './savedAccounts'
import { createSchoolTab, createStudentTab } from './tabs'

function makeState(): GameState {
  const school = createSchoolTab('www.qiming-high.edu.cn/news', ['www.qiming-high.edu.cn/', 'www.qiming-high.edu.cn/news'], 1)
  const student = createStudentTab('stu.qiming-high.edu.cn/attendance', ['stu.qiming-high.edu.cn/login', 'stu.qiming-high.edu.cn/attendance'], 1, 'student-1', 'zhou_xun')
  return {
    isStarted: true, hasSave: true, tabs: [school, student], activeTabId: 'student-1',
    savedStudentAccounts: createDefaultSavedAccounts('2026-09-16T00:00:00Z'), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    studentTabCaptchas: { 'student-1': '7314' }, visitedPages: [school.currentUrl, student.currentUrl], clues: createEmptyClues(),
    triggeredEvents: [], unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [], openVirtualFileId: null,
    chapterOneCompleted: false, chapterOneCompletedAt: null, chapterEndingPlayed: false,
    currentUrl: student.currentUrl, history: student.history, historyIndex: student.historyIndex, refreshToken: 0,
    addressGlitchActive: false, chapterEndingVisible: false,
    chapterTwoStarted: false, chapterTwoCompleted: false, chapterTwoCompletedAt: null, chapterTwoEndingPlayed: false, searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: false, revealedFileSections: [], chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
  }
}

describe('v5 本地存档', () => {
  it('保存并恢复标签级账号、多标签和独立历史', () => {
    const state = makeState(); writeSave(state); const saved = readSave()
    expect(saved).toMatchObject({ schemaVersion: 5, activeTabId: 'student-1' })
    expect(saved?.tabs).toHaveLength(2)
    expect(saved?.tabs.find((tab) => tab.id === 'school-main')?.history).toHaveLength(2)
    expect(saved?.tabs.find((tab) => tab.id === 'student-1')).toMatchObject({ currentUrl: 'stu.qiming-high.edu.cn/attendance', studentSession: { accountId: 'zhou_xun' } })
    expect(localStorage.getItem(SAVE_KEY)).not.toBeNull()
  })

  it('验证码和明文密码不会写入存档', () => {
    writeSave(makeState()); const raw = localStorage.getItem(SAVE_KEY) ?? ''
    expect(raw).not.toContain('7314')
    expect(raw).not.toContain('ZX0913')
    expect(raw).not.toContain('argtest')
  })

  it('刷新恢复后已发现线索和侧栏状态仍然存在', () => {
    const state = makeState(); state.evidenceSidebarCollapsed = true
    state.clues.dropout_notice = { ...state.clues.dropout_notice, discovered: true, discoveredAt: '2026-09-16T08:00:00Z', sourceUrl: 'notice' }
    writeSave(state)
    expect(readSave()).toMatchObject({ evidenceSidebarCollapsed: true, clues: { dropout_notice: { discovered: true, sourceUrl: 'notice' } } })
  })

  it('v2 学生系统存档迁移为林默标签会话', () => {
    const migrated = migrateSave({ schemaVersion: 2, prototypeVersion: 'old', isStarted: true, currentUrl: 'stu.qiming-high.edu.cn/messages', history: ['www.qiming-high.edu.cn/', 'stu.qiming-high.edu.cn/login', 'stu.qiming-high.edu.cn/messages'], historyIndex: 2, studentLoggedIn: true, visitedPages: [], clues: createEmptyClues(), triggeredEvents: ['zhou_message_unlocked'], unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [], chapterOneCompleted: false, chapterOneCompletedAt: null, chapterEndingPlayed: false, savedAt: 'old' })
    expect(migrated?.schemaVersion).toBe(5)
    expect(migrated?.tabs.find((tab) => tab.siteType === 'student')?.studentSession?.accountId).toBe('lin_mo')
    expect(migrated?.activeTabId).toBe('student-1')
    expect(migrated?.triggeredEvents).toContain('zhou_draft_revealed')
    expect(migrated?.clues.zhou_credentials.discovered).toBe(false)
  })

  it('v3 发现账号线索不会自动保存周寻账号', () => {
    const clues = createEmptyClues(); clues.zhou_credentials = { ...clues.zhou_credentials, discovered: true }
    const migrated = migrateSave({ schemaVersion: 3, tabs: [createSchoolTab(), createStudentTab(undefined, undefined, undefined, 'student-system')], activeTabId: 'student-system', currentStudentAccount: 'lin_mo', clues })
    expect(migrated?.savedStudentAccounts.map((account) => account.accountId)).toEqual(['lin_mo'])
  })

  it('v3 当前为周寻账号时迁移后保存周寻并恢复会话', () => {
    const migrated = migrateSave({ schemaVersion: 3, tabs: [createSchoolTab(), createStudentTab(undefined, undefined, undefined, 'student-system')], activeTabId: 'student-system', currentStudentAccount: 'zhou_xun', clues: createEmptyClues() })
    expect(migrated?.savedStudentAccounts.map((account) => account.accountId)).toEqual(['lin_mo', 'zhou_xun'])
    expect(migrated?.tabs.find((tab) => tab.id === 'student-1')?.studentSession?.accountId).toBe('zhou_xun')
  })

  it('已完成的 v2 存档迁移后仍保持完成', () => {
    localStorage.setItem(LEGACY_V2_SAVE_KEY, JSON.stringify({ schemaVersion: 2, prototypeVersion: 'old', isStarted: true, currentUrl: 'www.qiming-high.edu.cn/', history: ['www.qiming-high.edu.cn/'], historyIndex: 0, studentLoggedIn: false, visitedPages: [], clues: createEmptyClues(), triggeredEvents: ['chapter_one_completed'], unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [], chapterOneCompleted: true, chapterOneCompletedAt: '2026-09-16T00:00:00Z', chapterEndingPlayed: true, savedAt: 'old' }))
    expect(readSave()).toMatchObject({ schemaVersion: 5, chapterOneCompleted: true, chapterEndingPlayed: true })
  })

  it('损坏数据安全回退', () => {
    localStorage.setItem(SAVE_KEY, '{bad json'); expect(readSave()).toBeNull()
  })

  it('重置只删除 campus_arg_ 前缀数据', () => {
    localStorage.setItem('campus_arg_alpha', '1'); localStorage.setItem('other_site_data', 'keep'); resetGameStorage()
    expect(localStorage.getItem('campus_arg_alpha')).toBeNull(); expect(localStorage.getItem('other_site_data')).toBe('keep')
  })
})
