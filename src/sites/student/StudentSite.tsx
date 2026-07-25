import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import type { GameRoute, StudentAccountId } from '../../types/game'
import { authenticateSavedStudent, authenticateStudent, generateCaptcha, generateDifferentCaptcha, getStudentAccount } from '../../utils/auth'
import { formatSavedAccountLabel } from '../../game/savedAccounts'
import { useGame } from '../../game/GameContext'
import { BACKUP_FILE_ID, CHAPTER_FOUR_BACKUP_FILE_ID, CHAPTER_FOUR_FINAL_FILE_ID, CHAPTER_THREE_BACKUP_FILE_ID, CHAPTER_THREE_FINAL_FILE_ID, CHAPTER_TWO_FINAL_FILE_ID, GUYAN_DRAFT_MESSAGE_ID, OLD_BUILDING_ACCESS_FILE_ID, SHENZHI_CACHE_FILE_ID, ZHOU_CREDENTIALS_MESSAGE_ID, ZHOU_MESSAGE_ID } from '../../game/constants'
import { isBackupPasswordValid } from '../../game/story'
import { ModalFrame } from '../../components/ModalFrame'
import { VirtualFileViewer } from '../../components/VirtualFileViewer'
import { getVirtualFile } from '../../data/virtualFiles'
import { attendanceRecords, baseDownloads, baseMessages, cardRecords, classStudents, zhouAttendanceRecord, zhouCardRecord } from '../../data/studentRecords'
import { checkedAccessDirection, classHistoryViews, filterAccessRecords, filterGroupHistory, groupHistoryRecords, isBackdatedDatePair, statusCacheProfile, statusDateFields, type AccessDirection, type AccessPerson, type AccessQuery, type ClassHistoryPeriod, type StatusDateKey } from '../../data/chapterTwoInteractions'
import {
  isChapterThreeAccessQuery,
  queryCameraExceptions,
  queryEquipmentLoans,
  queryLaboratoryAccessRecords,
  queryLaboratoryReservations,
} from '../../data/chapterThree'
import { isAdminReferenceQuery, queryAdminHistory, type AdminHistoryResult } from '../../data/chapterFour'

interface Props {
  route: GameRoute
  onNavigate: (url: string) => void
  onReturnSchoolTab?: () => void
  captchaGenerator?: () => string
}

const activeMenu = [
  ['系统首页', 'dashboard'], ['学籍信息', 'student-status'], ['考勤记录', 'attendance'], ['校园卡记录', 'card-records'],
  ['班级名单', 'class-list'], ['消息中心', 'messages'], ['文件中心', 'downloads'],
] as const
const inactiveMenu = ['成绩查询', '选课管理', '宿舍管理', '奖助学金', '社团活动', '体育测试', '教学评价']

export function StudentSite({ route, onNavigate, onReturnSchoolTab, captchaGenerator }: Props) {
  const { activeTab } = useGame()
  const accountId = activeTab.studentSession?.accountId ?? null
  const wantsLogin = route.componentKey === 'student-login' || route.componentKey === 'student-entry'
  if (!accountId) return <StudentLogin onNavigate={onNavigate} onReturnSchoolTab={onReturnSchoolTab} captchaGenerator={captchaGenerator} />
  const effectiveRoute = wantsLogin
    ? { ...route, pathname: '/dashboard', pageTitle: '系统首页 - 学生信息系统', componentKey: 'student-dashboard' as const }
    : route
  return <StudentSystem route={effectiveRoute} onNavigate={onNavigate} onReturnSchoolTab={onReturnSchoolTab} />
}

function StudentLogin({ onNavigate, onReturnSchoolTab, captchaGenerator }: Pick<Props, 'onNavigate' | 'onReturnSchoolTab' | 'captchaGenerator'>) {
  const { state, activeTab, loginStudent, setStudentTabCaptcha } = useGame()
  const initialSavedId = state.savedStudentAccounts.find((account) => account.accountId === 'lin_mo')?.accountId
    ?? state.savedStudentAccounts[0]?.accountId ?? ''
  const [mode, setMode] = useState<'saved' | 'manual'>(initialSavedId ? 'saved' : 'manual')
  const [selectedAccountId, setSelectedAccountId] = useState(initialSavedId)
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [error, setError] = useState('')
  const currentCaptcha = state.studentTabCaptchas[activeTab.id] ?? ''
  const makeCaptcha = useCallback(() => captchaGenerator?.() ?? generateCaptcha(), [captchaGenerator])

  useEffect(() => {
    if (!currentCaptcha) setStudentTabCaptcha(activeTab.id, makeCaptcha())
  }, [activeTab.id, currentCaptcha, makeCaptcha, setStudentTabCaptcha])

  useEffect(() => {
    if (selectedAccountId && state.savedStudentAccounts.some((account) => account.accountId === selectedAccountId)) return
    const next = state.savedStudentAccounts.find((account) => account.accountId === 'lin_mo')?.accountId
      ?? state.savedStudentAccounts[0]?.accountId ?? ''
    setSelectedAccountId(next)
    if (!next) setMode('manual')
  }, [selectedAccountId, state.savedStudentAccounts])

  const refreshCaptcha = () => {
    const next = captchaGenerator ? captchaGenerator() : generateDifferentCaptcha(currentCaptcha)
    setStudentTabCaptcha(activeTab.id, next === currentCaptcha ? generateDifferentCaptcha(currentCaptcha, () => 0) : next)
    setCaptchaInput('')
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const accountId = mode === 'saved'
      ? authenticateSavedStudent(selectedAccountId, captchaInput, currentCaptcha)
      : authenticateStudent(studentId, password, captchaInput, currentCaptcha)
    if (!accountId) {
      setError(mode === 'saved' ? '登录失败：验证码不正确。' : '登录失败：学号、密码或验证码不正确。')
      refreshCaptcha()
      return
    }
    setError('')
    setCaptchaInput('')
    loginStudent(accountId, activeTab.id)
  }

  return (
    <div className="student-login-page">
      <header><div className="system-logo">QM</div><div><h1>启明市第一中学</h1><p>学生信息系统</p></div></header>
      <main>
        <section className="login-notice"><span className="login-grid-icon" aria-hidden="true">▦</span><h2>学生综合信息服务</h2><p>用于查询学籍、考勤、校园卡及校内通知等信息。</p><ul><li>请妥善保管个人账号信息</li><li>离开公共计算机前请退出登录</li><li>系统数据仅供校内使用</li></ul></section>
        <section className="login-card">
          <h2>用户登录</h2><p className="login-card-sub">STUDENT LOGIN</p>
          <form onSubmit={submit}>
            {mode === 'saved' ? <>
              <label>账号<select aria-label="账号" value={selectedAccountId} onChange={(event) => setSelectedAccountId(event.target.value)}>{state.savedStudentAccounts.map((account) => <option value={account.accountId} key={account.accountId}>{formatSavedAccountLabel(account)}</option>)}</select></label>
              <label>密码<input aria-label="密码" value="******" readOnly /></label>
            </> : <>
              <label>学号<input aria-label="学号" value={studentId} onChange={(event) => setStudentId(event.target.value)} autoComplete="username" /></label>
              <label>密码<input aria-label="密码" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
            </>}
            <label>验证码<div className="captcha-row"><input aria-label="验证码" inputMode="numeric" maxLength={8} value={captchaInput} onChange={(event) => setCaptchaInput(event.target.value)} /><button className="captcha-code" type="button" aria-label="刷新验证码" onClick={refreshCaptcha}>{currentCaptcha || '----'}</button></div></label>
            <button className="captcha-refresh" type="button" onClick={refreshCaptcha}>看不清，换一张</button>
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="login-submit" type="submit">登　录</button>
            {mode === 'saved'
              ? <button className="account-mode-toggle" type="button" onClick={() => { setMode('manual'); setError('') }}>使用其他账号</button>
              : state.savedStudentAccounts.length > 0 && <button className="account-mode-toggle" type="button" onClick={() => { setMode('saved'); setError('') }}>选择已保存账号</button>}
          </form>
        </section>
      </main>
      <footer><button type="button" onClick={() => onReturnSchoolTab ? onReturnSchoolTab() : onNavigate('www.qiming-high.edu.cn/')}>← 返回学校官网</button><span>启明市第一中学信息中心（虚构）</span></footer>
    </div>
  )
}

function StudentSystem({ route, onNavigate, onReturnSchoolTab }: Props) {
  const { state, activeTab, logoutStudent } = useGame()
  const accountId = activeTab.studentSession?.accountId ?? ''
  const account = getStudentAccount(accountId)
  if (!account) return <StudentLogin onNavigate={onNavigate} onReturnSchoolTab={onReturnSchoolTab} />
  const logout = () => logoutStudent(activeTab.id)
  return (
    <div className="student-system">
      <header className="student-topbar"><div className="student-system-brand"><span>QM</span><div><strong>学生信息系统</strong><small>启明市第一中学</small></div></div><div className="student-user"><span>{account.name}　{account.className}</span><button type="button" onClick={logout}>退出登录</button></div></header>
      <div className="student-shell">
        <aside className="student-sidebar">
          <div className="student-profile"><div>{account.name.slice(0, 1)}</div><strong>{account.name}</strong><span>{account.studentId}</span></div>
          <nav aria-label="学生系统功能菜单">
            {activeMenu.map(([label, path]) => <button className={route.pathname === `/${path}` ? 'active' : ''} key={path} type="button" onClick={() => onNavigate(`stu.qiming-high.edu.cn/${path}`)}><span aria-hidden="true">▪</span>{label}{path === 'messages' && messageUnreadCount(state, accountId) > 0 && <b className="menu-unread">{messageUnreadCount(state, accountId)}</b>}</button>)}
            {state.chapterTwoStarted && accountId === 'lin_mo' && <button className={route.pathname === '/class-group-history' ? 'active' : ''} type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/class-group-history')}><span aria-hidden="true">▪</span>班级群历史</button>}
            {accountId === 'zhou_xun' && state.unlockedFileIds.includes(OLD_BUILDING_ACCESS_FILE_ID) && <button className={route.pathname === '/access-query' ? 'active' : ''} type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/access-query')}><span aria-hidden="true">▪</span>门禁记录查询</button>}
            {accountId === 'zhou_xun' && state.clues.old_building_duty_record.discovered && <><span className="student-menu-section">调查资料</span>
              <button className={route.pathname === '/lab-reservations' ? 'active' : ''} type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/lab-reservations')}><span aria-hidden="true">▪</span>实验室使用申请</button>
              <button className={route.pathname === '/equipment-loans' ? 'active' : ''} type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/equipment-loans')}><span aria-hidden="true">▪</span>设备借用记录</button>
              <button className={route.pathname === '/lab-access-records' ? 'active' : ''} type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/lab-access-records')}><span aria-hidden="true">▪</span>实验楼访问记录</button>
              <button className={route.pathname === '/camera-exceptions' ? 'active' : ''} type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/camera-exceptions')}><span aria-hidden="true">▪</span>监控存储异常</button>
            </>}
            {state.triggeredEvents.includes('chapter_four_started') && <button className={route.pathname === '/system-search' ? 'active' : ''} type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/system-search')}><span aria-hidden="true">▪</span>系统检索</button>}
            {accountId === 'zhou_xun' && state.triggeredEvents.includes('chapter_four_started') && <><span className="student-menu-section">权限调查</span>
              <button className={route.pathname === '/admin-attempts' ? 'active' : ''} type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/admin-attempts')}><span aria-hidden="true">▪</span>访问失败记录</button>
              <button className={route.pathname === '/system-help/permission-request' ? 'active' : ''} type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/system-help/permission-request')}><span aria-hidden="true">▪</span>权限申请说明</button>
              {state.triggeredEvents.includes('chapter_four_admin_unlocked') && <button className={route.pathname === '/admin/history' ? 'active' : ''} type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/admin/history')}><span aria-hidden="true">▪</span>历史查询</button>}
            </>}
            {inactiveMenu.map((label) => <span className="student-menu-placeholder" key={label}><i aria-hidden="true">▪</i>{label}</span>)}
          </nav>
          <button className="back-school" type="button" onClick={() => onReturnSchoolTab ? onReturnSchoolTab() : onNavigate('www.qiming-high.edu.cn/')}>返回学校官网</button>
        </aside>
        <main className="student-content"><div className="student-breadcrumb">学生信息系统　/　{route.pageTitle.replace(' - 学生信息系统', '')}</div><StudentPage route={route} onNavigate={onNavigate} accountId={accountId} /></main>
      </div>
    </div>
  )
}

function messageUnreadCount(state: ReturnType<typeof useGame>['state'], accountId: StudentAccountId): number {
  const storyId = accountId === 'lin_mo' ? ZHOU_CREDENTIALS_MESSAGE_ID : ZHOU_MESSAGE_ID
  return state.unreadMessageIds.includes(storyId) ? 1 : 0
}

function StudentPage({ route, onNavigate, accountId }: Props & { accountId: StudentAccountId }) {
  switch (route.componentKey) {
    case 'student-dashboard': return <Dashboard onNavigate={onNavigate} accountId={accountId} />
    case 'student-status': return <StudentStatus accountId={accountId} onNavigate={onNavigate} />
    case 'student-status-cache': return <StatusCache accountId={accountId} />
    case 'student-attendance': return <Attendance accountId={accountId} />
    case 'student-card-records': return <CardRecords accountId={accountId} />
    case 'student-class-list': return <ClassList />
    case 'student-messages': return <Messages accountId={accountId} onNavigate={onNavigate} />
    case 'student-group-history': return <GroupHistory accountId={accountId} />
    case 'student-access-query': return <AccessQueryPage accountId={accountId} />
    case 'student-lab-access-records': return <LaboratoryAccessRecordsPage accountId={accountId} />
    case 'student-lab-reservations': return <LaboratoryReservationsPage accountId={accountId} />
    case 'student-equipment-loans': return <EquipmentLoansPage accountId={accountId} />
    case 'student-camera-exceptions': return <CameraExceptionsPage accountId={accountId} />
    case 'student-system-search': return <SystemSearchPage />
    case 'student-admin-attempts': return <AdminAttemptsPage accountId={accountId} />
    case 'student-permission-help': return <PermissionHelpPage accountId={accountId} />
    case 'student-admin-history': return <AdminHistoryPage accountId={accountId} />
    case 'student-downloads': return <Downloads accountId={accountId} />
    case 'student-missing': return <MissingStudentRecord onNavigate={onNavigate} />
    default: return <StudentNotFound onNavigate={onNavigate} />
  }
}

function PageHeader({ title, description }: { title: string; description: string }) { return <div className="student-page-header"><h1>{title}</h1><p>{description}</p></div> }

function Dashboard({ onNavigate, accountId }: Pick<Props, 'onNavigate'> & { accountId: StudentAccountId }) {
  const { state } = useGame()
  const account = getStudentAccount(accountId)!
  const fileCount = baseDownloads.length + (accountId === 'zhou_xun' && state.unlockedFileIds.includes(BACKUP_FILE_ID) ? 1 : 0)
  const isZhou = accountId === 'zhou_xun'
  return <><PageHeader title="系统首页" description={`欢迎登录，${account.name}。以下是你的校园信息摘要。`} />
    <div className="dashboard-alert"><span>{isZhou ? '学籍变动提醒' : '旧消息提醒'}</span><p>{isZhou ? '你的学籍状态已发生变更。' : '消息中心有一条周寻此前留下的消息。'}</p><button type="button" onClick={() => onNavigate(isZhou ? 'stu.qiming-high.edu.cn/student-status' : 'stu.qiming-high.edu.cn/messages')}>{isZhou ? '查看学籍信息' : '查看消息'}</button></div>
    <div className="stat-cards"><Stat label="学籍状态" value={isZhou ? '已退学' : '在籍'} /><Stat label="未读消息" value={`${messageUnreadCount(state, accountId)} 条`} /><Stat label="可用文件" value={`${fileCount} 个`} /><Stat label="账号" value={account.studentId} /></div>
    {state.chapterOneCompleted && <div className="system-complete-note">调查资料已保存在本机。系统中的原始记录可能仍会发生变化。</div>}
    {state.triggeredEvents.includes('chapter_three_started') && <div className="system-complete-note">第三章《值班记录》：查明6月16日晚旧实验楼发生了什么。</div>}
    <div className="dashboard-grid"><Panel title="学生基本信息"><InfoGrid entries={[["姓名", account.name], ["学号", account.studentId], ["班级", account.className], ["入学年份", "2024年"]]} /></Panel><Panel title="今日课程"><SimpleTable headers={["节次", "课程", "教室"]} rows={[["第1节", "语文", account.className], ["第2节", "数学", account.className], ["第3节", "物理", "新实验楼B201"]]} /></Panel></div>
  </>
}

function StudentStatus({ accountId, onNavigate }: { accountId: StudentAccountId; onNavigate: (url: string) => void }) {
  const { state, discoverClue } = useGame()
  useEffect(() => { if (accountId === 'zhou_xun') discoverClue('student_status_dropout', 'stu.qiming-high.edu.cn/student-status') }, [accountId, discoverClue])
  if (accountId === 'lin_mo') return <><PageHeader title="学籍信息" description="当前账号的学生基本学籍档案。" /><Panel title="林默 · 基本学籍"><InfoGrid entries={[["姓名", "林默"], ["学号", "2024010307"], ["班级", "高二（3）班"], ["学籍状态", "在籍"], ["入学日期", "2024-09-01"]]} /></Panel><PermissionNotice /></>
  return <><PageHeader title="学籍信息" description="当前账号的学生基本学籍档案。" /><Panel title="周寻 · 基本学籍"><div className="zhou-profile"><div className="zhou-avatar">周</div><div><strong>周寻　2024010312</strong><span>高二（3）班 · 已退学</span><small>个人物品登记：深蓝色双肩书包，黄色圆形挂件</small></div></div><InfoGrid entries={[["姓名", "周寻"], ["班级", "高二（3）班"], ["学号", "2024010312"], ["学籍状态", "已退学"], ["生效日期", "2026-09-12"], ["变更原因", "家庭原因"]]} />{state.unlockedFileIds.includes(SHENZHI_CACHE_FILE_ID) && <button className="record-inspect" type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/student-status/cache')}>{state.clues.shenzhi_dropout_backdated.discovered ? '历史变更缓存 · 已核对' : '查看历史变更缓存'}</button>}</Panel></>
}

function Attendance({ accountId }: { accountId: StudentAccountId }) {
  const { state, discoverClue } = useGame()
  const [expanded, setExpanded] = useState(false)
  if (accountId === 'lin_mo') return <><PageHeader title="考勤记录" description="当前账号近期出勤记录。" /><Panel title="林默近期考勤"><SimpleTable headers={["日期", "学生", "时间", "记录", "状态"]} rows={attendanceRecords.map((row) => [...row])} /></Panel><PermissionNotice /></>
  const inspect = () => { setExpanded(true); discoverClue('attendance_after_dropout', 'stu.qiming-high.edu.cn/attendance') }
  return <><PageHeader title="考勤记录" description="当前账号近期出勤记录。" /><Panel title="周寻近期考勤"><SimpleTable headers={["日期", "学生", "时间", "记录", "状态"]} rows={[zhouAttendanceRecord.map(String)]} emphasizeCell={(_, column) => column === 2} /><button className="record-inspect" type="button" onClick={inspect}>{state.clues.attendance_after_dropout.discovered ? '已核对' : '查看异常日期'}{!state.clues.attendance_after_dropout.discovered && <b>退学后仍签到</b>}</button>{expanded && <p className="record-note">该签到发生在系统所示退学生效日期之后，原始记录状态仍为“正常”。</p>}</Panel></>
}

function CardRecords({ accountId }: { accountId: StudentAccountId }) {
  const { state, discoverClue } = useGame()
  const [expanded, setExpanded] = useState(false)
  if (accountId === 'lin_mo') return <><PageHeader title="校园卡记录" description="当前账号近期消费流水。" /><Panel title="林默 · 校园卡消费明细"><SimpleTable headers={["日期", "时间", "地点", "金额"]} rows={cardRecords.map((row) => [...row])} /></Panel><PermissionNotice /></>
  const inspect = () => { setExpanded(true); discoverClue('card_record_old_building', 'stu.qiming-high.edu.cn/card-records') }
  return <><PageHeader title="校园卡记录" description="当前账号近期消费流水。" /><Panel title="周寻 · 最近记录"><div className="record-card"><div><strong>{zhouCardRecord[2]}</strong><span>{zhouCardRecord[0]}　{zhouCardRecord[1]}　消费 {zhouCardRecord[3]}</span></div><button type="button" onClick={inspect}>{state.clues.card_record_old_building.discovered ? '已查看' : '查看记录'}</button></div>{expanded && <p className="record-note">终端编号：LAB-VM-02　位置登记：实验楼一层东侧。</p>}</Panel></>
}

function PermissionNotice() { return <div className="system-complete-note">出于隐私权限限制，本账号不能查看其他学生的详细学籍、考勤或校园卡记录。</div> }
function ClassList() {
  const { state, discoverClue, markClassCountAnomalyPlayed } = useGame()
  const [period, setPeriod] = useState<ClassHistoryPeriod>('current')
  const [viewedCurrent, setViewedCurrent] = useState(true)
  const [viewedMay, setViewedMay] = useState(state.clues.class_size_mismatch.discovered)
  const [recordDetail, setRecordDetail] = useState(false)
  const [compared, setCompared] = useState(state.clues.class_size_mismatch.discovered)
  const [juneCount, setJuneCount] = useState(17)
  const view = classHistoryViews[period]
  const changePeriod = (next: ClassHistoryPeriod) => {
    setPeriod(next); setRecordDetail(false)
    if (next === 'current') setViewedCurrent(true)
    if (next === 'may') setViewedMay(true)
    if (next === 'june' && !state.classCountAnomalyPlayed) {
      setJuneCount(18)
      window.setTimeout(() => { setJuneCount(17); markClassCountAnomalyPlayed() }, 500)
    }
  }
  const compare = () => { setCompared(true); discoverClue('class_size_mismatch', 'stu.qiming-high.edu.cn/class-list') }
  const rows = period === 'current' ? classStudents.map((row) => [row[0], row[1], row[3]]) : view.rows
  return <><PageHeader title="班级名单" description="高二（3）班在册与历史记录。" /><Panel title="高二（3）班学生名单">
    <div className="history-toolbar"><span>查看时间</span>{(['current','may','june'] as ClassHistoryPeriod[]).map((key) => <button className={period === key ? 'active' : ''} type="button" key={key} onClick={() => changePeriod(key)}>{classHistoryViews[key].label}</button>)}</div>
    <div className="history-count">{period === 'june' ? `加载结果：${juneCount}人` : view.countLabel}</div>
    <SimpleTable headers={["序号", "姓名", "状态"]} rows={rows} />
    {period === 'may' && <button className="record-inspect" type="button" onClick={() => setRecordDetail(true)}>查看第12条记录详情</button>}
    {recordDetail && <InfoGrid entries={[["记录编号","12"],["状态","历史数据不完整"],["关联座位编号","12"]]} />}
    {(viewedCurrent && viewedMay || state.clues.class_size_mismatch.discovered) && <div className="comparison-box"><button type="button" onClick={compare} disabled={compared}>{compared ? '人数已核对' : '核对人数'}</button>{compared && <p>当前名单：17人<br />五月记录：18条</p>}</div>}
  </Panel></>
}

function Messages({ accountId, onNavigate }: { accountId: StudentAccountId; onNavigate: (url: string) => void }) {
  const { state, readMessage } = useGame()
  const [storyOpen, setStoryOpen] = useState(false)
  const [chapterFileId, setChapterFileId] = useState<string | null>(null)
  const isLin = accountId === 'lin_mo'
  const messageId = isLin ? ZHOU_CREDENTIALS_MESSAGE_ID : ZHOU_MESSAGE_ID
  const draftUnlocked = state.triggeredEvents.includes('zhou_draft_revealed')
  const storyVisible = isLin || draftUnlocked
  const openStory = () => { setStoryOpen(true); readMessage(messageId) }
  const chapterFile = getVirtualFile(chapterFileId)
  const openChapterMessage = (id: string, fileId: string) => { readMessage(id); setChapterFileId(fileId) }
  return <><PageHeader title="消息中心" description={isLin ? '系统通知与收到的校内消息。' : '系统通知与当前账号保存的草稿。'} /><Panel title={isLin ? '收件箱' : '消息与草稿'}><div className="message-list">
    {storyVisible && <button type="button" className="story-message" onClick={openStory}><span className="message-status">{state.unreadMessageIds.includes(messageId) ? '未读' : isLin ? '已读' : '草稿'}</span><strong>{isLin ? '先替我保管一下' : '你看到公告了吧'}</strong><span>{isLin ? '发件人：周寻' : '未发送草稿'}</span><time>{isLin ? '2026-09-11' : '2026-09-14 23:48'}</time></button>}
    {state.chapterTwoStarted && isLin && <button type="button" className="story-message" onClick={() => onNavigate('stu.qiming-high.edu.cn/class-group-history')}><span className="message-status">系统</span><strong>高二（3）班群聊数据迁移提醒</strong><span>查看迁移后的班级群历史</span><time>2026-06-20</time></button>}
    {state.chapterTwoStarted && !isLin && state.clues.shenzhi_removed_from_group.discovered && state.clues.shenzhi_old_building_group.discovered && <button type="button" className="story-message" onClick={() => openChapterMessage(GUYAN_DRAFT_MESSAGE_ID, 'guyan-note')}><span className="message-status">草稿</span><strong>顾言不认识她？</strong><span>周寻调查草稿</span><time>2026-06-20</time></button>}
    {!isLin && !draftUnlocked && <div className="system-complete-note">当前没有可查看的私人草稿。</div>}
    {baseMessages.map((message) => <div key={message.id}><span className="message-status">{message.status}</span><strong>{message.subject}</strong><span>发件人：{message.sender}</span><time>{message.date}</time></div>)}
  </div></Panel>
  {storyOpen && isLin && <ModalFrame title="先替我保管一下" onClose={() => setStoryOpen(false)} className="message-modal"><div className="message-meta"><span>发件人：周寻</span><span>时间：2026-09-11 21:06</span></div><div className="zhou-message-body"><p>林默，先替我保管一下。</p><p>如果我没到学校，就用学生系统看一下。</p><p>学号：2024010312<br />密码：ZX0913</p><p>先别问老师，也别把这条消息转发给其他人。</p><p>——周寻</p></div></ModalFrame>}
  {storyOpen && !isLin && <ModalFrame title="你看到公告了吧" onClose={() => setStoryOpen(false)} className="message-modal"><div className="message-meta"><span>所有者：周寻</span><span>保存时间：2026-09-14 23:48</span><span>状态：草稿 · 未发送</span></div><div className="zhou-message-body"><p>你看到公告了吧。</p><p>别相信退学日期。</p><p>去查9月13日的照片。</p></div></ModalFrame>}
  {chapterFile && <VirtualFileViewer file={chapterFile} onClose={() => setChapterFileId(null)} />}
  </>
}

function StatusCache({ accountId }: { accountId: StudentAccountId }) {
  const { state, discoverClue } = useGame()
  const completed = state.clues.shenzhi_dropout_backdated.discovered
  const [selected, setSelected] = useState<StatusDateKey[]>(completed ? ['effective', 'application'] : [])
  const [result, setResult] = useState<'idle' | 'correct' | 'wrong'>(completed ? 'correct' : 'idle')
  if (accountId !== 'zhou_xun') return <><PageHeader title="学籍历史缓存" description="学籍状态变更的历史字段。" /><PermissionNotice /></>
  if (!state.unlockedFileIds.includes(SHENZHI_CACHE_FILE_ID)) return <><PageHeader title="学籍历史缓存" description="学籍状态变更的历史字段。" /><div className="system-complete-note">当前没有可读取的缓存记录。</div></>
  const toggle = (key: StatusDateKey) => {
    setResult('idle')
    setSelected((current) => current.includes(key) ? current.filter((item) => item !== key) : current.length < 2 ? [...current, key] : [current[1], key])
  }
  const compare = () => {
    if (isBackdatedDatePair(selected)) {
      setResult('correct')
      discoverClue('shenzhi_dropout_backdated', 'stu.qiming-high.edu.cn/student-status/cache')
    } else setResult('wrong')
  }
  return <><PageHeader title="学籍历史缓存" description="选择两项日期字段进行核对。" /><Panel title="记录 2024010318">
    <InfoGrid entries={[["姓名", statusCacheProfile.name], ["学籍状态", statusCacheProfile.status], ["变更原因", statusCacheProfile.reason]]} />
    <div className="date-compare-grid">{statusDateFields.map((field) => <button className={selected.includes(field.key) ? 'selected' : ''} type="button" key={field.key} onClick={() => toggle(field.key)}><span>{field.label}</span><strong>{field.value}</strong></button>)}</div>
    <button className="record-inspect" type="button" disabled={selected.length !== 2 || completed} onClick={compare}>{completed ? '日期已核对' : '核对所选日期'}</button>
    {result === 'wrong' && <p className="record-note" role="alert">所选字段不能说明记录写入顺序，请重新选择。</p>}
    {result === 'correct' && <p className="record-note">生效日期早于退学申请文件的创建时间。</p>}
  </Panel></>
}

function GroupHistory({ accountId }: { accountId: StudentAccountId }) {
  const { state, discoverClue } = useGame()
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [action, setAction] = useState('')
  const [results, setResults] = useState(() => groupHistoryRecords.filter((record) => record.member !== '沈栀'))
  const [detail, setDetail] = useState(false)
  if (accountId !== 'lin_mo') return <><PageHeader title="班级群历史" description="班级群成员变更记录。" /><PermissionNotice /></>
  const submit = (event: FormEvent) => { event.preventDefault(); setResults(filterGroupHistory(name, date, action)); setDetail(false) }
  const inspect = () => { setDetail(true); discoverClue('shenzhi_removed_from_group', 'stu.qiming-high.edu.cn/class-group-history') }
  return <><PageHeader title="班级群历史" description="数据迁移后保留的成员变更记录。" /><Panel title="高二（3）班">
    <form className="record-query-form" onSubmit={submit}><label>成员姓名<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>日期<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>操作<select value={action} onChange={(event) => setAction(event.target.value)}><option value="">全部</option><option value="加入群聊">加入群聊</option><option value="移出群聊">移出群聊</option></select></label><button type="submit">查询</button></form>
    <div className="table-scroll"><table><thead><tr><th>时间</th><th>成员</th><th>操作</th><th>来源</th><th /></tr></thead><tbody>{results.map((record) => <tr key={`${record.date}-${record.member}`}><td>{record.date}</td><td>{record.member}</td><td>{record.action}</td><td>{record.source}</td><td>{record.member === '沈栀' && <button type="button" onClick={inspect}>查看操作详情</button>}</td></tr>)}</tbody></table></div>
    {results.length === 0 && <p className="record-note">未检索到符合条件的记录。</p>}
    {detail && <InfoGrid entries={[["成员", "沈栀"], ["操作", "移出群聊"], ["操作时间", "2026-06-18 08:12"], ["管理员", "顾言"]]} />}
  </Panel></>
}

function AccessQueryPage({ accountId }: { accountId: StudentAccountId }) {
  const { state, recordAccessQuery } = useGame()
  const completed = state.clues.shenzhi_exit_missing.discovered
  const remembered: AccessDirection[] = completed ? ['进入', '离开'] : [
    ...(state.revealedFileSections.includes('access-query-enter') ? ['进入' as const] : []),
    ...(state.revealedFileSections.includes('access-query-exit') ? ['离开' as const] : []),
  ]
  const [query, setQuery] = useState<AccessQuery>({ date: '2026-06-16', place: '全部', person: '全部', direction: '全部' })
  const [results, setResults] = useState<ReturnType<typeof filterAccessRecords> | null>(null)
  if (accountId !== 'zhou_xun') return <><PageHeader title="门禁记录查询" description="校内门禁终端日志。" /><PermissionNotice /></>
  if (!state.unlockedFileIds.includes(OLD_BUILDING_ACCESS_FILE_ID)) return <><PageHeader title="门禁记录查询" description="校内门禁终端日志。" /><div className="system-complete-note">当前账号没有可查询的门禁范围。</div></>
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const nextResults = filterAccessRecords(query)
    setResults(nextResults)
    const checked = checkedAccessDirection(query, nextResults)
    if (checked) recordAccessQuery(checked)
  }
  return <><PageHeader title="门禁记录查询" description="按日期、地点、人员与通行类型检索原始日志。" /><Panel title="查询条件">
    <form className="record-query-form" onSubmit={submit}><label>日期<input type="date" value={query.date} onChange={(event) => setQuery({ ...query, date: event.target.value })} /></label><label>地点<select value={query.place} onChange={(event) => setQuery({ ...query, place: event.target.value })}><option>全部</option><option>旧实验楼东门</option><option>新实验楼东门</option></select></label><label>人员<select value={query.person} onChange={(event) => setQuery({ ...query, person: event.target.value as AccessPerson })}><option>全部</option><option>沈栀</option><option>林默</option><option>顾言</option><option>何岚</option><option>唐棠</option></select></label><label>类型<select value={query.direction} onChange={(event) => setQuery({ ...query, direction: event.target.value as AccessDirection })}><option>全部</option><option>进入</option><option>离开</option></select></label><button type="submit">查询</button></form>
    {results && results.length > 0 && <SimpleTable headers={["日期", "时间", "人员", "地点", "类型"]} rows={results.map((record) => [record.date, record.time, record.person, record.place, record.direction])} />}
    {results && results.length === 0 && <p className="record-note">未检索到符合条件的记录。</p>}
    {remembered.length > 0 && <div className="comparison-box"><p>已查询：{remembered.join('、')}</p>{completed && <strong>门禁异常已确认</strong>}</div>}
  </Panel></>
}

function LaboratoryAccessRecordsPage({ accountId }: { accountId: StudentAccountId }) {
  const { state, recordChapterThreeEvidence } = useGame()
  const [date, setDate] = useState('')
  const [building, setBuilding] = useState('旧实验楼')
  const [results, setResults] = useState<ReturnType<typeof queryLaboratoryAccessRecords> | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  if (accountId !== 'zhou_xun') return <><PageHeader title="实验楼访问记录" description="周寻个人调查资料。" /><div className="system-complete-note">当前账号无权查看周寻的私人调查资料。</div></>
  if (!state.clues.old_building_duty_record.discovered) return <><PageHeader title="实验楼访问记录" description="周寻个人调查资料。" /><div className="system-complete-note">当前没有可读取的调查记录。</div></>
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next = queryLaboratoryAccessRecords(date, building)
    setResults(next)
    setDetailOpen(false)
    if (isChapterThreeAccessQuery(date, building) && next.length > 0) recordChapterThreeEvidence('access-log')
  }
  const inspectOperation = () => {
    setDetailOpen(true)
    recordChapterThreeEvidence('admin-trace')
  }
  return <><PageHeader title="实验楼访问记录" description="按日期和楼宇查询周寻保存的异常访问记录。" /><Panel title="实验楼异常访问记录.txt">
    <form className="record-query-form" onSubmit={submit}><label>日期<input aria-label="访问记录日期" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>地点<select aria-label="访问记录地点" value={building} onChange={(event) => setBuilding(event.target.value)}><option>旧实验楼</option><option>新实验楼</option></select></label><button type="submit">查询</button></form>
    {results && results.length > 0 && <div className="table-scroll"><table><thead><tr><th>日期</th><th>时间</th><th>地点</th><th>记录</th><th /></tr></thead><tbody>{results.map((record) => <tr key={`${record.date}-${record.time}`}><td>{record.date}</td><td>{record.time}</td><td>{record.place}</td><td>{record.event}</td><td>{record.time === '22:30' && <button type="button" onClick={inspectOperation}>查看操作来源</button>}</td></tr>)}</tbody></table></div>}
    {results && results.length === 0 && <p className="record-note">未查询到符合条件的访问记录。</p>}
    {detailOpen && <InfoGrid entries={[["操作时间", "2026-06-16 22:30"], ["操作来源", "权限：管理员"], ["具体账号", "未显示"]]} />}
  </Panel></>
}

function PrivateInvestigationDenied({ title }: { title: string }) {
  return <><PageHeader title={title} description="周寻个人调查资料。" /><div className="system-complete-note">当前账号无权查看周寻的私人调查资料。</div></>
}

function LaboratoryReservationsPage({ accountId }: { accountId: StudentAccountId }) {
  const { state, recordChapterThreeEvidence } = useGame()
  const [date, setDate] = useState('')
  const [applicant, setApplicant] = useState('沈栀')
  const [results, setResults] = useState<ReturnType<typeof queryLaboratoryReservations> | null>(null)
  if (accountId !== 'zhou_xun') return <PrivateInvestigationDenied title="实验室使用申请记录" />
  if (!state.clues.old_building_duty_record.discovered) return <><PageHeader title="实验室使用申请记录" description="周寻个人调查资料。" /><div className="system-complete-note">当前没有可读取的调查记录。</div></>
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next = queryLaboratoryReservations(date, applicant)
    setResults(next)
    if (next.length > 0) recordChapterThreeEvidence('reservation-record')
  }
  return <><PageHeader title="实验室使用申请记录" description="按使用日期和申请人检索实验室申请。" /><Panel title="实验室使用申请记录.xlsx">
    <form className="record-query-form" onSubmit={submit}><label>使用日期<input aria-label="实验室使用日期" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>申请人<select aria-label="实验室申请人" value={applicant} onChange={(event) => setApplicant(event.target.value)}><option>沈栀</option><option>周寻</option></select></label><button type="submit">查询申请</button></form>
    {results && results.length > 0 && <SimpleTable headers={["申请日期", "使用日期", "地点", "用途", "申请人", "审批状态", "审批部门"]} rows={results.map((record) => [record.applicationDate, record.useDate, record.place, record.purpose, record.applicant, record.approvalStatus, record.approvalDepartment])} />}
    {results && results.length === 0 && <p className="record-note">未查询到符合条件的使用申请。</p>}
    {state.clues.old_building_reservation.discovered && <p className="record-note">已记录：沈栀提前申请使用旧实验楼A-302。</p>}
  </Panel></>
}

function EquipmentLoansPage({ accountId }: { accountId: StudentAccountId }) {
  const { state, recordChapterThreeEvidence } = useGame()
  const [date, setDate] = useState('')
  const [borrower, setBorrower] = useState('沈栀')
  const [results, setResults] = useState<ReturnType<typeof queryEquipmentLoans> | null>(null)
  if (accountId !== 'zhou_xun') return <PrivateInvestigationDenied title="实验室设备借用记录" />
  if (!state.clues.old_building_duty_record.discovered) return <><PageHeader title="实验室设备借用记录" description="周寻个人调查资料。" /><div className="system-complete-note">当前没有可读取的调查记录。</div></>
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next = queryEquipmentLoans(date, borrower)
    setResults(next)
    if (next.length > 0) recordChapterThreeEvidence('equipment-record')
  }
  return <><PageHeader title="实验室设备借用记录" description="按日期和借用人检索设备借用状态。" /><Panel title="实验室设备借用记录.txt">
    <form className="record-query-form" onSubmit={submit}><label>借用日期<input aria-label="设备借用日期" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>借用人<select aria-label="设备借用人" value={borrower} onChange={(event) => setBorrower(event.target.value)}><option>沈栀</option><option>周寻</option></select></label><button type="submit">查询借用</button></form>
    {results && results.length > 0 && <SimpleTable headers={["日期", "借用人", "设备", "状态"]} rows={results.map((record) => [record.date, record.borrower, record.equipment.join('、'), record.status])} />}
    {results && results.length === 0 && <p className="record-note">未查询到符合条件的设备借用记录。</p>}
    {state.clues.equipment_missing_record.discovered && <p className="record-note">已记录：沈栀借用的摄像与存储设备尚未归还。</p>}
  </Panel></>
}

function CameraExceptionsPage({ accountId }: { accountId: StudentAccountId }) {
  const { state, recordChapterThreeEvidence } = useGame()
  const [date, setDate] = useState('')
  const [device, setDevice] = useState('旧实验楼东门摄像头')
  const [results, setResults] = useState<ReturnType<typeof queryCameraExceptions> | null>(null)
  if (accountId !== 'zhou_xun') return <PrivateInvestigationDenied title="监控存储异常记录" />
  if (!state.clues.old_building_duty_record.discovered) return <><PageHeader title="监控存储异常记录" description="周寻个人调查资料。" /><div className="system-complete-note">当前没有可读取的调查记录。</div></>
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next = queryCameraExceptions(date, device)
    setResults(next)
    if (next.length > 0) recordChapterThreeEvidence('camera-exception')
  }
  return <><PageHeader title="监控存储异常记录" description="按日期和设备检索监控存储异常。" /><Panel title="监控存储异常记录.txt">
    <form className="record-query-form" onSubmit={submit}><label>异常日期<input aria-label="监控异常日期" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>监控设备<select aria-label="监控设备" value={device} onChange={(event) => setDevice(event.target.value)}><option>旧实验楼东门摄像头</option><option>新实验楼东门摄像头</option></select></label><button type="submit">查询异常</button></form>
    {results && results.length > 0 && <SimpleTable headers={["日期", "设备", "异常时间", "异常类型", "处理状态"]} rows={results.map((record) => [record.date, record.device, record.exceptionTime, record.exceptionType, record.status])} />}
    {results && results.length === 0 && <p className="record-note">未查询到符合条件的监控异常记录。</p>}
    {state.clues.camera_exception_record.discovered && <p className="record-note">已记录：22:25至22:40的监控数据发生覆盖。</p>}
  </Panel></>
}

function SystemSearchPage() {
  const { state, recordChapterFourEvidence } = useGame()
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)
  if (!state.triggeredEvents.includes('chapter_four_started')) return <><PageHeader title="系统检索" description="检索系统服务与历史引用。" /><div className="system-complete-note">当前没有可用的检索范围。</div></>
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const matched = isAdminReferenceQuery(query)
    setSearched(matched)
    if (matched) recordChapterFourEvidence('permission-search')
  }
  return <><PageHeader title="系统检索" description="检索系统服务、账号与历史引用。" /><Panel title="系统检索">
    <form className="record-query-form" onSubmit={submit}><label>关键词<input aria-label="系统检索关键词" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入账号或权限标识" /></label><button type="submit">检索</button></form>
    {searched && <div className="comparison-box"><strong>找到1条历史引用</strong><p>标识：ADMIN_03</p><p>公开账号：未找到</p><p>详情：权限不足，普通账号无法查询。</p></div>}
    {!searched && query && <p className="record-note">请输入完整标识并执行检索。</p>}
  </Panel></>
}

function AdminAttemptsPage({ accountId }: { accountId: StudentAccountId }) {
  const { state, recordChapterFourEvidence } = useGame()
  const [inspected, setInspected] = useState(state.clues.zhou_admin_attempt.discovered)
  if (accountId !== 'zhou_xun') return <PrivateInvestigationDenied title="访问失败记录" />
  if (!state.triggeredEvents.includes('chapter_four_started')) return <PrivateInvestigationDenied title="访问失败记录" />
  const inspect = () => {
    setInspected(true)
    recordChapterFourEvidence('zhou-attempt')
  }
  return <><PageHeader title="访问失败记录" description="周寻个人调查资料。" /><Panel title="访问失败记录.txt">
    <p>记录中保留了一次被拒绝的管理入口访问。</p>
    <button className="record-inspect" type="button" onClick={inspect} disabled={inspected}>{inspected ? '访问记录已核对' : '核对访问目标'}</button>
    {inspected && <InfoGrid entries={[['访问目标', '/admin/history'], ['访问结果', '403 Forbidden'], ['访问人', '周寻']]} />}
  </Panel></>
}

function PermissionHelpPage({ accountId }: { accountId: StudentAccountId }) {
  const { state, recordChapterFourEvidence } = useGame()
  const [inspected, setInspected] = useState(state.clues.permission_request_manual.discovered)
  if (accountId !== 'zhou_xun') return <><PageHeader title="权限申请说明" description="系统帮助。" /><PermissionNotice /></>
  const inspect = () => {
    setInspected(true)
    recordChapterFourEvidence('permission-manual')
  }
  return <><PageHeader title="权限申请说明" description="历史数据访问帮助。" /><Panel title="权限申请说明">
    <p>历史数据访问仅向完成校内授权流程的维护人员开放。</p>
    <button className="record-inspect" type="button" onClick={inspect} disabled={inspected}>{inspected ? '申请条件已核对' : '核对申请条件'}</button>
    {inspected && <InfoGrid entries={[['条件一', '维护编号'], ['条件二', '管理员授权记录'], ['条件三', '访问申请']]} />}
  </Panel></>
}

function AdminHistoryPage({ accountId }: { accountId: StudentAccountId }) {
  const { state, recordChapterFourEvidence } = useGame()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<AdminHistoryResult | null>(null)
  const accessible = accountId === 'zhou_xun' && state.triggeredEvents.includes('chapter_four_admin_unlocked')
  useEffect(() => {
    if (accessible) recordChapterFourEvidence('history-access')
  }, [accessible, recordChapterFourEvidence])
  if (!accessible) return <><PageHeader title="历史查询" description="管理员历史操作记录。" /><PermissionNotice /></>
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next = queryAdminHistory(query)
    setResult(next)
    if (next?.title === '学生状态修改记录') recordChapterFourEvidence('student-status-log')
    if (next?.title === '权限组记录') recordChapterFourEvidence('admin-group')
    if (next?.title === '目标记录') recordChapterFourEvidence('linmo-target')
  }
  return <><PageHeader title="历史查询" description="旧版管理员历史操作记录。" /><Panel title="历史操作记录">
    <form className="record-query-form" onSubmit={submit}><label>查询对象<input aria-label="管理员历史查询" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="学号、姓名或权限标识" /></label><button type="submit">查询历史</button></form>
    {result && <><h3>{result.title}</h3><InfoGrid entries={result.rows} /></>}
    {result === null && query && <p className="record-note">没有匹配的历史记录。</p>}
  </Panel></>
}

function Downloads({ accountId }: { accountId: StudentAccountId }) {
  const { state, activeTab, openBackup, openVirtualFile, closeVirtualFile, beginChapterEnding, beginChapterTwoEnding, completeChapterThree, completeChapterFour, discoverClue, revealFileSection } = useGame()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const unlocked = accountId === 'zhou_xun' && state.unlockedFileIds.includes(BACKUP_FILE_ID)
  const currentFile = useMemo(() => getVirtualFile(activeTab.openVirtualFileId ?? null), [activeTab.openVirtualFileId])
  const submitPassword = (event: FormEvent) => {
    event.preventDefault()
    if (!isBackupPasswordValid(password)) { setError('密码不正确，无法读取加密文件。'); return }
    setError(''); setPasswordOpen(false); openBackup()
  }
  const closeFile = useCallback(() => {
    const completedBackup = activeTab.openVirtualFileId === 'backup-readme'
    const completedChapterTwo = activeTab.openVirtualFileId === CHAPTER_TWO_FINAL_FILE_ID
    const completedChapterThree = activeTab.openVirtualFileId === CHAPTER_THREE_FINAL_FILE_ID
    const completedChapterFour = activeTab.openVirtualFileId === CHAPTER_FOUR_FINAL_FILE_ID
    closeVirtualFile()
    if (completedBackup) beginChapterEnding()
    if (completedChapterTwo) beginChapterTwoEnding()
    if (completedChapterThree) completeChapterThree()
    if (completedChapterFour) completeChapterFour()
  }, [activeTab.openVirtualFileId, closeVirtualFile, beginChapterEnding, beginChapterTwoEnding, completeChapterThree, completeChapterFour])
  const openStoryFile = (id: string) => { const file = getVirtualFile(id); openVirtualFile(id); if (file?.onOpenClueId) discoverClue(file.onOpenClueId, 'stu.qiming-high.edu.cn/downloads') }
  const openChapterThreeBackup = () => {
    const finalized = state.unlockedFileIds.includes(CHAPTER_THREE_FINAL_FILE_ID)
    const id = finalized ? CHAPTER_THREE_FINAL_FILE_ID : CHAPTER_THREE_BACKUP_FILE_ID
    openVirtualFile(id)
    revealFileSection(finalized ? 'chapter_three_final_opened' : 'chapter-three-backup-read')
  }
  const openChapterFourBackup = () => {
    const finalized = state.unlockedFileIds.includes(CHAPTER_FOUR_FINAL_FILE_ID)
    const id = finalized ? CHAPTER_FOUR_FINAL_FILE_ID : CHAPTER_FOUR_BACKUP_FILE_ID
    openVirtualFile(id)
    revealFileSection(finalized ? 'chapter_four_final_opened' : 'chapter-four-backup-read')
  }
  const chapterFiles = [
    ['chapter-two-search-note', '检索记录.txt'], ['seat-chart-may', '高二（3）班座位表_五月.pdf'], ['midterm-grades', '高二三班期中成绩汇总.csv'],
  ] as const
  return <><PageHeader title="文件中心" description="所有文件均以只读方式查看，不会传输到现实设备。" /><Panel title="可用文件"><div className="download-list">
    {unlocked && <div className="story-download"><span className="file-icon encrypted">ZIP</span><span><strong>调查备份_01.zip</strong><small>上传者：周寻 · 状态：加密</small></span><button type="button" onClick={() => setPasswordOpen(true)}>解锁</button></div>}
    {accountId === 'zhou_xun' && state.chapterTwoStarted && chapterFiles.map(([id, name]) => <div className="story-download" key={id}><span className="file-icon">{name.split('.').pop()?.toUpperCase()}</span><span><strong>{name}</strong><small>周寻个人文件 · 只读</small></span><button type="button" onClick={() => openStoryFile(id)}>打开</button></div>)}
    {accountId === 'zhou_xun' && state.chapterTwoStarted && <div className="story-download damaged"><span className="file-icon">DAT</span><span><strong>学生缓存_2024010318.dat</strong><small>文件损坏<br />部分数据无法恢复<br />需要更多关联记录</small></span><button type="button" disabled>无法读取</button></div>}
    {accountId === 'zhou_xun' && state.unlockedFileIds.includes(CHAPTER_TWO_FINAL_FILE_ID) && (() => { const file = getVirtualFile(CHAPTER_TWO_FINAL_FILE_ID)!; return <div className="story-download unlocked"><span className="file-icon">{file.name.split('.').pop()?.toUpperCase()}</span><span><strong>{file.name}</strong><small>恢复记录 · 只读</small></span><button type="button" onClick={() => openStoryFile(CHAPTER_TWO_FINAL_FILE_ID)}>打开</button></div> })()}
    {accountId === 'zhou_xun' && state.unlockedFileIds.includes(CHAPTER_THREE_BACKUP_FILE_ID) && (() => { const finalized = state.unlockedFileIds.includes(CHAPTER_THREE_FINAL_FILE_ID); const file = getVirtualFile(finalized ? CHAPTER_THREE_FINAL_FILE_ID : CHAPTER_THREE_BACKUP_FILE_ID)!; return <div className={finalized ? 'story-download unlocked' : 'story-download'}><span className="file-icon">TXT</span><span><strong>{file.name}</strong><small>{finalized ? '调查记录已更新 · 只读' : '周寻个人文件 · 只读'}</small></span><button type="button" onClick={openChapterThreeBackup}>打开</button></div> })()}
    {accountId === 'zhou_xun' && state.unlockedFileIds.includes(CHAPTER_FOUR_BACKUP_FILE_ID) && (() => { const finalized = state.unlockedFileIds.includes(CHAPTER_FOUR_FINAL_FILE_ID); const file = getVirtualFile(finalized ? CHAPTER_FOUR_FINAL_FILE_ID : CHAPTER_FOUR_BACKUP_FILE_ID)!; return <div className={finalized ? 'story-download unlocked' : 'story-download'}><span className="file-icon">TXT</span><span><strong>{file.name}</strong><small>{finalized ? '权限调查已更新 · 只读' : '周寻个人文件 · 只读'}</small></span><button type="button" onClick={openChapterFourBackup}>打开</button></div> })()}
    {baseDownloads.map((file) => <div key={file.id}><span className="file-icon">{file.name.split('.').pop()?.toUpperCase()}</span><span><strong>{file.name}</strong><small>{file.meta}</small></span><button type="button" onClick={() => openVirtualFile(file.id)}>打开</button></div>)}
  </div></Panel>
  {passwordOpen && <ModalFrame title="加密文件验证" onClose={() => setPasswordOpen(false)} className="password-modal"><form className="backup-password-form" onSubmit={submitPassword}><p>请输入四位数字密码。</p><label>密码<input type="password" inputMode="numeric" aria-label="调查备份密码" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus /></label>{error && <p className="password-error" role="alert">{error}</p>}<button type="submit">解锁并打开</button></form></ModalFrame>}
  {currentFile && <VirtualFileViewer file={currentFile} onClose={closeFile} revealed={currentFile.reveal ? state.revealedFileSections.includes(currentFile.reveal.key) : false} onReveal={() => currentFile.reveal && revealFileSection(currentFile.reveal.key, currentFile.reveal.clueId)} />}
  </>
}

function MissingStudentRecord({ onNavigate }: Pick<Props, 'onNavigate'>) {
  return <div className="student-404 missing-record"><strong>记录不存在</strong><h1>未找到学生档案</h1><p>学号：2024010318</p><p>该学生记录不存在，或当前账号无权访问。</p><button type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/dashboard')}>返回系统首页</button></div>
}

function StudentNotFound({ onNavigate }: Pick<Props, 'onNavigate'>) { return <div className="student-404"><strong>404</strong><h1>请求的功能页面不存在</h1><p>请核对系统内地址，或返回系统首页。</p><button type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/dashboard')}>返回系统首页</button></div> }
function Stat({ label, value }: { label: string; value: string }) { return <div className="stat-card"><span>{label}</span><strong>{value}</strong></div> }
function Panel({ title, children }: { title: string; children: ReactNode }) { return <section className="system-panel"><h2>{title}</h2><div className="system-panel-body">{children}</div></section> }
function InfoGrid({ entries }: { entries: [string, string][] }) { return <dl className="info-grid">{entries.map(([label, value], index) => <div key={`${label}-${index}`}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> }
function SimpleTable({ headers, rows, highlightLast = false, emphasizeCell }: { headers: string[]; rows: string[][]; highlightLast?: boolean; emphasizeCell?: (cell: string, columnIndex: number, rowIndex: number) => boolean }) { return <div className="table-scroll"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={`${row.join('-')}-${rowIndex}`} className={highlightLast && rowIndex === rows.length - 1 ? 'anomaly-row' : ''}>{row.map((cell, columnIndex) => <td className={emphasizeCell?.(cell, columnIndex, rowIndex) ? 'clue-time-emphasis' : undefined} key={`${cell}-${columnIndex}`}>{cell}</td>)}</tr>)}</tbody></table></div> }
