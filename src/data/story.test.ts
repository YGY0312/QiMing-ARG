import { createEmptyClues, getDiscoveredEvidence } from './story'

describe('关键事实侧栏配置', () => {
  it('只返回已经发现的线索', () => {
    const clues = createEmptyClues(); clues.attendance_after_dropout.discovered = true
    expect(getDiscoveredEvidence(clues).map((group) => group.id)).toEqual(['attendance_after_dropout'])
  })

  it('账号线索包含剧情账号但不包含备份密码', () => {
    const clues = createEmptyClues(); clues.zhou_credentials.discovered = true
    const text = JSON.stringify(getDiscoveredEvidence(clues))
    expect(text).toContain('2024010312'); expect(text).toContain('ZX0913'); expect(text).not.toContain('0726')
  })

  it('沈栀事实仅说明身份未知', () => {
    const clues = createEmptyClues(); clues.shenzhi_name.discovered = true
    expect(getDiscoveredEvidence(clues)[0].facts).toEqual(['当前仅发现姓名，身份不明'])
  })
})
