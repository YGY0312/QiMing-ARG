import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createEmptyClues } from '../data/story'
import { CHAPTER_THREE_BACKUP_FILE_ID, CHAPTER_THREE_FINAL_FILE_ID } from '../game/constants'
import { GameProvider } from '../game/GameContext'
import { parseGameUrl } from '../game/router'
import { createDefaultSavedAccounts } from '../game/savedAccounts'
import { createStudentAccountStates, writeSave } from '../game/storage'
import { createSchoolTab, createStudentTab } from '../game/tabs'
import type { ClueId, GameState, StudentAccountId } from '../types/game'
import { SchoolSite } from './school/SchoolSite'
import { StudentSite } from './student/StudentSite'

function chapterThreeState(accountId: StudentAccountId | null, url: string): GameState {
  const school = createSchoolTab(url.startsWith('www.') ? url : undefined)
  const student = accountId ? createStudentTab(url, [url], 0, 'student-1', accountId) : null
  const active = student ?? school
  return {
    isStarted: true, hasSave: true, tabs: student ? [school, student] : [school], activeTabId: active.id,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [url], clues: createEmptyClues(),
    triggeredEvents: ['chapter_one_completed', 'chapter_two_started', 'chapter_two_completed', 'chapter_three_started'],
    unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [CHAPTER_THREE_BACKUP_FILE_ID],
    chapterOneCompleted: true, chapterOneCompletedAt: '2026-09-16', chapterEndingPlayed: true,
    chapterTwoStarted: true, chapterTwoCompleted: true, chapterTwoCompletedAt: '2026-09-17', chapterTwoEndingPlayed: true,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: true, revealedFileSections: ['chapter-three-backup-read'],
    studentTabCaptchas: {}, currentUrl: active.currentUrl, history: active.history, historyIndex: active.historyIndex, refreshToken: 0, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
  }
}

function discover(state: GameState, id: ClueId): void {
  state.clues[id] = { ...state.clues[id], discovered: true, discoveredAt: '2026-09-17T12:00:00Z', sourceUrl: 'test' }
}

describe('第三章页面与账号权限', () => {
  it('周寻账号可以查看调查备份02', async () => {
    const user = userEvent.setup()
    const url = 'stu.qiming-high.edu.cn/downloads'
    writeSave(chapterThreeState('zhou_xun', url))
    render(<GameProvider><StudentSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    const backupRow = screen.getByText('调查备份_02.txt').closest('.story-download')
    expect(backupRow).not.toBeNull()
    await user.click(within(backupRow as HTMLElement).getByRole('button', { name: '打开' }))
    expect(screen.getByText(/重点是：/)).toBeInTheDocument()
    expect(screen.getByText(/那一晚谁看到了她/)).toBeInTheDocument()
  })

  it('四项线索完成后同一备份02显示最终记录', async () => {
    const user = userEvent.setup()
    const url = 'stu.qiming-high.edu.cn/downloads'
    const state = chapterThreeState('zhou_xun', url)
    state.triggeredEvents.push('chapter_three_final_unlocked')
    state.unlockedFileIds.push(CHAPTER_THREE_FINAL_FILE_ID)
    writeSave(state)
    render(<GameProvider><StudentSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    const backupRow = screen.getByText('调查备份_02.txt').closest('.story-download')
    await user.click(within(backupRow as HTMLElement).getByRole('button', { name: '打开' }))
    expect(screen.getByText(/ADMIN_03/)).toBeInTheDocument()
    expect(screen.getByText(/不是普通教师/)).toBeInTheDocument()
  })

  it('林默账号无法查看周寻的实验楼访问调查资料', () => {
    const url = 'stu.qiming-high.edu.cn/lab-access-records'
    const state = chapterThreeState('lin_mo', url)
    discover(state, 'old_building_duty_record')
    writeSave(state)
    render(<GameProvider><StudentSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    expect(screen.getByText('当前账号无权查看周寻的私人调查资料。')).toBeInTheDocument()
    expect(screen.queryByText('实验楼异常访问记录.txt')).not.toBeInTheDocument()
  })

  it('官网主动查询6月16日值班安排后记录值班线索', async () => {
    const user = userEvent.setup()
    const url = 'www.qiming-high.edu.cn/services/laboratory/duty-june-2026'
    writeSave(chapterThreeState(null, url))
    render(<GameProvider><SchoolSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    await user.type(screen.getByLabelText('值班日期'), '2026-06-16')
    await user.click(screen.getByRole('button', { name: '查询' }))
    expect(screen.getByText('陈启明')).toBeInTheDocument()
    expect(screen.getByText('已记录：6月16日晚旧实验楼存在值班人员。')).toBeInTheDocument()
  })

  it('周寻主动查询访问记录并查看匿名管理员权限来源', async () => {
    const user = userEvent.setup()
    const url = 'stu.qiming-high.edu.cn/lab-access-records'
    const state = chapterThreeState('zhou_xun', url)
    discover(state, 'old_building_duty_record')
    writeSave(state)
    render(<GameProvider><StudentSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    await user.type(screen.getByLabelText('访问记录日期'), '2026-06-16')
    await user.click(screen.getByRole('button', { name: '查询' }))
    expect(screen.getByText('沈栀进入旧实验楼')).toBeInTheDocument()
    expect(screen.getByText('异常解除')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '查看操作来源' }))
    expect(screen.getByText('权限：管理员')).toBeInTheDocument()
    expect(screen.getByText('未显示')).toBeInTheDocument()
  })

  it('管理员痕迹出现后可以在官网记录系统升级新闻', async () => {
    const user = userEvent.setup()
    const url = 'www.qiming-high.edu.cn/news/campus-security-system-upgrade'
    const state = chapterThreeState(null, url)
    discover(state, 'admin_permission_trace')
    writeSave(state)
    render(<GameProvider><SchoolSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    expect(screen.getByRole('heading', { name: '校园安全系统升级完成' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '记录发布时间与负责部门' }))
    expect(screen.getByRole('button', { name: '发布时间已记录' })).toBeDisabled()
  })
})
