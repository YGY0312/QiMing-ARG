import { PROTOTYPE_VERSION, useGame } from '../game/GameContext'
import { PROJECT_CREATOR } from '../config/app'

export function LaunchScreen() {
  const { state, startGame, resetGame } = useGame()

  const confirmReset = () => {
    if (window.confirm('确定要清除《退学证明》的全部本地存档并重新开始吗？')) {
      resetGame()
    }
  }

  return (
    <main className="launch-screen">
      <section className="launch-card" aria-labelledby="game-title">
        <div className="launch-eyebrow">校园调查档案 / CASE 01</div>
        <div className="launch-rule" />
        <h1 id="game-title">退学证明</h1>
        <p className="launch-subtitle">一款校园调查类网页 ARG 游戏</p>
        {state.chapterOneCompleted && <div className="chapter-complete-stamp">第一章已完成</div>}
        {state.chapterTwoCompleted && <div className="chapter-complete-stamp">第二章已完成</div>}
        {state.triggeredEvents.includes('chapter_three_completed')
          ? <div className="chapter-complete-stamp">第三章《值班记录》已完成</div>
          : state.triggeredEvents.includes('chapter_three_started') && <div className="chapter-complete-stamp">第三章《值班记录》调查中</div>}
        <p className="launch-intro">
          周寻已经数日没有出现。学校档案显示，他早已退学。<br />
          但你记得，在那个日期之后，你还见过他。
        </p>
        <div className="launch-actions">
          <button className="primary-button" type="button" onClick={startGame}>
            {state.hasSave ? '继续调查' : '开始调查'}
          </button>
          <button className="text-button" type="button" onClick={confirmReset} disabled={!state.hasSave}>
            重新开始
          </button>
        </div>
        <div className="launch-meta">
          <span>建议使用电脑端浏览器并佩戴耳机</span>
          <span>当前版本：{PROTOTYPE_VERSION}</span>
          <span>当前章节：第三章《值班记录》</span>
        </div>
        <div className="launch-credits">
          <span>策划、设计与制作：{PROJECT_CREATOR}</span>
          <span>开发辅助：OpenAI Codex、ChatGPT</span>
          <span>公开测试版</span>
        </div>
      </section>
      <p className="fiction-note">本作中的学校、人物与网站均为虚构</p>
    </main>
  )
}
