import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { BrowserShell } from '../browser/BrowserShell'
import { createEmptyClues } from '../data/story'
import { GameProvider } from '../game/GameContext'
import { CHAPTER_SEVEN_BACKUP_FILE_ID, CHAPTER_SEVEN_FINAL_FILE_ID, SAVE_KEY } from '../game/constants'
import { parseGameUrl } from '../game/router'
import { createDefaultSavedAccounts } from '../game/savedAccounts'
import { createSave, createStudentAccountStates, readSave } from '../game/storage'
import { createSchoolTab, createStudentTab } from '../game/tabs'
import type { ClueId, GameState, StoryEventId, StudentAccountId } from '../types/game'
import { SchoolSite } from './school/SchoolSite'
import { StudentSite } from './student/StudentSite'

function chapterSevenState(accountId: StudentAccountId, url: string): GameState {
  const school = createSchoolTab()
  const student = createStudentTab(url, [url], 0, 'student-1', accountId)
  return {
    isStarted: true, hasSave: true, tabs: [school, student], activeTabId: student.id,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [], clues: createEmptyClues(),
    triggeredEvents: ['chapter_six_completed', 'chapter_seven_started'],
    unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [CHAPTER_SEVEN_BACKUP_FILE_ID],
    chapterOneCompleted: true, chapterOneCompletedAt: '2026-01-01', chapterEndingPlayed: true,
    chapterTwoStarted: true, chapterTwoCompleted: true, chapterTwoCompletedAt: '2026-01-02', chapterTwoEndingPlayed: true,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: true, revealedFileSections: [],
    studentTabCaptchas: {}, currentUrl: url, history: [url], historyIndex: 0, refreshToken: 0, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
    chapterThreeEndingVisible: false, chapterFourEndingVisible: false, chapterFiveEndingVisible: false, chapterFiveSessionGlitchActive: false,
    chapterSixEndingVisible: false, chapterSixSyncGlitchActive: false, chapterSevenEndingVisible: false,
  }
}

function prepare(state: GameState, events: StoryEventId[] = [], clues: ClueId[] = [], sections: string[] = []) {
  state.triggeredEvents.push(...events)
  for (const id of clues) state.clues[id] = { ...state.clues[id], discovered: true, discoveredAt: '2026-09-15', sourceUrl: 'test' }
  state.revealedFileSections.push(...sections)
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(createSave(state)))
}

function renderStudent(state: GameState) {
  prepare(state)
  return render(<GameProvider><StudentSite route={parseGameUrl(state.currentUrl)} onNavigate={() => undefined} /></GameProvider>)
}

beforeEach(() => window.localStorage.clear())

describe('第七章页面与权限', () => {
  it('周寻pending属性解析本地索引但不自动发现核心线索', async () => {
    const user = userEvent.setup()
    renderStudent(chapterSevenState('zhou_xun', 'stu.qiming-high.edu.cn/terminal/TERM-OLD-03/pending/2024010312'))
    expect(screen.getByText('LOCAL_REF: CLS-ARCHIVE-18')).toBeInTheDocument()
    expect(readSave()?.triggeredEvents).not.toContain('chapter_seven_class_archive_unlocked')
    await user.click(screen.getByRole('button', { name: '解析本地索引' }))
    await waitFor(() => expect(readSave()?.triggeredEvents).toContain('chapter_seven_class_archive_unlocked'))
    expect(readSave()?.clues.original_class_roster.discovered).toBe(false)
  })

  it('旧服务归档支持搜索并且打开索引不发现核心线索', async () => {
    const user = userEvent.setup()
    const state = chapterSevenState('zhou_xun', 'www.qiming-high.edu.cn/services/legacy-archive')
    const school = createSchoolTab(state.currentUrl, [state.currentUrl], 0)
    state.tabs[0] = school
    state.activeTabId = school.id
    state.currentUrl = school.currentUrl
    prepare(state)
    render(<GameProvider><SchoolSite route={parseGameUrl(state.currentUrl)} onNavigate={() => undefined} onOpenStudentTab={() => undefined} /></GameProvider>)
    await user.type(screen.getByLabelText('校园旧服务归档检索'), 'CLASS 18')
    await user.click(screen.getByRole('button', { name: '检索归档' }))
    expect(screen.getByText('高二（3）班公共资料索引')).toBeInTheDocument()
    expect(readSave()?.clues.original_class_roster.discovered).toBe(false)
  })

  it('错误恢复字段失败，正确字段恢复18人并主动记录线索', async () => {
    const user = userEvent.setup()
    const state = chapterSevenState('zhou_xun', 'stu.qiming-high.edu.cn/investigation/class-archive')
    state.triggeredEvents.push('chapter_seven_class_archive_unlocked')
    renderStudent(state)
    await user.type(screen.getByLabelText('原始名单班级'), '高二（3）班')
    await user.type(screen.getByLabelText('原始名单历史人数'), '17')
    await user.type(screen.getByLabelText('原始名单提交角色'), '班长')
    await user.click(screen.getByRole('button', { name: '恢复原始名单' }))
    expect(screen.getByRole('alert')).toHaveTextContent('恢复字段不匹配')
    fireEvent.change(screen.getByLabelText('原始名单历史人数'), { target: { value: '18' } })
    await user.click(screen.getByRole('button', { name: '恢复原始名单' }))
    expect(await screen.findByText('2024010318')).toBeInTheDocument()
    expect(screen.getByText('沈栀')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(19)
    await user.click(screen.getByRole('button', { name: '记录原始名单' }))
    await waitFor(() => expect(readSave()?.clues.original_class_roster.discovered).toBe(true))
  })

  it('林默不能访问班长缓存与数据传输且不会发现线索', () => {
    const state = chapterSevenState('lin_mo', 'stu.qiming-high.edu.cn/investigation/monitor-records')
    state.revealedFileSections.push('chapter-seven-monitor-cache-recovered')
    renderStudent(state)
    expect(screen.getByText('当前账号无权访问该资料。')).toBeInTheDocument()
    expect(readSave()?.clues.zhou_questioned_monitor.discovered).toBe(false)
  })

  it('班长聊天与未发送说明均需主动记录', async () => {
    const user = userEvent.setup()
    const state = chapterSevenState('zhou_xun', 'stu.qiming-high.edu.cn/investigation/monitor-records')
    state.revealedFileSections.push('chapter-seven-monitor-cache-recovered')
    renderStudent(state)
    expect(screen.getByText('是谁让你重新交名单的？', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('草稿 · 未发送', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('我没有见过退学申请，也没有见过转学手续。', { exact: false })).toBeInTheDocument()
    expect(readSave()?.clues.monitor_unsent_statement.discovered).toBe(false)
    await user.click(screen.getByRole('button', { name: '记录周寻的询问' }))
    await user.click(screen.getByRole('button', { name: '保存为调查证据' }))
    await waitFor(() => {
      expect(readSave()?.clues.zhou_questioned_monitor.discovered).toBe(true)
      expect(readSave()?.clues.monitor_unsent_statement.discovered).toBe(true)
    })
  })

  it('数据传输只选一条不触发，正确两条触发外部导出', async () => {
    const user = userEvent.setup()
    const state = chapterSevenState('zhou_xun', 'stu.qiming-high.edu.cn/investigation/data-transfer')
    state.clues.external_backup_index = { ...state.clues.external_backup_index, discovered: true, discoveredAt: '2026-09-15', sourceUrl: 'test' }
    renderStudent(state)
    await user.click(screen.getByRole('button', { name: '查询' }))
    const start = screen.getByRole('checkbox', { name: '选择传输记录2026-09-14 23:56' })
    await user.click(start)
    expect(screen.getByRole('button', { name: '核对外部导出' })).toBeDisabled()
    await user.click(screen.getByRole('checkbox', { name: '选择传输记录2026-09-15 00:01' }))
    await user.click(screen.getByRole('button', { name: '核对外部导出' }))
    await waitFor(() => expect(readSave()?.clues.terminal_external_export.discovered).toBe(true))
  })

  it('外部节点错误校验不开放，正确校验开放目录且incident锁定', async () => {
    const user = userEvent.setup()
    const url = 'archive.qm-node.local/EXT-BACKUP-QM-0616'
    const state = chapterSevenState('zhou_xun', url)
    state.triggeredEvents.push('chapter_seven_external_backup_unlocked')
    prepare(state)
    render(<GameProvider><BrowserShell /></GameProvider>)
    await user.type(screen.getByLabelText('外部节点历史对象'), '2024010318')
    await user.type(screen.getByLabelText('外部节点来源终端'), 'TERM-OLD-03')
    await user.type(screen.getByLabelText('外部节点原始人数'), '17')
    await user.click(screen.getByRole('button', { name: '验证归档' }))
    expect(screen.getByRole('alert')).toHaveTextContent('校验信息不一致')
    fireEvent.change(screen.getByLabelText('外部节点原始人数'), { target: { value: '18' } })
    await user.click(screen.getByRole('button', { name: '验证归档' }))
    expect(await screen.findByRole('button', { name: /manifest/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /incident/ }))
    expect(await screen.findByText('目录已锁定')).toBeInTheDocument()
    expect(screen.getByText('需要更多原始时间记录')).toBeInTheDocument()
  })

  it('最终备份打开不完成，关闭完成并显示一次第七章结尾', async () => {
    const user = userEvent.setup()
    const state = chapterSevenState('zhou_xun', 'stu.qiming-high.edu.cn/downloads')
    state.triggeredEvents.push('chapter_seven_final_unlocked')
    state.unlockedFileIds.push(CHAPTER_SEVEN_FINAL_FILE_ID)
    prepare(state)
    render(<GameProvider><BrowserShell /></GameProvider>)
    const row = screen.getByText('调查备份_06.txt', { selector: 'strong' }).closest('div')!
    await user.click(within(row).getByRole('button', { name: '打开' }))
    expect(readSave()?.revealedFileSections).toContain('chapter_seven_final_opened')
    expect(readSave()?.triggeredEvents).not.toContain('chapter_seven_completed')
    await user.click(screen.getByRole('button', { name: '关闭' }))
    expect(await screen.findByRole('dialog', { name: '第七章结束' })).toBeInTheDocument()
    expect(readSave()?.triggeredEvents).toContain('chapter_seven_completed')
    expect(readSave()?.clues.outside_system_summary.discovered).toBe(true)
    await user.click(screen.getByRole('button', { name: '继续浏览' }))
    await user.click(within(screen.getByText('调查备份_06.txt', { selector: 'strong' }).closest('div')!).getByRole('button', { name: '打开' }))
    await user.click(screen.getByRole('button', { name: '关闭' }))
    expect(screen.queryByRole('dialog', { name: '第七章结束' })).not.toBeInTheDocument()
  })
})
