import { useState, type FormEvent } from 'react'
import {
  accessComparison, accessRecords, calculateDelay, cleanupEvidence, completeIncidentTimeline,
  emergencySteps, incidentVerification, isCorrectEmergencyOrder, isCorrectLastRoute,
  lastRouteNodes, medicalIdentity, reportDifferences, rescueTimes, tmpRecoverySources,
  validateAccessComparison, validateCleanupEvidence, validateIncidentVerification,
  validateMedicalIdentity, validateReportDifferences, validateTmpRecovery,
} from '../../data/chapterEight'
import { useGame } from '../../game/GameContext'
import type { ChapterEightEvidenceAction, GameRoute } from '../../types/game'

const baseUrl = 'archive.qm-node.local/EXT-BACKUP-QM-0616/incident/0616'
type Section = 'home' | 'timeline' | 'access' | 'emergency' | 'medical' | 'internal' | 'cleanup'

export function ChapterEightArchive({ route, onNavigate }: { route: GameRoute; onNavigate: (url: string) => void }) {
  const section = route.pathname.split('/').at(-1) as Section
  const activeSection: Section = ['timeline', 'access', 'emergency', 'medical', 'internal', 'cleanup'].includes(section) ? section : 'home'
  if (activeSection === 'home') return <IncidentHome onNavigate={onNavigate} />
  return <IncidentSection section={activeSection} onNavigate={onNavigate} />
}

function IncidentHome({ onNavigate }: { onNavigate: (url: string) => void }) {
  const { state, unlockChapterEightIncident } = useGame()
  const unlocked = state.triggeredEvents.includes('chapter_eight_incident_unlocked')
  const allRecovered = state.triggeredEvents.includes('chapter_eight_final_unlocked')
  const prefilled = state.revealedFileSections.includes('chapter-eight-incident-fields-filled')
  const [fields, setFields] = useState(prefilled ? { ...incidentVerification } : { objectId: '', date: '', device: '' })
  const [error, setError] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!validateIncidentVerification(fields)) { setError(true); return }
    setError(false)
    unlockChapterEightIncident()
  }
  if (!state.triggeredEvents.includes('chapter_eight_started')) return <main><h1>0616事件记录</h1><p>目录已锁定</p><p>需要更多原始时间记录</p></main>
  return <main className="incident-page"><p className="node-path">/backup/0616/incident/0616/</p><h1>0616事件记录包</h1>
    <dl><div><dt>完整性</dt><dd>{allRecovered ? '事件时间线已恢复' : '43%'}</dd></div><div><dt>状态</dt><dd>{unlocked ? '可进行分段恢复' : '等待校验'}</dd></div></dl>
    {!unlocked && <form className="archive-verify-form" onSubmit={submit}><h2>事件索引校验</h2>
      <label>对象编号<input aria-label="事件对象编号" value={fields.objectId} onChange={(event) => setFields({ ...fields, objectId: event.target.value })} /></label>
      <label>事件日期<input aria-label="事件日期" value={fields.date} onChange={(event) => setFields({ ...fields, date: event.target.value })} /></label>
      <label>来源设备<input aria-label="事件来源设备" value={fields.device} onChange={(event) => setFields({ ...fields, device: event.target.value })} /></label>
      <button type="submit">校验事件记录</button>{error && <p role="alert">校验信息不一致。</p>}
    </form>}
    {unlocked && <><DirectoryList onNavigate={onNavigate} />
      {allRecovered && <section className="incident-card"><h2>事件时间线已恢复</h2><ol className="incident-full-timeline">{completeIncidentTimeline.map(([time, text]) => <li key={`${time}-${text}`}><time>{time}</time><span>{text}</span></li>)}</ol></section>}
    </>}
  </main>
}

function DirectoryList({ onNavigate }: { onNavigate: (url: string) => void }) {
  const { state } = useGame()
  const unlocked = {
    timeline: true, access: true,
    emergency: state.triggeredEvents.includes('chapter_eight_emergency_records_unlocked'),
    medical: state.triggeredEvents.includes('chapter_eight_medical_records_unlocked'),
    internal: state.clues.medical_identity_matched.discovered && state.clues.shenzhi_death_confirmed.discovered,
    cleanup: state.triggeredEvents.includes('chapter_eight_cleanup_records_unlocked'),
  }
  return <nav className="incident-directory" aria-label="0616事件目录">
    {(Object.keys(unlocked) as Array<keyof typeof unlocked>).map((key) => <button key={key} type="button" disabled={!unlocked[key]} onClick={() => onNavigate(`${baseUrl}/${key}`)}>/{key}/ <span>{unlocked[key] ? key === 'access' ? '部分可读取' : '可读取' : '锁定'}</span></button>)}
  </nav>
}

function IncidentSection({ section, onNavigate }: { section: Section; onNavigate: (url: string) => void }) {
  const { state } = useGame()
  const allowed = section === 'timeline' || section === 'access'
    || (section === 'emergency' && state.triggeredEvents.includes('chapter_eight_emergency_records_unlocked'))
    || (section === 'medical' && state.triggeredEvents.includes('chapter_eight_medical_records_unlocked'))
    || (section === 'internal' && state.clues.medical_identity_matched.discovered && state.clues.shenzhi_death_confirmed.discovered)
    || (section === 'cleanup' && state.triggeredEvents.includes('chapter_eight_cleanup_records_unlocked'))
  if (!state.triggeredEvents.includes('chapter_eight_incident_unlocked') || !allowed) return <ArchiveMessage title={`/${section}/`} text="权限不足或该目录尚未恢复。" />
  return <main className="incident-page"><button className="node-back" type="button" onClick={() => onNavigate(baseUrl)}>← 返回 incident/0616</button>
    {section === 'timeline' && <TimelinePage />}
    {section === 'access' && <AccessPage />}
    {section === 'emergency' && <EmergencyPage />}
    {section === 'medical' && <MedicalPage />}
    {section === 'internal' && <InternalPage />}
    {section === 'cleanup' && <CleanupPage />}
  </main>
}

function TimelinePage() {
  const { state, recordChapterEightEvidence, revealFileSection } = useGame()
  const [order, setOrder] = useState<string[]>(lastRouteNodes.map(() => ''))
  const [checked, setChecked] = useState(false)
  const [sources, setSources] = useState<string[]>([])
  const [recovered, setRecovered] = useState(state.revealedFileSections.includes('chapter-eight-tmp-recovered'))
  const [error, setError] = useState('')
  const confirmRoute = () => {
    if (!isCorrectLastRoute(order)) { setError('时间线顺序不正确。'); return }
    setError(''); setChecked(true); recordChapterEightEvidence('last-route')
  }
  const recover = () => {
    if (!validateTmpRecovery(sources)) { setError('恢复来源无法形成有效关联。'); return }
    setError(''); setRecovered(true); revealFileSection('chapter-eight-tmp-recovered')
  }
  return <><h1>最后路线恢复</h1><p>将五个节点按时间顺序排列。</p>
    <div className="incident-order">{order.map((value, index) => <label key={index}>节点 {index + 1}<select aria-label={`路线节点${index + 1}`} value={value} onChange={(event) => setOrder(order.map((item, i) => i === index ? event.target.value : item))}><option value="">请选择</option>{lastRouteNodes.map((node) => <option key={node.id} value={node.id}>{node.time} · {node.label}</option>)}</select></label>)}</div>
    {checked && <p className="system-complete-note">沈栀从东侧入口进入，经过广播设备室，最终到达三层设备间，并在终端写入后生成临时文件。</p>}
    <button type="button" disabled={state.clues.shenzhi_last_route.discovered} onClick={confirmRoute}>{state.clues.shenzhi_last_route.discovered ? '最后路线已记录' : '确认最后路线'}</button>
    {state.clues.shenzhi_last_route.discovered && state.clues.equipment_room_override.discovered && <section className="incident-card"><h2>222801.tmp 恢复</h2><dl><div><dt>创建时间</dt><dd>2026-06-16 22:28:01</dd></div><div><dt>来源</dt><dd>CAM-07</dd></div><div><dt>格式</dt><dd>损坏临时缓存</dd></div></dl>
      <fieldset><legend>选择三个相关来源</legend>{tmpRecoverySources.map((item) => <label key={item}><input type="checkbox" aria-label={`恢复来源${item}`} checked={sources.includes(item)} onChange={(event) => setSources(event.target.checked ? [...sources, item] : sources.filter((value) => value !== item))} />{item}</label>)}</fieldset>
      {!recovered && <button type="button" onClick={recover}>恢复临时缓存</button>}
      {recovered && <><pre className="incident-fragment">记录类型：自动缓存{'\n'}设备状态：剧烈运动后中断{'\n'}最后定位：旧实验楼三层封闭通道{'\n\n'}22:27:48 “开门……”{'\n'}22:27:55 撞击声{'\n'}22:28:00 设备失去稳定信号</pre><button type="button" disabled={state.clues.cam_tmp_recovered.discovered} onClick={() => recordChapterEightEvidence('cam-tmp')}>{state.clues.cam_tmp_recovered.discovered ? '临时缓存已记录' : '记录临时缓存'}</button></>}
    </section>}
    {error && <p role="alert">{error}</p>}
  </>
}

function AccessPage() {
  const { state, recordChapterEightEvidence } = useGame()
  const [fields, setFields] = useState({ audioBreak: '', override: '', rescueCall: '' })
  const [error, setError] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!validateAccessComparison(fields)) { setError(true); return }
    setError(false); recordChapterEightEvidence('equipment-override')
  }
  return <><h1>门禁维护覆盖记录</h1><div className="table-scroll"><table><thead><tr><th>时间</th><th>区域</th><th>操作</th><th>状态</th><th>权限</th></tr></thead><tbody>{accessRecords.map((row) => <tr key={row.time}><td>{row.time}</td><td>{row.area}</td><td>{row.action}</td><td>{row.status}</td><td>{row.permission}</td></tr>)}</tbody></table></div>
    <form className="incident-compare-form" onSubmit={submit}><h2>核对时间关系</h2>
      <label>录音中断<select aria-label="录音中断时间" value={fields.audioBreak} onChange={(e) => setFields({ ...fields, audioBreak: e.target.value })}><TimeOptions /></select></label>
      <label>维护覆盖<select aria-label="维护覆盖时间" value={fields.override} onChange={(e) => setFields({ ...fields, override: e.target.value })}><TimeOptions /></select></label>
      <label>外部急救呼叫<select aria-label="外部急救呼叫时间" value={fields.rescueCall} onChange={(e) => setFields({ ...fields, rescueCall: e.target.value })}><TimeOptions /></select></label>
      <button type="submit" disabled={state.clues.equipment_room_override.discovered}>{state.clues.equipment_room_override.discovered ? '门禁覆盖已记录' : '记录门禁覆盖'}</button>{error && <p role="alert">时间核对不一致。</p>}
    </form>
  </>
}
function TimeOptions() { return <><option value="">请选择</option>{Object.values(accessComparison).map((time) => <option key={time} value={time}>{time}</option>)}</> }

function EmergencyPage() {
  const { state, recordChapterEightEvidence } = useGame()
  const [order, setOrder] = useState<string[]>(['', '', ''])
  const [delayStart, setDelayStart] = useState('')
  const [delayEnd, setDelayEnd] = useState('')
  const [calculated, setCalculated] = useState('')
  const [error, setError] = useState('')
  const confirmSignal = () => {
    if (!isCorrectEmergencyOrder(order)) { setError('内部处置顺序不正确。'); return }
    setError(''); recordChapterEightEvidence('emergency-signal')
  }
  const calculate = () => {
    const result = calculateDelay(delayStart, delayEnd)
    if (!result || delayStart !== rescueTimes.start || delayEnd !== rescueTimes.end) { setError('请选择紧急按钮触发和外部急救呼叫。'); return }
    setError(''); setCalculated(result.label)
  }
  return <><h1>紧急响应记录</h1><div className="incident-order">{order.map((value, index) => <label key={index}>步骤 {index + 1}<select aria-label={`紧急处置步骤${index + 1}`} value={value} onChange={(event) => setOrder(order.map((item, i) => i === index ? event.target.value : item))}><option value="">请选择</option>{emergencySteps.map((step) => <option key={step.id} value={step.id}>{step.time} · {step.label}</option>)}</select></label>)}</div>
    <button type="button" disabled={state.clues.emergency_signal_received.discovered} onClick={confirmSignal}>{state.clues.emergency_signal_received.discovered ? '紧急信号已记录' : '确认内部处置顺序'}</button>
    {state.clues.emergency_signal_received.discovered && <section className="incident-card"><h2>外部急救时间比对</h2><p>救护车辆于22:55:40到达旧实验楼东侧入口。</p><label>起点<select aria-label="急救延误起点" value={delayStart} onChange={(e) => setDelayStart(e.target.value)}><option value="">请选择</option><option value="22:31:44">22:31:44 紧急按钮触发</option><option value="22:32:06">22:32:06 安保查看</option></select></label><label>终点<select aria-label="急救延误终点" value={delayEnd} onChange={(e) => setDelayEnd(e.target.value)}><option value="">请选择</option><option value="22:34:12">22:34:12 内部处置</option><option value="22:46:18">22:46:18 外部急救呼叫</option></select></label><button type="button" onClick={calculate}>计算响应间隔</button>
      {calculated && <><p className="system-complete-note">紧急信号已被内部系统接收，但外部急救在{calculated}后才被呼叫。</p><button type="button" disabled={state.clues.external_rescue_delayed.discovered} onClick={() => recordChapterEightEvidence('rescue-delay')}>{state.clues.external_rescue_delayed.discovered ? '急救延误已记录' : '记录急救延误'}</button></>}
    </section>}
    {error && <p role="alert">{error}</p>}
  </>
}

function MedicalPage() {
  const { state, recordChapterEightEvidence } = useGame()
  const matched = state.clues.medical_identity_matched.discovered
  const [fields, setFields] = useState({ studentNumber: '', device: '', source: '' })
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!validateMedicalIdentity(fields)) { setError('身份信息无法匹配。'); return }
    setError(''); recordChapterEightEvidence('medical-identity')
  }
  return <><h1>匿名医疗接收记录</h1><dl><div><dt>医疗机构</dt><dd>启明市第二急救中心</dd></div><div><dt>接收时间</dt><dd>2026-06-16 23:16</dd></div><div><dt>患者</dt><dd>{matched ? '沈栀 · 2024010318 · 高二（3）班' : '未确认女学生'}</dd></div><div><dt>来源地点</dt><dd>启明中学旧实验楼</dd></div><div><dt>送达状态</dt><dd>重伤</dd></div><div><dt>随身物品</dt><dd>学生卡残片、CAM-07设备包、标记2024010318的存储介质</dd></div></dl>
    {!matched && <form className="incident-compare-form" onSubmit={submit}><h2>匹配身份</h2><label>学生编号<input aria-label="医疗学生编号" value={fields.studentNumber} onChange={(e) => setFields({ ...fields, studentNumber: e.target.value })} /></label><label>设备编号<input aria-label="医疗设备编号" value={fields.device} onChange={(e) => setFields({ ...fields, device: e.target.value })} /></label><label>来源地点<input aria-label="医疗来源地点" value={fields.source} onChange={(e) => setFields({ ...fields, source: e.target.value })} /></label><button type="submit">确认身份匹配</button></form>}
    {matched && <section className="incident-card medical-conclusion"><h2>最终医疗结论</h2><dl><div><dt>患者</dt><dd>沈栀</dd></div><div><dt>抢救结束</dt><dd>2026-06-16 23:58</dd></div><div><dt>结果</dt><dd>抢救无效死亡</dd></div><div><dt>主要伤情</dt><dd>严重颅脑损伤及失血性休克</dd></div><div><dt>记录状态</dt><dd>内部归档 · 学校已确认</dd></div></dl><button type="button" disabled={state.clues.shenzhi_death_confirmed.discovered} onClick={() => setConfirming(true)}>{state.clues.shenzhi_death_confirmed.discovered ? '最终结论已记录' : '记录最终医疗结论'}</button></section>}
    {error && <p role="alert">{error}</p>}
    {confirming && <div className="incident-confirm" role="dialog" aria-modal="true" aria-label="确认最终医疗结论"><section><h2>确认记录</h2><p>该记录将明确确认沈栀的最终下落。</p><button type="button" onClick={() => { recordChapterEightEvidence('death-confirmation'); setConfirming(false) }}>确认记录</button><button type="button" onClick={() => setConfirming(false)}>取消</button></section></div>}
  </>
}

function InternalPage() {
  const { state, recordChapterEightEvidence } = useGame()
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState(false)
  const confirm = () => {
    if (!validateReportDifferences(selected)) { setError(true); return }
    setError(false); recordChapterEightEvidence('report-falsification')
  }
  return <><h1>内部与对外事件报告</h1><div className="incident-report-grid"><article><h2>原始事件摘要</h2><small>外部备份残片 · 2026-06-17 00:26</small><p>一名学生在旧实验楼三层封闭通道受伤。设备间门禁被维护权限覆盖。校园安保收到紧急信号后先进行内部处置。学生送医后抢救无效死亡。</p><p>对象：2024010318</p></article><article><h2>对外事件登记</h2><small>2026-06-17 06:40</small><p>学生因个人原因在校外发生意外。学校已协助家属处理相关事项。该生后续不再返校。</p><p>事件类型：校外个人意外</p></article></div>
    <fieldset><legend>选择两份报告中存在的差异</legend>{reportDifferences.map((item) => <label key={item}><input type="checkbox" aria-label={`报告差异${item}`} checked={selected.includes(item)} onChange={(event) => setSelected(event.target.checked ? [...selected, item] : selected.filter((value) => value !== item))} />{item}</label>)}</fieldset>
    <button type="button" disabled={state.clues.incident_report_falsified.discovered} onClick={confirm}>{state.clues.incident_report_falsified.discovered ? '报告伪造已确认' : '确认报告伪造'}</button>{error && <p role="alert">差异证据尚不完整。</p>}
  </>
}

function CleanupPage() {
  const { state, recordChapterEightEvidence } = useGame()
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState(false)
  const confirm = () => {
    if (!validateCleanupEvidence(selected)) { setError(true); return }
    setError(false); recordChapterEightEvidence('cleanup-order')
  }
  return <><h1>事后清理命令</h1><dl><div><dt>任务组</dt><dd>SYS-0616</dd></div><div><dt>执行时间</dt><dd>2026-06-17 06:52 至 2026-06-18 10:30</dd></div><div><dt>权限</dt><dd>ADMIN_03</dd></div></dl>
    <ol><li>将对象2024010318标记为离校处理。</li><li>从当前班级名单中移除对象。</li><li>停止公开显示相关学籍变更历史。</li><li>将门禁、监控和设备记录迁入内部事件归档。</li><li>将TERM-OLD-03登记为停用。</li><li>将CAM-07标记为未归还设备。</li><li>将对外事件类型设置为个人原因离校。</li><li>关闭SYS-0616公开查询入口。</li></ol>
    <p className="system-complete-note">关联通知：2026-06-17 07:46，向班长发送重新提交名单通知。</p>
    <fieldset><legend>加入事后处理证据链</legend>{cleanupEvidence.map((item) => <label key={item}><input type="checkbox" aria-label={`清理证据${item}`} checked={selected.includes(item)} onChange={(event) => setSelected(event.target.checked ? [...selected, item] : selected.filter((value) => value !== item))} />{item}</label>)}</fieldset>
    <button type="button" disabled={state.clues.post_incident_cleanup_order.discovered} onClick={confirm}>{state.clues.post_incident_cleanup_order.discovered ? '事后处理链已记录' : '确认事后处理链'}</button>{error && <p role="alert">证据链尚不完整。</p>}
  </>
}

function ArchiveMessage({ title, text }: { title: string; text: string }) {
  return <main><h1>{title}</h1><p>{text}</p></main>
}

export function Session0914Page() {
  const { state } = useGame()
  if (!state.triggeredEvents.includes('chapter_eight_completed')) return <ArchiveMessage title="0914本地会话" text="记录尚未开放。" />
  return <main className="incident-page"><p className="node-path">/session/0914</p><h1>0914本地会话</h1><dl><div><dt>来源</dt><dd>TERM-OLD-03</dd></div><div><dt>账户</dt><dd>2024010312</dd></div><div><dt>状态</dt><dd>等待验证</dd></div></dl><p>需要区分本人操作、自动任务与后续管理员访问。</p></main>
}
