import { useGame } from './GameContext'

export function ChapterFiveEnding() {
  const { dismissChapterFiveEnding, returnToTitle } = useGame()
  return (
    <div className="chapter-ending chapter-five-ending" role="dialog" aria-modal="true" aria-label="第五章结束">
      <section>
        <p className="chapter-ending-kicker">第五章</p>
        <h2>最后登录</h2>
        <p>周寻失踪以后，他的账号仍在旧实验楼活动。</p>
        <p>沈栀、周寻与林默，被同一台停用终端连接在了一起。</p>
        <p>还有一次登录，无法确认是谁完成的。</p>
        <div><button type="button" onClick={dismissChapterFiveEnding}>继续浏览</button><button type="button" onClick={returnToTitle}>返回标题页</button></div>
      </section>
    </div>
  )
}
