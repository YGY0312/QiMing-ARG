import { useState, type FormEvent } from 'react'
import {
  adminOperators, aliveConclusionEvidence, aliveSignature, behaviorSources, exitTimeline,
  exportEvidence, identifyAdminOperator, localSessionIdentity, localSessionTimeline,
  monitoringEvidence, packageTimes, proxyTimeline, sessionVerification, validateAliveConclusion,
  validateAliveSignature, validateBehaviorSources, validateExitOrder, validateExportEvidence,
  validateLocalSessionIdentity, validateMonitoringEvidence, validatePackageTimes,
  validateSessionVerification, validateTaskPairs, verificationTaskPairs,
} from '../../data/chapterNine'
import { ModalFrame } from '../../components/ModalFrame'
import { useGame } from '../../game/GameContext'
import type { GameRoute } from '../../types/game'

const baseUrl = 'archive.qm-node.local/EXT-BACKUP-QM-0616/session/0914'
type Section = 'home' | 'timeline' | 'source' | 'tasks' | 'proxy' | 'exit' | 'alive'
const sectionNames: Record<Exclude<Section, 'home'>, string> = {
  timeline: '会话时间线', source: '来源分类', tasks: '验证任务',
  proxy: '代理会话', exit: '离校记录', alive: '存活签名',
}

export function ChapterNineArchive({ route, onNavigate }: { route: GameRoute; onNavigate: (url: string) => void }) {
  const tail = route.pathname.split('/').at(-1) as Section
  const section: Section = ['timeline', 'source', 'tasks', 'proxy', 'exit', 'alive'].includes(tail) ? tail : 'home'
  if (section === 'home') return <SessionHome onNavigate={onNavigate} />
  return <SessionSection section={section} onNavigate={onNavigate} />
}

function SessionHome({ onNavigate }: { onNavigate: (url: string) => void }) {
  const { state, unlockChapterNineSession } = useGame()
  const unlocked = state.triggeredEvents.includes('chapter_nine_session_unlocked')
  const prefilled = state.revealedFileSections.includes('chapter-nine-session-fields-filled')
  const [fields, setFields] = useState(prefilled ? { ...sessionVerification } : { account: '', terminal: '', exportObject: '' })
  const [error, setError] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!validateSessionVerification(fields)) { setError(true); return }
    setError(false); unlockChapterNineSession()
  }
  if (!state.triggeredEvents.includes('chapter_nine_started')) return <main><h1>0914本地会话</h1><p>状态：等待验证</p></main>
  const unlockedSections: Record<Exclude<Section, 'home'>, boolean> = {
    timeline: true,
    source: true,
    tasks: state.triggeredEvents.includes('chapter_nine_source_classification_unlocked'),
    proxy: state.triggeredEvents.includes('chapter_nine_admin_trace_unlocked'),
    exit: state.triggeredEvents.includes('chapter_nine_witness_unlocked'),
    alive: state.triggeredEvents.includes('chapter_nine_alive_check_unlocked'),
  }
  const complete = state.triggeredEvents.includes('chapter_nine_final_unlocked')
  return <main className="incident-page"><p className="node-path">/session/0914/</p><h1>0914本地会话</h1>
    <dl><div><dt>来源</dt><dd>TERM-OLD-03</dd></div><div><dt>账户</dt><dd>2024010312</dd></div><div><dt>状态</dt><dd>{unlocked ? '可进行分段恢复' : '等待验证'}</dd></div></dl>
    {!unlocked && <form className="archive-verify-form" onSubmit={submit}><h2>会话校验</h2>
      <label>账户编号<input aria-label="会话账户编号" value={fields.account} onChange={(e) => setFields({ ...fields, account: e.target.value })} /></label>
      <label>来源终端<input aria-label="会话来源终端" value={fields.terminal} onChange={(e) => setFields({ ...fields, terminal: e.target.value })} /></label>
      <label>导出对象<input aria-label="会话导出对象" value={fields.exportObject} onChange={(e) => setFields({ ...fields, exportObject: e.target.value })} /></label>
      <button type="submit">校验0914会话</button>{error && <p role="alert">会话校验信息不一致。</p>}
    </form>}
    {unlocked && <nav className="incident-directory" aria-label="0914会话目录">{(Object.keys(unlockedSections) as Array<keyof typeof unlockedSections>).map((key) =>
      <button key={key} type="button" disabled={!unlockedSections[key]} onClick={() => onNavigate(`${baseUrl}/${key}`)}>/{key}/ <span>{unlockedSections[key] ? sectionNames[key] : '锁定'}</span></button>)}</nav>}
    {complete && <section className="incident-card"><h2>完整0914会话结论</h2><div className="report-comparison">
      <article><h3>周寻本人 · 23:48至00:02</h3><p>本地登录、创建草稿、移除设备、导出资料、建立验证任务并写入校验密钥。</p></article>
      <article><h3>预设任务 · 条件执行</h3><p>按调查证据完成情况开放部分外部索引和调查备份。</p></article>
      <article><h3>ADMIN_03代理 · 00:03以后</h3><p>修改草稿元数据、建立代理会话、查询并监测林默。</p></article>
      <article><h3>系统外确认</h3><p>顾言00:37目击；9月18日ZX-KEY-01签名验证通过。</p></article>
    </div><p className="system-complete-note">最终结论：周寻还活着，已经离开学校。</p></section>}
  </main>
}

function SessionSection({ section, onNavigate }: { section: Exclude<Section, 'home'>; onNavigate: (url: string) => void }) {
  const { state } = useGame()
  const allowed = section === 'timeline' || section === 'source'
    || (section === 'tasks' && state.triggeredEvents.includes('chapter_nine_source_classification_unlocked'))
    || (section === 'proxy' && state.triggeredEvents.includes('chapter_nine_admin_trace_unlocked'))
    || (section === 'exit' && state.triggeredEvents.includes('chapter_nine_witness_unlocked'))
    || (section === 'alive' && state.triggeredEvents.includes('chapter_nine_alive_check_unlocked'))
  if (!state.triggeredEvents.includes('chapter_nine_session_unlocked') || !allowed) return <main><h1>/{section}/</h1><p>权限不足或该目录尚未恢复。</p></main>
  return <main className="incident-page"><button className="node-back" type="button" onClick={() => onNavigate(baseUrl)}>← 返回 session/0914</button>
    {section === 'timeline' && <Timeline />}
    {section === 'source' && <SourceClassification />}
    {section === 'tasks' && <Tasks />}
    {section === 'proxy' && <Proxy />}
    {section === 'exit' && <Exit />}
    {section === 'alive' && <Alive />}
  </main>
}

function Timeline() {
  const { state, recordChapterNineEvidence } = useGame()
  const [identity, setIdentity] = useState({ type: '', terminal: '', auth: '' })
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState('')
  const confirmIdentity = () => {
    if (!validateLocalSessionIdentity(identity)) { setError('会话身份特征不一致。'); return }
    setError(''); recordChapterNineEvidence('local-session')
  }
  const confirmExport = () => {
    if (!validateExportEvidence(selected)) { setError('导出记录不能形成完整链条。'); return }
    setError(''); recordChapterNineEvidence('export-completed')
  }
  return <><h1>周寻本地会话</h1><ol className="incident-full-timeline">{localSessionTimeline.map(([time, text]) => <li key={time}><time>{time}</time><span>{text}</span></li>)}</ol>
    <section className="incident-card"><h2>核对身份特征</h2>
      <label>会话类型<select aria-label="本地会话类型" value={identity.type} onChange={(e) => setIdentity({ ...identity, type: e.target.value })}><option value="">请选择</option><option>LOCAL_SESSION</option><option>PROXY_SESSION</option></select></label>
      <label>设备<select aria-label="本地会话设备" value={identity.terminal} onChange={(e) => setIdentity({ ...identity, terminal: e.target.value })}><option value="">请选择</option><option>TERM-OLD-03</option><option>IC-SEC-02</option></select></label>
      <label>认证<select aria-label="本地会话认证" value={identity.auth} onChange={(e) => setIdentity({ ...identity, auth: e.target.value })}><option value="">请选择</option><option>本地凭证</option><option>服务授权</option></select></label>
      <button type="button" disabled={state.clues.zhou_local_session_verified.discovered} onClick={confirmIdentity}>{state.clues.zhou_local_session_verified.discovered ? '本地会话已确认' : '确认周寻本地会话'}</button>
    </section>
    {state.clues.zhou_local_session_verified.discovered && <section className="incident-card"><h2>验证导出结果</h2><fieldset><legend>选择完整导出链</legend>{exportEvidence.map((item) => <label key={item}><input type="checkbox" aria-label={`选择${item}`} checked={selected.includes(item)} onChange={(e) => setSelected(e.target.checked ? [...selected, item] : selected.filter((value) => value !== item))} />{item}</label>)}</fieldset><button type="button" disabled={state.clues.zhou_export_completed.discovered} onClick={confirmExport}>{state.clues.zhou_export_completed.discovered ? '外部导出已确认' : '验证导出结果'}</button></section>}
    {error && <p role="alert">{error}</p>}
  </>
}

function SourceClassification() {
  const { state, revealFileSection } = useGame()
  const [values, setValues] = useState<Record<keyof typeof behaviorSources, string>>({ draft: '', export: '', externalIndex: '', draftModification: '', linmoQuery: '' })
  const [error, setError] = useState(false)
  const labels: Record<keyof typeof behaviorSources, string> = { draft: '创建草稿', export: '导出ARCHIVE_0616', externalIndex: '解锁外部备份索引', draftModification: '修改草稿最后时间', linmoQuery: '查询林默账号' }
  const submit = () => {
    if (!validateBehaviorSources(values)) { setError(true); return }
    setError(false); revealFileSection('chapter-nine-source-classified')
  }
  return <><h1>行为来源分类</h1><div className="report-comparison"><article><h2>LOCAL_SESSION</h2><p>TERM-OLD-03 · 本地凭证 · 23:48至00:02</p></article><article><h2>DELAYED_JOB</h2><p>ZX-VERIFY-01 · 条件满足后执行</p></article><article><h2>PROXY_SESSION</h2><p>IC-SEC-02 · ADMIN_03 · 00:03以后</p></article></div>
    <div className="incident-order">{(Object.keys(values) as Array<keyof typeof values>).map((key) => <label key={key}>{labels[key]}<select aria-label={`来源分类${labels[key]}`} value={values[key]} onChange={(e) => setValues({ ...values, [key]: e.target.value })}><option value="">请选择</option><option>LOCAL_SESSION</option><option>DELAYED_JOB</option><option>PROXY_SESSION</option></select></label>)}</div>
    <button type="button" disabled={state.revealedFileSections.includes('chapter-nine-source-classified')} onClick={submit}>{state.revealedFileSections.includes('chapter-nine-source-classified') ? '来源分类已完成' : '确认来源分类'}</button>{error && <p role="alert">行为来源分类不正确。</p>}
  </>
}

function Tasks() {
  const { state, recordChapterNineEvidence } = useGame()
  const [pairs, setPairs] = useState<Record<keyof typeof verificationTaskPairs, string>>({ '原始名单': '', 'TERM-OLD-03证据': '', '0616身份确认': '' })
  const [error, setError] = useState(false)
  const submit = () => {
    if (!validateTaskPairs(pairs)) { setError(true); return }
    setError(false); recordChapterNineEvidence('verification-tasks')
  }
  return <><h1>ZX-VERIFY-01验证任务</h1><dl><div><dt>创建</dt><dd>2026-09-15 00:00:26</dd></div><div><dt>来源</dt><dd>LOCAL_SESSION</dd></div><div><dt>类型</dt><dd>条件验证</dd></div></dl>
    <div className="incident-order">{(Object.keys(pairs) as Array<keyof typeof pairs>).map((key) => <label key={key}>{key}<select aria-label={`任务配对${key}`} value={pairs[key]} onChange={(e) => setPairs({ ...pairs, [key]: e.target.value })}><option value="">请选择</option><option>外部索引</option><option>pending目录</option><option>医疗记录</option></select></label>)}</div>
    <button type="button" disabled={state.clues.delayed_verification_tasks.discovered} onClick={submit}>{state.clues.delayed_verification_tasks.discovered ? '验证任务已记录' : '记录验证任务'}</button>{error && <p role="alert">任务与入口配对不正确。</p>}
  </>
}

function Proxy() {
  const { state, recordChapterNineEvidence } = useGame()
  const [tracking, setTracking] = useState<string[]>([])
  const [operator, setOperator] = useState('')
  const [error, setError] = useState('')
  const confirmTracking = () => {
    if (!validateMonitoringEvidence(tracking)) { setError('追踪证据链不完整。'); return }
    setError(''); recordChapterNineEvidence('linmo-monitoring')
  }
  const confirmOperator = () => {
    if (!identifyAdminOperator(operator)) { setError('所选对象无法同时匹配三类记录。'); return }
    setError(''); recordChapterNineEvidence('operator-identified')
  }
  return <><h1>ADMIN_03代理会话</h1><dl><div><dt>认证方式</dt><dd>ADMIN_03服务授权</dd></div><div><dt>会话类型</dt><dd>PROXY_SESSION</dd></div><div><dt>原账号密码</dt><dd>未使用</dd></div></dl>
    <ol className="incident-full-timeline">{proxyTimeline.map(([time, text]) => <li key={time}><time>{time}</time><span>{text}</span></li>)}</ol>
    <button type="button" disabled={state.clues.admin_proxy_session.discovered || !state.revealedFileSections.includes('chapter-nine-source-classified')} onClick={() => recordChapterNineEvidence('admin-proxy')}>{state.clues.admin_proxy_session.discovered ? '管理员代理已确认' : '确认管理员代理'}</button>
    {state.clues.admin_proxy_session.discovered && <section className="incident-card"><h2>00:04草稿隐藏字段</h2><p>正文未发生主要变化；新增字段：<code>TRACE_TARGET=LAST_READER</code></p><p>首次触发对象：2024010307 · 林默</p><fieldset><legend>建立监测证据链</legend>{monitoringEvidence.map((item) => <label key={item}><input type="checkbox" aria-label={`监测证据${item}`} checked={tracking.includes(item)} onChange={(e) => setTracking(e.target.checked ? [...tracking, item] : tracking.filter((value) => value !== item))} />{item}</label>)}</fieldset><button type="button" disabled={state.clues.monitoring_target_linmo.discovered} onClick={confirmTracking}>{state.clues.monitoring_target_linmo.discovered ? '林默监测已确认' : '确认林默监测链'}</button></section>}
    {state.clues.admin_proxy_session.discovered && <section className="incident-card"><h2>代理来源追踪</h2><p>IC-SEC-02：技术负责人23:42登录至00:18；信息中心门禁记录为23:39进入、00:21离开。</p><div className="table-scroll"><table><thead><tr><th>候选</th><th>身份</th><th>门禁</th><th>终端</th><th>授权</th></tr></thead><tbody>{adminOperators.map((item) => <tr key={item.id}><td>{item.name}<br /><small>{item.staffId}</small></td><td>{item.role}</td><td>{item.access ? '匹配' : '不匹配'}</td><td>{item.terminal ? '匹配' : '不匹配'}</td><td>{item.authorized ? '成员' : '否'}</td></tr>)}</tbody></table></div><label>选择关键操作者<select aria-label="关键操作者" value={operator} onChange={(e) => setOperator(e.target.value)}><option value="">请选择</option>{adminOperators.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button type="button" disabled={state.clues.admin03_operator_identified.discovered} onClick={confirmOperator}>{state.clues.admin03_operator_identified.discovered ? '关键操作者已确认' : '确认关键操作者'}</button><p>该结论只对应本次代理会话及部分技术清理；启明计划并非由单一人员建立或运行。</p></section>}
    {error && <p role="alert">{error}</p>}
  </>
}

function Exit() {
  const { state, recordChapterNineEvidence, revealFileSection } = useGame()
  const [order, setOrder] = useState<string[]>(exitTimeline.map(() => ''))
  const [times, setTimes] = useState({ deposited: '', received: '' })
  const [error, setError] = useState('')
  const confirmSighting = () => {
    if (!validateExitOrder(order)) { setError('离校时间线顺序不正确。'); return }
    setError(''); recordChapterNineEvidence('last-sighting')
  }
  const confirmPackage = () => {
    if (!validatePackageTimes(times)) { setError('投递与节点确认时间不一致。'); return }
    setError(''); revealFileSection('chapter-nine-physical-package-verified')
  }
  return <><h1>顾言最后目击记录</h1><section className="incident-card"><h2>未发送说明：我最后一次见到周寻</h2><p>九月十五日零点三十多分，我在学校东门外见到了周寻。他没有回宿舍，手上有轻微擦伤，但人是清醒的，也能自己行走。</p><p>他交给我一个封好的文件袋，让我在一点以后放进校外寄存柜。他没有告诉我去向，只说退学证明不是他申请的。我没有打开文件袋。</p></section>
    <div className="incident-order">{order.map((value, index) => <label key={index}>节点 {index + 1}<select aria-label={`离校节点${index + 1}`} value={value} onChange={(e) => setOrder(order.map((item, i) => i === index ? e.target.value : item))}><option value="">请选择</option>{exitTimeline.map((item) => <option key={item.id} value={item.id}>{item.time} · {item.label}</option>)}</select></label>)}</div>
    <button type="button" disabled={state.clues.monitor_last_sighting.discovered} onClick={confirmSighting}>{state.clues.monitor_last_sighting.discovered ? '最后目击已确认' : '确认离校时间线'}</button>
    {state.clues.monitor_last_sighting.discovered && <section className="incident-card"><h2>physical_package_ref</h2><p>内容索引：CERT_ORIGINAL / ADMIN_CHAIN / QM_AUTH_LIST / PUBLIC_PACKAGE（正文锁定）</p><label>顾言寄存柜时间<select aria-label="文件袋投递时间" value={times.deposited} onChange={(e) => setTimes({ ...times, deposited: e.target.value })}><option value="">请选择</option><option>{packageTimes.deposited}</option><option>2026-09-15 00:37</option></select></label><label>外部节点首次确认<select aria-label="节点接收时间" value={times.received} onChange={(e) => setTimes({ ...times, received: e.target.value })}><option value="">请选择</option><option>{packageTimes.received}</option><option>2026-09-15 01:12</option></select></label><button type="button" disabled={state.revealedFileSections.includes('chapter-nine-physical-package-verified')} onClick={confirmPackage}>{state.revealedFileSections.includes('chapter-nine-physical-package-verified') ? '物理投递已核对' : '核对物理投递与节点确认'}</button></section>}
    {error && <p role="alert">{error}</p>}
  </>
}

function Alive() {
  const { state, recordChapterNineEvidence } = useGame()
  const [fields, setFields] = useState({ signature: '', account: '', exportObject: '' })
  const [verified, setVerified] = useState(state.clues.external_alive_signature.discovered)
  const [selected, setSelected] = useState<string[]>([])
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const verify = (event: FormEvent) => {
    event.preventDefault()
    if (!validateAliveSignature(fields)) { setError('签名校验信息不一致。'); return }
    setError(''); setVerified(true)
  }
  const beginConclusion = () => {
    if (!validateAliveConclusion(selected) || !state.clues.external_alive_signature.discovered) { setError('存活结论证据链尚不完整。'); return }
    setError(''); setConfirming(true)
  }
  return <><h1>系统外存活签名</h1><dl><div><dt>接收时间</dt><dd>2026-09-18 04:12</dd></div><div><dt>签名标识</dt><dd>ZX-KEY-01</dd></div><div><dt>密钥写入</dt><dd>2026-09-15 00:01:32</dd></div><div><dt>位置字段</dt><dd>已删除</dd></div><div><dt>来源</dt><dd>匿名中继</dd></div></dl>
    {!verified && <form className="archive-verify-form" onSubmit={verify}><label>签名标识<input aria-label="存活签名标识" value={fields.signature} onChange={(e) => setFields({ ...fields, signature: e.target.value })} /></label><label>对应账户<input aria-label="存活签名账户" value={fields.account} onChange={(e) => setFields({ ...fields, account: e.target.value })} /></label><label>原始导出对象<input aria-label="存活签名导出对象" value={fields.exportObject} onChange={(e) => setFields({ ...fields, exportObject: e.target.value })} /></label><button type="submit">验证签名</button></form>}
    {verified && <section className="incident-card"><h2>签名验证通过</h2><p>我已经离开。</p><p>不要回复。不要找我。</p><p>把最后一份原始记录取出来。如果学生系统里显示我已经退学，去查那份证明是谁签发的。</p><button type="button" disabled={state.clues.external_alive_signature.discovered} onClick={() => recordChapterNineEvidence('alive-signature')}>{state.clues.external_alive_signature.discovered ? '系统外签名已记录' : '记录系统外签名'}</button></section>}
    {state.clues.external_alive_signature.discovered && <section className="incident-card"><h2>确认周寻状态</h2><fieldset><legend>将三项证据加入结论</legend>{aliveConclusionEvidence.map((item) => <label key={item}><input type="checkbox" aria-label={`存活证据${item}`} checked={selected.includes(item)} onChange={(e) => setSelected(e.target.checked ? [...selected, item] : selected.filter((value) => value !== item))} />{item}</label>)}</fieldset><button type="button" disabled={state.clues.zhou_alive_and_departed.discovered} onClick={beginConclusion}>{state.clues.zhou_alive_and_departed.discovered ? '周寻状态已确认' : '确认周寻状态'}</button></section>}
    {confirming && <ModalFrame title="确认周寻状态" onClose={() => setConfirming(false)}><p>现有证据可以确认周寻在离开学校后仍然活着，但不能确定其具体位置。</p><div className="modal-actions"><button type="button" onClick={() => { recordChapterNineEvidence('alive-departed'); setConfirming(false) }}>确认结论</button><button type="button" onClick={() => setConfirming(false)}>继续调查</button></div></ModalFrame>}
    {error && <p role="alert">{error}</p>}
  </>
}

export function CertificateChainPage() {
  const { state } = useGame()
  if (!state.triggeredEvents.includes('chapter_nine_certificate_chain_unlocked')) return <><h1>退学证明签发链</h1><p>权限不足或签发链尚未开放。</p></>
  return <><h1>退学证明签发链</h1><dl><div><dt>文件</dt><dd>退学证明_2024010312.pdf</dd></div><div><dt>申请来源</dt><dd>缺失</dd></div><div><dt>学生确认</dt><dd>缺失</dd></div><div><dt>监护人确认</dt><dd>缺失</dd></div><div><dt>审批状态</dt><dd>已完成</dd></div><div><dt>签发权限</dt><dd>ADMIN_03</dd></div><div><dt>签发时间</dt><dd>2026-09-15 06:20</dd></div><div><dt>关联任务</dt><dd>QM-CLOSE-0915</dd></div><div><dt>最终验证</dt><dd>未完成</dd></div></dl><p>需要原始证明、权限授权表和公开证据包完成最终验证。</p></>
}
