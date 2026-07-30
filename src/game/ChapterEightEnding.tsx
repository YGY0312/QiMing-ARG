import { useGame } from './GameContext'

export function ChapterEightEnding() {
  const { dismissChapterEightEnding, returnToTitle } = useGame()
  return <div className="chapter-ending chapter-eight-ending" role="dialog" aria-modal="true" aria-label="第八章结束"><section>
    <p className="chapter-ending-kicker">第八章</p><h2>六月十六日</h2>
    <p>沈栀没有退学。</p>
    <p>她在六月十六日晚进入旧实验楼，并在被送医后抢救无效死亡。</p>
    <p>紧急信号曾经被收到，但外部急救被延迟。</p>
    <p>第二天，她的名字从班级名单中消失。</p>
    <div className="ending-record"><span>2024010318　沈栀</span><small>状态：已故</small><small>公开学籍状态：个人原因离校</small><small>记录一致性：冲突</small></div>
    <div><button type="button" onClick={dismissChapterEightEnding}>继续浏览</button><button type="button" onClick={returnToTitle}>返回标题页</button></div>
  </section></div>
}
