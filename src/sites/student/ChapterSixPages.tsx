import { useState, type FormEvent, type ReactNode } from 'react'
import { cameraFiles, cameraRecoveryFields, floorPlanAreas, hasAllPendingObjects, hasTerminalStatusFluctuation, isSameNetworkPortPair, isValidFloorRoute, mediaMetadata, networkAccessRecords, pendingObjects, queryNetworkAccess, recoveredAudioIndex, terminalHeartbeats, validateCameraRecovery, type NetworkAccessFilters } from '../../data/chapterSix'
import { useGame } from '../../game/GameContext'
import type { StudentAccountId } from '../../types/game'

const Header = ({ title, text }: { title: string; text: string }) => <div className="student-page-header"><h1>{title}</h1><p>{text}</p></div>
const Panel = ({ title, children }: { title: string; children: ReactNode }) => <section className="system-panel"><h2>{title}</h2><div className="system-panel-body">{children}</div></section>
const Denied = ({ title }: { title: string }) => <><Header title={title} text="周寻账号私人调查资料。" /><div className="system-complete-note">当前账号无权访问该资料。</div></>

export function TerminalStatusInvestigation({ accountId, onNavigate }: { accountId: StudentAccountId; onNavigate: (url: string) => void }) {
  const { state, recordChapterSixEvidence } = useGame()
  const [open, setOpen] = useState(false)
  if (accountId !== 'zhou_xun' || !state.triggeredEvents.includes('chapter_six_started')) return null
  return <section className="comparison-box"><h3>状态变化记录</h3>
    <button type="button" className="record-inspect" onClick={() => setOpen(true)}>查看状态变化记录</button>
    {open && <><dl className="info-grid"><div><dt>公开登记状态</dt><dd>已停用</dd></div><div><dt>当前状态</dt><dd>已停用</dd></div></dl>
      <table><thead><tr><th>时间</th><th>实时心跳</th></tr></thead><tbody>{terminalHeartbeats.map((row) => <tr key={row.time}><td>{row.time}</td><td>{row.status}</td></tr>)}</tbody></table>
      <button type="button" className="primary-action" disabled={state.clues.terminal_status_fluctuation.discovered} onClick={() => hasTerminalStatusFluctuation() && recordChapterSixEvidence('status-fluctuation')}>{state.clues.terminal_status_fluctuation.discovered ? '状态矛盾已记录' : '核对公开状态与心跳'}</button>
      {state.clues.terminal_status_fluctuation.discovered && <p className="record-note">设备公开状态与实际心跳记录不一致。</p>}</>}
    {state.triggeredEvents.includes('chapter_six_map_unlocked') && <button type="button" className="record-inspect" onClick={() => onNavigate('stu.qiming-high.edu.cn/investigation/floor-plan')}>查看旧实验楼三层平面图</button>}
    {state.triggeredEvents.includes('chapter_six_terminal_cache_unlocked') && <button type="button" className="record-inspect" onClick={() => onNavigate('stu.qiming-high.edu.cn/terminal/TERM-OLD-03/cache')}>查看缓存目录</button>}
  </section>
}

export function FloorPlanPage({ accountId }: { accountId: StudentAccountId }) {
  const { state, recordChapterSixEvidence } = useGame()
  const [selected, setSelected] = useState<string[]>([])
  const [wrong, setWrong] = useState(false)
  if (accountId !== 'zhou_xun') return <Denied title="旧实验楼三层平面图" />
  if (!state.triggeredEvents.includes('chapter_six_map_unlocked')) return <><Header title="旧实验楼三层平面图" text="调查路径资料。" /><div className="system-complete-note">前置记录不足，平面图尚未解锁。</div></>
  const toggle = (area: string) => setSelected((current) => current.includes(area) ? current.filter((item) => item !== area) : [...current, area])
  const confirm = () => {
    const valid = isValidFloorRoute(selected)
    setWrong(!valid)
    if (valid) recordChapterSixEvidence('floor-route')
  }
  return <><Header title="旧实验楼三层疏散平面图" text="标记可能连续的三个调查区域。" /><Panel title="三层平面图">
    <div className="floor-plan" role="group" aria-label="旧实验楼三层区域">{floorPlanAreas.map((area) => <button key={area} type="button" aria-pressed={selected.includes(area)} className={selected.includes(area) ? 'selected' : ''} onClick={() => toggle(area)}>{area}{selected.includes(area) && <span> · 已选</span>}</button>)}</div>
    <button type="button" className="primary-action" onClick={confirm} disabled={state.clues.third_floor_route.discovered}>{state.clues.third_floor_route.discovered ? '调查路径已确认' : '确认调查路径'}</button>
    {wrong && <p role="alert" className="record-note">这些区域暂时无法形成有效调查路径。</p>}
    {state.clues.third_floor_route.discovered && <p className="record-note">A-302 → 广播设备室 → 三层设备间</p>}
  </Panel></>
}

export function NetworkAccessPage({ accountId }: { accountId: StudentAccountId }) {
  const { state, recordChapterSixEvidence } = useGame()
  const [filters, setFilters] = useState<NetworkAccessFilters>({ startDate: '2026-06-16', endDate: '2026-09-15', device: 'TERM-OLD-03', accessPoint: '', status: '' })
  const [results, setResults] = useState<typeof networkAccessRecords[number][] | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  if (accountId !== 'zhou_xun' || !state.triggeredEvents.includes('chapter_six_started')) return <Denied title="网络接入记录" />
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const result = queryNetworkAccess(filters)
    setError(result.error)
    setResults(result.records)
    const visible = new Set<string>(result.records.map((row) => row.id))
    setSelected((current) => current.filter((id) => visible.has(id)))
  }
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 2 ? [...current, id] : [current[1], id])
  const compare = () => isSameNetworkPortPair(selected) ? recordChapterSixEvidence('same-network-port') : setError('所选记录无法证明跨月使用相同节点。')
  return <><Header title="网络接入记录" text="按日期范围检索设备接入节点。" /><Panel title="接入记录查询">
    <form className="record-query-form" onSubmit={submit}>
      <label>开始日期<input aria-label="网络开始日期" type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} /></label>
      <label>结束日期<input aria-label="网络结束日期" type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} /></label>
      <label>设备编号<input aria-label="网络设备编号" value={filters.device} onChange={(e) => setFilters({ ...filters, device: e.target.value })} /></label>
      <label>接入点<input aria-label="网络接入点" value={filters.accessPoint} onChange={(e) => setFilters({ ...filters, accessPoint: e.target.value })} /></label>
      <label>状态<select aria-label="网络状态" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">全部</option><option>在线</option><option>离线</option><option>数据同步</option></select></label><button type="submit">查询</button>
    </form>
    {error && <p role="alert" className="record-note">{error}</p>}
    {results && <div className="table-scroll"><table><thead><tr><th>核对</th><th>时间</th><th>设备</th><th>接入点</th><th>状态</th></tr></thead><tbody>{results.map((row) => <tr key={row.id}><td><input type="checkbox" aria-label={`选择${row.date} ${row.time}`} checked={selected.includes(row.id)} onChange={() => toggle(row.id)} /></td><td>{row.date} {row.time}</td><td>{row.device}</td><td>{row.accessPoint}</td><td>{row.status}</td></tr>)}</tbody></table></div>}
    <button type="button" className="primary-action" disabled={selected.length !== 2 || state.clues.terminal_same_network_port.discovered} onClick={compare}>{state.clues.terminal_same_network_port.discovered ? '接入节点已核对' : '核对接入节点'}</button>
  </Panel></>
}

export function CameraRecoveryPage({ accountId, onNavigate }: { accountId: StudentAccountId; onNavigate: (url: string) => void }) {
  const { state, recordChapterSixEvidence, revealFileSection } = useGame()
  const recovered = state.revealedFileSections.includes('chapter-six-camera-recovered')
  const [fields, setFields] = useState({ borrower: '', device: '', terminal: '' })
  const [wrong, setWrong] = useState(false)
  if (accountId !== 'zhou_xun') return <Denied title="设备归还缓存_CAM-07.dat" />
  if (!state.triggeredEvents.includes('chapter_six_media_unlocked')) return <><Header title="设备归还缓存_CAM-07.dat" text="文件损坏，索引无法读取。" /><div className="system-complete-note">需要关联设备记录。</div></>
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!validateCameraRecovery(fields)) { setWrong(true); return }
    setWrong(false); revealFileSection('chapter-six-camera-recovered'); recordChapterSixEvidence('camera-storage-index')
  }
  return <><Header title="设备归还缓存_CAM-07.dat" text="使用关联记录恢复媒体目录。" /><Panel title="/DCIM/0616/">
    {!recovered && <form className="record-query-form" onSubmit={submit}>
      <label>借用人<input aria-label="CAM借用人" value={fields.borrower} onChange={(e) => setFields({ ...fields, borrower: e.target.value })} /></label>
      <label>设备编号<input aria-label="CAM设备编号" value={fields.device} onChange={(e) => setFields({ ...fields, device: e.target.value })} /></label>
      <label>关联终端<input aria-label="CAM关联终端" value={fields.terminal} onChange={(e) => setFields({ ...fields, terminal: e.target.value })} /></label><button type="submit">尝试恢复</button>
    </form>}
    {wrong && <p role="alert" className="record-note">设备关联不足，无法恢复目录。</p>}
    {recovered && <div className="table-scroll"><table><thead><tr><th>文件名</th><th>类型</th><th>创建时间</th><th>状态</th></tr></thead><tbody>{cameraFiles.map((file) => <tr key={file.name}><td>{file.name.endsWith('.mp4') ? <button type="button" className="table-link" onClick={() => onNavigate(`stu.qiming-high.edu.cn/files/camera-cache/media/${file.name}`)}>{file.name}</button> : file.name}</td><td>{file.type}</td><td>{file.createdAt}</td><td>{file.status}</td></tr>)}</tbody></table></div>}
  </Panel></>
}

export function MediaMetadataPage({ accountId, fileName }: { accountId: StudentAccountId; fileName?: string }) {
  const { state, recordChapterSixEvidence, revealFileSection } = useGame()
  const key = fileName as keyof typeof mediaMetadata
  const metadata = mediaMetadata[key]
  const indexRecovered = state.revealedFileSections.includes('chapter-six-audio-index')
  if (accountId !== 'zhou_xun') return <Denied title="媒体元数据" />
  if (!state.clues.camera_storage_index.discovered || !metadata) return <><Header title="媒体元数据" text="无法读取。" /></>
  return <><Header title={key} text="CAM-07媒体元数据，不提供视频播放。" /><Panel title="元数据">
    <dl className="info-grid">{Object.entries(metadata).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    {key === '221936.mp4' && <><button type="button" className="record-inspect" onClick={() => revealFileSection('chapter-six-audio-index')}>恢复音轨索引</button>
      {indexRecovered && <><table><tbody>{recoveredAudioIndex.map(([time, text]) => <tr key={time}><td>{time}</td><td>{text}</td></tr>)}</tbody></table><button type="button" className="primary-action" disabled={state.clues.damaged_recording_metadata.discovered} onClick={() => recordChapterSixEvidence('recording-metadata')}>记录音轨异常</button></>}</>}
  </Panel></>
}

export function TerminalCachePage({ accountId, onNavigate }: { accountId: StudentAccountId; onNavigate: (url: string) => void }) {
  const { state, recordChapterSixEvidence } = useGame()
  const [openPending, setOpenPending] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  if (accountId !== 'zhou_xun') return <Denied title="TERM-OLD-03缓存目录" />
  if (!state.triggeredEvents.includes('chapter_six_terminal_cache_unlocked')) return <><Header title="TERM-OLD-03缓存目录" text="目录尚未开放。" /></>
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  return <><Header title="/terminal03/cache/" text="本地缓存目录。" /><Panel title="目录">
    <p>/archive/　权限不足</p><p>/sync/　权限不足</p><button type="button" className="table-link" onClick={() => setOpenPending(true)}>/pending/　可读取</button>
    {openPending && <div className="table-scroll"><table><thead><tr><th>比对</th><th>对象编号</th><th>来源</th><th>状态</th><th>属性</th></tr></thead><tbody>{pendingObjects.map((item) => <tr key={item.id}><td><input type="checkbox" aria-label={`选择待同步对象${item.id}`} checked={selected.includes(item.id)} onChange={() => toggle(item.id)} /></td><td>{item.id}.pending</td><td>{item.source}</td><td>{item.status}</td><td><button type="button" className="table-link" onClick={() => onNavigate(`stu.qiming-high.edu.cn/terminal/TERM-OLD-03/pending/${item.id}`)}>查看属性</button></td></tr>)}</tbody></table>
      <button type="button" className="primary-action" disabled={!hasAllPendingObjects(selected) || state.clues.pending_object_records.discovered} onClick={() => recordChapterSixEvidence('pending-objects')}>{state.clues.pending_object_records.discovered ? '待同步对象已确认' : '确认待同步对象'}</button></div>}
  </Panel></>
}

export function PendingDetailPage({ accountId, objectId }: { accountId: StudentAccountId; objectId?: string }) {
  const { state, recordChapterSixEvidence } = useGame()
  if (accountId !== 'zhou_xun') return <Denied title="待同步对象属性" />
  const object = pendingObjects.find((item) => item.id === objectId)
  if (!object) return <><Header title="待同步对象" text="对象不存在。" /></>
  return <><Header title={`${object.id}.pending`} text="待同步对象属性。" /><Panel title="属性">
    <dl className="info-grid"><div><dt>对象</dt><dd>{object.id}</dd></div><div><dt>来源</dt><dd>{object.source}</dd></div><div><dt>状态</dt><dd>{object.status}</dd></div>
      {object.id === '2024010312' && <><div><dt>创建时间</dt><dd>2026-09-14 23:58</dd></div><div><dt>最后修改</dt><dd>2026-09-15 00:01</dd></div><div><dt>写入设备</dt><dd>TERM-OLD-03</dd></div><div><dt>写入来源</dt><dd>LOCAL_SESSION</dd></div><div><dt>残留备注</dt><dd>不要从系统里找我。</dd></div></>}</dl>
    {object.id === '2024010312' && <button type="button" className="primary-action" disabled={state.clues.zhou_local_session_note.discovered} onClick={() => recordChapterSixEvidence('local-session-note')}>记录本地会话备注</button>}
  </Panel></>
}

export function SyncStatusPage({ accountId }: { accountId: StudentAccountId }) {
  if (accountId !== 'zhou_xun') return <Denied title="同步状态" />
  return <><Header title="同步状态" text="历史对象状态。" /><Panel title="2024010307"><dl className="info-grid"><div><dt>对象</dt><dd>2024010307</dd></div><div><dt>状态</dt><dd>未开始</dd></div><div><dt>设备位置</dt><dd>无法确认</dd></div></dl></Panel></>
}
