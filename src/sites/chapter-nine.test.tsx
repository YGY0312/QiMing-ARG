import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { BrowserShell } from '../browser/BrowserShell'
import { chapterNineClueIds, createEmptyClues } from '../data/story'
import { CHAPTER_NINE_BACKUP_FILE_ID, CHAPTER_NINE_FINAL_FILE_ID, SAVE_KEY } from '../game/constants'
import { GameProvider } from '../game/GameContext'
import { createDefaultSavedAccounts } from '../game/savedAccounts'
import { createSave, createStudentAccountStates, readSave } from '../game/storage'
import { createSchoolTab, createStudentTab } from '../game/tabs'
import type { GameState, StudentAccountId } from '../types/game'

function chapterNineState(accountId: StudentAccountId, url: string): GameState {
  const school = createSchoolTab()
  const student = createStudentTab(url, [url], 0, 'student-1', accountId)
  return {
    isStarted: true, hasSave: true, tabs: [school, student], activeTabId: student.id,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [], clues: createEmptyClues(),
    triggeredEvents: ['chapter_seven_external_backup_unlocked', 'chapter_eight_completed', 'chapter_nine_started'],
    unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [CHAPTER_NINE_BACKUP_FILE_ID],
    chapterOneCompleted: true, chapterOneCompletedAt: '2026-01-01', chapterEndingPlayed: true,
    chapterTwoStarted: true, chapterTwoCompleted: true, chapterTwoCompletedAt: '2026-01-02', chapterTwoEndingPlayed: true,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: true, revealedFileSections: [],
    studentTabCaptchas: {}, currentUrl: url, history: [url], historyIndex: 0, refreshToken: 0, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
    chapterThreeEndingVisible: false, chapterFourEndingVisible: false, chapterFiveEndingVisible: false,
    chapterFiveSessionGlitchActive: false, chapterSixEndingVisible: false, chapterSixSyncGlitchActive: false,
    chapterSevenEndingVisible: false, chapterEightEndingVisible: false, chapterNineEndingVisible: false,
  }
}
function prepare(state: GameState) { window.localStorage.setItem(SAVE_KEY, JSON.stringify(createSave(state))) }
beforeEach(() => window.localStorage.clear())

describe('第九章页面、权限与生命周期', () => {
  it('错误会话字段不开放，正确三项开放分层目录', async () => {
    const user = userEvent.setup()
    prepare(chapterNineState('zhou_xun', 'archive.qm-node.local/EXT-BACKUP-QM-0616/session/0914'))
    render(<GameProvider><BrowserShell /></GameProvider>)
    await user.type(screen.getByLabelText('会话账户编号'), '2024010312')
    await user.type(screen.getByLabelText('会话来源终端'), 'TERM-OLD-03')
    await user.type(screen.getByLabelText('会话导出对象'), 'OTHER')
    await user.click(screen.getByRole('button', { name: '校验0914会话' }))
    expect(screen.getByRole('alert')).toHaveTextContent('会话校验信息不一致')
    fireEvent.change(screen.getByLabelText('会话导出对象'), { target: { value: 'ARCHIVE_0616' } })
    await user.click(screen.getByRole('button', { name: '校验0914会话' }))
    expect(await screen.findByRole('button', { name: /timeline/ })).toBeEnabled()
    expect(screen.getByRole('button', { name: /proxy/ })).toBeDisabled()
  })

  it('林默不能访问0914代理日志且不会获得线索', () => {
    const state = chapterNineState('lin_mo', 'archive.qm-node.local/EXT-BACKUP-QM-0616/session/0914/proxy')
    state.triggeredEvents.push('chapter_nine_session_unlocked', 'chapter_nine_admin_trace_unlocked')
    prepare(state)
    render(<GameProvider><BrowserShell /></GameProvider>)
    expect(screen.getByText('当前会话没有读取该归档的关联权限。')).toBeInTheDocument()
    expect(readSave()?.clues.admin_proxy_session.discovered).toBe(false)
  })

  it('存活签名必须验证，周寻状态需要三项证据和二次确认', async () => {
    const user = userEvent.setup()
    const state = chapterNineState('zhou_xun', 'archive.qm-node.local/EXT-BACKUP-QM-0616/session/0914/alive')
    state.triggeredEvents.push('chapter_nine_session_unlocked', 'chapter_nine_alive_check_unlocked')
    state.revealedFileSections.push('chapter-nine-physical-package-verified')
    prepare(state)
    render(<GameProvider><BrowserShell /></GameProvider>)
    await user.type(screen.getByLabelText('存活签名标识'), 'ZX-KEY-01')
    await user.type(screen.getByLabelText('存活签名账户'), '2024010312')
    await user.type(screen.getByLabelText('存活签名导出对象'), 'ARCHIVE_0616')
    await user.click(screen.getByRole('button', { name: '验证签名' }))
    await user.click(screen.getByRole('button', { name: '记录系统外签名' }))
    for (const name of ['顾言东门目击', '文件袋投递确认', 'ZX-KEY-01签名通过']) await user.click(screen.getByRole('checkbox', { name: `存活证据${name}` }))
    await user.click(screen.getByRole('button', { name: '确认周寻状态' }))
    const dialog = screen.getByRole('dialog', { name: '确认周寻状态' })
    expect(dialog).toHaveTextContent('仍然活着')
    await user.click(within(dialog).getByRole('button', { name: '继续调查' }))
    expect(readSave()?.clues.zhou_alive_and_departed.discovered).toBe(false)
    await user.click(screen.getByRole('button', { name: '确认周寻状态' }))
    await user.click(within(screen.getByRole('dialog', { name: '确认周寻状态' })).getByRole('button', { name: '确认结论' }))
    await waitFor(() => expect(readSave()?.clues.zhou_alive_and_departed.discovered).toBe(true))
  })

  it('最终备份打开不完成，关闭完成、结尾只播放一次并添加签发链历史', async () => {
    const user = userEvent.setup()
    const state = chapterNineState('zhou_xun', 'stu.qiming-high.edu.cn/downloads')
    state.triggeredEvents.push('chapter_nine_session_unlocked', 'chapter_nine_certificate_chain_unlocked', 'chapter_nine_final_unlocked')
    state.unlockedFileIds.push(CHAPTER_NINE_FINAL_FILE_ID)
    for (const id of chapterNineClueIds.filter((id) => id !== 'last_account_summary')) state.clues[id] = { ...state.clues[id], discovered: true, discoveredAt: '2026-09-18', sourceUrl: 'test' }
    prepare(state)
    render(<GameProvider><BrowserShell /></GameProvider>)
    const row = screen.getByText('调查备份_08.txt', { selector: 'strong' }).closest('div')!
    await user.click(within(row).getByRole('button', { name: '打开' }))
    expect(readSave()?.triggeredEvents).toContain('chapter_nine_final_opened')
    expect(readSave()?.triggeredEvents).not.toContain('chapter_nine_completed')
    await user.click(screen.getByRole('button', { name: '关闭' }))
    expect(await screen.findByRole('dialog', { name: '第九章结束' })).toBeInTheDocument()
    expect(readSave()?.clues.last_account_summary.discovered).toBe(true)
    await user.click(screen.getByRole('button', { name: '继续浏览' }))
    expect(readSave()?.tabs[1].history.filter((url) => url.endsWith('/certificate-chain'))).toHaveLength(1)
    await user.click(within(screen.getByText('调查备份_08.txt', { selector: 'strong' }).closest('div')!).getByRole('button', { name: '打开' }))
    await user.click(screen.getByRole('button', { name: '关闭' }))
    expect(screen.queryByRole('dialog', { name: '第九章结束' })).not.toBeInTheDocument()
  })
})
