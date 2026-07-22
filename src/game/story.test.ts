import { createEmptyClues } from '../data/story'
import { BACKUP_FILE_ID, SHENZHI_ANOMALY_URL, ZHOU_CREDENTIALS_MESSAGE_ID, ZHOU_MESSAGE_ID } from './constants'
import { createStudentAccountStates } from './storage'
import { createDefaultSavedAccounts } from './savedAccounts'
import { createSchoolTab, createStudentTab } from './tabs'
import { appendChapterAnomaly, discoverStoryClue, isBackupPasswordValid, openInvestigationBackup, readStoryMessage, resetChapterProgress } from './story'
import type { GameState } from '../types/game'

function makeState(): GameState {
  const school = createSchoolTab()
  const tab = createStudentTab(undefined, undefined, undefined, 'student-1', 'zhou_xun')
  return {
    isStarted: true, hasSave: true, tabs: [school, tab], activeTabId: tab.id, savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false, studentTabCaptchas: {},
    currentUrl: tab.currentUrl, history: tab.history, historyIndex: tab.historyIndex, visitedPages: [tab.currentUrl], clues: createEmptyClues(),
    triggeredEvents: [], unreadMessageIds: [ZHOU_CREDENTIALS_MESSAGE_ID], readMessageIds: [], unlockedFileIds: [], openVirtualFileId: null,
    chapterOneCompleted: false, chapterOneCompletedAt: null, chapterEndingPlayed: false, refreshToken: 0, addressGlitchActive: false, chapterEndingVisible: false,
    chapterTwoStarted: false, chapterTwoCompleted: false, chapterTwoCompletedAt: null, chapterTwoEndingPlayed: false, searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: false, revealedFileSections: [], chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
  }
}

describe('第一章线索和事件', () => {
  it('周寻草稿需要账号、学籍、考勤和照片线索', () => {
    let state = makeState()
    for (const id of ['zhou_credentials', 'student_status_dropout', 'attendance_after_dropout'] as const) state = discoverStoryClue(state, id, id)
    expect(state.triggeredEvents).not.toContain('zhou_draft_revealed')
    state = discoverStoryClue(state, 'photo_after_dropout', 'photo')
    expect(state.triggeredEvents.filter((id) => id === 'zhou_draft_revealed')).toHaveLength(1)
  })

  it('读取林默旧消息会发现周寻账号线索', () => {
    const state = readStoryMessage(makeState(), ZHOU_CREDENTIALS_MESSAGE_ID, 'messages')
    expect(state.readMessageIds).toContain(ZHOU_CREDENTIALS_MESSAGE_ID)
    expect(state.clues.zhou_credentials.discovered).toBe(true)
  })

  it('读取周寻草稿会发现 zhou_message', () => {
    const state = readStoryMessage(makeState(), ZHOU_MESSAGE_ID, 'messages')
    expect(state.readMessageIds).toContain(ZHOU_MESSAGE_ID)
    expect(state.clues.zhou_message.discovered).toBe(true)
  })

  it('草稿、消费和封闭通知齐全后解锁调查备份', () => {
    let state = makeState()
    for (const id of ['zhou_message', 'card_record_old_building', 'old_building_closed'] as const) state = discoverStoryClue(state, id, id)
    expect(state.unlockedFileIds).toContain(BACKUP_FILE_ID)
    expect(state.triggeredEvents).toContain('investigation_backup_unlocked')
  })

  it('消费记录与封闭通知形成矛盾事件', () => {
    let state = discoverStoryClue(makeState(), 'card_record_old_building', 'card')
    state = discoverStoryClue(state, 'old_building_closed', 'notice')
    expect(state.triggeredEvents).toContain('old_building_contradiction')
  })

  it('备份密码只接受去除首尾空格后的 0726', () => {
    expect(isBackupPasswordValid('1234')).toBe(false)
    expect(isBackupPasswordValid(' 0726 ')).toBe(true)
  })

  it('打开备份后发现沈栀并完成第一章', () => {
    const state = openInvestigationBackup(makeState(), 'downloads', '2026-09-16T00:00:00.000Z')
    expect(state.clues.investigation_backup.discovered).toBe(true)
    expect(state.clues.shenzhi_name.discovered).toBe(true)
    expect(state.chapterOneCompleted).toBe(true)
  })

  it('章节异常只添加一次且同步当前标签历史', () => {
    const complete = { ...makeState(), chapterOneCompleted: true }
    const twice = appendChapterAnomaly(appendChapterAnomaly(complete))
    expect(twice.history.filter((url) => url === SHENZHI_ANOMALY_URL)).toHaveLength(1)
    expect(twice.tabs.find((tab) => tab.id === 'student-1')?.history).toContain(SHENZHI_ANOMALY_URL)
  })

  it('重置章节保留标签会话并恢复账号消息未读', () => {
    const reset = resetChapterProgress(openInvestigationBackup(makeState(), 'downloads'))
    expect(reset.tabs).toHaveLength(2)
    expect(reset.tabs.find((tab) => tab.id === 'student-1')?.studentSession?.accountId).toBe('zhou_xun')
    expect(reset.clues.shenzhi_name.discovered).toBe(false)
    expect(reset.unreadMessageIds).toContain(ZHOU_CREDENTIALS_MESSAGE_ID)
  })
})
