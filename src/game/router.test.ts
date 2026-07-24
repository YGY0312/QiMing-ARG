import { parseGameUrl } from './router'

describe('游戏内地址解析', () => {
  it('识别学校官网', () => {
    expect(parseGameUrl('www.qiming-high.edu.cn').componentKey).toBe('school-home')
  })

  it('识别学生信息系统', () => {
    expect(parseGameUrl('stu.qiming-high.edu.cn/login').componentKey).toBe('student-login')
  })

  it('未知域名返回浏览器错误页', () => {
    const route = parseGameUrl('unknown.example.com/path')
    expect(route.componentKey).toBe('not-found')
    expect(route.siteType).toBe('unknown')
  })

  it('含 https:// 的地址可以正常解析', () => {
    expect(parseGameUrl('https://www.qiming-high.edu.cn/news').componentKey).toBe('school-news')
  })

  it('清理前后空格、大小写和末尾斜杠', () => {
    const route = parseGameUrl('  HTTPS://STU.QIMING-HIGH.EDU.CN/login/  ')
    expect(route.componentKey).toBe('student-login')
    expect(route.url).toBe('stu.qiming-high.edu.cn/login')
  })

  it('已知域名的未知路径返回对应站点 404', () => {
    const route = parseGameUrl('www.qiming-high.edu.cn/missing')
    expect(route.siteType).toBe('school')
    expect(route.componentKey).toBe('not-found')
  })

  it('第三章官网与学生系统页面有稳定路由', () => {
    expect(parseGameUrl('www.qiming-high.edu.cn/services/laboratory').componentKey).toBe('school-lab-management')
    expect(parseGameUrl('www.qiming-high.edu.cn/services/laboratory/duty-june-2026').componentKey).toBe('school-duty-schedule')
    expect(parseGameUrl('stu.qiming-high.edu.cn/lab-access-records').componentKey).toBe('student-lab-access-records')
  })
})
