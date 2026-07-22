import { addSavedAccountRecord, addSavedStudentAccount, createDefaultSavedAccounts, formatSavedAccountLabel, removeSavedStudentAccount } from './savedAccounts'

describe('动态已保存账号', () => {
  it('新游戏只保存林默', () => {
    expect(createDefaultSavedAccounts('now').map((account) => account.accountId)).toEqual(['lin_mo'])
  })

  it('首次成功登录后可加入周寻且不会重复', () => {
    const once = addSavedStudentAccount(createDefaultSavedAccounts(), 'zhou_xun', 'later')
    expect(addSavedStudentAccount(once, 'zhou_xun')).toEqual(once)
  })

  it('保存记录结构支持未来第三账号', () => {
    const future = { accountId: 'future_student', studentNumber: '2027010001', displayName: '新学生', savedAt: 'future' }
    expect(addSavedAccountRecord(createDefaultSavedAccounts(), future)).toContainEqual(future)
  })

  it('可移除账号并生成统一下拉标签', () => {
    const accounts = addSavedStudentAccount(createDefaultSavedAccounts(), 'zhou_xun')
    expect(removeSavedStudentAccount(accounts, 'lin_mo').map((account) => account.accountId)).toEqual(['zhou_xun'])
    expect(formatSavedAccountLabel(accounts[0])).toBe('2024010307（林默）')
  })
})
