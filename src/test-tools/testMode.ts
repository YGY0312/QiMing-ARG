export const TEST_MODE_SESSION_KEY = 'campus_arg_test_mode'

export function isTestToolsBuildEnabled(value: unknown = import.meta.env.VITE_ENABLE_TEST_TOOLS): boolean {
  return value === 'true'
}

export function queryRequestsTestMode(search: string): boolean {
  return new URLSearchParams(search).get('testmode') === '1'
}

export function initializeTestMode(
  buildEnabled: boolean,
  search: string,
  storage: Pick<Storage, 'getItem' | 'setItem'>,
): boolean {
  if (!buildEnabled) return false
  if (queryRequestsTestMode(search)) storage.setItem(TEST_MODE_SESSION_KEY, '1')
  return storage.getItem(TEST_MODE_SESSION_KEY) === '1'
}

export function clearTestMode(
  storage: Pick<Storage, 'removeItem'>,
  location: Pick<Location, 'href'> = window.location,
  history: Pick<History, 'replaceState'> = window.history,
): void {
  storage.removeItem(TEST_MODE_SESSION_KEY)
  const url = new URL(location.href)
  url.searchParams.delete('testmode')
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}

export function shouldMountTestConsole(buildEnabled: boolean, testModeEnabled: boolean): boolean {
  return buildEnabled && testModeEnabled
}
