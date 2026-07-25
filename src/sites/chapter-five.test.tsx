import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { BrowserShell } from '../browser/BrowserShell'
import { createEmptyClues } from '../data/story'
import { GameProvider } from '../game/GameContext'
import { CHAPTER_FIVE_BACKUP_FILE_ID, CHAPTER_FIVE_FINAL_FILE_ID, SAVE_KEY } from '../game/constants'
import { parseGameUrl } from '../game/router'
import { createDefaultSavedAccounts } from '../game/savedAccounts'
import { createSave, createStudentAccountStates, readSave, writeSave } from '../game/storage'
import { createSchoolTab, createStudentTab } from '../game/tabs'
import { StudentSite } from './student/StudentSite'
import { TestConsole } from '../test-tools/TestConsole'
import type { GameState, StudentAccountId } from '../types/game'

function chapterFiveState(accountId: StudentAccountId, url: string): GameState {
  const school = createSchoolTab()
  const student = createStudentTab(url, [url], 0, 'student-1', accountId)
  return {
    isStarted: true, hasSave: true, tabs: [school, student], activeTabId: student.id,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [], clues: createEmptyClues(),
    triggeredEvents: ['chapter_one_completed', 'chapter_two_started', 'chapter_two_completed', 'chapter_three_started', 'chapter_three_final_unlocked', 'chapter_three_completed', 'chapter_four_started', 'chapter_four_admin_unlocked', 'chapter_four_final_unlocked', 'chapter_four_completed', 'chapter_five_started'],
    unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [CHAPTER_FIVE_BACKUP_FILE_ID],
    chapterOneCompleted: true, chapterOneCompletedAt: '2026-01-01', chapterEndingPlayed: true,
    chapterTwoStarted: true, chapterTwoCompleted: true, chapterTwoCompletedAt: '2026-01-02', chapterTwoEndingPlayed: true,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: true, revealedFileSections: [],
    studentTabCaptchas: {}, currentUrl: url, history: [url], historyIndex: 0, refreshToken: 0, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
    chapterThreeEndingVisible: false, chapterFourEndingVisible: false, chapterFiveEndingVisible: false, chapterFiveSessionGlitchActive: false,
  }
}

function seed(state: GameState) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(createSave(state)))
}

function renderStudent(state: GameState) {
  seed(state)
  return render(<GameProvider><StudentSite route={parseGameUrl(state.currentUrl)} onNavigate={() => undefined} /></GameProvider>)
}

beforeEach(() => window.localStorage.clear())

describe('第五章页面与权限', () => {
  it('林默可查看安全提醒，但打开不会自动发现，主动确认才记录线索', async () => {
    const user = userEvent.setup()
    const state = chapterFiveState('lin_mo', 'stu.qiming-high.edu.cn/messages')
    state.unreadMessageIds.push('account_relation_security_warning')
    renderStudent(state)
    await user.click(screen.getByRole('button', { name: /账号安全提醒/ }))
    expect(readSave()?.clues.account_relation_warning.discovered).toBe(false)
    await user.click(screen.getByRole('button', { name: '查看关联信息' }))
    await waitFor(() => expect(readSave()?.clues.account_relation_warning.discovered).toBe(true))
  })

  it('周寻看不到林默私人提醒，林默不能访问周寻登录与设备', () => {
    const first = renderStudent(chapterFiveState('zhou_xun', 'stu.qiming-high.edu.cn/messages'))
    expect(screen.queryByRole('button', { name: /账号安全提醒/ })).not.toBeInTheDocument()
    first.unmount()
    window.localStorage.clear()
    renderStudent(chapterFiveState('lin_mo', 'stu.qiming-high.edu.cn/security/devices'))
    expect(screen.getByText('当前账号无权查看该账号的安全调查资料。')).toBeInTheDocument()
  })

  it('正确核对两条终端记录后发现失踪后登录', async () => {
    const user = userEvent.setup()
    renderStudent(chapterFiveState('zhou_xun', 'stu.qiming-high.edu.cn/security/devices'))
    await user.click(screen.getByRole('button', { name: '查询' }))
    await user.click(screen.getByRole('checkbox', { name: '选择2026-09-14 23:48' }))
    expect(screen.getByRole('button', { name: '核对登录时间' })).toBeDisabled()
    await user.click(screen.getByRole('checkbox', { name: '选择2026-09-15 00:02' }))
    await user.click(screen.getByRole('button', { name: '核对登录时间' }))
    expect(readSave()?.clues.zhou_post_disappearance_login.discovered).toBe(false)
    await user.click(screen.getByRole('button', { name: '记录该异常' }))
    await waitFor(() => expect(readSave()?.clues.zhou_post_disappearance_login.discovered).toBe(true))
  })

  it('设备详情主动核对后发现停用终端活动', async () => {
    const user = userEvent.setup()
    renderStudent(chapterFiveState('zhou_xun', 'stu.qiming-high.edu.cn/security/device/TERM-OLD-03'))
    expect(screen.getByText('2026-06-18')).toBeInTheDocument()
    expect(readSave()?.clues.decommissioned_terminal_activity.discovered).toBe(false)
    await user.click(screen.getByRole('button', { name: '核对设备状态' }))
    await waitFor(() => expect(readSave()?.clues.decommissioned_terminal_activity.discovered).toBe(true))
  })

  it('DAT错误字段失败，正确字段恢复后分两步发现缓存与终端关联', async () => {
    const user = userEvent.setup()
    const state = chapterFiveState('zhou_xun', 'stu.qiming-high.edu.cn/files/student-cache-2024010318/recover')
    state.triggeredEvents.push('chapter_five_cache_unlocked')
    renderStudent(state)
    await user.type(screen.getByLabelText('缓存学生编号'), '2024010318')
    await user.type(screen.getByLabelText('缓存维护编号'), 'SYS-0000')
    await user.type(screen.getByLabelText('缓存终端编号'), 'TERM-OLD-03')
    await user.click(screen.getByRole('button', { name: '开始恢复' }))
    expect(screen.getByRole('alert')).toHaveTextContent('关联字段不足')
    fireEvent.change(screen.getByLabelText('缓存维护编号'), { target: { value: 'SYS-0616' } })
    await user.click(screen.getByRole('button', { name: '开始恢复' }))
    await waitFor(() => expect(readSave()?.clues.shenzhi_cache_recovered.discovered).toBe(true))
    expect(readSave()?.clues.shenzhi_zhou_terminal_link.discovered).toBe(false)
    await user.click(screen.getByRole('button', { name: /查看关联访问账号/ }))
    await waitFor(() => expect(readSave()?.clues.shenzhi_zhou_terminal_link.discovered).toBe(true))
  })

  it('三个账号全部加入后才能确认关联', async () => {
    const user = userEvent.setup()
    const state = chapterFiveState('zhou_xun', 'stu.qiming-high.edu.cn/investigation/account-relations')
    state.triggeredEvents.push('chapter_five_cache_unlocked', 'chapter_five_relation_unlocked')
    renderStudent(state)
    for (const id of ['2024010318', '2024010312', '2024010307']) {
      fireEvent.change(screen.getByLabelText('关联账号查询'), { target: { value: id } })
      await user.click(screen.getByRole('button', { name: '查询' }))
      await user.click(screen.getByRole('button', { name: '加入关联比对' }))
    }
    await user.click(screen.getByRole('button', { name: '确认关联' }))
    await waitFor(() => expect(readSave()?.clues.three_account_relation.discovered).toBe(true))
  })

  it('未发送草稿需要主动打开并正确比对时间', async () => {
    const user = userEvent.setup()
    const state = chapterFiveState('zhou_xun', 'stu.qiming-high.edu.cn/messages')
    state.revealedFileSections.push('chapter-five-last-activity-reviewed')
    renderStudent(state)
    await user.click(screen.getByRole('button', { name: /别再登录我的账号/ }))
    await waitFor(() => expect(readSave()?.clues.zhou_last_draft.discovered).toBe(true))
    expect(screen.getByText('草稿 · 未发送')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '查看修改记录' }))
    await user.click(screen.getByRole('button', { name: /会话中断时间/ }))
    await user.click(screen.getByRole('button', { name: /草稿最后修改时间/ }))
    await user.click(screen.getByRole('button', { name: '比对时间' }))
    await waitFor(() => expect(readSave()?.clues.draft_modified_after_logout.discovered).toBe(true))
  })
})

describe('第五章最终文件生命周期', () => {
  it('打开不完成，关闭后完成并显示一次结尾', async () => {
    const user = userEvent.setup()
    const state = chapterFiveState('zhou_xun', 'stu.qiming-high.edu.cn/downloads')
    state.triggeredEvents.push('chapter_five_cache_unlocked', 'chapter_five_relation_unlocked', 'chapter_five_final_unlocked')
    state.unlockedFileIds.push(CHAPTER_FIVE_FINAL_FILE_ID)
    seed(state)
    render(<GameProvider><BrowserShell /></GameProvider>)
    const finalRow = screen.getByText('调查备份_04.txt', { selector: 'strong' }).closest('div')!
    await user.click(within(finalRow).getByRole('button', { name: '打开' }))
    expect(screen.queryByRole('dialog', { name: '第五章结束' })).not.toBeInTheDocument()
    expect(readSave()?.triggeredEvents).not.toContain('chapter_five_completed')
    await user.click(screen.getByRole('button', { name: '关闭' }))
    expect(await screen.findByRole('dialog', { name: '第五章结束' })).toBeInTheDocument()
    expect(readSave()?.triggeredEvents).toContain('chapter_five_completed')
    expect(readSave()?.clues.zhou_last_login_summary.discovered).toBe(true)
    await user.click(screen.getByRole('button', { name: '继续浏览' }))
    await user.click(within(screen.getByText('调查备份_04.txt', { selector: 'strong' }).closest('div')!).getByRole('button', { name: '打开' }))
    await user.click(screen.getByRole('button', { name: '关闭' }))
    expect(screen.queryByRole('dialog', { name: '第五章结束' })).not.toBeInTheDocument()
  })

  it('测试控制台可以手动重播第五章结尾', async () => {
    const user = userEvent.setup()
    const state = chapterFiveState('zhou_xun', 'stu.qiming-high.edu.cn/downloads')
    state.triggeredEvents.push('chapter_five_cache_unlocked', 'chapter_five_relation_unlocked', 'chapter_five_final_unlocked', 'chapter_five_completed')
    writeSave(state)
    render(<GameProvider><BrowserShell /><TestConsole onExitTestMode={() => undefined} /></GameProvider>)
    await user.click(screen.getByRole('button', { name: '打开测试控制台' }))
    await user.click(screen.getByRole('button', { name: '播放第五章结尾' }))
    expect(await screen.findByRole('dialog', { name: '第五章结束' })).toBeInTheDocument()
  })
})
