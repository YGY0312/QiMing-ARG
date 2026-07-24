import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SchoolSite } from './school/SchoolSite'
import { StudentSite } from './student/StudentSite'
import { BrowserShell } from '../browser/BrowserShell'
import { GameProvider } from '../game/GameContext'
import { parseGameUrl } from '../game/router'
import { LAB_SAFETY_GROUP_PHOTO } from '../data/imageAssets'
import { createEmptyClues } from '../data/story'
import { OLD_BUILDING_ACCESS_FILE_ID, SHENZHI_CACHE_FILE_ID } from '../game/constants'
import { createDefaultSavedAccounts } from '../game/savedAccounts'
import { createStudentAccountStates, writeSave } from '../game/storage'
import { createSchoolTab, createStudentTab } from '../game/tabs'
import type { GameState, StudentAccountId } from '../types/game'

function makeStudentState(accountId: StudentAccountId, url: string, unlockedFileIds: string[] = []): GameState {
  const school = createSchoolTab()
  const student = createStudentTab(url, [url], 0, 'student-1', accountId)
  return {
    isStarted: true, hasSave: true, tabs: [school, student], activeTabId: student.id,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [url], clues: createEmptyClues(), triggeredEvents: ['chapter_one_completed', 'chapter_two_started'],
    unreadMessageIds: [], readMessageIds: [], unlockedFileIds,
    chapterOneCompleted: true, chapterOneCompletedAt: '2026-06-01', chapterEndingPlayed: true,
    chapterTwoStarted: true, chapterTwoCompleted: false, chapterTwoCompletedAt: null, chapterTwoEndingPlayed: false,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: false, revealedFileSections: [],
    studentTabCaptchas: {}, currentUrl: url, history: [url], historyIndex: 0, refreshToken: 0, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false, chapterThreeEndingVisible: false,
  }
}

function StudentRouteHarness({ initialUrl }: { initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl)
  return <StudentSite route={parseGameUrl(url)} onNavigate={setUrl} />
}

describe('站点交互语义', () => {
  it('学校官网不可点击栏目不是链接或按钮', () => {
    render(<SchoolSite route={parseGameUrl('www.qiming-high.edu.cn/')} onNavigate={() => undefined} />)
    expect(screen.getByText('学校概况').tagName).toBe('SPAN')
    expect(screen.queryByRole('button', { name: '学校概况' })).not.toBeInTheDocument()
  })

  it('新闻列表可以打开对应详情', async () => {
    const user = userEvent.setup(); const navigate = vi.fn()
    render(<SchoolSite route={parseGameUrl('www.qiming-high.edu.cn/news')} onNavigate={navigate} />)
    await user.click(screen.getByRole('button', { name: /我校举行新学期升旗仪式/ }))
    expect(navigate).toHaveBeenCalledWith('www.qiming-high.edu.cn/news/flag-raising-ceremony')
  })

  it('学生系统不可点击菜单项保持为占位文本', () => {
    localStorage.setItem('campus_arg_save_v1', JSON.stringify({ schemaVersion: 1, prototypeVersion: 'test', isStarted: true, currentUrl: 'stu.qiming-high.edu.cn/dashboard', history: ['stu.qiming-high.edu.cn/dashboard'], historyIndex: 0, studentLoggedIn: true, visitedPages: [], savedAt: new Date().toISOString() }))
    render(<GameProvider><StudentSite route={parseGameUrl('stu.qiming-high.edu.cn/dashboard')} onNavigate={() => undefined} /></GameProvider>)
    expect(screen.getByText('成绩查询').tagName).toBe('SPAN')
    expect(screen.queryByRole('button', { name: /成绩查询/ })).not.toBeInTheDocument()
  })
})

describe('双标签浏览器', () => {
  it('初始只有官网标签，每次入口点击都创建新的学生标签', async () => {
    const user = userEvent.setup()
    render(<GameProvider><BrowserShell /></GameProvider>)
    expect(screen.getAllByRole('tab')).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: /学生信息系统.*Student Information System/ }))
    expect(screen.getAllByRole('tab')).toHaveLength(2)
    await user.click(screen.getAllByRole('tab')[0])
    await user.click(screen.getByRole('button', { name: /学生信息系统.*Student Information System/ }))
    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getAllByRole('tab')[2]).toHaveAttribute('aria-selected', 'true')
  })

  it('学生标签可关闭并重新打开，官网主标签不可关闭', async () => {
    const user = userEvent.setup()
    render(<GameProvider><BrowserShell /></GameProvider>)
    await user.click(screen.getByRole('button', { name: /学生信息系统.*Student Information System/ }))
    expect(screen.getAllByRole('button', { name: /关闭.*标签/ })).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: /关闭.*标签/ }))
    expect(screen.getAllByRole('tab')).toHaveLength(1)
    expect(screen.queryByRole('button', { name: /关闭.*标签/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /学生信息系统.*Student Information System/ }))
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })
})

describe('图片资源登记', () => {
  it('实验室合照包含稳定文件名、剧情描述和相对坐标热点', () => {
    expect(LAB_SAFETY_GROUP_PHOTO).toMatchObject({ id: 'lab_safety_group_photo_20260913', placeholderFile: 'lab_safety_group_photo_20260913.placeholder.svg', finalFile: 'lab_safety_group_photo_20260913.webp', replacementStatus: 'placeholder' })
    expect(LAB_SAFETY_GROUP_PHOTO.narrativePurpose).toContain('2026年9月13日')
    expect(Object.values(LAB_SAFETY_GROUP_PHOTO.hotspots.zhou_xun).every((value) => value >= 0 && value <= 1)).toBe(true)
  })
})

describe('第二章学生系统回归', () => {
  it('周寻账号的学籍历史缓存显示周寻', () => {
    const url = 'stu.qiming-high.edu.cn/student-status/cache'
    writeSave(makeStudentState('zhou_xun', url, [SHENZHI_CACHE_FILE_ID]))
    render(<GameProvider><StudentRouteHarness initialUrl={url} /></GameProvider>)
    const nameRow = screen.getByText('姓名').closest('div')
    expect(nameRow?.querySelector('dd')?.textContent).toBe('周寻')
  })

  it('离开班级群历史后详情临时状态会清空', async () => {
    const user = userEvent.setup()
    const url = 'stu.qiming-high.edu.cn/class-group-history'
    writeSave(makeStudentState('lin_mo', url))
    render(<GameProvider><StudentRouteHarness initialUrl={url} /></GameProvider>)
    await user.type(screen.getByLabelText('成员姓名'), '沈栀')
    await user.click(screen.getByRole('button', { name: '查询' }))
    await user.click(screen.getByRole('button', { name: '查看操作详情' }))
    expect(screen.getByText('管理员')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /首页/ }))
    expect(screen.queryByText('管理员')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /班级群历史/ }))
    expect(screen.queryByText('管理员')).not.toBeInTheDocument()
  })

  it('门禁进入和离开查询依次登记并自动确认异常', async () => {
    const user = userEvent.setup()
    const url = 'stu.qiming-high.edu.cn/access-query'
    writeSave(makeStudentState('zhou_xun', url, [OLD_BUILDING_ACCESS_FILE_ID]))
    render(<GameProvider><StudentRouteHarness initialUrl={url} /></GameProvider>)
    await user.selectOptions(screen.getByLabelText('类型'), '进入')
    await user.click(screen.getByRole('button', { name: '查询' }))
    expect(screen.getByText('已查询：进入')).toBeInTheDocument()
    expect(screen.queryByText('门禁异常已确认')).not.toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('类型'), '离开')
    await user.click(screen.getByRole('button', { name: '查询' }))
    expect(screen.getByText('已查询：进入、离开')).toBeInTheDocument()
    expect(screen.getByText('门禁异常已确认')).toBeInTheDocument()
  })
})
