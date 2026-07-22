import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import type { GameRoute } from '../../types/game'
import { newsItems, noticeItems } from '../../data/content'
import { useGame, useOptionalGame } from '../../game/GameContext'
import { ModalFrame } from '../../components/ModalFrame'
import { hotspotStyle, LAB_SAFETY_GROUP_PHOTO, resolveStoryImageSource } from '../../data/imageAssets'
import { getVirtualFile } from '../../data/virtualFiles'
import { VirtualFileViewer } from '../../components/VirtualFileViewer'
import { isShenzhiSearch, searchSchoolContent } from '../../data/chapterTwo'

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
  { label: '联系我们' },
]

export function SchoolSite({ route, onNavigate, onOpenStudentTab }: Props) {
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
          {navItems.map((item) => item.url ? (
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
    default:
      return <SchoolNotFound onNavigate={onNavigate} />
  }
}

function SchoolHome({ onNavigate, onOpenStudentTab }: Pick<Props, 'onNavigate' | 'onOpenStudentTab'>) {
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
            <div><h2>{newsItems[0].title}</h2><p>{newsItems[0].summary}</p></div>
          </article>
          <ArticleRows items={newsItems.slice(1)} prefix="news" onNavigate={onNavigate} />
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
  const items = type === 'news' ? newsItems : noticeItems
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
  const { state, discoverClue, revealFileSection } = useGame()
  const [attachmentOpen, setAttachmentOpen] = useState(false)
  const items = type === 'news' ? newsItems : noticeItems
  const article = items.find((item) => item.id === id)
  useEffect(() => {
    if (type !== 'notices') return
    if (id === 'student-status-change') discoverClue('dropout_notice', 'www.qiming-high.edu.cn/notices/student-status-change')
    if (id === 'old-lab-closure') discoverClue('old_building_closed', 'www.qiming-high.edu.cn/notices/old-lab-closure')
  }, [id, type, discoverClue])
  if (!article) return <SchoolNotFound onNavigate={onNavigate} />
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
  const results = searchSchoolContent(decoded)
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
