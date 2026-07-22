import { BrowserShell } from '../browser/BrowserShell'
import { LaunchScreen } from './LaunchScreen'
import { useGame } from '../game/GameContext'

export function App() {
  const { state } = useGame()
  return state.isStarted ? <BrowserShell /> : <LaunchScreen />
}
