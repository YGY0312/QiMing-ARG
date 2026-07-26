import { useGame } from './GameContext'

export function ChapterSixEnding() {
  const { dismissChapterSixEnding, returnToTitle } = useGame()
  return <div className="chapter-ending chapter-six-ending" role="dialog" aria-modal="true" aria-label="第六章结束"><section>
    <p className="chapter-ending-kicker">第六章</p><h2>终端03</h2>
    <p>终端没有消失。</p><p>它仍在旧实验楼三层，等待把新的对象同步进系统。</p>
    <p>终端中的三个对象是：</p><p>沈栀。<br />周寻。<br />林默。</p>
    <div><button type="button" onClick={dismissChapterSixEnding}>继续浏览</button><button type="button" onClick={returnToTitle}>返回标题页</button></div>
  </section></div>
}
