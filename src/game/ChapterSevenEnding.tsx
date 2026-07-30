import { useGame } from './GameContext'

export function ChapterSevenEnding() {
  const { dismissChapterSevenEnding, returnToTitle } = useGame()
  return <div className="chapter-ending chapter-seven-ending" role="dialog" aria-modal="true" aria-label="第七章结束"><section>
    <p className="chapter-ending-kicker">第七章</p><h2>系统之外</h2>
    <p>沈栀的名字不是自然消失的。</p>
    <p>在她失联后的第二天，班级名单被重新提交。</p>
    <p>周寻把真正的记录带出了校园系统。</p>
    <p>外部备份中，第一次出现了那个名字：</p>
    <p><strong>启明计划。</strong></p>
    <div className="ending-record"><span>incident/0616</span><small>状态：等待验证</small></div>
    <div><button type="button" onClick={dismissChapterSevenEnding}>继续浏览</button><button type="button" onClick={returnToTitle}>返回标题页</button></div>
  </section></div>
}
