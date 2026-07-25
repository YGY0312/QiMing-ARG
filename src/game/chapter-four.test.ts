import { queryAdminHistory } from '../data/chapterFour'
import { createEmptyClues } from '../data/story'
import { virtualFiles } from '../data/virtualFiles'
import type { ChapterFourEvidenceAction, GameState } from '../types/game'
import { CHAPTER_FOUR_BACKUP_FILE_ID, CHAPTER_FOUR_FINAL_FILE_ID } from './constants'
import { createDefaultSavedAccounts } from './savedAccounts'
import { createStudentAccountStates } from './storage'
import { completeChapterFour, evaluateStoryEvents, recordChapterFourEvidence } from './story'
import { createSchoolTab } from './tabs'

function state(): GameState {
  const tab = createSchoolTab()
  return {
    isStarted: true, hasSave: true, tabs: [tab], activeTabId: tab.id,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [], clues: createEmptyClues(),
    triggeredEvents: ['chapter_one_completed', 'chapter_two_started', 'chapter_two_completed', 'chapter_three_started', 'chapter_three_final_unlocked', 'chapter_three_completed'],
    unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [],
    chapterOneCompleted: true, chapterOneCompletedAt: '2026-09-16', chapterEndingPlayed: true,
    chapterTwoStarted: true, chapterTwoCompleted: true, chapterTwoCompletedAt: '2026-09-17', chapterTwoEndingPlayed: true,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: true, revealedFileSections: [],
    studentTabCaptchas: {}, currentUrl: tab.currentUrl, history: tab.history, historyIndex: 0, refreshToken: 0, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
    chapterThreeEndingVisible: false, chapterFourEndingVisible: false,
  }
}

const actions: ChapterFourEvidenceAction[] = [
  'permission-search', 'legacy-entry', 'access-denied', 'zhou-attempt', 'permission-manual',
  'history-access', 'student-status-log', 'admin-group', 'linmo-target',
]

describe('第四章《权限不足》状态机', () => {
  it('第三章完成后自动开启第四章并开放初始备份', () => {
    const next = evaluateStoryEvents(state())
    expect(next.triggeredEvents).toContain('chapter_four_started')
    expect(next.unlockedFileIds).toContain(CHAPTER_FOUR_BACKUP_FILE_ID)
  })

  it('搜索ADMIN_03和访问403只获得对应线索，不会完成章节', () => {
    let next = evaluateStoryEvents(state())
    next = recordChapterFourEvidence(next, 'permission-search', 'search', 'first')
    expect(next.clues.permission_limit.discovered).toBe(true)
    expect(next.clues.legacy_admin_entry.discovered).toBe(false)
    next = recordChapterFourEvidence(next, 'access-denied', 'admin')
    expect(next.clues.admin_access_denied.discovered).toBe(true)
    expect(next.triggeredEvents).not.toContain('chapter_four_completed')
  })

  it('权限说明本身不会提前解锁历史查询', () => {
    let next = evaluateStoryEvents(state())
    next = recordChapterFourEvidence(next, 'permission-manual', 'help')
    expect(next.triggeredEvents).not.toContain('chapter_four_admin_unlocked')
  })

  it('前五项条件满足后解锁历史查询入口', () => {
    let next = evaluateStoryEvents(state())
    for (const action of actions.slice(0, 5)) next = recordChapterFourEvidence(next, action, action)
    expect(next.triggeredEvents).toContain('chapter_four_admin_unlocked')
    expect(next.triggeredEvents).not.toContain('chapter_four_final_unlocked')
  })

  it('管理员历史查询返回三类记录', () => {
    expect(queryAdminHistory('沈栀')?.rows).toContainEqual(['修改', '异常注销'])
    expect(queryAdminHistory('ADMIN_03')?.rows).toContainEqual(['权限', 'RecordCleanup'])
    expect(queryAdminHistory('2024010307')?.rows).toContainEqual(['状态', '调查中'])
  })

  it('九条线索只解锁最终文件，打开前不会完成章节', () => {
    let next = evaluateStoryEvents(state())
    for (const action of actions) next = recordChapterFourEvidence(next, action, action)
    expect(next.triggeredEvents).toContain('chapter_four_final_unlocked')
    expect(next.unlockedFileIds).toContain(CHAPTER_FOUR_FINAL_FILE_ID)
    expect(next.triggeredEvents).not.toContain('chapter_four_completed')
  })

  it('乱序调查不会软锁，重复调查不改首次发现时间', () => {
    let next = evaluateStoryEvents(state())
    for (const action of [...actions].reverse()) next = recordChapterFourEvidence(next, action, action, action)
    expect(next.triggeredEvents).toContain('chapter_four_final_unlocked')
    const repeated = recordChapterFourEvidence(next, 'permission-search', 'later', 'later')
    expect(repeated.clues.permission_limit.discoveredAt).toBe('permission-search')
  })

  it('关闭最终文件才完成第四章，且结尾只出现一次', () => {
    let unlocked = evaluateStoryEvents(state())
    for (const action of actions) unlocked = recordChapterFourEvidence(unlocked, action, action)
    const completed = completeChapterFour(unlocked)
    expect(completed.triggeredEvents).toContain('chapter_four_completed')
    expect(completed.chapterFourEndingVisible).toBe(true)
    const repeated = completeChapterFour({ ...completed, chapterFourEndingVisible: false })
    expect(repeated.chapterFourEndingVisible).toBe(false)
    expect(repeated.triggeredEvents.filter((id) => id === 'chapter_four_completed')).toHaveLength(1)
  })

  it('调查备份03初始与最终文本正确且打开不自动授予线索', () => {
    const initial = virtualFiles[CHAPTER_FOUR_BACKUP_FILE_ID]
    const final = virtualFiles[CHAPTER_FOUR_FINAL_FILE_ID]
    expect(initial.content).toBe('我找到管理员入口了。\n\n但是ADMIN_03不是账号。\n\n它是一组权限。')
    expect(final.content).toContain('2024010307')
    expect(final.content).toContain('这是你的账号。')
    expect(initial.onOpenClueId).toBeUndefined()
    expect(final.onOpenClueId).toBeUndefined()
  })
})
