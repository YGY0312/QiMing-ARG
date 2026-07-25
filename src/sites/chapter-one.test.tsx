import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SchoolSite } from './school/SchoolSite'
import { StudentSite } from './student/StudentSite'
import { GameProvider } from '../game/GameContext'
import { createEmptyClues } from '../data/story'
import { parseGameUrl } from '../game/router'
import { createStudentAccountStates, readSave, writeSave } from '../game/storage'
import { addSavedStudentAccount, createDefaultSavedAccounts } from '../game/savedAccounts'
import { createSchoolTab, createStudentTab } from '../game/tabs'
import { BACKUP_FILE_ID, ZHOU_CREDENTIALS_MESSAGE_ID, ZHOU_MESSAGE_ID } from '../game/constants'
import type { ClueId, GameState, StudentAccountId } from '../types/game'

function seedSave(account: StudentAccountId | null = null, discovered: ClueId[] = [], unlockedFileIds: string[] = [], url = 'stu.qiming-high.edu.cn/dashboard') {
  const school = createSchoolTab()
  const student = createStudentTab(url, [url], 0, 'student-1', account)
  const clues = createEmptyClues()
  for (const id of discovered) clues[id] = { ...clues[id], discovered: true, discoveredAt: '2026-09-16T00:00:00Z', sourceUrl: id }
  const state: GameState = {
    isStarted: true, hasSave: true, tabs: [school, student], activeTabId: 'student-1',
    savedStudentAccounts: account === 'zhou_xun' ? addSavedStudentAccount(createDefaultSavedAccounts(), 'zhou_xun') : createDefaultSavedAccounts(),
    studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false, studentTabCaptchas: {}, visitedPages: [url], clues, triggeredEvents: [],
    unreadMessageIds: [ZHOU_CREDENTIALS_MESSAGE_ID, ZHOU_MESSAGE_ID], readMessageIds: [], unlockedFileIds, openVirtualFileId: null,
    chapterOneCompleted: false, chapterOneCompletedAt: null, chapterEndingPlayed: false,
    currentUrl: url, history: [url], historyIndex: 0, refreshToken: 0, addressGlitchActive: false, chapterEndingVisible: false,
    chapterTwoStarted: false, chapterTwoCompleted: false, chapterTwoCompletedAt: null, chapterTwoEndingPlayed: false, searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: false, revealedFileSections: [], chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false, chapterThreeEndingVisible: false, chapterFourEndingVisible: false,
  }
  writeSave(state)
}

describe('双账号与权限', () => {
  it('林默与周寻均可登录，错误密码失败', async () => {
    const user = userEvent.setup()
    seedSave(null, [], [], 'stu.qiming-high.edu.cn/login')
    render(<GameProvider><StudentSite route={parseGameUrl('stu.qiming-high.edu.cn/login')} onNavigate={() => undefined} captchaGenerator={() => '7314'} /></GameProvider>)
    expect(screen.getByRole('option', { name: '2024010307（林默）' })).toBeInTheDocument()
    expect(screen.getByLabelText('密码')).toHaveValue('******')
    await user.type(screen.getByLabelText('验证码'), '1111'); await user.click(screen.getByRole('button', { name: /登.*录/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('登录失败')
    const refreshedCaptcha = screen.getByRole('button', { name: '刷新验证码' }).textContent ?? ''
    await user.type(screen.getByLabelText('验证码'), refreshedCaptcha); await user.click(screen.getByRole('button', { name: /登.*录/ }))
    expect(screen.getByText(/欢迎登录，林默/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '退出登录' }))
    await user.click(screen.getByRole('button', { name: '使用其他账号' }))
    await user.type(screen.getByLabelText('学号'), '2024010312'); await user.type(screen.getByLabelText('密码'), 'ZX0913'); await user.type(screen.getByLabelText('验证码'), '7314'); await user.click(screen.getByRole('button', { name: /登.*录/ }))
    expect(screen.getByText(/欢迎登录，周寻/)).toBeInTheDocument()
    await waitFor(() => expect(readSave()?.tabs.find((tab) => tab.id === 'student-1')?.studentSession?.accountId).toBe('zhou_xun'))
    expect(readSave()?.savedStudentAccounts.map((account) => account.accountId)).toContain('zhou_xun')
  })

  it('林默不能查看周寻详细学籍', () => {
    seedSave('lin_mo', [], [], 'stu.qiming-high.edu.cn/student-status')
    render(<GameProvider><StudentSite route={parseGameUrl('stu.qiming-high.edu.cn/student-status')} onNavigate={() => undefined} /></GameProvider>)
    expect(screen.getByText('在籍')).toBeInTheDocument()
    expect(screen.getByText(/不能查看其他学生的详细学籍/)).toBeInTheDocument()
    expect(screen.queryByText('2026-09-12')).not.toBeInTheDocument()
  })

  it('林默旧消息包含账号信息，打开后发现 zhou_credentials', async () => {
    const user = userEvent.setup(); seedSave('lin_mo', [], [], 'stu.qiming-high.edu.cn/messages')
    render(<GameProvider><StudentSite route={parseGameUrl('stu.qiming-high.edu.cn/messages')} onNavigate={() => undefined} /></GameProvider>)
    expect(screen.queryByText('你看到公告了吧')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /先替我保管一下/ }))
    expect(screen.getByText(/2024010312/)).toBeInTheDocument()
    await waitFor(() => expect(readSave()?.clues.zhou_credentials.discovered).toBe(true))
  })

  it('周寻账号显示自己的退学状态、异常考勤和校园卡记录', async () => {
    const user = userEvent.setup(); seedSave('zhou_xun', [], [], 'stu.qiming-high.edu.cn/student-status')
    const { rerender } = render(<GameProvider><StudentSite route={parseGameUrl('stu.qiming-high.edu.cn/student-status')} onNavigate={() => undefined} /></GameProvider>)
    expect(screen.getByText('2026-09-12')).toBeInTheDocument()
    rerender(<GameProvider><StudentSite route={parseGameUrl('stu.qiming-high.edu.cn/attendance')} onNavigate={() => undefined} /></GameProvider>)
    await user.click(screen.getByRole('button', { name: /查看异常日期/ }))
    expect(screen.getByText(/退学生效日期之后/)).toBeInTheDocument()
    rerender(<GameProvider><StudentSite route={parseGameUrl('stu.qiming-high.edu.cn/card-records')} onNavigate={() => undefined} /></GameProvider>)
    expect(screen.getByText('实验楼自动售货机')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '查看记录' }))
    expect(screen.getByText(/LAB-VM-02/)).toBeInTheDocument()
  })

  it('周寻草稿只存在于周寻账号且标明未发送', async () => {
    const user = userEvent.setup(); seedSave('zhou_xun', ['zhou_credentials', 'student_status_dropout', 'attendance_after_dropout', 'photo_after_dropout'], [], 'stu.qiming-high.edu.cn/messages')
    render(<GameProvider><StudentSite route={parseGameUrl('stu.qiming-high.edu.cn/messages')} onNavigate={() => undefined} /></GameProvider>)
    await user.click(screen.getByRole('button', { name: /你看到公告了吧/ }))
    expect(screen.getByText('状态：草稿 · 未发送')).toBeInTheDocument()
    await waitFor(() => expect(readSave()?.clues.zhou_message.discovered).toBe(true))
  })
})

describe('虚拟文件与剧情', () => {
  it('普通 TXT 由虚拟查看器打开且不存在下载链接', async () => {
    const user = userEvent.setup(); seedSave('lin_mo', [], [], 'stu.qiming-high.edu.cn/downloads')
    const { container } = render(<GameProvider><StudentSite route={parseGameUrl('stu.qiming-high.edu.cn/downloads')} onNavigate={() => undefined} /></GameProvider>)
    await user.click(screen.getAllByRole('button', { name: '打开' })[2])
    expect(screen.getByText('文件预览')).toBeInTheDocument()
    expect(container).toHaveTextContent(/07:20\s+晨检/)
    expect(container.querySelector('a[download]')).toBeNull()
  })

  it('调查备份错误密码失败，0726 打开 readme 并发现沈栀', async () => {
    const user = userEvent.setup(); seedSave('zhou_xun', [], [BACKUP_FILE_ID], 'stu.qiming-high.edu.cn/downloads')
    render(<GameProvider><StudentSite route={parseGameUrl('stu.qiming-high.edu.cn/downloads')} onNavigate={() => undefined} /></GameProvider>)
    await user.click(screen.getByRole('button', { name: '解锁' }))
    const input = screen.getByLabelText('调查备份密码')
    await user.type(input, '1111'); await user.click(screen.getByRole('button', { name: '解锁并打开' }))
    expect(screen.getByRole('alert')).toHaveTextContent('密码不正确')
    await user.clear(input); await user.type(input, '0726'); await user.click(screen.getByRole('button', { name: '解锁并打开' }))
    expect(screen.getByText(/关键词：沈栀/)).toBeInTheDocument()
    await waitFor(() => expect(readSave()?.chapterOneCompleted).toBe(true))
  })

  it('官网公告和相对坐标照片热点仍能发现线索', async () => {
    const user = userEvent.setup(); seedSave(null)
    const { rerender } = render(<GameProvider><SchoolSite route={parseGameUrl('www.qiming-high.edu.cn/notices/student-status-change')} onNavigate={() => undefined} /></GameProvider>)
    await waitFor(() => expect(readSave()?.clues.dropout_notice.discovered).toBe(true))
    rerender(<GameProvider><SchoolSite route={parseGameUrl('www.qiming-high.edu.cn/news/lab-safety')} onNavigate={() => undefined} /></GameProvider>)
    await user.click(screen.getByRole('button', { name: '放大查看实验室安全教育活动合照' }))
    await user.click(screen.getByRole('button', { name: '查看右后方背深蓝书包的学生' }))
    await waitFor(() => expect(readSave()?.clues.photo_after_dropout.discovered).toBe(true))
  })
})
