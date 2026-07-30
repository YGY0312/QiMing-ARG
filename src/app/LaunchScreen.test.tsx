import { render, screen } from '@testing-library/react'
import { GameProvider } from '../game/GameContext'
import { LaunchScreen } from './LaunchScreen'

describe('启动页版本信息', () => {
  it('显示当前版本和第七章系统之外', () => {
    render(<GameProvider><LaunchScreen /></GameProvider>)
    expect(screen.getByText('当前版本：公开测试版 v0.7.0')).toBeInTheDocument()
    expect(screen.getByText('当前章节：第七章《系统之外》')).toBeInTheDocument()
  })
})
