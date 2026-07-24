import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createEmptyClues } from '../data/story'
import { CHAPTER_THREE_BACKUP_FILE_ID, CHAPTER_THREE_FINAL_FILE_ID } from '../game/constants'
import { GameProvider } from '../game/GameContext'
import { BrowserShell } from '../browser/BrowserShell'
import { LaunchScreen } from '../app/LaunchScreen'
import { parseGameUrl } from '../game/router'
import { createDefaultSavedAccounts } from '../game/savedAccounts'
import { createStudentAccountStates, readSave, writeSave } from '../game/storage'
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
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false, chapterThreeEndingVisible: false,
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
    expect(screen.getByText(/我找到了一些东西/)).toBeInTheDocument()
    expect(screen.getByText(/沈栀提前申请进入旧实验楼/)).toBeInTheDocument()
    expect(screen.getByText(/继续查访问记录/)).toBeInTheDocument()
  })

  it('全部线索完成后同一备份02显示最终记录', async () => {
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
    expect(screen.getByText(/我还原了6月16日晚/)).toBeInTheDocument()
    expect(screen.getByText(/但我还不知道这个账号是谁/)).toBeInTheDocument()
  })

  it('最终备份打开时只记录opened，关闭后完成第三章并显示一次结尾', async () => {
    const user = userEvent.setup()
    const url = 'stu.qiming-high.edu.cn/downloads'
    const state = chapterThreeState('zhou_xun', url)
    state.triggeredEvents.push('chapter_three_final_unlocked')
    state.unlockedFileIds.push(CHAPTER_THREE_FINAL_FILE_ID)
    writeSave(state)
    render(<GameProvider><BrowserShell /></GameProvider>)

    const backupRow = screen.getByText('调查备份_02.txt').closest('.story-download')
    await user.click(within(backupRow as HTMLElement).getByRole('button', { name: '打开' }))
    expect(screen.queryByRole('dialog', { name: '值班记录' })).not.toBeInTheDocument()
    await waitFor(() => {
      expect(readSave()?.revealedFileSections).toContain('chapter_three_final_opened')
      expect(readSave()?.triggeredEvents).not.toContain('chapter_three_completed')
    })

    await user.click(screen.getByRole('button', { name: '关闭' }))
    expect(await screen.findByRole('dialog', { name: '值班记录' })).toBeInTheDocument()
    expect(screen.getByText(/ADMIN_03/)).toBeInTheDocument()
    await waitFor(() => expect(readSave()?.triggeredEvents).toContain('chapter_three_completed'))

    await user.click(screen.getByRole('button', { name: '继续浏览' }))
    const reopenedRow = screen.getByText('调查备份_02.txt').closest('.story-download')
    await user.click(within(reopenedRow as HTMLElement).getByRole('button', { name: '打开' }))
    await user.click(screen.getByRole('button', { name: '关闭' }))
    expect(screen.queryByRole('dialog', { name: '值班记录' })).not.toBeInTheDocument()
  })

  it('刷新恢复后保持第三章完成且不自动重播结尾', () => {
    const state = chapterThreeState('zhou_xun', 'stu.qiming-high.edu.cn/downloads')
    state.triggeredEvents.push('chapter_three_final_unlocked', 'chapter_three_completed')
    state.unlockedFileIds.push(CHAPTER_THREE_FINAL_FILE_ID)
    writeSave(state)
    render(<GameProvider><LaunchScreen /></GameProvider>)
    expect(screen.getByText('第三章《值班记录》已完成')).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: '值班记录' })).not.toBeInTheDocument()
  })

  it.each([
    ['stu.qiming-high.edu.cn/lab-reservations', '实验室使用申请记录.xlsx'],
    ['stu.qiming-high.edu.cn/equipment-loans', '实验室设备借用记录.txt'],
    ['stu.qiming-high.edu.cn/lab-access-records', '实验楼异常访问记录.txt'],
    ['stu.qiming-high.edu.cn/camera-exceptions', '监控存储异常记录.txt'],
  ])('林默账号无法查看周寻私人调查资料：%s', (url, privateTitle) => {
    const state = chapterThreeState('lin_mo', url)
    discover(state, 'old_building_duty_record')
    writeSave(state)
    render(<GameProvider><StudentSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    expect(screen.getByText('当前账号无权查看周寻的私人调查资料。')).toBeInTheDocument()
    expect(screen.queryByText(privateTitle)).not.toBeInTheDocument()
  })

  it('学生缓存损坏提示使用关联记录文案', () => {
    const url = 'stu.qiming-high.edu.cn/downloads'
    writeSave(chapterThreeState('zhou_xun', url))
    render(<GameProvider><StudentSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    const cacheRow = screen.getByText('学生缓存_2024010318.dat').closest('.story-download')
    expect(cacheRow).toHaveTextContent('文件损坏')
    expect(cacheRow).toHaveTextContent('部分数据无法恢复')
    expect(cacheRow).toHaveTextContent('需要更多关联记录')
    expect(cacheRow).not.toHaveTextContent('需要更多交互证据')
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

  it('周寻主动查询实验室申请并发现提前安排', async () => {
    const user = userEvent.setup()
    const url = 'stu.qiming-high.edu.cn/lab-reservations'
    const state = chapterThreeState('zhou_xun', url)
    discover(state, 'old_building_duty_record')
    writeSave(state)
    render(<GameProvider><StudentSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    await user.type(screen.getByLabelText('实验室使用日期'), '2026-06-16')
    await user.click(screen.getByRole('button', { name: '查询申请' }))
    expect(screen.getByText('旧实验楼 A-302')).toBeInTheDocument()
    expect(screen.getByText('已记录：沈栀提前申请使用旧实验楼A-302。')).toBeInTheDocument()
  })

  it('周寻主动查询设备借用并发现未归还记录', async () => {
    const user = userEvent.setup()
    const url = 'stu.qiming-high.edu.cn/equipment-loans'
    const state = chapterThreeState('zhou_xun', url)
    discover(state, 'old_building_duty_record')
    writeSave(state)
    render(<GameProvider><StudentSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    await user.type(screen.getByLabelText('设备借用日期'), '2026-06-16')
    await user.click(screen.getByRole('button', { name: '查询借用' }))
    expect(screen.getByText('便携摄像设备、存储卡、数据线')).toBeInTheDocument()
    expect(screen.getByText('已记录：沈栀借用的摄像与存储设备尚未归还。')).toBeInTheDocument()
  })

  it('周寻主动查询监控异常并发现数据覆盖', async () => {
    const user = userEvent.setup()
    const url = 'stu.qiming-high.edu.cn/camera-exceptions'
    const state = chapterThreeState('zhou_xun', url)
    discover(state, 'old_building_duty_record')
    writeSave(state)
    render(<GameProvider><StudentSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    await user.type(screen.getByLabelText('监控异常日期'), '2026-06-16')
    await user.click(screen.getByRole('button', { name: '查询异常' }))
    expect(screen.getByText('数据覆盖')).toBeInTheDocument()
    expect(screen.getByText('已记录：22:25至22:40的监控数据发生覆盖。')).toBeInTheDocument()
  })

  it('官网主动查询值班日志并发现维护时间线', async () => {
    const user = userEvent.setup()
    const url = 'www.qiming-high.edu.cn/services/laboratory/duty-log'
    writeSave(chapterThreeState(null, url))
    render(<GameProvider><SchoolSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    await user.type(screen.getByLabelText('值班日志日期'), '2026-06-16')
    await user.click(screen.getByRole('button', { name: '查询日志' }))
    expect(screen.getByText('收到系统维护通知')).toBeInTheDocument()
    expect(screen.getByText('执行系统同步')).toBeInTheDocument()
    expect(screen.getByText('已记录：维护通知、系统同步与当晚值班日志处于同一时间线。')).toBeInTheDocument()
  })

  it('官网主动查询维护工单并发现数据同步记录', async () => {
    const user = userEvent.setup()
    const url = 'www.qiming-high.edu.cn/services/information-center/maintenance'
    writeSave(chapterThreeState(null, url))
    render(<GameProvider><SchoolSite route={parseGameUrl(url)} onNavigate={() => undefined} /></GameProvider>)
    await user.type(screen.getByLabelText('维护工单编号'), 'SYS-0616')
    await user.click(screen.getByRole('button', { name: '查询工单' }))
    expect(screen.getByText('数据同步维护')).toBeInTheDocument()
    expect(screen.getByText('已记录：6月16日22:20存在学生信息系统数据同步维护。')).toBeInTheDocument()
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
