import { useEffect, useState, type FormEvent } from 'react'
import { useGame, PROTOTYPE_VERSION } from '../game/GameContext'
import { SCHOOL_HOME_URL, SHENZHI_ANOMALY_URL, SHENZHI_STUDENT_ANOMALY_URL, TERM_OLD_03_SYNC_HISTORY_URL } from '../game/constants'
import { SchoolSite } from '../sites/school/SchoolSite'
import { StudentSite } from '../sites/student/StudentSite'
import { UnknownSiteError } from './UnknownSiteError'
import { InvestigationLog } from '../game/InvestigationLog'
import { ChapterEnding, ChapterTwoEnding } from '../game/ChapterEnding'
import { ChapterThreeEnding } from '../game/ChapterThreeEnding'
import { ChapterFourEnding } from '../game/ChapterFourEnding'
import { ChapterFiveEnding } from '../game/ChapterFiveEnding'
import { ChapterSixEnding } from '../game/ChapterSixEnding'
import { ChapterSevenEnding } from '../game/ChapterSevenEnding'
import { ChapterEightEnding } from '../game/ChapterEightEnding'
import { EvidenceSidebar } from '../game/EvidenceSidebar'
import { ArchiveSite } from '../sites/archive/ArchiveSite'

export function BrowserShell() {
  const {
    state, route, activeTab, canGoBack, canGoForward, navigate, goBack, goForward, refresh,
    openStudentTab, focusSchoolTab, switchTab, closeTab, returnToTitle, resetGame, finishAddressGlitch, finishChapterTwoAddressGlitch, finishChapterFiveSessionGlitch, finishChapterSixSyncGlitch,
  } = useGame()
  const [address, setAddress] = useState(route.url)
  const [menuOpen, setMenuOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)

  useEffect(() => setAddress(route.url), [route.url, state.activeTabId])
  useEffect(() => {
    if (!state.addressGlitchActive) return
    setAddress(SHENZHI_ANOMALY_URL)
    const timer = window.setTimeout(() => { setAddress(route.url); finishAddressGlitch() }, 1000)
    return () => window.clearTimeout(timer)
  }, [state.addressGlitchActive, route.url, finishAddressGlitch])
  useEffect(() => {
    if (!state.chapterTwoAddressGlitchActive) return
    setAddress(SHENZHI_STUDENT_ANOMALY_URL)
    const timer = window.setTimeout(() => { setAddress(route.url); finishChapterTwoAddressGlitch() }, 1200)
    return () => window.clearTimeout(timer)
  }, [state.chapterTwoAddressGlitchActive, route.url, finishChapterTwoAddressGlitch])
  useEffect(() => {
    if (!state.chapterFiveSessionGlitchActive) return
    const timer = window.setTimeout(finishChapterFiveSessionGlitch, 1000)
    return () => window.clearTimeout(timer)
  }, [state.chapterFiveSessionGlitchActive, finishChapterFiveSessionGlitch])
  useEffect(() => {
    if (!state.chapterSixSyncGlitchActive) return
    setAddress(TERM_OLD_03_SYNC_HISTORY_URL)
    const timer = window.setTimeout(() => { setAddress(route.url); finishChapterSixSyncGlitch() }, 1000)
    return () => window.clearTimeout(timer)
  }, [state.chapterSixSyncGlitchActive, route.url, finishChapterSixSyncGlitch])

  const submitAddress = (event: FormEvent) => { event.preventDefault(); navigate(address) }
  const confirmReset = () => {
    if (window.confirm('确定清除本游戏的本地存档吗？此操作不会影响其他网站数据。')) resetGame()
  }

  return (
    <main className="game-desktop">
      <div className="mobile-warning" role="note">建议使用电脑端浏览器访问本游戏</div>
      <section className="browser-window" aria-label="游戏内浏览器">
        <header className="browser-top">
          <div className="tab-row" role="tablist" aria-label="游戏内网页标签">
            <div className="window-mark" aria-hidden="true"><i /><i /><i /></div>
            {state.tabs.map((tab) => (
              <div className={`browser-tab ${tab.id === state.activeTabId ? 'active' : ''}`} key={tab.id}>
                <button type="button" role="tab" aria-selected={tab.id === state.activeTabId} onClick={() => switchTab(tab.id)}><span className="tab-icon">▣</span>{tab.pageTitle}</button>
                {tab.id !== 'school-main' && <button className="tab-close" type="button" aria-label={`关闭${tab.pageTitle}标签`} onClick={() => closeTab(tab.id)}>×</button>}
              </div>
            ))}
          </div>
          <div className="toolbar">
            <div className="toolbar-nav" aria-label="浏览控制">
              <button type="button" aria-label="后退" title="后退" onClick={goBack} disabled={!canGoBack}>←</button>
              <button type="button" aria-label="前进" title="前进" onClick={goForward} disabled={!canGoForward}>→</button>
              <button type="button" aria-label="刷新" title="刷新" onClick={refresh}>↻</button>
              <button type="button" aria-label="学校官网主页" title="学校官网主页" onClick={() => navigate(SCHOOL_HOME_URL)}>⌂</button>
            </div>
            <form className="address-form" onSubmit={submitAddress}>
              <span className="address-status" aria-hidden="true">◇</span>
              <label className="sr-only" htmlFor="game-address">游戏内地址</label>
              <input id="game-address" value={address} onChange={(event) => setAddress(event.target.value)} spellCheck={false} autoCapitalize="off" />
              <button type="submit">前往</button>
            </form>
            <div className="browser-menu-wrap">
              <button className="menu-trigger" type="button" aria-label="浏览器菜单" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>⋮</button>
              {menuOpen && <div className="browser-menu"><button type="button" onClick={() => { setLogOpen(true); setMenuOpen(false) }}>调查记录</button><button type="button" onClick={returnToTitle}>返回游戏标题页</button><button type="button" onClick={confirmReset}>清除存档并重置</button><div className="menu-version">{PROTOTYPE_VERSION}</div></div>}
            </div>
          </div>
        </header>
        <div className={`browser-workspace ${state.evidenceSidebarCollapsed ? 'evidence-collapsed' : ''}`}>
          <div className="browser-page" key={`${activeTab.id}-${activeTab.refreshToken}`}>
            {state.chapterSixSyncGlitchActive && <main className="student-main"><div className="student-page-header"><h1>同步状态</h1><p>对象：2024010307</p></div><div className="system-complete-note">状态：未开始<br />设备位置：无法确认</div></main>}
            {!state.chapterSixSyncGlitchActive && <>
            {route.siteType === 'school' && <SchoolSite route={route} onNavigate={navigate} onOpenStudentTab={openStudentTab} />}
            {route.siteType === 'student' && <StudentSite route={route} onNavigate={navigate} onReturnSchoolTab={focusSchoolTab} />}
            {route.siteType === 'archive' && <ArchiveSite route={route} onNavigate={navigate} />}
            {route.siteType === 'unknown' && <UnknownSiteError hostname={route.hostname} />}
            </>}
          </div>
          <EvidenceSidebar />
        </div>
        <footer className="browser-statusbar"><span>游戏内网络 · {state.tabs.length} 个标签</span><button type="button" onClick={returnToTitle}>返回《退学证明》</button></footer>
      </section>
      {logOpen && <InvestigationLog onClose={() => setLogOpen(false)} />}
      {state.chapterEndingVisible && <ChapterEnding />}
      {state.chapterTwoEndingVisible && <ChapterTwoEnding />}
      {state.chapterThreeEndingVisible && <ChapterThreeEnding />}
      {state.chapterFourEndingVisible && <ChapterFourEnding />}
      {state.chapterFiveEndingVisible && <ChapterFiveEnding />}
      {state.chapterSixEndingVisible && <ChapterSixEnding />}
      {state.chapterSevenEndingVisible && <ChapterSevenEnding />}
      {state.chapterEightEndingVisible && <ChapterEightEnding />}
    </main>
  )
}
