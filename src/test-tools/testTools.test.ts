import { APP_VERSION, PROJECT_CREATOR, SAVE_SCHEMA_VERSION } from '../config/app'
import { createFeedbackText, importSaveText } from './testTools'

describe('公开测试辅助工具', () => {
  it('反馈模板使用v0.5.0版本号', () => {
    expect(APP_VERSION).toBe('v0.5.0')
  })

  it('拒绝损坏或无效存档，不产生覆盖结果', () => {
    expect(importSaveText('{bad json')).toMatchObject({ ok: false })
    expect(importSaveText('{}')).toMatchObject({ ok: false })
  })

  it('反馈模板包含版本、存档版本、署名和复现上下文', () => {
    const feedback = createFeedbackText({
      nickname: 'tester',
      page: 'www.qiming-high.edu.cn/',
      chapter: '第一章调查中',
      discoveredClues: 3,
      severity: '一般',
      description: '按钮没有响应',
      browser: 'test browser',
    })
    expect(feedback).toContain(PROJECT_CREATOR)
    expect(feedback).toContain(APP_VERSION)
    expect(feedback).toContain(String(SAVE_SCHEMA_VERSION))
    expect(feedback).toContain('www.qiming-high.edu.cn/')
    expect(feedback).toContain('按钮没有响应')
  })
})
