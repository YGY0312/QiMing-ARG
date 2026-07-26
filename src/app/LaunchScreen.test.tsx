import { render, screen } from '@testing-library/react'
import { GameProvider } from '../game/GameContext'
import { LaunchScreen } from './LaunchScreen'

describe('启动页版本信息', () => {
  it('显示当前版本和第六章终端03', () => {
    render(<GameProvider><LaunchScreen /></GameProvider>)
    expect(screen.getByText('当前版本：公开测试版 v0.6.0')).toBeInTheDocument()
    expect(screen.getByText('当前章节：第六章《终端03》')).toBeInTheDocument()
  })
})
