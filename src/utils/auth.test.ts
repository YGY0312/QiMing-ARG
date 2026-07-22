import { authenticateSavedStudent, authenticateStudent, generateCaptcha, generateDifferentCaptcha, isCaptchaValid, validateLogin } from './auth'

describe('学生系统双账号验证', () => {
  it('林默账号可以登录', () => {
    expect(authenticateStudent('2024010307', 'argtest', '7314', '7314')).toBe('lin_mo')
  })

  it('周寻账号可以登录且学号会去除首尾空格', () => {
    expect(authenticateStudent(' 2024010312 ', 'ZX0913', ' 7314 ', '7314')).toBe('zhou_xun')
  })

  it('错误账号、密码或验证码不能登录', () => {
    expect(validateLogin('2024010308', 'argtest', '7314', '7314')).toBe(false)
    expect(validateLogin('2024010312', 'wrong', '7314', '7314')).toBe(false)
    expect(validateLogin('2024010312', 'ZX0913', '0000', '7314')).toBe(false)
  })

  it('已保存账号只需正确验证码', () => {
    expect(authenticateSavedStudent('lin_mo', ' 7314 ', '7314')).toBe('lin_mo')
    expect(authenticateSavedStudent('lin_mo', '1111', '7314')).toBeNull()
  })

  it('验证码生成器可注入且范围为四位数字', () => {
    expect(generateCaptcha(() => 0)).toBe('1000')
    expect(generateCaptcha(() => 0.999999)).toBe('9999')
  })

  it('刷新验证码不会保留相同值', () => {
    expect(generateDifferentCaptcha('1000', () => 0)).not.toBe('1000')
  })

  it('验证码比较会清理输入空格但拒绝非四位当前值', () => {
    expect(isCaptchaValid(' 4321 ', '4321')).toBe(true)
    expect(isCaptchaValid('321', '321')).toBe(false)
  })
})
