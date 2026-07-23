import { clearTestMode, initializeTestMode, queryRequestsTestMode, shouldMountTestConsole, TEST_MODE_SESSION_KEY } from './testMode'

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
  }
}

describe('公开测试模式双重开关', () => {
  it('没有构建开关时查询参数也不能启用', () => {
    const storage = memoryStorage()
    expect(initializeTestMode(false, '?testmode=1', storage)).toBe(false)
    expect(storage.getItem(TEST_MODE_SESSION_KEY)).toBeNull()
    expect(shouldMountTestConsole(false, true)).toBe(false)
  })

  it('构建开关开启后仍需查询参数或当前标签页会话', () => {
    const storage = memoryStorage()
    expect(initializeTestMode(true, '', storage)).toBe(false)
    expect(initializeTestMode(true, '?testmode=1', storage)).toBe(true)
    expect(initializeTestMode(true, '', storage)).toBe(true)
    expect(shouldMountTestConsole(true, true)).toBe(true)
  })

  it('只接受 testmode=1 并可退出和清理网址', () => {
    expect(queryRequestsTestMode('?testmode=0')).toBe(false)
    expect(queryRequestsTestMode('?foo=1&testmode=1')).toBe(true)
    const storage = memoryStorage()
    storage.setItem(TEST_MODE_SESSION_KEY, '1')
    const replaceState = vi.fn()
    clearTestMode(storage, { href: 'https://example.test/?foo=1&testmode=1#/game' }, { replaceState })
    expect(storage.getItem(TEST_MODE_SESSION_KEY)).toBeNull()
    expect(replaceState).toHaveBeenCalledWith(null, '', '/?foo=1#/game')
  })
})
