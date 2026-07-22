import { createNextStudentTab, createSchoolTab, createStudentTab, goBackInTab, goForwardInTab, navigateTab, refreshTab, studentTabTitle, withStudentSession } from './tabs'

describe('多标签纯状态逻辑', () => {
  it('学校与学生标签分别保留网址和历史', () => {
    const school = navigateTab(createSchoolTab(), 'www.qiming-high.edu.cn/news')
    const student = navigateTab(createStudentTab(), 'stu.qiming-high.edu.cn/messages')
    expect(school.history).toEqual(['www.qiming-high.edu.cn/', 'www.qiming-high.edu.cn/news'])
    expect(student.history).toEqual(['stu.qiming-high.edu.cn/login', 'stu.qiming-high.edu.cn/messages'])
  })

  it('后退前进只改变传入的当前标签', () => {
    const student = navigateTab(createStudentTab(), 'stu.qiming-high.edu.cn/messages')
    const back = goBackInTab(student)
    expect(back.currentUrl).toBe('stu.qiming-high.edu.cn/login')
    expect(goForwardInTab(back).currentUrl).toBe('stu.qiming-high.edu.cn/messages')
  })

  it('刷新不修改历史', () => {
    const tab = createSchoolTab()
    expect(refreshTab(tab)).toMatchObject({ history: tab.history, historyIndex: 0, refreshToken: 1 })
  })

  it('连续创建学生标签使用稳定且不重复的编号', () => {
    const school = createSchoolTab(); const one = createNextStudentTab([school]); const two = createNextStudentTab([school, one])
    expect([one.id, two.id]).toEqual(['student-1', 'student-2'])
  })

  it('林默与周寻会话可同时存在于不同标签', () => {
    const lin = withStudentSession(createStudentTab(undefined, undefined, undefined, 'student-1'), 'lin_mo')
    const zhou = withStudentSession(createStudentTab(undefined, undefined, undefined, 'student-2'), 'zhou_xun')
    expect(lin.studentSession?.accountId).toBe('lin_mo')
    expect(zhou.studentSession?.accountId).toBe('zhou_xun')
  })

  it('标签标题反映各自登录账号', () => {
    expect(studentTabTitle(null)).toBe('学生信息系统')
    expect(studentTabTitle('lin_mo')).toBe('学生信息系统 - 林默')
    expect(studentTabTitle('zhou_xun')).toBe('学生信息系统 - 周寻')
  })

  it('退出会话时清除该标签的虚拟文件', () => {
    const open = { ...createStudentTab(undefined, undefined, undefined, 'student-1', 'zhou_xun'), openVirtualFileId: 'backup-readme' }
    expect(withStudentSession(open, null).openVirtualFileId).toBeNull()
  })
})
