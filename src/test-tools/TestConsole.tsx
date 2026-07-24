import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { APP_VERSION, APP_VERSION_LABEL, PROJECT_CREATOR, SAVE_SCHEMA_VERSION } from '../config/app'
import { chapterThreeClueIds, chapterTwoClueIds, clueDefinitions } from '../data/story'
import { SAVE_KEY } from '../game/constants'
import { useGame } from '../game/GameContext'
import { createSave, writeSave } from '../game/storage'
import type { ChapterOneClueId, ClueId, StudentAccountId, TabId } from '../types/game'
import { createFeedbackText, exportSaveText, importSaveText } from './testTools'

const chapterOneClueIds: ChapterOneClueId[] = [
  'dropout_notice', 'zhou_credentials', 'student_status_dropout', 'attendance_after_dropout',
  'photo_after_dropout', 'card_record_old_building', 'old_building_closed', 'zhou_message',
  'investigation_backup', 'shenzhi_name',
]

interface Props { onExitTestMode: () => void }

export function TestConsole({ onExitTestMode }: Props) {
  const game = useGame()
  const {
    state, activeTab, navigate, openStudentTab, focusSchoolTab, loginStudent, logoutStudent,
    addSavedAccount, removeSavedAccount, discoverClue, clearClue, forceEvent, resetChapterOne,
    resetChapterTwo, resetGame, revealFileSection, setEvidenceSidebarCollapsed,
    beginChapterEnding, playChapterTwoEnding, startGame,
  } = game
  const [open, setOpen] = useState(false)
  const [saveText, setSaveText] = useState('')
  const [importText, setImportText] = useState('')
  const [message, setMessage] = useState('')
  const [nickname, setNickname] = useState('')
  const [severity, setSeverity] = useState('一般')
  const [description, setDescription] = useState('')

  const discoveredCount = Object.values(state.clues).filter((clue) => clue.discovered).length
  const chapterLabel = state.revealedFileSections.includes('chapter-three-final-read') ? '第三章调查完成'
    : state.triggeredEvents.includes('chapter_three_started') ? '第三章调查中'
      : state.chapterTwoCompleted ? '第二章已完成'
        : state.chapterTwoStarted ? '第二章调查中'
          : state.chapterOneCompleted ? '第一章已完成'
            : state.isStarted ? '第一章调查中' : '尚未开始'
  const safeRawState = useMemo(() => createSave(state), [state])
  const feedbackText = useMemo(() => createFeedbackText({
    nickname,
    page: activeTab.currentUrl,
    chapter: chapterLabel,
    discoveredClues: discoveredCount,
    severity,
    description,
    browser: window.navigator.userAgent,
  }), [nickname, activeTab.currentUrl, chapterLabel, discoveredCount, severity, description])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  const confirmAction = (prompt: string, action: () => void) => {
    if (window.confirm(prompt)) action()
  }
  const copyText = async (text: string, success: string) => {
    try {
      await window.navigator.clipboard.writeText(text)
      setMessage(success)
    } catch {
      setMessage('复制失败，请从文本框中手动复制。')
    }
  }
  const openAccountPage = (accountId: StudentAccountId, url: string) => {
    navigate(url)
    loginStudent(accountId)
    navigate(url)
  }
  const toggleClue = (id: ClueId) => state.clues[id].discovered ? clearClue(id) : discoverClue(id)
  const submitImport = (event: FormEvent) => {
    event.preventDefault()
    const result = importSaveText(importText)
    if (!result.ok) {
      setMessage(result.error)
      return
    }
    confirmAction('导入将覆盖当前进度，确定继续吗？', () => {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(result.save))
      setMessage('存档导入成功，正在重新载入。')
      window.location.reload()
    })
  }
  const exit = onExitTestMode

  if (!open) return <button className="test-console-trigger" type="button" onClick={() => setOpen(true)} aria-label="打开测试控制台">TEST</button>

  return (
    <div className="test-console-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
      <aside className="test-console" data-test-tools="QIMING_PUBLIC_TEST_TOOLS" role="dialog" aria-modal="true" aria-labelledby="test-console-title">
        <header>
          <div><span>PUBLIC TEST</span><h2 id="test-console-title">测试控制台</h2></div>
          <div><button type="button" onClick={exit}>退出测试模式</button><button type="button" aria-label="关闭测试控制台" onClick={() => setOpen(false)}>×</button></div>
        </header>
        <p className="test-console-warning">公开测试工具中的操作可能改变本地存档。重置、覆盖与完成章节前会再次确认。</p>
        {message && <p className="test-console-message" role="status">{message}</p>}

        <section>
          <h3>当前状态</h3>
          <dl className="test-status-grid">
            <div><dt>应用版本</dt><dd>{APP_VERSION_LABEL} ({APP_VERSION})</dd></div>
            <div><dt>存档版本</dt><dd>v{SAVE_SCHEMA_VERSION}</dd></div>
            <div><dt>活动标签</dt><dd>{activeTab.id}</dd></div>
            <div><dt>当前网址</dt><dd>{activeTab.currentUrl}</dd></div>
            <div><dt>章节状态</dt><dd>{chapterLabel}</dd></div>
            <div><dt>第一章</dt><dd>{state.chapterOneCompleted ? '已完成' : state.isStarted ? '进行中' : '未开始'}</dd></div>
            <div><dt>第二章</dt><dd>{state.chapterTwoCompleted ? '已完成' : state.chapterTwoStarted ? '进行中' : '未开始'}</dd></div>
            <div><dt>第三章</dt><dd>{state.revealedFileSections.includes('chapter-three-final-read') ? '已完成' : state.triggeredEvents.includes('chapter_three_started') ? '进行中' : '未开始'}</dd></div>
            <div><dt>线索 / 事件</dt><dd>{discoveredCount} / {state.triggeredEvents.length}</dd></div>
            <div><dt>保存账号</dt><dd>{state.savedStudentAccounts.map((account) => account.displayName).join('、') || '无'}</dd></div>
            <div><dt>关键事实侧栏</dt><dd>{state.evidenceSidebarCollapsed ? '已收起' : '已展开'}</dd></div>
          </dl>
          <div className="test-tab-summary">{state.tabs.map((tab) => <div key={tab.id}><strong>{tab.id}</strong><span>{tab.currentUrl}</span><b>{tab.studentSession?.accountId ?? (tab.siteType === 'school' ? '学校官网' : '未登录')}</b></div>)}</div>
          <details><summary>查看原始状态</summary><pre>{JSON.stringify(safeRawState, null, 2)}</pre></details>
        </section>

        <section>
          <h3>标签与页面</h3>
          <div className="test-action-grid">
            <button type="button" onClick={focusSchoolTab}>打开或聚焦学校官网</button>
            <button type="button" onClick={openStudentTab}>新建学生系统标签</button>
            <button type="button" onClick={() => openAccountPage('lin_mo', 'stu.qiming-high.edu.cn/messages')}>林默消息中心</button>
            <button type="button" onClick={() => openAccountPage('zhou_xun', 'stu.qiming-high.edu.cn/student-status')}>周寻学籍信息</button>
            <button type="button" onClick={() => openAccountPage('zhou_xun', 'stu.qiming-high.edu.cn/attendance')}>周寻考勤</button>
            <button type="button" onClick={() => openAccountPage('lin_mo', 'stu.qiming-high.edu.cn/class-list')}>班级历史名单</button>
            <button type="button" onClick={() => openAccountPage('lin_mo', 'stu.qiming-high.edu.cn/class-group-history')}>班级群历史</button>
            <button type="button" onClick={() => navigate('www.qiming-high.edu.cn/search/%E6%B2%88%E6%A0%80')}>官网站内搜索</button>
            <button type="button" onClick={() => navigate('www.qiming-high.edu.cn/news/future-self-essay')}>征文新闻</button>
            <button type="button" onClick={() => navigate('www.qiming-high.edu.cn/news/old-lab-equipment-sorting')}>实验器材整理新闻</button>
            <button type="button" onClick={() => openAccountPage('zhou_xun', 'stu.qiming-high.edu.cn/student-status/cache')}>学籍历史缓存</button>
            <button type="button" onClick={() => openAccountPage('zhou_xun', 'stu.qiming-high.edu.cn/access-query')}>门禁记录查询</button>
            <button type="button" onClick={() => navigate('www.qiming-high.edu.cn/services/laboratory/duty-june-2026')}>第三章值班安排</button>
            <button type="button" onClick={() => openAccountPage('zhou_xun', 'stu.qiming-high.edu.cn/lab-access-records')}>第三章访问记录</button>
            <button type="button" onClick={() => navigate('www.qiming-high.edu.cn/news/campus-security-system-upgrade')}>系统升级新闻</button>
            <button type="button" onClick={() => openAccountPage('zhou_xun', 'stu.qiming-high.edu.cn/downloads')}>周寻文件区</button>
          </div>
        </section>

        <section>
          <h3>账号与独立会话</h3>
          <div className="test-action-grid">
            <button type="button" onClick={() => addSavedAccount('lin_mo')}>保存林默账号</button>
            <button type="button" onClick={() => addSavedAccount('zhou_xun')}>保存周寻账号</button>
            <button type="button" onClick={() => removeSavedAccount('zhou_xun')}>移除已保存的周寻</button>
          </div>
          <div className="test-session-list">{state.tabs.filter((tab) => tab.siteType === 'student').map((tab) => (
            <div key={tab.id}>
              <span><strong>{tab.id}</strong> · {tab.studentSession?.accountId ?? '未登录'}</span>
              <button type="button" onClick={() => loginStudent('lin_mo', tab.id)}>登录林默</button>
              <button type="button" onClick={() => loginStudent('zhou_xun', tab.id)}>登录周寻</button>
              <button type="button" onClick={() => logoutStudent(tab.id)}>退出</button>
            </div>
          ))}</div>
        </section>

        <ClueSection title="第一章测试" ids={chapterOneClueIds} state={state} onToggle={toggleClue}>
          <button type="button" onClick={startGame}>开始第一章</button>
          <button type="button" onClick={() => discoverClue('zhou_credentials')}>解锁周寻账号凭据</button>
          <button type="button" onClick={() => forceEvent('investigation_backup_unlocked')}>解锁调查备份</button>
          <button type="button" onClick={() => confirmAction('确定标记第一章完成吗？', () => forceEvent('chapter_one_completed'))}>标记第一章完成</button>
          <button type="button" onClick={() => { forceEvent('chapter_one_completed'); beginChapterEnding() }}>播放第一章结尾</button>
          <button type="button" className="danger" onClick={() => confirmAction('确定清除第一章及后续章节进度吗？', resetChapterOne)}>重置第一章</button>
        </ClueSection>

        <ClueSection title="第二章测试" ids={chapterTwoClueIds} state={state} onToggle={toggleClue}>
          <button type="button" onClick={() => forceEvent('chapter_two_started')}>开始第二章</button>
          <button type="button" onClick={() => discoverClue('class_size_mismatch')}>标记人数核对完成</button>
          <button type="button" onClick={() => discoverClue('seat_chart_shenzhi')}>标记座位恢复完成</button>
          <button type="button" onClick={() => discoverClue('hidden_grade_row')}>标记成绩隐藏行显示</button>
          <button type="button" onClick={() => discoverClue('shenzhi_essay')}>标记征文属性查看</button>
          <button type="button" onClick={() => discoverClue('shenzhi_removed_from_group')}>标记群历史记录确认</button>
          <button type="button" onClick={() => discoverClue('shenzhi_dropout_backdated')}>标记学籍日期比对完成</button>
          <button type="button" onClick={() => revealFileSection('access-query-enter')}>注入门禁进入结果</button>
          <button type="button" onClick={() => revealFileSection('access-query-exit')}>注入门禁离开结果</button>
          <button type="button" onClick={() => discoverClue('shenzhi_exit_missing')}>标记门禁比对完成</button>
          <button type="button" onClick={() => forceEvent('chapter_two_final_file_unlocked')}>解锁最后记录</button>
          <button type="button" onClick={() => confirmAction('确定标记第二章完成吗？', () => forceEvent('chapter_two_completed'))}>标记第二章完成</button>
          <button type="button" onClick={playChapterTwoEnding}>播放第二章结尾</button>
          <button type="button" className="danger" onClick={() => confirmAction('确定清除第二章全部进度吗？第一章完成状态会保留。', resetChapterTwo)}>重置第二章</button>
        </ClueSection>

        <ClueSection title="第三章测试" ids={chapterThreeClueIds} state={state} onToggle={toggleClue}>
          <button type="button" onClick={() => forceEvent('chapter_three_started')}>开启第三章</button>
          <button type="button" onClick={() => forceEvent('chapter_three_final_unlocked')}>解锁最终备份</button>
        </ClueSection>

        <section>
          <h3>存档工具</h3>
          <div className="test-action-grid">
            <button type="button" onClick={() => { writeSave(state); setMessage('当前状态已保存。') }}>保存当前状态</button>
            <button type="button" onClick={() => window.location.reload()}>重新读取存档</button>
            <button type="button" className="danger" onClick={() => confirmAction('确定完整重置游戏吗？此操作会清除全部进度。', resetGame)}>重置完整游戏</button>
            <button type="button" onClick={() => { const text = exportSaveText(state); setSaveText(text); setMessage('已生成存档文本。') }}>导出存档</button>
            <button type="button" onClick={() => copyText(saveText || exportSaveText(state), '存档文本已复制。')}>复制存档文本</button>
            <button type="button" onClick={() => setEvidenceSidebarCollapsed(!state.evidenceSidebarCollapsed)}>切换关键事实侧栏</button>
          </div>
          <label className="test-textarea-label">导出内容<textarea aria-label="导出存档文本" readOnly value={saveText} placeholder="点击“导出存档”生成 JSON" /></label>
          <form onSubmit={submitImport}>
            <label className="test-textarea-label">导入内容<textarea aria-label="导入存档文本" value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="在此粘贴 JSON 存档" /></label>
            <button type="submit">验证并导入存档</button>
          </form>
        </section>

        <section>
          <h3>测试反馈文本</h3>
          <div className="test-feedback-fields">
            <label>测试人员昵称（可选）<input value={nickname} onChange={(event) => setNickname(event.target.value)} /></label>
            <label>严重程度<select value={severity} onChange={(event) => setSeverity(event.target.value)}><option>轻微</option><option>一般</option><option>严重</option><option>阻塞</option></select></label>
            <label className="wide">问题描述<textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label>
          </div>
          <textarea aria-label="测试反馈文本" readOnly value={feedbackText} />
          <button type="button" onClick={() => copyText(feedbackText, '反馈文本已复制。')}>复制反馈文本</button>
          <p className="test-credit-line">项目创建者：{PROJECT_CREATOR}</p>
        </section>
      </aside>
    </div>
  )
}

function ClueSection({
  title, ids, state, onToggle, children,
}: {
  title: string
  ids: ClueId[]
  state: ReturnType<typeof useGame>['state']
  onToggle: (id: ClueId) => void
  children: ReactNode
}) {
  return <section><h3>{title}</h3><div className="test-action-grid">{children}</div><details><summary>逐条发现或清除线索</summary><ul className="test-clue-list">{ids.map((id) => <li key={id}><span>{clueDefinitions[id].title}</span><code>{id}</code><button type="button" onClick={() => onToggle(id)}>{state.clues[id].discovered ? '清除' : '发现'}</button></li>)}</ul></details></section>
}
