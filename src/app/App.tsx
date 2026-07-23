import { lazy, Suspense, useState } from 'react'
import { BrowserShell } from '../browser/BrowserShell'
import { LaunchScreen } from './LaunchScreen'
import { useGame } from '../game/GameContext'
import { clearTestMode, initializeTestMode, shouldMountTestConsole } from '../test-tools/testMode'

const testToolsBuildEnabled = import.meta.env.VITE_ENABLE_TEST_TOOLS === 'true'
const TestConsole = testToolsBuildEnabled
  ? lazy(() => import('../test-tools/TestConsole').then((module) => ({ default: module.TestConsole })))
  : null

export function App() {
  const { state } = useGame()
  const [testModeEnabled, setTestModeEnabled] = useState(() => initializeTestMode(
    testToolsBuildEnabled,
    window.location.search,
    window.sessionStorage,
  ))
  const exitTestMode = () => {
    clearTestMode(window.sessionStorage)
    setTestModeEnabled(false)
  }
  return <>
    {state.isStarted ? <BrowserShell /> : <LaunchScreen />}
    {TestConsole && shouldMountTestConsole(testToolsBuildEnabled, testModeEnabled) && (
      <Suspense fallback={null}><TestConsole onExitTestMode={exitTestMode} /></Suspense>
    )}
  </>
}
