import { goBack, goForward, pushHistory } from './history'

describe('浏览器历史记录', () => {
  it('后退和前进逻辑正常', () => {
    const initial = { history: ['a/', 'b/', 'c/'], historyIndex: 2 }
    const backed = goBack(initial)
    expect(backed.historyIndex).toBe(1)
    expect(goForward(backed).historyIndex).toBe(2)
  })

  it('从中间导航时丢弃原前进分支', () => {
    const next = pushHistory({ history: ['a/', 'b/', 'c/'], historyIndex: 1 }, 'd/')
    expect(next).toEqual({ history: ['a/', 'b/', 'd/'], historyIndex: 2 })
  })
})
