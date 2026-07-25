import { render, screen } from '@testing-library/react'
import { GameProvider } from '../game/GameContext'
import { LaunchScreen } from './LaunchScreen'

describe('启动页版本信息', () => {
  it('显示v0.5.0和第五章最后登录', () => {
    render(<GameProvider><LaunchScreen /></GameProvider>)
    expect(screen.getByText('当前版本：公开测试版 v0.5.0')).toBeInTheDocument()
    expect(screen.getByText('当前章节：第五章《最后登录》')).toBeInTheDocument()
  })
})
