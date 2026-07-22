import { accessComparisonComplete, classHistoryViews, filterAccessRecords, filterGroupHistory, isBackdatedDatePair } from './chapterTwoInteractions'
import { searchSchoolContent } from './chapterTwo'
import { virtualFiles } from './virtualFiles'

describe('第二章交互模型', () => {
  it('名单历史保留当前、五月和六月三个视图', () => {
    expect(classHistoryViews.current.rows).toHaveLength(17)
    expect(classHistoryViews.may.rows).toHaveLength(18)
    expect(classHistoryViews.may.rows[11]).toEqual(['12', '姓名字段缺失', '数据读取异常'])
    expect(classHistoryViews.june.rows).toHaveLength(17)
  })

  it('班级群筛选不会把无关记录一并返回', () => {
    const result = filterGroupHistory('沈栀', '2026-06-18', '移出群聊')
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ member: '沈栀', administrator: '顾言' })
    expect(filterGroupHistory('宋乔', '', '')).toHaveLength(1)
  })

  it('只有生效日期和申请文件日期构成倒签核对', () => {
    expect(isBackdatedDatePair(['effective', 'application'])).toBe(true)
    expect(isBackdatedDatePair(['effective', 'entered'])).toBe(false)
    expect(isBackdatedDatePair(['application'])).toBe(false)
  })

  it('沈栀门禁进入为一条而离开为零条', () => {
    const base = { date: '2026-06-16', place: '旧实验楼东门', person: '沈栀' as const }
    expect(filterAccessRecords({ ...base, direction: '进入' })).toHaveLength(1)
    expect(filterAccessRecords({ ...base, direction: '离开' })).toHaveLength(0)
  })

  it('门禁对比必须同时包含进入和离开查询', () => {
    expect(accessComparisonComplete(['进入'])).toBe(false)
    expect(accessComparisonComplete(['离开'])).toBe(false)
    expect(accessComparisonComplete(['离开', '进入'])).toBe(true)
  })
})

describe('第二章提示弱化', () => {
  it.each(['窗外', '第十二号座位', '旧实验楼', '顾言', '高二三班', '高二（3）班'])('关键词 %s 可返回有限结果', (keyword) => {
    const results = searchSchoolContent(keyword)
    expect(results.length).toBeGreaterThan(0)
    expect(results.length).toBeLessThan(4)
  })

  it('周寻文件列表不再包含本应由系统页面承载的伪文件', () => {
    expect(virtualFiles['class-size-check']).toBeUndefined()
    expect(virtualFiles['group-change-log']).toBeUndefined()
    expect(virtualFiles['shenzhi-status-cache']).toBeUndefined()
    expect(virtualFiles['old-building-access-summary']).toBeUndefined()
  })

  it('调查文件没有直接代替玩家推理的备注', () => {
    const text = JSON.stringify(virtualFiles)
    expect(text).not.toContain(['周寻', '备注'].join(''))
    expect(text).not.toContain(['她进去过', '没有出来'].join('，'))
    expect(text).not.toContain(['和我的情况', '一样'].join(''))
  })
})
