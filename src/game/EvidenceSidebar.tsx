import { getDiscoveredEvidence } from '../data/story'
import { useGame } from './GameContext'

export function EvidenceSidebar() {
  const { state, setEvidenceSidebarCollapsed } = useGame()
  const evidence = getDiscoveredEvidence(state.clues)

  if (state.evidenceSidebarCollapsed) {
    return (
      <aside className="evidence-sidebar collapsed" aria-label="已发现的关键事实">
        <button type="button" onClick={() => setEvidenceSidebarCollapsed(false)} aria-label="展开关键事实">
          关键事实 <span>{evidence.length}</span>
        </button>
      </aside>
    )
  }

  return (
    <aside className="evidence-sidebar" aria-label="已发现的关键事实">
      <header>
        <div><strong>关键事实</strong><span>仅显示已发现线索</span></div>
        <button type="button" onClick={() => setEvidenceSidebarCollapsed(true)} aria-label="收起关键事实">收起</button>
      </header>
      <div className="evidence-list">
        {state.triggeredEvents.includes('chapter_six_started') && !state.triggeredEvents.includes('chapter_six_completed')
          ? <p className="evidence-direction">第六章《终端03》：确认停用终端的位置与异常活动</p>
          : state.triggeredEvents.includes('chapter_five_started') && !state.triggeredEvents.includes('chapter_five_completed')
          ? <p className="evidence-direction">第五章《最后登录》：确认周寻失踪后的账号活动</p>
          : state.triggeredEvents.includes('chapter_four_started') && !state.triggeredEvents.includes('chapter_four_completed')
          ? <p className="evidence-direction">第四章《权限不足》：确认谁拥有修改记录的权限</p>
          : state.triggeredEvents.includes('chapter_three_started') && !state.triggeredEvents.includes('chapter_three_completed')
          ? <p className="evidence-direction">第三章《值班记录》：查明6月16日晚旧实验楼发生了什么</p>
          : state.chapterTwoStarted && !state.chapterTwoCompleted && <p className="evidence-direction">当前调查方向：确认沈栀的身份</p>}
        {evidence.length === 0 && <p className="evidence-empty">调查过程中确认的事实会记录在这里。</p>}
        {evidence.map((group) => (
          <section key={group.id}>
            <h2>{group.title}</h2>
            <small>{group.source}</small>
            <ul>{group.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
          </section>
        ))}
      </div>
    </aside>
  )
}
