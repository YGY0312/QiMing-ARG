import { createEmptyClues } from '../data/story'
import { virtualFiles } from '../data/virtualFiles'
import type { ClueId, GameState } from '../types/game'
import { createDefaultSavedAccounts } from './savedAccounts'
import { createStudentAccountStates, migrateSave } from './storage'
import { createSchoolTab } from './tabs'
import { appendChapterTwoAnomaly, discoverStoryClue, evaluateStoryEvents, resetChapterTwoProgress } from './story'
import { CHAPTER_TWO_FINAL_FILE_ID, OLD_BUILDING_ACCESS_FILE_ID, SHENZHI_CACHE_FILE_ID, SHENZHI_STUDENT_ANOMALY_URL } from './constants'
import { isShenzhiSearch, searchSchoolContent } from '../data/chapterTwo'

function state(): GameState {
  const tab = createSchoolTab()
  return {
    isStarted: true, hasSave: true, tabs: [tab], activeTabId: tab.id, savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [], clues: createEmptyClues(), triggeredEvents: [], unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [],
    chapterOneCompleted: true, chapterOneCompletedAt: '2026-09-16', chapterEndingPlayed: true,
    chapterTwoStarted: true, chapterTwoCompleted: false, chapterTwoCompletedAt: null, chapterTwoEndingPlayed: false, searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: false, revealedFileSections: [],
    studentTabCaptchas: {}, currentUrl: tab.currentUrl, history: tab.history, historyIndex: 0, refreshToken: 0, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
  }
}
function discoverMany(base: GameState, ids: ClueId[]) { return ids.reduce((next, id) => discoverStoryClue(next, id, 'test'), base) }

describe('第二章事件链', () => {
  it('第一章完成后自动开始第二章且只触发一次', () => {
    const base = state(); base.chapterTwoStarted = false; base.triggeredEvents = []
    const next = evaluateStoryEvents(base)
    expect(next.chapterTwoStarted).toBe(true)
    expect(evaluateStoryEvents(next).triggeredEvents.filter((id) => id === 'chapter_two_started')).toHaveLength(1)
  })
  it('五项前置证据任意三项解锁学籍缓存', () => {
    const next = discoverMany(state(), ['class_size_mismatch', 'seat_chart_shenzhi', 'hidden_grade_row'])
    expect(next.unlockedFileIds).toContain(SHENZHI_CACHE_FILE_ID)
  })
  it('只有两项前置证据时不提前解锁缓存', () => {
    const next = discoverMany(state(), ['class_size_mismatch', 'seat_chart_shenzhi'])
    expect(next.unlockedFileIds).not.toContain(SHENZHI_CACHE_FILE_ID)
  })
  it('倒签记录与旧楼分组共同解锁门禁摘要', () => {
    const next = discoverMany(state(), ['shenzhi_dropout_backdated', 'shenzhi_old_building_group'])
    expect(next.unlockedFileIds).toContain(OLD_BUILDING_ACCESS_FILE_ID)
  })
  it('六项核心线索齐备后才解锁最终记录', () => {
    const core: ClueId[] = ['seat_chart_shenzhi','hidden_grade_row','shenzhi_essay','shenzhi_dropout_backdated','shenzhi_old_building_group','shenzhi_exit_missing']
    const almost = discoverMany(state(), core.slice(0, -1)); expect(almost.unlockedFileIds).not.toContain(CHAPTER_TWO_FINAL_FILE_ID)
    expect(discoverStoryClue(almost, core.at(-1)!, 'test').unlockedFileIds).toContain(CHAPTER_TWO_FINAL_FILE_ID)
  })
  it('打乱核心线索发现顺序仍能解锁且不会重复事件', () => {
    const shuffled: ClueId[] = ['shenzhi_exit_missing','shenzhi_essay','seat_chart_shenzhi','shenzhi_old_building_group','hidden_grade_row','shenzhi_dropout_backdated']
    const next = discoverMany(state(), shuffled)
    expect(next.unlockedFileIds).toContain(CHAPTER_TWO_FINAL_FILE_ID)
    expect(next.triggeredEvents.filter((id) => id === 'chapter_two_final_file_unlocked')).toHaveLength(1)
  })
  it('最终记录完成章节，并把异常学生地址持久加入历史一次', () => {
    const complete = discoverStoryClue(state(), 'shenzhi_last_record', 'test')
    const ended = appendChapterTwoAnomaly(complete)
    expect(ended.chapterTwoCompleted).toBe(true); expect(ended.history).toContain(SHENZHI_STUDENT_ANOMALY_URL)
    expect(appendChapterTwoAnomaly(ended).history.filter((url) => url === SHENZHI_STUDENT_ANOMALY_URL)).toHaveLength(1)
  })
  it('仅重置第二章会保留第一章完成状态', () => {
    const progressed = discoverMany(state(), ['seat_chart_shenzhi', 'hidden_grade_row', 'shenzhi_essay'])
    const reset = resetChapterTwoProgress(progressed)
    expect(reset.chapterOneCompleted).toBe(true); expect(reset.clues.seat_chart_shenzhi.discovered).toBe(false); expect(reset.chapterTwoStarted).toBe(true)
  })
})

describe('第二章资料与迁移', () => {
  it('搜索沈栀不返回公开正文，普通剧情关键词返回数据驱动结果', () => {
    expect(isShenzhiSearch('沈栀')).toBe(true); expect(searchSchoolContent('沈栀')).toEqual([])
    expect(searchSchoolContent('写给未来的自己').some(({ article }) => article.id === 'future-self-essay')).toBe(true)
    expect(searchSchoolContent('实验器材整理').some(({ article }) => article.id === 'old-lab-equipment-sorting')).toBe(true)
  })
  it('交互文件含18座位、隐藏成绩行和作者属性', () => {
    expect(virtualFiles['seat-chart-may'].seats).toHaveLength(18)
    expect(virtualFiles['midterm-grades'].hiddenRows?.[0]).toContain('沈栀')
    expect(virtualFiles['essay-window'].metadata).toContainEqual(['创建者', '沈栀'])
  })
  it('v4 存档迁移到v5时保留第一章、标签和账号并初始化第二章', () => {
    const tab = createSchoolTab('www.qiming-high.edu.cn/news', ['www.qiming-high.edu.cn/', 'www.qiming-high.edu.cn/news'], 1)
    const migrated = migrateSave({ schemaVersion: 4, isStarted: true, tabs: [tab], activeTabId: tab.id, savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), clues: createEmptyClues(), chapterOneCompleted: true, chapterEndingPlayed: true })
    expect(migrated).toMatchObject({ schemaVersion: 5, chapterOneCompleted: true, chapterTwoStarted: false, activeTabId: tab.id })
    expect(migrated?.tabs[0].history).toHaveLength(2)
  })
})
