import { useState, type FormEvent } from 'react'
import { searchDecommissionRecords, searchNetworkArchive } from '../../data/chapterSix'
import { useGame } from '../../game/GameContext'

export function AssetDecommissionPage() {
  const { state, recordChapterSixEvidence } = useGame()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ReturnType<typeof searchDecommissionRecords> | null>(null)
  if (!state.triggeredEvents.includes('chapter_six_started')) return <main className="school-main school-404"><div><strong>404</strong><h2>页面不存在</h2></div></main>
  const submit = (event: FormEvent) => { event.preventDefault(); setResults(searchDecommissionRecords(query)) }
  return <main className="school-main school-subpage"><div className="school-breadcrumb">校园服务 &gt; 资产与设备 &gt; 设备报废公示</div><section className="school-list-page duty-schedule-page">
    <h2>设备报废公示<small>ASSET DISPOSAL</small></h2>
    <form className="record-query-form" onSubmit={submit}><label>设备名称或资产编号<input aria-label="设备报废检索" value={query} onChange={(e) => setQuery(e.target.value)} /></label><button type="submit">检索</button></form>
    {results?.map((row) => <article className="comparison-box" key={row.id}><h3>{row.name}</h3><p>资产编号：{row.id}</p><p>报废日期：{row.date}</p><p>设备状态：{row.status}</p><p>处置位置：{row.location}</p><p>处置方式：{row.method}</p>
      <button type="button" className="record-inspect" disabled={state.clues.terminal_decommission_record.discovered} onClick={() => recordChapterSixEvidence('decommission-record')}>{state.clues.terminal_decommission_record.discovered ? '处置信息已记录' : '记录处置信息'}</button></article>)}
    {results && results.length === 0 && <p className="record-note">未找到匹配的设备记录。</p>}
  </section></main>
}

export function NetworkArchivePage() {
  const { state, recordChapterSixEvidence } = useGame()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ReturnType<typeof searchNetworkArchive> | null>(null)
  if (!state.triggeredEvents.includes('chapter_six_started')) return <main className="school-main school-404"><div><strong>404</strong><h2>页面不存在</h2></div></main>
  const ready = state.clues.third_floor_route.discovered && state.clues.terminal_same_network_port.discovered
  return <main className="school-main school-subpage"><div className="school-breadcrumb">信息中心 &gt; 网络归档检索</div><section className="school-list-page duty-schedule-page">
    <h2>网络端口归档<small>NETWORK ARCHIVE</small></h2>
    <form className="record-query-form" onSubmit={(event) => { event.preventDefault(); setResults(searchNetworkArchive(query)) }}><label>交换节点<input aria-label="网络归档检索" value={query} onChange={(e) => setQuery(e.target.value)} /></label><button type="submit">检索归档</button></form>
    {results?.map((row) => <article className="comparison-box" key={row.node}><h3>{row.node}</h3><p>部署区域：{row.area}</p><p>覆盖房间：{row.rooms.join('、')}</p><p>状态：{row.status}</p><p>停用日期：{row.date}</p>
      <button type="button" className="record-inspect" disabled={!ready || state.clues.network_port_location.discovered} onClick={() => recordChapterSixEvidence('network-port-location')}>{state.clues.network_port_location.discovered ? '平面图关联已确认' : ready ? '与平面图关联' : '需要平面图与接入记录'}</button></article>)}
  </section></main>
}
