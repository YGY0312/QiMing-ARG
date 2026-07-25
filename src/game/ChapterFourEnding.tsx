import { useGame } from './GameContext'

export function ChapterFourEnding() {
  const { dismissChapterFourEnding, returnToTitle } = useGame()
  return (
    <div className="chapter-ending-overlay" role="dialog" aria-modal="true" aria-label="第四章结束">
      <section className="chapter-ending-card">
        <p className="chapter-ending-kicker">第四章 · 权限不足</p>
        <h2>调查阶段结束</h2>
        <p>你已经进入管理员系统。</p>
        <p>但同时，你的访问记录也被保存。</p>
        <div className="chapter-ending-message"><strong>未知消息 · SYSTEM</strong><p>你的访问权限已被记录。</p></div>
        <div><button type="button" onClick={dismissChapterFourEnding}>继续浏览</button><button type="button" onClick={returnToTitle}>返回标题页</button></div>
      </section>
    </div>
  )
}
