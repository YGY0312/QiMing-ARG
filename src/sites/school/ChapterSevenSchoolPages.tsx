import { useState, type FormEvent } from 'react'
import { legacyClassIndex, searchLegacyArchive } from '../../data/chapterSeven'
import { useGame } from '../../game/GameContext'

export function LegacyArchivePage({ onNavigate }: { onNavigate: (url: string) => void }) {
  const { state } = useGame()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ReturnType<typeof searchLegacyArchive> | null>(null)
  if (!state.triggeredEvents.includes('chapter_seven_started')) return <main className="school-main school-404"><div><strong>404</strong><h2>页面不存在</h2></div></main>
  const submit = (event: FormEvent) => { event.preventDefault(); setResults(searchLegacyArchive(query)) }
  return <main className="school-main school-subpage legacy-archive-page">
    <div className="school-breadcrumb">校园服务 &gt; 旧站与历史服务</div>
    <section className="school-list-page"><h2>校园旧服务归档<small>LEGACY CAMPUS SERVICES</small></h2>
      <p>以下服务已停止维护，仅保留有限索引。</p>
      <ul className="legacy-service-list"><li>旧班级主页</li><li>社团旧站</li><li>广播站归档</li><li>公共文件索引</li><li>校园打印服务历史入口</li></ul>
      <form className="record-query-form" onSubmit={submit}><label>归档编号、班级或关键词<input aria-label="校园旧服务归档检索" value={query} onChange={(event) => setQuery(event.target.value)} /></label><button type="submit">检索归档</button></form>
      {results?.map((row) => <article className="comparison-box" key={row.id}><h3>{row.title}</h3><p>状态：{row.status}</p><p>最近同步：{row.lastSync}</p><p>资料来源：{row.source}</p><p>访问状态：{row.access}</p><p>记录编号：{row.id}</p><button type="button" className="record-inspect" onClick={() => onNavigate(`www.qiming-high.edu.cn/services/legacy-archive/${row.id}`)}>查看索引详情</button></article>)}
      {results && results.length === 0 && <p className="record-note">未找到匹配的旧服务索引。</p>}
    </section>
  </main>
}

export function LegacyIndexPage({ onNavigate }: { onNavigate: (url: string) => void }) {
  const { state } = useGame()
  if (!state.triggeredEvents.includes('chapter_seven_started')) return <main className="school-main school-404"><div><strong>404</strong><h2>页面不存在</h2></div></main>
  return <main className="school-main school-subpage legacy-archive-page"><div className="school-breadcrumb">校园旧服务归档 &gt; {legacyClassIndex.id}</div>
    <section className="school-list-page"><h2>{legacyClassIndex.title}<small>{legacyClassIndex.id}</small></h2>
      <dl className="info-grid"><div><dt>文件</dt><dd>{legacyClassIndex.fileName}</dd></div><div><dt>来源账户</dt><dd>{legacyClassIndex.sourceAccount}</dd></div><div><dt>最后编辑角色</dt><dd>{legacyClassIndex.lastEditorRole}</dd></div><div><dt>存储位置</dt><dd>{legacyClassIndex.storage}</dd></div></dl>
      <p className="record-note">公开页面只提供索引。恢复文件需要在已登录的关联调查中提交已知字段。</p>
      <button type="button" className="primary-action" onClick={() => onNavigate('stu.qiming-high.edu.cn/investigation/class-archive')}>申请恢复索引</button>
    </section>
  </main>
}
