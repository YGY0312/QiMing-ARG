import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import type { GameRoute } from '../../types/game'
import { newsItems, noticeItems } from '../../data/content'
import { useGame, useOptionalGame } from '../../game/GameContext'
import { ModalFrame } from '../../components/ModalFrame'
import { hotspotStyle, LAB_SAFETY_GROUP_PHOTO, resolveStoryImageSource } from '../../data/imageAssets'
import { getVirtualFile } from '../../data/virtualFiles'
import { VirtualFileViewer } from '../../components/VirtualFileViewer'
import { isShenzhiSearch, searchSchoolContent } from '../../data/chapterTwo'
import { queryDutyLogs, queryDutySchedule, queryMaintenanceTickets } from '../../data/chapterThree'

interface Props {
  route: GameRoute
  onNavigate: (url: string) => void
  onOpenStudentTab?: () => void
}

const navItems = [
  { label: '网站首页', url: 'www.qiming-high.edu.cn/' },
  { label: '学校概况' },
  { label: '校园新闻', url: 'www.qiming-high.edu.cn/news' },
  { label: '通知公告', url: 'www.qiming-high.edu.cn/notices' },
  { label: '师资队伍' },
  { label: '教学工作' },
  { label: '德育建设' },
  { label: '招生信息' },
  { label: '校园文化' },
  { label: '校园服务', url: 'www.qiming-high.edu.cn/services/laboratory', chapterThree: true },
  { label: '信息中心', url: 'www.qiming-high.edu.cn/services/information-center', chapterThree: true },
  { label: '联系我们' },
]

export function SchoolSite({ route, onNavigate, onOpenStudentTab }: Props) {
  const game = useOptionalGame()
  const chapterThreeNavigationVisible = game?.state.revealedFileSections.includes('chapter-three-backup-read') ?? false
  return (
    <div className="school-site">
      <header className="school-header">
        <div className="school-utility"><span>欢迎访问启明市第一中学网站</span><span>2026年9月16日　星期三</span></div>
        <div className="school-brand">
          <div className="school-emblem" aria-label="启明市第一中学校徽占位图形"><span>启</span><small>1958</small></div>
          <div><h1>启明市第一中学</h1><p>QIMING NO.1 HIGH SCHOOL</p></div>
          <div className="school-motto"><span>校　训</span><strong>明德　求真　笃行</strong></div>
        </div>
        <nav className="school-nav" aria-label="学校官网主导航">
          {navItems.filter((item) => !item.chapterThree || chapterThreeNavigationVisible).map((item) => item.url ? (
            <button key={item.label} type="button" onClick={() => onNavigate(item.url!)}>{item.label}</button>
          ) : (
            <span key={item.label} className="school-nav-placeholder">{item.label}</span>
          ))}
        </nav>
        <ChapterTwoSearch onNavigate={onNavigate} />
      </header>

      <SchoolContent route={route} onNavigate={onNavigate} onOpenStudentTab={onOpenStudentTab} />

      <footer className="school-footer">
        <p>启明市第一中学（虚构）　地址：启明市文教路18号</p>
        <p>校园网站开发原型 · 本页面不代表任何真实学校</p>
      </footer>
    </div>
  )
}

function ChapterTwoSearch({ onNavigate }: Pick<Props, 'onNavigate'>) {
  const game = useOptionalGame()
  const [query, setQuery] = useState('')
  const submitSearch = (event: FormEvent) => { event.preventDefault(); if (query.trim()) onNavigate(`www.qiming-high.edu.cn/search/${encodeURIComponent(query.trim())}`) }
  if (!game?.state.chapterTwoStarted) return null
  return <form className="school-search" role="search" onSubmit={submitSearch}><label><span className="sr-only">站内搜索</span><input aria-label="站内搜索" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索校园网站" /></label><button type="submit">搜索</button></form>
}

function SchoolContent({ route, onNavigate, onOpenStudentTab }: Props) {
  switch (route.componentKey) {
    case 'school-home':
      return <SchoolHome onNavigate={onNavigate} onOpenStudentTab={onOpenStudentTab} />
    case 'school-news':
      return <ArticleList title="校园新闻" type="news" onNavigate={onNavigate} />
    case 'school-notices':
      return <ArticleList title="通知公告" type="notices" onNavigate={onNavigate} />
    case 'school-news-detail':
      return <ArticleDetail id={route.params?.id} type="news" onNavigate={onNavigate} />
    case 'school-notice-detail':
      return <ArticleDetail id={route.params?.id} type="notices" onNavigate={onNavigate} />
    case 'school-search': return <SchoolSearch query={route.params?.id ?? ''} onNavigate={onNavigate} />
    case 'school-removed': return <RemovedSearchPage onNavigate={onNavigate} />
    case 'school-lab-management': return <LaboratoryManagement onNavigate={onNavigate} />
    case 'school-duty-schedule': return <DutySchedulePage onNavigate={onNavigate} />
    case 'school-duty-log': return <DutyLogPage onNavigate={onNavigate} />
    case 'school-information-center': return <InformationCenterPage onNavigate={onNavigate} />
    case 'school-maintenance-ticket': return <MaintenanceTicketPage onNavigate={onNavigate} />
    case 'school-system-services': return <SystemServicesPage onNavigate={onNavigate} />
    case 'school-admin-denied': return <AdminDeniedPage onNavigate={onNavigate} />
    default:
      return <SchoolNotFound onNavigate={onNavigate} />
  }
}

function SchoolHome({ onNavigate, onOpenStudentTab }: Pick<Props, 'onNavigate' | 'onOpenStudentTab'>) {
  const game = useOptionalGame()
  const visibleNews = newsItems.filter((item) => !item.chapterThreeOnly || game?.state.clues.admin_permission_trace.discovered)
  return (
    <main className="school-main school-home">
      <section className="campus-hero">
        <div className="hero-sky" />
        <div className="hero-building">
          <span className="building-wing left" /><span className="building-center">启明市第一中学</span><span className="building-wing right" />
        </div>
        <div className="hero-caption">崇德尚学　砺志笃行</div>
      </section>
      <div className="school-grid">
        <section className="school-panel news-panel">
          <PanelTitle title="校园新闻" onMore={() => onNavigate('www.qiming-high.edu.cn/news')} />
          <article className="featured-news">
            <div className="featured-placeholder"><span>校园简讯</span></div>
            <div><h2>{visibleNews[0].title}</h2><p>{visibleNews[0].summary}</p></div>
          </article>
          <ArticleRows items={visibleNews.slice(1)} prefix="news" onNavigate={onNavigate} />
        </section>
        <section className="school-panel notice-panel">
          <PanelTitle title="通知公告" onMore={() => onNavigate('www.qiming-high.edu.cn/notices')} />
          <ArticleRows items={noticeItems} prefix="notices" onNavigate={onNavigate} showDay />
          <button className="student-system-entry" type="button" onClick={() => onOpenStudentTab ? onOpenStudentTab() : onNavigate('stu.qiming-high.edu.cn/login')}>
            <span className="entry-icon">▦</span><span><strong>学生信息系统</strong><small>Student Information System</small></span><b>进入系统 ›</b>
          </button>
        </section>
      </div>
      <section className="school-links"><strong>校内专题</strong><span>文明校园建设</span><span>教学质量管理</span><span>校园安全教育</span><span>心理健康服务</span></section>
    </main>
  )
}

function PanelTitle({ title, onMore }: { title: string; onMore: () => void }) {
  return <div className="panel-title"><h2>{title}</h2><button type="button" onClick={onMore}>更多 &gt;&gt;</button></div>
}

function ArticleRows({ items, prefix, onNavigate, showDay = false }: {
  items: typeof newsItems
  prefix: 'news' | 'notices'
  onNavigate: (url: string) => void
  showDay?: boolean
}) {
  return (
    <ul className={showDay ? 'article-rows dated' : 'article-rows'}>
      {items.map((item) => (
        <li key={item.id}>
          {showDay && <time><b>{item.date.slice(-2)}</b><small>{item.date.slice(0, 7)}</small></time>}
          <button type="button" onClick={() => onNavigate(`www.qiming-high.edu.cn/${prefix}/${item.id}`)}>
            <span>{item.title}</span>{!showDay && <time>{item.date}</time>}
          </button>
        </li>
      ))}
    </ul>
  )
}

function ArticleList({ title, type, onNavigate }: {
  title: string
  type: 'news' | 'notices'
  onNavigate: (url: string) => void
}) {
  const game = useOptionalGame()
  const items = (type === 'news' ? newsItems : noticeItems).filter((item) => !item.chapterThreeOnly || game?.state.clues.admin_permission_trace.discovered)
  return (
    <main className="school-main school-subpage">
      <div className="school-breadcrumb">当前位置：网站首页 &gt; {title}</div>
      <div className="subpage-layout">
        <aside><h2>{title}</h2><span className="aside-active">{title}</span><span>专题栏目</span><span>资料中心</span></aside>
        <section className="school-list-page">
          <h2>{title}<small>{type === 'news' ? 'CAMPUS NEWS' : 'NOTICES'}</small></h2>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => onNavigate(`www.qiming-high.edu.cn/${type}/${item.id}`)}>
                  <strong>{item.title}</strong><span>{item.summary}</span>
                </button>
                <time>{item.date}</time>
              </li>
            ))}
          </ul>
          <div className="pagination">共 {items.length} 条　1 / 1 页</div>
        </section>
      </div>
    </main>
  )
}

function ArticleDetail({ id, type, onNavigate }: {
  id?: string
  type: 'news' | 'notices'
  onNavigate: (url: string) => void
}) {
  const { state, discoverClue, revealFileSection, recordChapterThreeEvidence } = useGame()
  const [attachmentOpen, setAttachmentOpen] = useState(false)
  const items = type === 'news' ? newsItems : noticeItems
  const article = items.find((item) => item.id === id)
  useEffect(() => {
    if (type !== 'notices') return
    if (id === 'student-status-change') discoverClue('dropout_notice', 'www.qiming-high.edu.cn/notices/student-status-change')
    if (id === 'old-lab-closure') discoverClue('old_building_closed', 'www.qiming-high.edu.cn/notices/old-lab-closure')
  }, [id, type, discoverClue])
  if (!article || article.chapterThreeOnly && !state.clues.admin_permission_trace.discovered) return <SchoolNotFound onNavigate={onNavigate} />
  const label = type === 'news' ? '校园新闻' : '通知公告'
  const attachment = getVirtualFile(article.attachmentFileId ?? null)
  const openAttachment = () => {
    setAttachmentOpen(true)
    if (attachment?.onOpenClueId) discoverClue(attachment.onOpenClueId, `www.qiming-high.edu.cn/${type}/${article.id}`)
  }
  return (
    <main className="school-main school-subpage article-page">
      <div className="school-breadcrumb">当前位置：网站首页 &gt; {label} &gt; 正文</div>
      <article>
        <h2>{article.title}</h2>
        <div className="article-meta">发布时间：{article.date}　来源：启明市第一中学{article.documentCode ? `　编号：${article.documentCode}` : ''}</div>
        <div className="article-body">{article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        {article.hasInvestigablePhoto && <ActivityPhoto />}
        {attachment && <button className="article-attachment" type="button" onClick={openAttachment}>附件：{article.attachmentLabel ?? attachment.name}</button>}
        {article.id === 'campus-security-system-upgrade' && <button className="record-inspect" type="button" disabled={state.clues.system_upgrade_notice.discovered} onClick={() => recordChapterThreeEvidence('system-upgrade')}>{state.clues.system_upgrade_notice.discovered ? '发布时间已记录' : '记录发布时间与负责部门'}</button>}
        {article.department && <p className="article-department">启明市第一中学{article.department}<br />2026年{Number(article.date.slice(5, 7))}月{Number(article.date.slice(8, 10))}日</p>}
        <button className="back-list" type="button" onClick={() => onNavigate(`www.qiming-high.edu.cn/${type}`)}>返回{label}列表</button>
      </article>
      {attachmentOpen && attachment && <VirtualFileViewer file={attachment} onClose={() => setAttachmentOpen(false)} revealed={attachment.reveal ? state.revealedFileSections.includes(attachment.reveal.key) : false} onReveal={() => attachment.reveal && revealFileSection(attachment.reveal.key, attachment.reveal.clueId)} />}
    </main>
  )
}

function SchoolSearch({ query, onNavigate }: { query: string; onNavigate: (url: string) => void }) {
  const decoded = useMemo(() => { try { return decodeURIComponent(query) } catch { return query } }, [query])
  const { state, markSearchResiduePlayed } = useGame()
  const normalized = decoded.trim().toLowerCase()
  const shenzhiSearch = isShenzhiSearch(normalized)
  const results = searchSchoolContent(decoded).filter(({ article }) => !article.chapterThreeOnly || state.clues.admin_permission_trace.discovered)
  useEffect(() => { if (shenzhiSearch && !state.searchResiduePlayed) markSearchResiduePlayed() }, [shenzhiSearch, state.searchResiduePlayed, markSearchResiduePlayed])
  return <main className="school-main school-subpage search-page"><div className="school-breadcrumb">当前位置：网站首页 &gt; 站内搜索</div><section className="school-list-page"><h2>搜索结果<small>SEARCH</small></h2><p>关键词：{decoded}</p>
    {shenzhiSearch ? <div className="search-residue"><strong>未找到公开内容</strong><p>旧索引缓存：高二（3）班学生沈栀……</p><small>来源页面：已删除</small><button type="button" onClick={() => onNavigate('www.qiming-high.edu.cn/removed/shenzhi-index')}>查看索引来源</button></div> : <ul>{results.map(({ article, section }) => <li key={article.id}><button type="button" onClick={() => onNavigate(`www.qiming-high.edu.cn/${section}/${article.id}`)}><strong>{article.title}</strong><span>{article.summary}</span></button><time>{article.date}</time></li>)}</ul>}
    {!shenzhiSearch && results.length === 0 && <p>没有找到相关内容。</p>}
  </section></main>
}

function RemovedSearchPage({ onNavigate }: Pick<Props, 'onNavigate'>) {
  const { discoverClue } = useGame()
  useEffect(() => discoverClue('shenzhi_search_residue', 'www.qiming-high.edu.cn/removed/shenzhi-index'), [discoverClue])
  return <main className="school-main school-404"><div className="school-breadcrumb">当前位置：搜索索引 &gt; 已删除页面</div><div><strong>410</strong><h2>该页面已被删除</h2><p>索引更新时间：2026-06-20。缓存摘要仍显示“高二（3）班学生沈栀”。</p><button type="button" onClick={() => onNavigate('www.qiming-high.edu.cn/')}>返回网站首页</button></div></main>
}

function LaboratoryManagement({ onNavigate }: Pick<Props, 'onNavigate'>) {
  const { state } = useGame()
  if (!state.revealedFileSections.includes('chapter-three-backup-read')) return <SchoolNotFound onNavigate={onNavigate} />
  return <main className="school-main school-subpage"><div className="school-breadcrumb">当前位置：校园服务 &gt; 实验室管理</div><div className="subpage-layout">
    <aside><h2>校园服务</h2><span className="aside-active">实验室管理</span><span>场地预约</span><span>安全制度</span></aside>
    <section className="school-list-page"><h2>实验室管理<small>LABORATORY SERVICES</small></h2><ul>
      <li><button type="button" onClick={() => onNavigate('www.qiming-high.edu.cn/services/laboratory/duty-june-2026')}><strong>2026年6月实验楼值班安排</strong><span>实验中心值班与巡查安排</span></button><time>2026-06</time></li>
      <li><button type="button" onClick={() => onNavigate('www.qiming-high.edu.cn/services/laboratory/duty-log')}><strong>实验楼值班日志.txt</strong><span>按日期检索实验楼值班日志</span></button><time>日志</time></li>
    </ul></section>
  </div></main>
}

function DutySchedulePage({ onNavigate }: Pick<Props, 'onNavigate'>) {
  const { state, recordChapterThreeEvidence } = useGame()
  const [date, setDate] = useState('')
  const [results, setResults] = useState<ReturnType<typeof queryDutySchedule> | null>(null)
  if (!state.revealedFileSections.includes('chapter-three-backup-read')) return <SchoolNotFound onNavigate={onNavigate} />
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next = queryDutySchedule(date, '旧实验楼')
    setResults(next)
    if (next.some((record) => record.date === '2026-06-16')) recordChapterThreeEvidence('duty-record')
  }
  return <main className="school-main school-subpage"><div className="school-breadcrumb">当前位置：校园服务 &gt; 实验室管理 &gt; 值班安排</div><section className="school-list-page duty-schedule-page">
    <h2>2026年6月实验楼值班安排<small>LABORATORY DUTY SCHEDULE</small></h2>
    <p>按日期查询实验楼晚间值班安排。</p>
    <form className="record-query-form" onSubmit={submit}><label>日期<input aria-label="值班日期" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>楼宇<select aria-label="值班楼宇" value="旧实验楼" disabled><option>旧实验楼</option></select></label><button type="submit">查询</button></form>
    {results && results.length > 0 && <div className="table-scroll"><table><thead><tr><th>日期</th><th>楼宇</th><th>时段</th><th>值班教师</th></tr></thead><tbody>{results.map((record) => <tr key={`${record.date}-${record.building}`}><td>{record.date}</td><td>{record.building}</td><td>{record.period}</td><td>{record.teacher}</td></tr>)}</tbody></table></div>}
    {results && results.length === 0 && <p className="record-note">未查询到该日期的旧实验楼值班安排。</p>}
    {state.clues.old_building_duty_record.discovered && <p className="record-note">已记录：6月16日晚旧实验楼存在值班人员。</p>}
    <button className="back-list" type="button" onClick={() => onNavigate('www.qiming-high.edu.cn/services/laboratory')}>返回实验室管理</button>
  </section></main>
}

function DutyLogPage({ onNavigate }: Pick<Props, 'onNavigate'>) {
  const { state, recordChapterThreeEvidence } = useGame()
  const [date, setDate] = useState('')
  const [results, setResults] = useState<ReturnType<typeof queryDutyLogs> | null>(null)
  if (!state.revealedFileSections.includes('chapter-three-backup-read')) return <SchoolNotFound onNavigate={onNavigate} />
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next = queryDutyLogs(date)
    setResults(next)
    if (date === '2026-06-16' && next.length > 0) recordChapterThreeEvidence('duty-log')
  }
  return <main className="school-main school-subpage"><div className="school-breadcrumb">当前位置：校园服务 &gt; 实验室管理 &gt; 值班日志</div><section className="school-list-page duty-schedule-page">
    <h2>实验楼值班日志.txt<small>LABORATORY DUTY LOG</small></h2>
    <p>输入日期检索实验中心归档的值班事件。</p>
    <form className="record-query-form" onSubmit={submit}><label>日志日期<input aria-label="值班日志日期" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><button type="submit">查询日志</button></form>
    {results && results.length > 0 && <div className="table-scroll"><table><thead><tr><th>日期</th><th>时间</th><th>日志内容</th></tr></thead><tbody>{results.map((record) => <tr key={`${record.date}-${record.time}`}><td>{record.date}</td><td>{record.time}</td><td>{record.event}</td></tr>)}</tbody></table></div>}
    {results && results.length === 0 && <p className="record-note">未查询到该日期的值班日志。</p>}
    {state.clues.duty_log_record.discovered && <p className="record-note">已记录：维护通知、系统同步与当晚值班日志处于同一时间线。</p>}
    <button className="back-list" type="button" onClick={() => onNavigate('www.qiming-high.edu.cn/services/laboratory')}>返回实验室管理</button>
  </section></main>
}

function InformationCenterPage({ onNavigate }: Pick<Props, 'onNavigate'>) {
  const { state } = useGame()
  if (!state.revealedFileSections.includes('chapter-three-backup-read')) return <SchoolNotFound onNavigate={onNavigate} />
  return <main className="school-main school-subpage"><div className="school-breadcrumb">当前位置：信息中心</div><div className="subpage-layout">
    <aside><h2>信息中心</h2><span className="aside-active">系统维护记录</span><span>服务公告</span><span>终端支持</span></aside>
    <section className="school-list-page"><h2>信息中心<small>INFORMATION CENTER</small></h2><ul>
      <li><button type="button" onClick={() => onNavigate('www.qiming-high.edu.cn/services/information-center/maintenance')}><strong>系统维护记录</strong><span>按工单编号查询历史维护任务</span></button><time>查询</time></li>
      {state.triggeredEvents.includes('chapter_four_started') && <li><button type="button" onClick={() => onNavigate('www.qiming-high.edu.cn/services/information-center/system-services')}><strong>系统服务</strong><span>校园系统升级说明与兼容服务</span></button><time>服务</time></li>}
    </ul></section>
  </div></main>
}

function SystemServicesPage({ onNavigate }: Pick<Props, 'onNavigate'>) {
  const { state, recordChapterFourEvidence } = useGame()
  const [entryVisible, setEntryVisible] = useState(state.clues.legacy_admin_entry.discovered)
  if (!state.triggeredEvents.includes('chapter_four_started')) return <SchoolNotFound onNavigate={onNavigate} />
  const revealEntry = () => {
    setEntryVisible(true)
    recordChapterFourEvidence('legacy-entry')
  }
  return <main className="school-main school-subpage"><div className="school-breadcrumb">当前位置：信息中心 &gt; 系统服务</div><section className="school-list-page duty-schedule-page">
    <h2>系统服务<small>SYSTEM SERVICES</small></h2>
    <p>校园安全系统已完成升级。旧版兼容服务仅用于历史数据维护。</p>
    <button className="record-inspect" type="button" onClick={revealEntry} disabled={entryVisible}>{entryVisible ? '兼容服务信息已展开' : '查看旧版兼容服务'}</button>
    {entryVisible && <div className="comparison-box"><p>旧版管理入口：/admin</p><button type="button" onClick={() => onNavigate('www.qiming-high.edu.cn/admin')}>访问旧版管理入口</button></div>}
    <button className="back-list" type="button" onClick={() => onNavigate('www.qiming-high.edu.cn/services/information-center')}>返回信息中心</button>
  </section></main>
}

function AdminDeniedPage({ onNavigate }: Pick<Props, 'onNavigate'>) {
  const { state, recordChapterFourEvidence } = useGame()
  useEffect(() => {
    if (state.triggeredEvents.includes('chapter_four_started')) recordChapterFourEvidence('access-denied')
  }, [state.triggeredEvents, recordChapterFourEvidence])
  if (!state.triggeredEvents.includes('chapter_four_started')) return <SchoolNotFound onNavigate={onNavigate} />
  return <main className="school-main school-404"><div className="school-breadcrumb">当前位置：信息中心 &gt; 旧版管理入口</div><div><strong>403</strong><h2>Forbidden</h2><p>权限不足。当前访问来源不具备管理员权限。</p><button type="button" onClick={() => onNavigate('www.qiming-high.edu.cn/services/information-center/system-services')}>返回系统服务</button></div></main>
}

function MaintenanceTicketPage({ onNavigate }: Pick<Props, 'onNavigate'>) {
  const { state, recordChapterThreeEvidence } = useGame()
  const [ticketId, setTicketId] = useState('')
  const [results, setResults] = useState<ReturnType<typeof queryMaintenanceTickets> | null>(null)
  if (!state.revealedFileSections.includes('chapter-three-backup-read')) return <SchoolNotFound onNavigate={onNavigate} />
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next = queryMaintenanceTickets(ticketId)
    setResults(next)
    if (next.some((record) => record.id === 'SYS-0616')) recordChapterThreeEvidence('maintenance-ticket')
  }
  return <main className="school-main school-subpage"><div className="school-breadcrumb">当前位置：信息中心 &gt; 系统维护记录</div><section className="school-list-page duty-schedule-page">
    <h2>系统维护记录<small>SYSTEM MAINTENANCE</small></h2>
    <p>输入工单编号查询信息中心维护记录。</p>
    <form className="record-query-form" onSubmit={submit}><label>工单编号<input aria-label="维护工单编号" value={ticketId} onChange={(event) => setTicketId(event.target.value)} placeholder="SYS-0000" /></label><button type="submit">查询工单</button></form>
    {results && results.length > 0 && <div className="table-scroll"><table><thead><tr><th>编号</th><th>时间</th><th>类型</th><th>影响范围</th><th>执行部门</th></tr></thead><tbody>{results.map((record) => <tr key={record.id}><td>{record.id}</td><td>{record.time}</td><td>{record.type}</td><td>{record.scope}</td><td>{record.department}</td></tr>)}</tbody></table></div>}
    {results && results.length === 0 && <p className="record-note">未查询到该工单。</p>}
    {state.clues.system_maintenance_ticket.discovered && <p className="record-note">已记录：6月16日22:20存在学生信息系统数据同步维护。</p>}
    <button className="back-list" type="button" onClick={() => onNavigate('www.qiming-high.edu.cn/services/information-center')}>返回信息中心</button>
  </section></main>
}

function ActivityPhoto() {
  const [open, setOpen] = useState(false)
  const [identified, setIdentified] = useState(false)
  const { discoverClue } = useGame()
  const close = useCallback(() => setOpen(false), [])
  const identify = () => {
    setIdentified(true)
    discoverClue('photo_after_dropout', 'www.qiming-high.edu.cn/news/lab-safety')
  }
  const imageSource = resolveStoryImageSource(LAB_SAFETY_GROUP_PHOTO)
  const zhouHotspot = LAB_SAFETY_GROUP_PHOTO.hotspots.zhou_xun
  return (
    <figure className="activity-photo-wrap">
      <button className="activity-photo-button" type="button" onClick={() => setOpen(true)} aria-label="放大查看实验室安全教育活动合照">
        <img className="activity-photo" src={imageSource} alt={LAB_SAFETY_GROUP_PHOTO.title} />
        <span>点击放大查看</span>
      </button>
      <figcaption>高二年级实验室安全教育活动合影　摄于2026年9月13日</figcaption>
      {open && <ModalFrame title="活动照片 · 原始尺寸" onClose={close} className="photo-modal"><div className="enlarged-photo"><img className="activity-photo" src={imageSource} alt={LAB_SAFETY_GROUP_PHOTO.title} /><button className="zhou-hotspot" style={hotspotStyle(zhouHotspot)} type="button" aria-label="查看右后方背深蓝书包的学生" onClick={identify}><span>查看此处</span></button></div><p className={identified ? 'photo-thought visible' : 'photo-thought'}>{identified ? '“这是周寻。他那天明明还在学校。”' : '照片可以逐处查看。右后方似乎有一个熟悉的身影。'}</p></ModalFrame>}
    </figure>
  )
}

function SchoolNotFound({ onNavigate }: Pick<Props, 'onNavigate'>) {
  return (
    <main className="school-main school-404">
      <div className="school-breadcrumb">当前位置：网站首页 &gt; 页面错误</div>
      <div><strong>404</strong><h2>您访问的页面不存在</h2><p>页面可能已被移动、删除，或地址输入有误。</p><button type="button" onClick={() => onNavigate('www.qiming-high.edu.cn/')}>返回网站首页</button></div>
    </main>
  )
}
