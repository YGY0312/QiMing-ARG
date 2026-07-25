import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserShell } from '../browser/BrowserShell'
import { createEmptyClues } from '../data/story'
import { GameProvider } from '../game/GameContext'
import { createDefaultSavedAccounts } from '../game/savedAccounts'
import { createStudentAccountStates, readSave, writeSave } from '../game/storage'
import { createSchoolTab } from '../game/tabs'
import type { GameState } from '../types/game'

function homeState(): GameState {
  const school = createSchoolTab()
  const clues = createEmptyClues()
  clues.admin_permission_trace = { ...clues.admin_permission_trace, discovered: true, discoveredAt: 'admin-trace', sourceUrl: 'test' }
  return {
    isStarted: true, hasSave: true, tabs: [school], activeTabId: school.id,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [school.currentUrl], clues,
    triggeredEvents: ['chapter_one_completed', 'chapter_two_started', 'chapter_two_completed', 'chapter_three_started'],
    unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [],
    chapterOneCompleted: true, chapterOneCompletedAt: '2026-09-16', chapterEndingPlayed: true,
    chapterTwoStarted: true, chapterTwoCompleted: true, chapterTwoCompletedAt: '2026-09-17', chapterTwoEndingPlayed: true,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: true, revealedFileSections: [],
    studentTabCaptchas: {}, currentUrl: school.currentUrl, history: school.history, historyIndex: 0, refreshToken: 0, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
    chapterThreeEndingVisible: false, chapterFourEndingVisible: false,
  }
}

describe('学校官网首页置顶新闻', () => {
  it('首页显示可聚焦的校园安全系统升级新闻卡片', () => {
    writeSave(homeState())
    render(<GameProvider><BrowserShell /></GameProvider>)
    const featured = screen.getByRole('link', { name: /校园安全系统升级完成/ })
    expect(featured).toBeInTheDocument()
    expect(featured).toHaveAttribute('href', '#/news/campus-security-system-upgrade')
  })

  it('点击置顶卡片进入同一新闻详情且不会提前发现线索', async () => {
    const user = userEvent.setup()
    writeSave(homeState())
    render(<GameProvider><BrowserShell /></GameProvider>)
    await user.click(screen.getByRole('link', { name: /校园安全系统升级完成/ }))
    expect(await screen.findByRole('heading', { name: '校园安全系统升级完成' })).toBeInTheDocument()
    await waitFor(() => expect(readSave()?.tabs[0].currentUrl).toBe('www.qiming-high.edu.cn/news/campus-security-system-upgrade'))
    expect(readSave()?.clues.system_upgrade_notice.discovered).toBe(false)
  })

  it('键盘Enter可以打开置顶新闻', async () => {
    const user = userEvent.setup()
    writeSave(homeState())
    render(<GameProvider><BrowserShell /></GameProvider>)
    const featured = screen.getByRole('link', { name: /校园安全系统升级完成/ })
    featured.focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('heading', { name: '校园安全系统升级完成' })).toBeInTheDocument()
  })

  it('更多按钮仍进入新闻列表', async () => {
    const user = userEvent.setup()
    writeSave(homeState())
    render(<GameProvider><BrowserShell /></GameProvider>)
    const newsPanel = screen.getByRole('heading', { name: '校园新闻' }).closest('section')
    await user.click(within(newsPanel as HTMLElement).getByRole('button', { name: /更多/ }))
    expect(await screen.findByRole('heading', { name: '校园新闻' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /校园安全系统升级完成/ })).toBeInTheDocument()
  })

  it('详情页仍需主动记录线索，已发现时重复进入保持幂等', async () => {
    const user = userEvent.setup()
    const state = homeState()
    const school = createSchoolTab('www.qiming-high.edu.cn/news/campus-security-system-upgrade')
    state.tabs = [school]
    state.currentUrl = school.currentUrl
    state.history = school.history
    writeSave(state)
    render(<GameProvider><BrowserShell /></GameProvider>)
    await user.click(screen.getByRole('button', { name: '记录发布时间与负责部门' }))
    await waitFor(() => expect(readSave()?.clues.system_upgrade_notice.discoveredAt).toBeTruthy())
    const discoveredAt = readSave()?.clues.system_upgrade_notice.discoveredAt
    expect(screen.getByRole('button', { name: '发布时间已记录' })).toBeDisabled()
    expect(readSave()?.clues.system_upgrade_notice.discoveredAt).toBe(discoveredAt)
  })
})
