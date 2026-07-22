import { useGame } from './GameContext'

export function ChapterEnding() {
  const { dismissChapterEnding, returnToTitle } = useGame()
  return (
    <div className="chapter-ending" role="dialog" aria-modal="true" aria-labelledby="chapter-ending-title">
      <section>
        <span>第一章</span>
        <h2 id="chapter-ending-title">退学证明</h2>
        <div className="ending-rule" />
        <p>你已经证明周寻并非正常退学。</p>
        <small>调查进度已保存。</small>
        <div><button type="button" onClick={dismissChapterEnding}>继续浏览</button><button type="button" onClick={returnToTitle}>返回标题页</button></div>
      </section>
    </div>
  )
}

export function ChapterTwoEnding() {
  const { dismissChapterTwoEnding, returnToTitle } = useGame()
  return <div className="chapter-ending chapter-two-ending" role="dialog" aria-modal="true" aria-labelledby="chapter-two-ending-title"><section><span>第二章</span><h2 id="chapter-two-ending-title">第十八个人</h2><div className="ending-rule" /><p>沈栀确实存在过。</p><p>她在进入旧实验楼后的第二天，被学校登记为退学。</p><small>调查进度已保存。</small><div><button type="button" onClick={dismissChapterTwoEnding}>继续浏览</button><button type="button" onClick={returnToTitle}>返回标题页</button></div></section></div>
}
