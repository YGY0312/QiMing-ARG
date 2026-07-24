import { render, screen } from '@testing-library/react'
import { GameProvider } from '../game/GameContext'
import { LaunchScreen } from './LaunchScreen'

describe('启动页版本信息', () => {
  it('显示v0.4.1和第三章值班记录', () => {
    render(<GameProvider><LaunchScreen /></GameProvider>)
    expect(screen.getByText('当前版本：公开测试版 v0.4.1')).toBeInTheDocument()
    expect(screen.getByText('当前章节：第三章《值班记录》')).toBeInTheDocument()
  })
})
