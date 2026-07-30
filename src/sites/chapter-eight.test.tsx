import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { BrowserShell } from '../browser/BrowserShell'
import { chapterEightClueIds, createEmptyClues } from '../data/story'
import { CHAPTER_EIGHT_BACKUP_FILE_ID, CHAPTER_EIGHT_FINAL_FILE_ID, SAVE_KEY } from '../game/constants'
import { GameProvider } from '../game/GameContext'
import { createDefaultSavedAccounts } from '../game/savedAccounts'
import { createSave, createStudentAccountStates, readSave } from '../game/storage'
import { createSchoolTab, createStudentTab } from '../game/tabs'
import type { GameState, StudentAccountId } from '../types/game'

function chapterEightState(accountId: StudentAccountId, url: string): GameState {
  const school = createSchoolTab()
  const student = createStudentTab(url, [url], 0, 'student-1', accountId)
  return {
    isStarted: true, hasSave: true, tabs: [school, student], activeTabId: student.id,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [], clues: createEmptyClues(),
    triggeredEvents: ['chapter_seven_external_backup_unlocked', 'chapter_seven_completed', 'chapter_eight_started'],
    unreadMessageIds: [], readMessageIds: [], unlockedFileIds: [CHAPTER_EIGHT_BACKUP_FILE_ID],
    chapterOneCompleted: true, chapterOneCompletedAt: '2026-01-01', chapterEndingPlayed: true,
    chapterTwoStarted: true, chapterTwoCompleted: true, chapterTwoCompletedAt: '2026-01-02', chapterTwoEndingPlayed: true,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: true, revealedFileSections: [],
    studentTabCaptchas: {}, currentUrl: url, history: [url], historyIndex: 0, refreshToken: 0, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
    chapterThreeEndingVisible: false, chapterFourEndingVisible: false, chapterFiveEndingVisible: false,
    chapterFiveSessionGlitchActive: false, chapterSixEndingVisible: false, chapterSixSyncGlitchActive: false,
    chapterSevenEndingVisible: false, chapterEightEndingVisible: false,
  }
}

function prepare(state: GameState) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(createSave(state)))
}

beforeEach(() => window.localStorage.clear())

describe('第八章页面与权限', () => {
  it('错误incident字段不开放，正确字段开放分层目录', async () => {
    const user = userEvent.setup()
    const state = chapterEightState('zhou_xun', 'archive.qm-node.local/EXT-BACKUP-QM-0616/incident/0616')
    prepare(state)
    render(<GameProvider><BrowserShell /></GameProvider>)
    await user.type(screen.getByLabelText('事件对象编号'), '2024010318')
    await user.type(screen.getByLabelText('事件日期'), '2026-06-17')
    await user.type(screen.getByLabelText('事件来源设备'), 'CAM-07')
    await user.click(screen.getByRole('button', { name: '校验事件记录' }))
    expect(screen.getByRole('alert')).toHaveTextContent('校验信息不一致')
    fireEvent.change(screen.getByLabelText('事件日期'), { target: { value: '2026-06-16' } })
    await user.click(screen.getByRole('button', { name: '校验事件记录' }))
    expect(await screen.findByRole('button', { name: /timeline/ })).toBeEnabled()
    expect(screen.getByRole('button', { name: /medical/ })).toBeDisabled()
    expect(readSave()?.triggeredEvents).toContain('chapter_eight_incident_unlocked')
  })

  it('林默无法访问incident深层且不会发现线索', () => {
    const state = chapterEightState('lin_mo', 'archive.qm-node.local/EXT-BACKUP-QM-0616/incident/0616/medical')
    state.triggeredEvents.push('chapter_eight_incident_unlocked', 'chapter_eight_medical_records_unlocked')
    prepare(state)
    render(<GameProvider><BrowserShell /></GameProvider>)
    expect(screen.getByText('当前会话没有读取该归档的关联权限。')).toBeInTheDocument()
    expect(readSave()?.clues.medical_identity_matched.discovered).toBe(false)
  })

  it('死亡结论需要先匹配身份再二次确认', async () => {
    const user = userEvent.setup()
    const state = chapterEightState('zhou_xun', 'archive.qm-node.local/EXT-BACKUP-QM-0616/incident/0616/medical')
    state.triggeredEvents.push('chapter_eight_incident_unlocked', 'chapter_eight_medical_records_unlocked')
    prepare(state)
    render(<GameProvider><BrowserShell /></GameProvider>)
    await user.type(screen.getByLabelText('医疗学生编号'), '2024010318')
    await user.type(screen.getByLabelText('医疗设备编号'), 'CAM-07')
    await user.type(screen.getByLabelText('医疗来源地点'), '旧实验楼')
    await user.click(screen.getByRole('button', { name: '确认身份匹配' }))
    expect(await screen.findByText('抢救无效死亡')).toBeInTheDocument()
    expect(readSave()?.clues.shenzhi_death_confirmed.discovered).toBe(false)
    await user.click(screen.getByRole('button', { name: '记录最终医疗结论' }))
    expect(screen.getByRole('dialog', { name: '确认最终医疗结论' })).toBeInTheDocument()
    await user.click(within(screen.getByRole('dialog', { name: '确认最终医疗结论' })).getByRole('button', { name: '取消' }))
    expect(readSave()?.clues.shenzhi_death_confirmed.discovered).toBe(false)
    await user.click(screen.getByRole('button', { name: '记录最终医疗结论' }))
    await user.click(within(screen.getByRole('dialog', { name: '确认最终医疗结论' })).getByRole('button', { name: '确认记录' }))
    await waitFor(() => expect(readSave()?.clues.shenzhi_death_confirmed.discovered).toBe(true))
  })

  it('最终备份打开不完成，关闭完成并显示一次结尾', async () => {
    const user = userEvent.setup()
    const state = chapterEightState('zhou_xun', 'stu.qiming-high.edu.cn/downloads')
    state.triggeredEvents.push('chapter_eight_incident_unlocked', 'chapter_eight_final_unlocked')
    state.unlockedFileIds.push(CHAPTER_EIGHT_FINAL_FILE_ID)
    for (const id of chapterEightClueIds.filter((id) => id !== 'june_sixteenth_summary')) {
      state.clues[id] = { ...state.clues[id], discovered: true, discoveredAt: '2026-09-15', sourceUrl: 'test' }
    }
    prepare(state)
    render(<GameProvider><BrowserShell /></GameProvider>)
    const row = screen.getByText('调查备份_07.txt', { selector: 'strong' }).closest('div')!
    await user.click(within(row).getByRole('button', { name: '打开' }))
    expect(readSave()?.triggeredEvents).toContain('chapter_eight_final_opened')
    expect(readSave()?.triggeredEvents).not.toContain('chapter_eight_completed')
    await user.click(screen.getByRole('button', { name: '关闭' }))
    expect(await screen.findByRole('dialog', { name: '第八章结束' })).toBeInTheDocument()
    expect(readSave()?.triggeredEvents).toContain('chapter_eight_completed')
    expect(readSave()?.clues.june_sixteenth_summary.discovered).toBe(true)
    await user.click(screen.getByRole('button', { name: '继续浏览' }))
    await user.click(within(screen.getByText('调查备份_07.txt', { selector: 'strong' }).closest('div')!).getByRole('button', { name: '打开' }))
    await user.click(screen.getByRole('button', { name: '关闭' }))
    expect(screen.queryByRole('dialog', { name: '第八章结束' })).not.toBeInTheDocument()
    expect(readSave()?.tabs[1].history.filter((url) => url.endsWith('/session/0914'))).toHaveLength(1)
  })
})
