import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyClues } from '../data/story'
import { GameProvider } from '../game/GameContext'
import { SAVE_KEY } from '../game/constants'
import { parseGameUrl } from '../game/router'
import { createDefaultSavedAccounts } from '../game/savedAccounts'
import { createSave, createStudentAccountStates, readSave } from '../game/storage'
import { createSchoolTab, createStudentTab } from '../game/tabs'
import type { GameState, StudentAccountId } from '../types/game'
import { StudentSite } from './student/StudentSite'
import { BrowserShell } from '../browser/BrowserShell'
import { CHAPTER_SIX_BACKUP_FILE_ID, CHAPTER_SIX_FINAL_FILE_ID } from '../game/constants'

function chapterSixState(accountId: StudentAccountId, url: string): GameState {
  const school = createSchoolTab()
  const student = createStudentTab(url, [url], 0, 'student-1', accountId)
  return {
    isStarted: true, hasSave: true, tabs: [school, student], activeTabId: student.id,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [], clues: createEmptyClues(),
    triggeredEvents: ['chapter_five_started', 'chapter_five_completed', 'chapter_six_started'],
    unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [],
    chapterOneCompleted: true, chapterOneCompletedAt: '2026-01-01', chapterEndingPlayed: true,
    chapterTwoStarted: true, chapterTwoCompleted: true, chapterTwoCompletedAt: '2026-01-02', chapterTwoEndingPlayed: true,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: true, revealedFileSections: [],
    studentTabCaptchas: {}, currentUrl: url, history: [url], historyIndex: 0, refreshToken: 0, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
    chapterThreeEndingVisible: false, chapterFourEndingVisible: false, chapterFiveEndingVisible: false, chapterFiveSessionGlitchActive: false,
    chapterSixEndingVisible: false, chapterSixSyncGlitchActive: false,
  }
}
function renderStudent(state: GameState) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(createSave(state)))
  return render(<GameProvider><StudentSite route={parseGameUrl(state.currentUrl)} onNavigate={() => undefined} /></GameProvider>)
}
beforeEach(() => window.localStorage.clear())

describe('第六章页面与权限', () => {
  it('终端详情打开记录不自动触发，主动核对后发现状态波动', async () => {
    const user = userEvent.setup()
    renderStudent(chapterSixState('zhou_xun', 'stu.qiming-high.edu.cn/security/device/TERM-OLD-03'))
    await user.click(screen.getByRole('button', { name: '查看状态变化记录' }))
    expect(screen.getByText('2026-09-15 00:07')).toBeInTheDocument()
    expect(screen.getByText('在线')).toBeInTheDocument()
    expect(readSave()?.clues.terminal_status_fluctuation.discovered).toBe(false)
    await user.click(screen.getByRole('button', { name: '核对公开状态与心跳' }))
    await waitFor(() => expect(readSave()?.clues.terminal_status_fluctuation.discovered).toBe(true))
  })
  it('林默直接访问网络接入记录会被拒绝且不触发线索', () => {
    renderStudent(chapterSixState('lin_mo', 'stu.qiming-high.edu.cn/investigation/network-access'))
    expect(screen.getByText('当前账号无权访问该资料。')).toBeInTheDocument()
    expect(readSave()?.clues.terminal_same_network_port.discovered).toBe(false)
  })
  it('正确三个平面图区域确认路径，错误组合无效', async () => {
    const user = userEvent.setup()
    const state = chapterSixState('zhou_xun', 'stu.qiming-high.edu.cn/investigation/floor-plan')
    state.triggeredEvents.push('chapter_six_map_unlocked')
    renderStudent(state)
    await user.click(screen.getByRole('button', { name: 'A-302' }))
    await user.click(screen.getByRole('button', { name: '弱电间' }))
    await user.click(screen.getByRole('button', { name: '三层设备间' }))
    await user.click(screen.getByRole('button', { name: '确认调查路径' }))
    expect(screen.getByRole('alert')).toHaveTextContent('无法形成有效调查路径')
    await user.click(screen.getByRole('button', { name: /弱电间/ }))
    await user.click(screen.getByRole('button', { name: '广播设备室' }))
    await user.click(screen.getByRole('button', { name: '确认调查路径' }))
    await waitFor(() => expect(readSave()?.clues.third_floor_route.discovered).toBe(true))
  })
  it('跨月查询选择正确两条后发现相同节点', async () => {
    const user = userEvent.setup()
    renderStudent(chapterSixState('zhou_xun', 'stu.qiming-high.edu.cn/investigation/network-access'))
    await user.click(screen.getByRole('button', { name: '查询' }))
    expect(screen.getByText('2026-06-16 22:27')).toBeInTheDocument()
    expect(screen.getByText('2026-09-14 23:47')).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: '选择2026-06-16 22:27' }))
    await user.click(screen.getByRole('checkbox', { name: '选择2026-09-14 23:47' }))
    await user.click(screen.getByRole('button', { name: '核对接入节点' }))
    await waitFor(() => expect(readSave()?.clues.terminal_same_network_port.discovered).toBe(true))
  })
  it('CAM错误字段失败，正确字段恢复四项索引', async () => {
    const user = userEvent.setup()
    const state = chapterSixState('zhou_xun', 'stu.qiming-high.edu.cn/files/camera-cache/recover')
    state.triggeredEvents.push('chapter_six_media_unlocked')
    renderStudent(state)
    await user.type(screen.getByLabelText('CAM借用人'), '2024010318')
    await user.type(screen.getByLabelText('CAM设备编号'), 'CAM-00')
    await user.type(screen.getByLabelText('CAM关联终端'), 'TERM-OLD-03')
    await user.click(screen.getByRole('button', { name: '尝试恢复' }))
    expect(screen.getByRole('alert')).toHaveTextContent('设备关联不足')
    fireEvent.change(screen.getByLabelText('CAM设备编号'), { target: { value: 'CAM-07' } })
    await user.click(screen.getByRole('button', { name: '尝试恢复' }))
    expect(await screen.findByText('221936.mp4')).toBeInTheDocument()
    expect(screen.getByText('222801.tmp')).toBeInTheDocument()
    expect(readSave()?.clues.camera_storage_index.discovered).toBe(true)
  })
  it('本地备注属性打开不自动发现，主动记录才触发', async () => {
    const user = userEvent.setup()
    renderStudent(chapterSixState('zhou_xun', 'stu.qiming-high.edu.cn/terminal/TERM-OLD-03/pending/2024010312'))
    expect(screen.getByText('LOCAL_SESSION')).toBeInTheDocument()
    expect(screen.getByText('不要从系统里找我。')).toBeInTheDocument()
    expect(readSave()?.clues.zhou_local_session_note.discovered).toBe(false)
    await user.click(screen.getByRole('button', { name: '记录本地会话备注' }))
    await waitFor(() => expect(readSave()?.clues.zhou_local_session_note.discovered).toBe(true))
  })
  it('最终备份打开只记录opened，关闭后完成并显示一次结尾', async () => {
    const user = userEvent.setup()
    const state = chapterSixState('zhou_xun', 'stu.qiming-high.edu.cn/downloads')
    state.triggeredEvents.push('chapter_six_final_unlocked')
    state.unlockedFileIds.push(CHAPTER_SIX_BACKUP_FILE_ID, CHAPTER_SIX_FINAL_FILE_ID)
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(createSave(state)))
    render(<GameProvider><BrowserShell /></GameProvider>)
    const row = screen.getByText('调查备份_05.txt', { selector: 'strong' }).closest('div')!
    await user.click(within(row).getByRole('button', { name: '打开' }))
    expect(readSave()?.revealedFileSections).toContain('chapter_six_final_opened')
    expect(readSave()?.triggeredEvents).not.toContain('chapter_six_completed')
    await user.click(screen.getByRole('button', { name: '关闭' }))
    expect(await screen.findByRole('dialog', { name: '第六章结束' })).toBeInTheDocument()
    expect(readSave()?.triggeredEvents).toContain('chapter_six_completed')
    expect(readSave()?.clues.terminal03_summary.discovered).toBe(true)
    await user.click(screen.getByRole('button', { name: '继续浏览' }))
    await waitFor(() => expect(screen.getByText('调查备份_05.txt', { selector: 'strong' })).toBeInTheDocument(), { timeout: 2000 })
    await user.click(within(screen.getByText('调查备份_05.txt', { selector: 'strong' }).closest('div')!).getByRole('button', { name: '打开' }))
    await user.click(screen.getByRole('button', { name: '关闭' }))
    expect(screen.queryByRole('dialog', { name: '第六章结束' })).not.toBeInTheDocument()
  })
})
