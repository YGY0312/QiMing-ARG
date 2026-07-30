import { useState, type FormEvent, type ReactNode } from 'react'
import {
  EXTERNAL_BACKUP_REF, externalIndexRecord, isCorrectRosterTimeline, isExternalExportPair,
  monitorCacheFacts, monitorChat, monitorStatement, originalClassRoster, originalRosterMetadata,
  queryTransferRecords, rosterDifference, rosterRecoveryFields, rosterTimeline, resubmissionNotice,
  validateMonitorCacheFacts, validateRosterRecovery, type TransferFilters,
} from '../../data/chapterSeven'
import { useGame } from '../../game/GameContext'
import type { StudentAccountId } from '../../types/game'

const Header = ({ title, text }: { title: string; text: string }) => <div className="student-page-header"><h1>{title}</h1><p>{text}</p></div>
const Panel = ({ title, children }: { title: string; children: ReactNode }) => <section className="system-panel"><h2>{title}</h2><div className="system-panel-body">{children}</div></section>
const Denied = ({ title }: { title: string }) => <><Header title={title} text="周寻账号私人调查资料。" /><div className="system-complete-note">当前账号无权访问该资料。</div></>

export function ClassArchivePage({ accountId, onNavigate }: { accountId: StudentAccountId; onNavigate: (url: string) => void }) {
  const { state, recordChapterSevenEvidence, revealFileSection } = useGame()
  const prefilled = state.revealedFileSections.includes('chapter-seven-roster-fields-filled')
  const recovered = state.revealedFileSections.includes('chapter-seven-roster-recovered')
  const monitorRecovered = state.revealedFileSections.includes('chapter-seven-monitor-cache-recovered')
  const [fields, setFields] = useState(prefilled ? { ...rosterRecoveryFields } : { className: '', historicalCount: '', submitterRole: '' })
  const [timeline, setTimeline] = useState<string[]>([])
  const [facts, setFacts] = useState<string[]>([])
  const [error, setError] = useState('')
  if (accountId !== 'zhou_xun') return <Denied title="原始班级名单恢复" />
  if (!state.triggeredEvents.includes('chapter_seven_class_archive_unlocked')) return <><Header title="原始班级名单恢复" text="外部资料引用。" /><div className="system-complete-note">本地索引尚未解析。</div></>
  const restore = (event: FormEvent) => {
    event.preventDefault()
    if (!validateRosterRecovery(fields)) { setError('恢复字段不匹配。'); return }
    setError(''); revealFileSection('chapter-seven-roster-recovered')
  }
  const addTime = (id: string) => setTimeline((current) => current.includes(id) ? current : [...current, id])
  const confirmTimeline = () => isCorrectRosterTimeline(timeline) ? recordChapterSevenEvidence('resubmission-notice') : setError('时间顺序不正确。')
  const toggleFact = (fact: string) => setFacts((current) => current.includes(fact) ? current.filter((item) => item !== fact) : [...current, fact])
  const restoreMonitor = () => {
    if (!validateMonitorCacheFacts(facts)) { setError('已知事实不足，无法恢复账户缓存。'); return }
    setError(''); revealFileSection('chapter-seven-monitor-cache-recovered')
  }
  return <><Header title="原始班级名单恢复" text="恢复校园旧服务索引指向的未提交文件。" />
    <Panel title="高二（3）班学生信息核对表_原始版.xlsx">
      {!recovered && <form className="record-query-form" onSubmit={restore}><label>班级<input aria-label="原始名单班级" value={fields.className} onChange={(e) => setFields({ ...fields, className: e.target.value })} /></label><label>历史人数<input aria-label="原始名单历史人数" value={fields.historicalCount} onChange={(e) => setFields({ ...fields, historicalCount: e.target.value })} /></label><label>提交角色<input aria-label="原始名单提交角色" value={fields.submitterRole} onChange={(e) => setFields({ ...fields, submitterRole: e.target.value })} /></label><button type="submit">恢复原始名单</button></form>}
      {error && <p role="alert" className="record-note">{error}</p>}
      {recovered && <><dl className="info-grid"><div><dt>创建时间</dt><dd>{originalRosterMetadata.createdAt}</dd></div><div><dt>最后保存</dt><dd>{originalRosterMetadata.savedAt}</dd></div><div><dt>提交角色</dt><dd>{originalRosterMetadata.submitterRole}</dd></div><div><dt>文件状态</dt><dd>{originalRosterMetadata.status}</dd></div></dl>
        <div className="table-scroll"><table><thead><tr><th>序号</th><th>学号</th><th>姓名</th><th>状态</th></tr></thead><tbody>{originalClassRoster.map((row) => <tr key={row.studentNumber}><td>{row.order}</td><td>{row.studentNumber}</td><td>{row.name}</td><td>{row.status}</td></tr>)}</tbody></table></div>
        <button type="button" className="primary-action" disabled={state.clues.original_class_roster.discovered} onClick={() => recordChapterSevenEvidence('original-roster')}>{state.clues.original_class_roster.discovered ? '原始名单已记录' : '记录原始名单'}</button>
      </>}
    </Panel>
    {state.clues.original_class_roster.discovered && <Panel title="关联通知记录"><article className="monitor-notice"><time>{resubmissionNotice.sentAt}</time><h3>{resubmissionNotice.title}</h3><p>接收对象：{resubmissionNotice.recipient}</p><p className="pre-line">{resubmissionNotice.body}</p><p>要求完成时间：{resubmissionNotice.deadline}</p><p>附件：{resubmissionNotice.attachment}</p></article>
      <div className="timeline-sort" role="group" aria-label="名单时间排序">{rosterTimeline.map((item) => <button type="button" key={item.id} aria-pressed={timeline.includes(item.id)} onClick={() => addTime(item.id)}><span>{timeline.indexOf(item.id) >= 0 ? `${timeline.indexOf(item.id) + 1}. ` : ''}</span>{item.label}<small>{item.time}</small></button>)}</div>
      <button type="button" className="primary-action" disabled={state.clues.monitor_resubmission_notice.discovered} onClick={confirmTimeline}>{state.clues.monitor_resubmission_notice.discovered ? '通知时间已核对' : '确认时间顺序'}</button>
    </Panel>}
    {state.clues.monitor_resubmission_notice.discovered && <Panel title="原始版本与提交版本比对"><div className="roster-comparison"><article><h3>原始版</h3><strong>18人</strong><p>包含：沈栀</p></article><article><h3>提交版</h3><strong>17人</strong><p>不包含：沈栀</p></article></div><dl className="info-grid"><div><dt>删除记录</dt><dd>{rosterDifference.removed.studentNumber} {rosterDifference.removed.name}</dd></div><div><dt>修改时间</dt><dd>{rosterDifference.modifiedAt}</dd></div><div><dt>修改角色</dt><dd>{rosterDifference.role}</dd></div><div><dt>来源模板</dt><dd>{rosterDifference.template}</dd></div></dl>
      <button type="button" className="primary-action" disabled={state.clues.shenzhi_removed_after_incident.discovered} onClick={() => recordChapterSevenEvidence('roster-difference')}>{state.clues.shenzhi_removed_after_incident.discovered ? '名单差异已确认' : '确认名单差异'}</button>
    </Panel>}
    {state.triggeredEvents.includes('chapter_seven_monitor_records_unlocked') && <Panel title="关联账户未同步缓存"><p>角色：班长</p><p>缓存类型：草稿 / 临时说明</p><p>来源：班级公共文件夹旧客户端</p>
      {!monitorRecovered && <div className="fact-selection">{monitorCacheFacts.map((fact) => <label key={fact}><input type="checkbox" aria-label={`选择事实：${fact}`} checked={facts.includes(fact)} onChange={() => toggleFact(fact)} />{fact}</label>)}</div>}
      <button type="button" className="primary-action" disabled={monitorRecovered} onClick={restoreMonitor}>{monitorRecovered ? '班长缓存已恢复' : '恢复账户缓存'}</button>
      {monitorRecovered && <button type="button" className="record-inspect" onClick={() => onNavigate('stu.qiming-high.edu.cn/investigation/monitor-records')}>查看班长记录</button>}
    </Panel>}
  </>
}

export function MonitorRecordsPage({ accountId }: { accountId: StudentAccountId }) {
  const { state, recordChapterSevenEvidence } = useGame()
  if (accountId !== 'zhou_xun') return <Denied title="班长缓存记录" />
  if (!state.revealedFileSections.includes('chapter-seven-monitor-cache-recovered')) return <><Header title="班长缓存记录" text="旧客户端缓存。" /><div className="system-complete-note">缓存尚未恢复。</div></>
  return <><Header title="班长缓存记录" text="班级公共文件夹旧客户端留下的未同步内容。" />
    <Panel title="班长与周寻的聊天缓存 · 2026-06-20"><div className="monitor-chat">{monitorChat.map(([speaker, text], index) => <p key={`${speaker}-${index}`} className={speaker === '周寻' ? 'zhou' : 'monitor'}><strong>{speaker}</strong><span>{text}</span></p>)}</div><button type="button" className="primary-action" disabled={state.clues.zhou_questioned_monitor.discovered} onClick={() => recordChapterSevenEvidence('monitor-chat')}>{state.clues.zhou_questioned_monitor.discovered ? '询问记录已保存' : '记录周寻的询问'}</button></Panel>
    <Panel title={monitorStatement.title}><p><strong>{monitorStatement.status}</strong>　{monitorStatement.time}</p><div className="statement-draft pre-line">{monitorStatement.content}</div><button type="button" className="primary-action" disabled={state.clues.monitor_unsent_statement.discovered} onClick={() => recordChapterSevenEvidence('monitor-statement')}>{state.clues.monitor_unsent_statement.discovered ? '说明已保存为证据' : '保存为调查证据'}</button></Panel>
    {state.triggeredEvents.includes('chapter_seven_external_index_unlocked') && <Panel title="附加字段"><dl className="info-grid"><div><dt>周寻查看文件属性</dt><dd>{externalIndexRecord.viewedAt}</dd></div><div><dt>附加备注</dt><dd>{externalIndexRecord.note}</dd></div><div><dt>引用</dt><dd>{externalIndexRecord.reference}</dd></div></dl><button type="button" className="primary-action" disabled={state.clues.external_backup_index.discovered} onClick={() => recordChapterSevenEvidence('external-index')}>{state.clues.external_backup_index.discovered ? '外部编号已解析' : '解析外部备份编号'}</button></Panel>}
  </>
}

export function DataTransferPage({ accountId, onNavigate }: { accountId: StudentAccountId; onNavigate: (url: string) => void }) {
  const { state, recordChapterSevenEvidence } = useGame()
  const [filters, setFilters] = useState<TransferFilters>({ startDate: '2026-06-16', endDate: '2026-09-15', device: 'TERM-OLD-03', targetType: '', status: '' })
  const [results, setResults] = useState<ReturnType<typeof queryTransferRecords> | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState('')
  if (accountId !== 'zhou_xun') return <Denied title="数据传输记录" />
  if (!state.clues.external_backup_index.discovered) return <><Header title="数据传输记录" text="高级查询入口。" /><div className="system-complete-note">外部索引不足。</div></>
  const submit = (event: FormEvent) => { event.preventDefault(); setResults(queryTransferRecords(filters)); setSelected([]); setError('') }
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 2 ? [...current, id] : [current[1], id])
  const compare = () => isExternalExportPair(selected) ? recordChapterSevenEvidence('external-export') : setError('所选记录不能构成完整导出过程。')
  return <><Header title="数据传输记录" text="按设备与目标类型查询终端传输历史。" /><Panel title="高级查询"><form className="record-query-form" onSubmit={submit}><label>开始日期<input aria-label="传输开始日期" type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} /></label><label>结束日期<input aria-label="传输结束日期" type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} /></label><label>设备编号<input aria-label="传输设备编号" value={filters.device} onChange={(e) => setFilters({ ...filters, device: e.target.value })} /></label><label>目标类型<select aria-label="传输目标类型" value={filters.targetType} onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}><option value="">全部</option><option>LOCAL_CACHE</option><option>EXTERNAL_NODE</option></select></label><label>传输状态<select aria-label="传输状态" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">全部</option><option>写入完成</option><option>导出开始</option><option>导出完成</option></select></label><button type="submit">查询</button></form>
    {results && <div className="table-scroll"><table><thead><tr><th>核对</th><th>时间</th><th>来源</th><th>目标</th><th>对象</th><th>状态</th><th>目标编号</th><th>校验片段</th></tr></thead><tbody>{results.map((row) => <tr key={row.id}><td><input type="checkbox" aria-label={`选择传输记录${row.timestamp}`} checked={selected.includes(row.id)} onChange={() => toggle(row.id)} /></td><td>{row.timestamp}</td><td>{row.source}</td><td>{row.targetType}</td><td>{row.object}</td><td>{row.status}</td><td>{row.targetId || '—'}</td><td>{row.checksum || '—'}</td></tr>)}</tbody></table></div>}
    {error && <p role="alert" className="record-note">{error}</p>}<button type="button" className="primary-action" disabled={selected.length !== 2 || state.clues.terminal_external_export.discovered} onClick={compare}>{state.clues.terminal_external_export.discovered ? '外部导出已核对' : '核对外部导出'}</button>
    {state.triggeredEvents.includes('chapter_seven_external_backup_unlocked') && <button type="button" className="record-inspect" onClick={() => onNavigate(`archive.qm-node.local/${EXTERNAL_BACKUP_REF}`)}>访问外部备份节点</button>}
  </Panel></>
}
