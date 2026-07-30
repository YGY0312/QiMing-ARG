import { useState, type FormEvent } from 'react'
import { EXTERNAL_BACKUP_REF, externalManifest, externalNodeFields, qimingPlanIndex, validateExternalNode } from '../../data/chapterSeven'
import { useGame } from '../../game/GameContext'
import type { GameRoute } from '../../types/game'
import { ChapterEightArchive } from './ChapterEightArchive'
import { ChapterNineArchive } from './ChapterNineArchive'

export function ArchiveSite({ route, onNavigate }: { route: GameRoute; onNavigate: (url: string) => void }) {
  const { state, activeTab } = useGame()
  const accountId = activeTab.studentSession?.accountId
  const allowed = accountId === 'zhou_xun' && state.triggeredEvents.includes('chapter_seven_external_backup_unlocked')
  return <div className="external-archive-site"><header><span>QM NODE</span><strong>外部归档节点</strong><small>本地只读镜像</small></header>
    {!allowed ? <main><h1>访问校验失败</h1><p>当前会话没有读取该归档的关联权限。</p></main> : <ArchivePage route={route} onNavigate={onNavigate} />}
  </div>
}

function ArchivePage({ route, onNavigate }: { route: GameRoute; onNavigate: (url: string) => void }) {
  if (route.componentKey === 'archive-manifest') return <ManifestPage />
  if (route.componentKey === 'archive-plan') return <PlanPage />
  if (route.componentKey === 'archive-incident') return <IncidentPage />
  if (route.componentKey === 'archive-session') return <ChapterNineArchive route={route} onNavigate={onNavigate} />
  return <ArchiveHome onNavigate={onNavigate} />
}

function ArchiveHome({ onNavigate }: { onNavigate: (url: string) => void }) {
  const { state, revealFileSection } = useGame()
  const prefilled = state.revealedFileSections.includes('chapter-seven-external-fields-filled')
  const verified = state.revealedFileSections.includes('chapter-seven-external-node-verified')
  const [fields, setFields] = useState(prefilled ? { ...externalNodeFields } : { historicalObject: '', sourceTerminal: '', originalCount: '' })
  const [error, setError] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!validateExternalNode(fields)) { setError(true); return }
    setError(false); revealFileSection('chapter-seven-external-node-verified')
  }
  return <main><p className="node-path">/{EXTERNAL_BACKUP_REF}/</p><h1>外部归档节点</h1><dl><div><dt>索引</dt><dd>{EXTERNAL_BACKUP_REF}</dd></div><div><dt>来源验证</dt><dd>TERM-OLD-03</dd></div><div><dt>状态</dt><dd>数据包存在</dd></div><div><dt>完整性</dt><dd>部分通过</dd></div></dl>
    {!verified && <form className="archive-verify-form" onSubmit={submit}><h2>请提交三项校验信息</h2><label>历史对象<input aria-label="外部节点历史对象" value={fields.historicalObject} onChange={(e) => setFields({ ...fields, historicalObject: e.target.value })} /></label><label>来源终端<input aria-label="外部节点来源终端" value={fields.sourceTerminal} onChange={(e) => setFields({ ...fields, sourceTerminal: e.target.value })} /></label><label>原始人数<input aria-label="外部节点原始人数" value={fields.originalCount} onChange={(e) => setFields({ ...fields, originalCount: e.target.value })} /></label><button type="submit">验证归档</button>{error && <p role="alert">校验信息不一致。</p>}</form>}
    {verified && <section className="archive-directory"><h2>/backup/0616/</h2><button type="button" onClick={() => onNavigate(`archive.qm-node.local/${EXTERNAL_BACKUP_REF}/manifest`)}>/manifest/ <span>可读取</span></button><button type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/investigation/class-archive')}>/class/ <span>可读取</span></button><div>/media/ <span>索引可读取</span></div><button type="button" onClick={() => onNavigate(`archive.qm-node.local/${EXTERNAL_BACKUP_REF}/plan`)}>/plan/ <span>仅标题可读取</span></button><button type="button" onClick={() => onNavigate(`archive.qm-node.local/${EXTERNAL_BACKUP_REF}/incident/0616`)}>/incident/ <span>{state.triggeredEvents.includes('chapter_eight_started') ? '可分段恢复' : '校验失败'}</span></button></section>}
  </main>
}

function ManifestPage() {
  const { state, recordChapterSevenEvidence } = useGame()
  if (!state.revealedFileSections.includes('chapter-seven-external-node-verified')) return <main><h1>manifest</h1><p>访问校验尚未完成。</p></main>
  return <main><p className="node-path">/backup/0616/manifest/</p><h1>归档清单</h1><dl><div><dt>归档编号</dt><dd>{externalManifest.archiveId}</dd></div><div><dt>导出来源</dt><dd>{externalManifest.source}</dd></div><div><dt>导出账户</dt><dd>{externalManifest.account}</dd></div><div><dt>导出时间</dt><dd>{externalManifest.exportedAt}</dd></div><div><dt>完整性</dt><dd>{externalManifest.integrity}</dd></div></dl><ul>{externalManifest.contents.map((item) => <li key={item}>{item}</li>)}</ul><button type="button" disabled={state.clues.external_backup_verified.discovered} onClick={() => recordChapterSevenEvidence('external-backup')}>{state.clues.external_backup_verified.discovered ? '清单已验证' : '验证清单'}</button></main>
}

function PlanPage() {
  const { state, recordChapterSevenEvidence } = useGame()
  if (!state.revealedFileSections.includes('chapter-seven-external-node-verified')) return <main><h1>/plan/</h1><p>访问校验尚未完成。</p></main>
  return <main><p className="node-path">/backup/0616/plan/</p><h1>计划目录</h1><ul>{qimingPlanIndex.files.map((file) => <li key={file}>{file}</li>)}</ul><p>主体文件加密或损坏。索引标题可读取。</p><dl><div><dt>项目名称</dt><dd>{qimingPlanIndex.name}</dd></div><div><dt>项目代号</dt><dd>{qimingPlanIndex.code}</dd></div><div><dt>内部状态</dt><dd>{qimingPlanIndex.status}</dd></div></dl><button type="button" disabled={state.clues.qiming_plan_name.discovered} onClick={() => recordChapterSevenEvidence('plan-name')}>{state.clues.qiming_plan_name.discovered ? '计划名称已记录' : '记录计划名称'}</button></main>
}

function IncidentPage() {
  const { route, navigate } = useGame()
  return <ChapterEightArchive route={route} onNavigate={navigate} />
}
