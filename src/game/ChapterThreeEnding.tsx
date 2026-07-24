import { useGame } from './GameContext'

export function ChapterThreeEnding() {
  const { dismissChapterThreeEnding, returnToTitle } = useGame()
  return (
    <div className="chapter-ending chapter-three-ending" role="dialog" aria-modal="true" aria-labelledby="chapter-three-ending-title">
      <section>
        <span>第三章</span>
        <h2 id="chapter-three-ending-title">值班记录</h2>
        <div className="ending-rule" />
        <p>沈栀进入旧实验楼后，有人处理了门禁记录，监控数据也被覆盖。</p>
        <p>系统留下了 ADMIN_03，却没有留下这个账号属于谁。</p>
        <p>周寻为什么会知道这些，同样没有答案。</p>
        <small>调查进度已保存。</small>
        <div><button type="button" onClick={dismissChapterThreeEnding}>继续浏览</button><button type="button" onClick={returnToTitle}>返回标题页</button></div>
      </section>
    </div>
  )
}
