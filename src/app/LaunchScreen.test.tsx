import { render, screen } from '@testing-library/react'
import { GameProvider } from '../game/GameContext'
import { LaunchScreen } from './LaunchScreen'

describe('启动页版本信息', () => {
  it('显示当前版本和第八章六月十六日', () => {
    render(<GameProvider><LaunchScreen /></GameProvider>)
    expect(screen.getByText('当前版本：公开测试版 v0.8.0')).toBeInTheDocument()
    expect(screen.getByText('当前章节：第八章《六月十六日》')).toBeInTheDocument()
  })
})
