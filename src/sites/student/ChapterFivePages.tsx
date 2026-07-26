import { useState, type FormEvent, type ReactNode } from 'react'
import {
  accountRelationRecords,
  cacheRecoveryFields,
  filterLoginRecords,
  hasCompleteAccountRelation,
  isDecommissionedTerminalActivity,
  isPostDisappearancePair,
  terminalOld03,
  validateCacheRecovery,
  zhouLastActivities,
  type LoginFilters,
  type RelationAccountId,
} from '../../data/chapterFive'
import { useGame } from '../../game/GameContext'
import type { StudentAccountId } from '../../types/game'
import { TerminalStatusInvestigation } from './ChapterSixPages'

function PageHeader({ title, description }: { title: string; description: string }) {
  return <div className="student-page-header"><h1>{title}</h1><p>{description}</p></div>
}
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="system-panel"><h2>{title}</h2><div className="system-panel-body">{children}</div></section>
}
function InfoGrid({ entries }: { entries: [string, string][] }) {
  return <dl className="info-grid">{entries.map(([label, value], index) => <div key={`${label}-${index}`}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
}
function Denied({ title }: { title: string }) {
  return <><PageHeader title={title} description="账号安全与私人调查资料。" /><div className="system-complete-note">当前账号无权查看该账号的安全调查资料。</div></>
}

export function LoginDevicesPage({ accountId, onNavigate }: { accountId: StudentAccountId; onNavigate: (url: string) => void }) {
  const { state, recordChapterFiveEvidence } = useGame()
  const [filters, setFilters] = useState<LoginFilters>({ startDate: '2026-09-14', endDate: '2026-09-15', device: '', status: '' })
  const [results, setResults] = useState<ReturnType<typeof filterLoginRecords>['records'] | null>(null)
  const [queryError, setQueryError] = useState<ReturnType<typeof filterLoginRecords>['error']>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [comparison, setComparison] = useState<'idle' | 'correct' | 'wrong'>(state.clues.zhou_post_disappearance_login.discovered ? 'correct' : 'idle')
  if (accountId !== 'zhou_xun' || !state.triggeredEvents.includes('chapter_five_started')) return <Denied title="登录与设备" />
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const result = filterLoginRecords(filters)
    setQueryError(result.error)
    if (result.error) return
    setResults(result.records)
    const visibleIds = new Set(result.records.map((record) => record.id))
    setSelected((current) => current.filter((id) => visibleIds.has(id)))
    setComparison(state.clues.zhou_post_disappearance_login.discovered ? 'correct' : 'idle')
  }
  const toggle = (id: string) => setSelected((current) =>
    current.includes(id) ? current.filter((item) => item !== id) : current.length < 2 ? [...current, id] : [current[1], id])
  const compare = () => {
    const correct = isPostDisappearancePair(selected)
    setComparison(correct ? 'correct' : 'wrong')
    if (correct) recordChapterFiveEvidence('post-disappearance-login')
  }
  return <><PageHeader title="登录与设备" description="查询当前账号的登录与设备记录。" /><Panel title="登录记录查询">
    <form className="record-query-form login-range-form" onSubmit={submit}>
      <label>开始日期<input aria-label="登录开始日期" type="date" value={filters.startDate} onChange={(event) => setFilters({ ...filters, startDate: event.target.value })} /></label>
      <label>结束日期<input aria-label="登录结束日期" type="date" value={filters.endDate} onChange={(event) => setFilters({ ...filters, endDate: event.target.value })} /></label>
      <label>设备<select aria-label="登录设备" value={filters.device} onChange={(event) => setFilters({ ...filters, device: event.target.value })}><option value="">全部</option><option>校园移动端</option><option>Web端</option><option>维护终端03</option></select></label>
      <label>状态<select aria-label="登录状态" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">全部</option><option>成功</option><option>会话中断</option></select></label>
      <button type="submit">查询</button>
    </form>
    {queryError === 'incomplete-range' && <p className="record-note" role="alert">请选择完整的日期范围。</p>}
    {queryError === 'invalid-date' && <p className="record-note" role="alert">日期格式无效，请重新选择。</p>}
    {queryError === 'reversed-range' && <p className="record-note" role="alert">开始日期不能晚于结束日期。</p>}
    {results && <div className="table-scroll"><table><thead><tr><th>核对</th><th>时间</th><th>设备</th><th>位置</th><th>状态</th></tr></thead><tbody>{results.map((record) => <tr key={record.id}><td><input aria-label={`选择${record.date} ${record.time}`} type="checkbox" checked={selected.includes(record.id)} onChange={() => toggle(record.id)} /></td><td>{record.date} {record.time}</td><td>{record.deviceId ? <button type="button" className="table-link" onClick={() => onNavigate(`stu.qiming-high.edu.cn/security/device/${record.deviceId}`)}>{record.device}</button> : record.device}{record.deviceId && <small>{record.deviceId}</small>}</td><td>{record.location}</td><td>{record.status}</td></tr>)}</tbody></table></div>}
    {results && results.length === 0 && <p className="record-note">未查询到符合条件的登录记录。</p>}
    {(results || state.clues.zhou_post_disappearance_login.discovered) && <button className="primary-action login-compare-action" type="button" disabled={selected.length !== 2 || state.clues.zhou_post_disappearance_login.discovered} onClick={compare}>{state.clues.zhou_post_disappearance_login.discovered ? '登录异常已核对' : '核对登录时间'}</button>}
    {comparison === 'wrong' && <p className="record-note" role="alert">所选记录不能证明退学后的连续登录活动。</p>}
    {comparison === 'correct' && <div className="comparison-box"><p>该账号在退学状态生效后仍存在登录活动。异常已记录。</p></div>}
    {state.clues.three_account_relation.discovered && <button className="record-inspect" type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/security/activity')}>查看最后活动</button>}
  </Panel></>
}

export function DeviceDetailPage({ accountId, onNavigate }: { accountId: StudentAccountId; onNavigate: (url: string) => void }) {
  const { state, recordChapterFiveEvidence } = useGame()
  const [checked, setChecked] = useState(state.clues.decommissioned_terminal_activity.discovered)
  if (accountId !== 'zhou_xun' || !state.triggeredEvents.includes('chapter_five_started')) return <Denied title="设备详情" />
  const inspect = () => {
    setChecked(true)
    if (isDecommissionedTerminalActivity()) recordChapterFiveEvidence('terminal-status')
  }
  return <><PageHeader title="维护终端03" description="账号登录设备详情。" /><Panel title={terminalOld03.id}>
    <InfoGrid entries={[['设备名称', terminalOld03.name], ['设备编号', terminalOld03.id], ['部署位置', terminalOld03.location], ['设备状态', terminalOld03.status], ['停用日期', terminalOld03.decommissionedAt], ['最近活动', terminalOld03.lastActivityAt]]} />
    <button className="record-inspect" type="button" disabled={checked} onClick={inspect}>{checked ? '设备状态已核对' : '核对设备状态'}</button>
    {checked && <p className="record-note">停用设备仍存在后续活动记录。</p>}
    {state.triggeredEvents.includes('chapter_five_completed') && <p className="system-complete-note">在线记录：设备位置无法确认。</p>}
    <TerminalStatusInvestigation accountId={accountId} onNavigate={onNavigate} />
  </Panel></>
}

export function CacheRecoveryPage({ accountId }: { accountId: StudentAccountId }) {
  const { state, recordChapterFiveEvidence, revealFileSection } = useGame()
  const recovered = state.revealedFileSections.includes('cache-recovery-completed')
  const prefilled = state.revealedFileSections.includes('cache-recovery-fields-filled')
  const [fields, setFields] = useState(prefilled ? { ...cacheRecoveryFields } : { studentNumber: '', maintenanceNumber: '', terminalNumber: '' })
  const [result, setResult] = useState<'idle' | 'correct' | 'wrong'>(recovered ? 'correct' : 'idle')
  if (accountId !== 'zhou_xun') return <Denied title="学生缓存恢复" />
  if (!state.triggeredEvents.includes('chapter_five_cache_unlocked')) return <><PageHeader title="学生缓存恢复" description="损坏缓存关联恢复工具。" /><div className="system-complete-note">关联记录不足，当前缓存无法恢复。</div></>
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!validateCacheRecovery(fields)) { setResult('wrong'); return }
    setResult('correct')
    revealFileSection('cache-recovery-completed')
    recordChapterFiveEvidence('cache-recovered')
  }
  return <><PageHeader title="学生缓存恢复" description="使用已经确认的关联字段尝试恢复损坏数据。" /><Panel title="学生缓存_2024010318.dat">
    {!recovered && <form className="record-query-form" onSubmit={submit}>
      <label>学生编号<input aria-label="缓存学生编号" value={fields.studentNumber} onChange={(event) => setFields({ ...fields, studentNumber: event.target.value })} /></label>
      <label>维护编号<input aria-label="缓存维护编号" value={fields.maintenanceNumber} onChange={(event) => setFields({ ...fields, maintenanceNumber: event.target.value })} /></label>
      <label>终端编号<input aria-label="缓存终端编号" value={fields.terminalNumber} onChange={(event) => setFields({ ...fields, terminalNumber: event.target.value })} /></label>
      <button type="submit">开始恢复</button>
    </form>}
    {result === 'wrong' && <p className="record-note" role="alert">关联字段不足，无法恢复。</p>}
    {result === 'correct' && <><InfoGrid entries={[['档案对象', cacheRecoveryFields.studentNumber], ['最后有效身份', '沈栀'], ['最后登录设备', cacheRecoveryFields.terminalNumber], ['最后登录时间', '2026-06-16 22:27']]} /><button className="record-inspect" type="button" disabled={state.clues.shenzhi_zhou_terminal_link.discovered} onClick={() => recordChapterFiveEvidence('terminal-link')}>{state.clues.shenzhi_zhou_terminal_link.discovered ? '关联账号已核对' : '查看关联访问账号：2024010312'}</button></>}
  </Panel></>
}

export function AccountRelationsPage({ accountId }: { accountId: StudentAccountId }) {
  const { state, recordChapterFiveEvidence } = useGame()
  const [query, setQuery] = useState('')
  const [found, setFound] = useState<RelationAccountId | null>(null)
  const allRelationIds = Object.keys(accountRelationRecords) as RelationAccountId[]
  const [selected, setSelected] = useState<RelationAccountId[]>(state.clues.three_account_relation.discovered ? allRelationIds : [])
  if (accountId !== 'zhou_xun' || !state.triggeredEvents.includes('chapter_five_relation_unlocked')) return <Denied title="账号关联查询" />
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setFound(Object.prototype.hasOwnProperty.call(accountRelationRecords, query.trim()) ? query.trim() as RelationAccountId : null)
  }
  const add = (id: RelationAccountId) => setSelected((current) => current.includes(id) ? current : [...current, id])
  const complete = hasCompleteAccountRelation(selected)
  return <><PageHeader title="账号关联查询" description="查询账号、历史档案与设备关联。" /><Panel title="账号关联">
    <div className="relation-query-section">
      <form className="record-query-form relation-query-form" onSubmit={submit}><label>账号或档案编号<input aria-label="关联账号查询" value={query} onChange={(event) => setQuery(event.target.value)} /></label><button type="submit">查询</button></form>
    </div>
    {found && <article className="relation-result-card" aria-label={`${accountRelationRecords[found].name}账号查询结果`}><div><small>{accountRelationRecords[found].label}</small><strong>{accountRelationRecords[found].name}</strong><code>{found}</code><p>{accountRelationRecords[found].relation}</p></div><button className={`relation-add-action${selected.includes(found) ? ' is-added' : ''}`} type="button" onClick={() => add(found)} disabled={selected.includes(found)}>{selected.includes(found) ? '已加入比对' : '加入关联比对'}</button></article>}
    {!found && query && <p className="record-note">没有匹配的账号关联记录。</p>}
    {selected.length > 0 && <section className="relation-selection" aria-label="已加入比对的账号"><h3>已加入比对</h3><div>{selected.map((id) => <span key={id}><strong>{accountRelationRecords[id].name}</strong><small>{id}</small></span>)}</div></section>}
    {complete && <section className="relation-result-section" aria-labelledby="relation-result-title"><h3 id="relation-result-title">关联结果</h3><div className="relation-chain">
      <div className="relation-node"><strong>沈栀</strong><small>2024010318</small></div>
      <div className="relation-connector"><span aria-hidden="true">↓</span><small>关联终端</small></div>
      <div className="relation-terminal"><strong>TERM-OLD-03</strong><small>同一终端</small></div>
      <div className="relation-connector reverse"><span aria-hidden="true">↑</span><small>关联终端</small></div>
      <div className="relation-node emphasized"><strong>周寻</strong><small>2024010312</small></div>
      <div className="relation-connector"><span aria-hidden="true">↓</span><small>账号关联</small></div>
      <div className="relation-node"><strong>林默</strong><small>2024010307</small></div>
    </div></section>}
    <button className="primary-action relation-confirm-action" type="button" disabled={!complete || state.clues.three_account_relation.discovered} onClick={() => recordChapterFiveEvidence('account-relation')}>{state.clues.three_account_relation.discovered ? '已确认关联' : '确认关联'}</button>
    {state.clues.three_account_relation.discovered && <p className="record-note">沈栀与周寻共同关联TERM-OLD-03，林默因周寻账号进入监测范围。</p>}
  </Panel></>
}

export function LastActivityPage({ accountId, onNavigate }: { accountId: StudentAccountId; onNavigate: (url: string) => void }) {
  const { state, revealFileSection } = useGame()
  const reviewed = state.revealedFileSections.includes('chapter-five-last-activity-reviewed')
  if (accountId !== 'zhou_xun' || !state.clues.three_account_relation.discovered) return <Denied title="最后活动" />
  return <><PageHeader title="最后活动" description="周寻账号最后一段可确认的页面活动。" /><Panel title="账号活动记录">
    <div className="table-scroll"><table><thead><tr><th>时间</th><th>页面</th><th>操作</th></tr></thead><tbody>{zhouLastActivities.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div>
    <button className="record-inspect" type="button" disabled={reviewed} onClick={() => revealFileSection('chapter-five-last-activity-reviewed')}>{reviewed ? '最后活动已核对' : '确认最后活动'}</button>
    {reviewed && <div className="comparison-box"><p>消息中心恢复了一条未发送草稿。</p><button type="button" onClick={() => onNavigate('stu.qiming-high.edu.cn/messages')}>查看草稿</button></div>}
  </Panel></>
}
