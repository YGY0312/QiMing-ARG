import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserShell } from '../browser/BrowserShell'
import { LaunchScreen } from '../app/LaunchScreen'
import { createEmptyClues } from '../data/story'
import { CHAPTER_FOUR_BACKUP_FILE_ID, CHAPTER_FOUR_FINAL_FILE_ID } from '../game/constants'
import { GameProvider } from '../game/GameContext'
import { parseGameUrl } from '../game/router'
import { createDefaultSavedAccounts } from '../game/savedAccounts'
import { createStudentAccountStates, readSave, writeSave } from '../game/storage'
import { createSchoolTab, createStudentTab } from '../game/tabs'
import type { ClueId, GameState, StudentAccountId } from '../types/game'
import { StudentSite } from './student/StudentSite'
import { SchoolSite } from './school/SchoolSite'
import { TestConsole } from '../test-tools/TestConsole'

function chapterFourState(accountId: StudentAccountId, url: string): GameState {
  const school = createSchoolTab()
  const student = createStudentTab(url, [url], 0, 'student-1', accountId)
  return {
    isStarted: true, hasSave: true, tabs: [school, student], activeTabId: student.id,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [url], clues: createEmptyClues(),
    triggeredEvents: ['chapter_one_completed', 'chapter_two_started', 'chapter_two_completed', 'chapter_three_started', 'chapter_three_final_unlocked', 'chapter_three_completed', 'chapter_four_started'],
    unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [CHAPTER_FOUR_BACKUP_FILE_ID],
    chapterOneCompleted: true, chapterOneCompletedAt: '2026-09-16', chapterEndingPlayed: true,
    chapterTwoStarted: true, chapterTwoCompleted: true, chapterTwoCompletedAt: '2026-09-17', chapterTwoEndingPlayed: true,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: true, revealedFileSections: [],
    studentTabCaptchas: {}, currentUrl: url, history: [url], historyIndex: 0, refreshToken: 0, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
    chapterThreeEndingVisible: false, chapterFourEndingVisible: false,
  }
}

function discover(state: GameState, ids: ClueId[]): void {
  for (const id of ids) state.clues[id] = { ...state.clues[id], discovered: true, discoveredAt: 'test', sourceUrl: 'test' }
}

describe('第四章页面、权限与结尾', () => {
  it('官网系统服务主动揭示旧入口，403页面只记录拒绝访问', async () => {
    const user = userEvent.setup()
    const servicesUrl = 'www.qiming-high.edu.cn/services/information-center/system-services'
    const state = chapterFourState('zhou_xun', 'stu.qiming-high.edu.cn/dashboard')
    const school = createSchoolTab(servicesUrl)
    state.tabs = [school, state.tabs[1]]
    state.activeTabId = school.id
    state.currentUrl = servicesUrl
    state.history = [servicesUrl]
    writeSave(state)
    render(<GameProvider><SchoolSite route={parseGameUrl(servicesUrl)} onNavigate={() => undefined} /></GameProvider>)
    await user.click(screen.getByRole('button', { name: '查看旧版兼容服务' }))
    expect(screen.getByText('旧版管理入口：/admin')).toBeInTheDocument()
    await waitFor(() => expect(readSave()?.clues.legacy_admin_entry.discovered).toBe(true))
    expect(readSave()?.clues.admin_access_denied.discovered).toBe(false)
  })

  it('访问403页面获得拒绝访问线索', async () => {
    const url = 'www.qiming-high.edu.cn/admin'
    const state = chapterFourState('zhou_xun', 'stu.qiming-high.edu.cn/dashboard')
    const school = createSchoolTab(url)
    state.tabs = [school, state.tabs[1]]
    state.activeTabId = school.id
    state.currentUrl = url
    state.history = [url]
    writeSave(state)
    render(<GameProvider><SchoolSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    expect(screen.getByText('403')).toBeInTheDocument()
    await waitFor(() => expect(readSave()?.clues.admin_access_denied.discovered).toBe(true))
  })

  it('系统检索ADMIN_03获得权限限制，但不完成章节', async () => {
    const user = userEvent.setup()
    const url = 'stu.qiming-high.edu.cn/system-search'
    writeSave(chapterFourState('zhou_xun', url))
    render(<GameProvider><StudentSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    await user.type(screen.getByLabelText('系统检索关键词'), 'ADMIN_03')
    await user.click(screen.getByRole('button', { name: '检索' }))
    expect(screen.getByText('找到1条历史引用')).toBeInTheDocument()
    await waitFor(() => expect(readSave()?.clues.permission_limit.discovered).toBe(true))
    expect(readSave()?.triggeredEvents).not.toContain('chapter_four_completed')
  })

  it.each([
    ['stu.qiming-high.edu.cn/admin-attempts', '访问失败记录'],
    ['stu.qiming-high.edu.cn/admin/history', '历史查询'],
  ])('林默不能查看周寻权限调查资料：%s', (url, title) => {
    const state = chapterFourState('lin_mo', url)
    state.triggeredEvents.push('chapter_four_admin_unlocked')
    writeSave(state)
    render(<GameProvider><StudentSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    expect(screen.getByText(title)).toBeInTheDocument()
    expect(screen.getByText(/无权查看|权限不足|权限限制/)).toBeInTheDocument()
  })

  it('周寻核对访问失败记录后获得对应线索', async () => {
    const user = userEvent.setup()
    const url = 'stu.qiming-high.edu.cn/admin-attempts'
    writeSave(chapterFourState('zhou_xun', url))
    render(<GameProvider><StudentSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    await user.click(screen.getByRole('button', { name: '核对访问目标' }))
    expect(screen.getByText('/admin/history')).toBeInTheDocument()
    await waitFor(() => expect(readSave()?.clues.zhou_admin_attempt.discovered).toBe(true))
  })

  it('满足条件后历史查询可分别发现三条线索', async () => {
    const user = userEvent.setup()
    const url = 'stu.qiming-high.edu.cn/admin/history'
    const state = chapterFourState('zhou_xun', url)
    state.triggeredEvents.push('chapter_four_admin_unlocked')
    discover(state, ['permission_limit', 'legacy_admin_entry', 'admin_access_denied', 'zhou_admin_attempt', 'permission_request_manual'])
    writeSave(state)
    render(<GameProvider><StudentSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    const input = screen.getByLabelText('管理员历史查询')
    for (const query of ['沈栀', 'ADMIN_03', '2024010307']) {
      await user.clear(input)
      await user.type(input, query)
      await user.click(screen.getByRole('button', { name: '查询历史' }))
    }
    await waitFor(() => {
      const saved = readSave()
      expect(saved?.clues.history_query_access.discovered).toBe(true)
      expect(saved?.clues.student_status_modify_log.discovered).toBe(true)
      expect(saved?.clues.admin03_permission_group.discovered).toBe(true)
      expect(saved?.clues.linmo_target_record.discovered).toBe(true)
    })
  })

  it('最终备份打开不完成，关闭后显示结尾且刷新不重播', async () => {
    const user = userEvent.setup()
    const url = 'stu.qiming-high.edu.cn/downloads'
    const state = chapterFourState('zhou_xun', url)
    state.triggeredEvents.push('chapter_four_admin_unlocked', 'chapter_four_final_unlocked')
    state.unlockedFileIds.push(CHAPTER_FOUR_FINAL_FILE_ID)
    writeSave(state)
    render(<GameProvider><BrowserShell /></GameProvider>)
    const row = screen.getByText('调查备份_03.txt').closest('.story-download')
    await user.click(within(row as HTMLElement).getByRole('button', { name: '打开' }))
    await waitFor(() => expect(readSave()?.revealedFileSections).toContain('chapter_four_final_opened'))
    expect(readSave()?.triggeredEvents).not.toContain('chapter_four_completed')
    await user.click(screen.getByRole('button', { name: '关闭' }))
    expect(await screen.findByRole('dialog', { name: '第四章结束' })).toBeInTheDocument()
    expect(screen.getByText('你的访问权限已被记录。')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '继续浏览' }))
    await waitFor(() => expect(readSave()?.revealedFileSections).toContain('chapter-four-ending-played'))
    await user.click(within(screen.getByText('调查备份_03.txt').closest('.story-download') as HTMLElement).getByRole('button', { name: '打开' }))
    await user.click(screen.getByRole('button', { name: '关闭' }))
    expect(screen.queryByRole('dialog', { name: '第四章结束' })).not.toBeInTheDocument()
    expect(readSave()?.triggeredEvents.filter((id) => id === 'chapter_four_completed')).toHaveLength(1)
  })

  it('刷新恢复后保持第四章完成状态且不自动重播结尾', () => {
    const state = chapterFourState('zhou_xun', 'stu.qiming-high.edu.cn/downloads')
    state.triggeredEvents.push('chapter_four_admin_unlocked', 'chapter_four_final_unlocked', 'chapter_four_completed')
    state.unlockedFileIds.push(CHAPTER_FOUR_FINAL_FILE_ID)
    writeSave(state)
    render(<GameProvider><LaunchScreen /></GameProvider>)
    expect(screen.getByText('第四章《权限不足》已完成')).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: '第四章结束' })).not.toBeInTheDocument()
  })

  it('Esc关闭第四章最终文件时仍能识别closingFileId并显示结尾', async () => {
    const user = userEvent.setup()
    const state = chapterFourState('zhou_xun', 'stu.qiming-high.edu.cn/downloads')
    state.triggeredEvents.push('chapter_four_admin_unlocked', 'chapter_four_final_unlocked')
    state.unlockedFileIds.push(CHAPTER_FOUR_FINAL_FILE_ID)
    writeSave(state)
    render(<GameProvider><BrowserShell /></GameProvider>)
    await user.click(within(screen.getByText('调查备份_03.txt').closest('.story-download') as HTMLElement).getByRole('button', { name: '打开' }))
    await user.keyboard('{Escape}')
    expect(await screen.findByRole('dialog', { name: '第四章结束' })).toBeInTheDocument()
    await waitFor(() => {
      expect(readSave()?.tabs.find((tab) => tab.id === 'student-1')?.openVirtualFileId).toBeNull()
      expect(readSave()?.triggeredEvents).toContain('chapter_four_completed')
    })
  })

  it('测试控制台可以手动重播第三章结尾', async () => {
    const user = userEvent.setup()
    const state = chapterFourState('zhou_xun', 'stu.qiming-high.edu.cn/downloads')
    writeSave(state)
    render(<GameProvider><BrowserShell /><TestConsole onExitTestMode={() => undefined} /></GameProvider>)
    await user.click(screen.getByRole('button', { name: '打开测试控制台' }))
    await user.click(screen.getByRole('button', { name: '播放第三章结尾' }))
    expect(await screen.findByRole('dialog', { name: '值班记录' })).toBeInTheDocument()
  })

  it('测试控制台可以手动重播第四章结尾', async () => {
    const user = userEvent.setup()
    const state = chapterFourState('zhou_xun', 'stu.qiming-high.edu.cn/downloads')
    state.triggeredEvents.push('chapter_four_admin_unlocked', 'chapter_four_final_unlocked', 'chapter_four_completed')
    writeSave(state)
    render(<GameProvider><BrowserShell /><TestConsole onExitTestMode={() => undefined} /></GameProvider>)
    await user.click(screen.getByRole('button', { name: '打开测试控制台' }))
    await user.click(screen.getByRole('button', { name: '播放第四章结尾' }))
    expect(await screen.findByRole('dialog', { name: '第四章结束' })).toBeInTheDocument()
  })
})
