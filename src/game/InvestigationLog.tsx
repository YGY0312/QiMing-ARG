import { clueDefinitions } from '../data/story'
import { useGame } from './GameContext'

export function InvestigationLog({ onClose }: { onClose: () => void }) {
  const { state } = useGame()
  const discovered = Object.values(state.clues).filter((clue) => clue.discovered)
  return (
    <div className="log-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside className="investigation-log" role="dialog" aria-modal="true" aria-labelledby="log-title">
        <header><div><span>CASE 01</span><h2 id="log-title">调查记录</h2></div><button type="button" aria-label="关闭调查记录" onClick={onClose}>×</button></header>
        <div className="log-progress"><strong>{discovered.length}</strong> / {Object.keys(state.clues).length}<span>已发现线索</span></div>
        <div className="log-list">
          {discovered.length === 0 && <p className="empty-log">尚未记录到可用线索。</p>}
          {discovered.map((clue) => {
            const definition = clueDefinitions[clue.id]
            return <article key={clue.id}><span>{clue.category}</span><h3>{definition.title}</h3><p>{definition.description}</p><footer>{definition.source} · {formatTime(clue.discoveredAt)}</footer></article>
          })}
        </div>
        {state.chapterOneCompleted && <div className="log-completed">第一章调查已完成</div>}
        {state.chapterTwoCompleted && <div className="log-completed">第二章调查已完成</div>}
        {state.triggeredEvents.includes('chapter_three_completed') && <div className="log-completed">第三章调查已完成</div>}
        {state.triggeredEvents.includes('chapter_four_completed') && <div className="log-completed">第四章调查已完成</div>}
        {state.triggeredEvents.includes('chapter_five_completed') && <div className="log-completed">第五章调查已完成</div>}
        {state.triggeredEvents.includes('chapter_six_completed') && <div className="log-completed">第六章调查已完成</div>}
        {state.triggeredEvents.includes('chapter_seven_completed') && <div className="log-completed">第七章调查已完成</div>}
        {state.triggeredEvents.includes('chapter_eight_completed') && <div className="log-completed">第八章调查已完成</div>}
        {state.triggeredEvents.includes('chapter_nine_completed') && <div className="log-completed">第九章调查已完成</div>}
      </aside>
    </div>
  )
}

function formatTime(value: string | null): string {
  if (!value) return '时间未知'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '时间未知' : date.toLocaleString('zh-CN', { hour12: false })
}
