import { useGame } from './GameContext'

export function ChapterNineEnding() {
  const { dismissChapterNineEnding, returnToTitle } = useGame()
  return <div className="chapter-ending chapter-nine-ending" role="dialog" aria-modal="true" aria-label="第九章结束"><section>
    <p className="chapter-ending-kicker">第九章</p><h2>最后一个账号</h2>
    <p>零点零二分以前，账号属于周寻。</p>
    <p>零点零三分以后，账号成为管理员的监视入口。</p>
    <p>周寻已经离开学校。三天后，他在系统之外证明自己仍然活着。</p>
    <p>那份退学证明，不是他的选择。</p>
    <div className="ending-record"><strong>2024010312　周寻</strong><span>生命状态：确认存活</span><span>校园状态：已退学</span><span>退学申请：不存在</span><span>记录一致性：冲突</span></div>
    <p>退学证明签发链：等待最终验证</p>
    <div className="ending-actions"><button type="button" onClick={dismissChapterNineEnding}>继续浏览</button><button type="button" onClick={returnToTitle}>返回标题页</button></div>
  </section></div>
}
