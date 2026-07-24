import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createEmptyClues } from '../data/story'
import { PROTOTYPE_VERSION, SCHOOL_HOME_URL, SHENZHI_STUDENT_ANOMALY_URL, ZHOU_CREDENTIALS_MESSAGE_ID } from './constants'
import { parseGameUrl } from './router'
import { addSavedStudentAccount, createDefaultSavedAccounts, removeSavedStudentAccount } from './savedAccounts'
import { createStudentAccountStates, readSave, resetGameStorage, writeSave } from './storage'
import { createNextStudentTab, createSchoolTab, goBackInTab, goForwardInTab, navigateTab, refreshTab, replaceTab, SCHOOL_TAB_ID, withStudentSession } from './tabs'
import { appendChapterAnomaly, appendChapterTwoAnomaly, clearStoryClue, discoverStoryClue, evaluateStoryEvents, forceStoryEvent, openInvestigationBackup, readStoryMessage, recordAccessQuery as recordStoryAccessQuery, recordChapterThreeEvidence as recordStoryChapterThreeEvidence, resetChapterProgress, resetChapterTwoProgress } from './story'
import type { BrowserTabState, ChapterThreeEvidenceAction, ClueId, GameRoute, GameState, StoryEventId, StudentAccountId, TabId } from '../types/game'

interface GameContextValue {
  state: GameState
  route: GameRoute
  activeTab: BrowserTabState
  canGoBack: boolean
  canGoForward: boolean
  startGame: () => void
  returnToTitle: () => void
  navigate: (url: string) => void
  goBack: () => void
  goForward: () => void
  refresh: () => void
  openStudentTab: () => void
  focusSchoolTab: () => void
  switchTab: (id: TabId) => void
  closeTab: (id: TabId) => void
  resetTabs: () => void
  loginStudent: (accountId: StudentAccountId, tabId?: TabId) => void
  logoutStudent: (tabId?: TabId) => void
  resetStudentSessions: () => void
  addSavedAccount: (accountId: StudentAccountId) => void
  removeSavedAccount: (accountId: StudentAccountId) => void
  setStudentTabCaptcha: (tabId: TabId, captcha: string) => void
  clearStudentTabCaptcha: (tabId: TabId) => void
  setEvidenceSidebarCollapsed: (collapsed: boolean) => void
  resetGame: () => void
  discoverClue: (id: ClueId, sourceUrl?: string) => void
  clearClue: (id: ClueId) => void
  readMessage: (id: string) => void
  openBackup: () => void
  openVirtualFile: (id: string) => void
  closeVirtualFile: () => void
  forceEvent: (id: StoryEventId) => void
  resetChapterOne: () => void
  resetChapterTwo: () => void
  revealFileSection: (key: string, clueId?: ClueId) => void
  recordAccessQuery: (direction: '进入' | '离开') => void
  recordChapterThreeEvidence: (action: ChapterThreeEvidenceAction) => void
  markSearchResiduePlayed: () => void
  markClassCountAnomalyPlayed: () => void
  beginChapterEnding: () => void
  finishAddressGlitch: () => void
  dismissChapterEnding: () => void
  beginChapterTwoEnding: () => void
  finishChapterTwoAddressGlitch: () => void
  dismissChapterTwoEnding: () => void
  playChapterTwoEnding: () => void
  clearChapterTwoAnomalyHistory: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

function activeTabOf(tabs: BrowserTabState[], id: TabId): BrowserTabState {
  return tabs.find((tab) => tab.id === id) ?? tabs.find((tab) => tab.id === SCHOOL_TAB_ID) ?? createSchoolTab()
}

function syncActiveTab(state: GameState, tabs = state.tabs, activeTabId = state.activeTabId): GameState {
  const active = activeTabOf(tabs, activeTabId)
  return { ...state, tabs, activeTabId: active.id, currentUrl: active.currentUrl, history: active.history, historyIndex: active.historyIndex, refreshToken: active.refreshToken, openVirtualFileId: active.openVirtualFileId ?? null }
}

function emptyState(): GameState {
  const schoolTab = createSchoolTab()
  return {
    isStarted: false, hasSave: false, tabs: [schoolTab], activeTabId: schoolTab.id,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: [], clues: createEmptyClues(), triggeredEvents: [], unreadMessageIds: [ZHOU_CREDENTIALS_MESSAGE_ID], readMessageIds: [], unlockedFileIds: [],
    chapterOneCompleted: false, chapterOneCompletedAt: null, chapterEndingPlayed: false, studentTabCaptchas: {},
    chapterTwoStarted: false, chapterTwoCompleted: false, chapterTwoCompletedAt: null, chapterTwoEndingPlayed: false,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: false, revealedFileSections: [],
    currentUrl: schoolTab.currentUrl, history: schoolTab.history, historyIndex: schoolTab.historyIndex, refreshToken: schoolTab.refreshToken, openVirtualFileId: null,
    addressGlitchActive: false, chapterEndingVisible: false,
    chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
  }
}

function initialState(): GameState {
  const saved = readSave()
  if (!saved) return emptyState()
  return evaluateStoryEvents(syncActiveTab({ ...emptyState(), ...saved, isStarted: false, hasSave: true, studentTabCaptchas: {}, addressGlitchActive: false, chapterEndingVisible: false, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false }))
}

function withVisited(state: GameState): GameState {
  return state.visitedPages.includes(state.currentUrl) ? state : { ...state, visitedPages: [...state.visitedPages, state.currentUrl] }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(initialState)

  useEffect(() => { if (state.hasSave) writeSave(state) }, [state])

  const navigate = useCallback((input: string) => {
    const route = parseGameUrl(input)
    setState((current) => {
      let tabs = current.tabs; let activeTabId = current.activeTabId
      const active = activeTabOf(tabs, activeTabId)
      if (route.siteType === 'school') {
        const school = tabs.find((tab) => tab.id === SCHOOL_TAB_ID) ?? createSchoolTab()
        tabs = replaceTab(tabs, navigateTab(school, route.url)); activeTabId = SCHOOL_TAB_ID
      } else if (route.siteType === 'student') {
        if (active.siteType === 'student') tabs = replaceTab(tabs, navigateTab(active, route.url))
        else { const created = navigateTab(createNextStudentTab(tabs), route.url); tabs = [...tabs, created]; activeTabId = created.id }
      } else tabs = replaceTab(tabs, navigateTab(active, route.url))

      let next = withVisited(syncActiveTab({ ...current, hasSave: true }, tabs, activeTabId))
      const target = activeTabOf(tabs, activeTabId); const accountId = target.studentSession?.accountId
      if (route.siteType === 'student' && accountId) next = { ...next, studentAccountStates: { ...next.studentAccountStates, [accountId]: { ...(next.studentAccountStates[accountId] ?? { lastLoginAt: null }), lastVisitedUrl: route.url } } }
      return evaluateStoryEvents(next)
    })
  }, [])

  const startGame = useCallback(() => setState((current) => withVisited({ ...current, isStarted: true, hasSave: true })), [])
  const returnToTitle = useCallback(() => setState((current) => ({ ...current, isStarted: false, chapterEndingVisible: false, chapterTwoEndingVisible: false })), [])
  const goBack = useCallback(() => setState((current) => { const updated = goBackInTab(activeTabOf(current.tabs, current.activeTabId)); return updated.historyIndex === current.historyIndex ? current : withVisited(syncActiveTab(current, replaceTab(current.tabs, updated))) }), [])
  const goForward = useCallback(() => setState((current) => { const updated = goForwardInTab(activeTabOf(current.tabs, current.activeTabId)); return updated.historyIndex === current.historyIndex ? current : withVisited(syncActiveTab(current, replaceTab(current.tabs, updated))) }), [])
  const refresh = useCallback(() => setState((current) => { const updated = refreshTab(activeTabOf(current.tabs, current.activeTabId)); return syncActiveTab(current, replaceTab(current.tabs, updated)) }), [])

  const openStudentTab = useCallback(() => setState((current) => { const created = createNextStudentTab(current.tabs); return withVisited(syncActiveTab({ ...current, hasSave: true }, [...current.tabs, created], created.id)) }), [])
  const focusSchoolTab = useCallback(() => setState((current) => withVisited(syncActiveTab(current, current.tabs, SCHOOL_TAB_ID))), [])
  const switchTab = useCallback((id: TabId) => setState((current) => current.tabs.some((tab) => tab.id === id) ? withVisited(syncActiveTab(current, current.tabs, id)) : current), [])
  const closeTab = useCallback((id: TabId) => setState((current) => {
    if (id === SCHOOL_TAB_ID || !current.tabs.some((tab) => tab.id === id)) return current
    const tabs = current.tabs.filter((tab) => tab.id !== id)
    const activeTabId = current.activeTabId === id ? SCHOOL_TAB_ID : current.activeTabId
    const { [id]: _removed, ...studentTabCaptchas } = current.studentTabCaptchas
    return syncActiveTab({ ...current, studentTabCaptchas }, tabs, activeTabId)
  }), [])
  const resetTabs = useCallback(() => setState((current) => { const school = createSchoolTab(); return syncActiveTab({ ...current, studentTabCaptchas: {} }, [school], school.id) }), [])

  const loginStudent = useCallback((accountId: StudentAccountId, requestedTabId?: TabId) => setState((current) => {
    const tabId = requestedTabId ?? current.activeTabId; const tab = current.tabs.find((item) => item.id === tabId)
    if (!tab || tab.siteType !== 'student') return current
    const updated = navigateTab(withStudentSession(tab, accountId), 'stu.qiming-high.edu.cn/dashboard')
    const { [tabId]: _captcha, ...studentTabCaptchas } = current.studentTabCaptchas
    const accountState = current.studentAccountStates[accountId] ?? { lastLoginAt: null, lastVisitedUrl: 'stu.qiming-high.edu.cn/dashboard' }
    const next = {
      ...current,
      hasSave: true,
      savedStudentAccounts: addSavedStudentAccount(current.savedStudentAccounts, accountId),
      studentAccountStates: { ...current.studentAccountStates, [accountId]: { ...accountState, lastLoginAt: new Date().toISOString(), lastVisitedUrl: updated.currentUrl } },
      studentTabCaptchas,
    }
    return syncActiveTab(next, replaceTab(current.tabs, updated), current.activeTabId)
  }), [])
  const logoutStudent = useCallback((requestedTabId?: TabId) => setState((current) => {
    const tabId = requestedTabId ?? current.activeTabId; const tab = current.tabs.find((item) => item.id === tabId)
    if (!tab || tab.siteType !== 'student') return current
    const updated = navigateTab(withStudentSession(tab, null), 'stu.qiming-high.edu.cn/login')
    return syncActiveTab(current, replaceTab(current.tabs, updated), current.activeTabId)
  }), [])
  const resetStudentSessions = useCallback(() => setState((current) => {
    const tabs = current.tabs.map((tab) => tab.siteType === 'student' ? navigateTab(withStudentSession(tab, null), 'stu.qiming-high.edu.cn/login') : tab)
    return syncActiveTab({ ...current, studentTabCaptchas: {} }, tabs)
  }), [])
  const addSavedAccount = useCallback((accountId: StudentAccountId) => setState((current) => ({ ...current, savedStudentAccounts: addSavedStudentAccount(current.savedStudentAccounts, accountId) })), [])
  const removeSavedAccount = useCallback((accountId: StudentAccountId) => setState((current) => ({ ...current, savedStudentAccounts: removeSavedStudentAccount(current.savedStudentAccounts, accountId) })), [])
  const setStudentTabCaptcha = useCallback((tabId: TabId, captcha: string) => setState((current) => ({ ...current, studentTabCaptchas: { ...current.studentTabCaptchas, [tabId]: captcha } })), [])
  const clearStudentTabCaptcha = useCallback((tabId: TabId) => setState((current) => { const { [tabId]: _captcha, ...studentTabCaptchas } = current.studentTabCaptchas; return { ...current, studentTabCaptchas } }), [])
  const setEvidenceSidebarCollapsed = useCallback((collapsed: boolean) => setState((current) => ({ ...current, evidenceSidebarCollapsed: collapsed, hasSave: true })), [])
  const resetGame = useCallback(() => { resetGameStorage(); setState(emptyState()) }, [])

  const discoverClue = useCallback((id: ClueId, sourceUrl?: string) => setState((current) => discoverStoryClue(current, id, sourceUrl ?? current.currentUrl)), [])
  const clearClue = useCallback((id: ClueId) => setState((current) => clearStoryClue(current, id)), [])
  const readMessage = useCallback((id: string) => setState((current) => readStoryMessage(current, id, current.currentUrl)), [])
  const openBackup = useCallback(() => setState((current) => {
    const tab = activeTabOf(current.tabs, current.activeTabId); const updated = { ...tab, openVirtualFileId: 'backup-readme' }
    return openInvestigationBackup(syncActiveTab(current, replaceTab(current.tabs, updated)), current.currentUrl)
  }), [])
  const openVirtualFile = useCallback((id: string) => setState((current) => { const tab = activeTabOf(current.tabs, current.activeTabId); return syncActiveTab(current, replaceTab(current.tabs, { ...tab, openVirtualFileId: id })) }), [])
  const closeVirtualFile = useCallback(() => setState((current) => { const tab = activeTabOf(current.tabs, current.activeTabId); return syncActiveTab(current, replaceTab(current.tabs, { ...tab, openVirtualFileId: null })) }), [])
  const forceEvent = useCallback((id: StoryEventId) => setState((current) => forceStoryEvent(current, id)), [])
  const resetChapterOne = useCallback(() => setState(resetChapterProgress), [])
  const resetChapterTwo = useCallback(() => setState(resetChapterTwoProgress), [])
  const revealFileSection = useCallback((key: string, clueId?: ClueId) => setState((current) => {
    const next = current.revealedFileSections.includes(key) ? current : { ...current, revealedFileSections: [...current.revealedFileSections, key] }
    return clueId ? discoverStoryClue(next, clueId, current.currentUrl) : next
  }), [])
  const recordAccessQuery = useCallback((direction: '进入' | '离开') => setState((current) => (
    recordStoryAccessQuery(current, direction, current.currentUrl)
  )), [])
  const recordChapterThreeEvidence = useCallback((action: ChapterThreeEvidenceAction) => setState((current) => (
    recordStoryChapterThreeEvidence(current, action, current.currentUrl)
  )), [])
  const markSearchResiduePlayed = useCallback(() => setState((current) => ({ ...current, searchResiduePlayed: true })), [])
  const markClassCountAnomalyPlayed = useCallback(() => setState((current) => ({ ...current, classCountAnomalyPlayed: true })), [])
  const beginChapterEnding = useCallback(() => setState(appendChapterAnomaly), [])
  const finishAddressGlitch = useCallback(() => setState((current) => ({ ...current, addressGlitchActive: false, chapterEndingVisible: true })), [])
  const dismissChapterEnding = useCallback(() => setState((current) => ({ ...current, chapterEndingVisible: false })), [])
  const beginChapterTwoEnding = useCallback(() => setState(appendChapterTwoAnomaly), [])
  const finishChapterTwoAddressGlitch = useCallback(() => setState((current) => ({ ...current, chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: true })), [])
  const dismissChapterTwoEnding = useCallback(() => setState((current) => ({ ...current, chapterTwoEndingVisible: false })), [])
  const playChapterTwoEnding = useCallback(() => setState((current) => appendChapterTwoAnomaly(forceStoryEvent({ ...current, chapterTwoEndingPlayed: false }, 'chapter_two_completed'))), [])
  const clearChapterTwoAnomalyHistory = useCallback(() => setState((current) => {
    const tabs = current.tabs.map((tab) => {
      const filtered = tab.history.filter((url) => url !== SHENZHI_STUDENT_ANOMALY_URL)
      const history = filtered.length ? filtered : [tab.siteType === 'student' ? 'stu.qiming-high.edu.cn/dashboard' : SCHOOL_HOME_URL]
      const currentUrl = tab.currentUrl === SHENZHI_STUDENT_ANOMALY_URL ? history.at(-1)! : tab.currentUrl
      return { ...tab, history, currentUrl, historyIndex: Math.min(history.indexOf(currentUrl) >= 0 ? history.indexOf(currentUrl) : history.length - 1, history.length - 1) }
    })
    return syncActiveTab({ ...current, chapterTwoAnomalyHistoryAdded: false }, tabs)
  }), [])

  const activeTab = useMemo(() => activeTabOf(state.tabs, state.activeTabId), [state.tabs, state.activeTabId])
  const route = useMemo(() => parseGameUrl(activeTab.currentUrl), [activeTab.currentUrl, activeTab.refreshToken])
  const value = useMemo<GameContextValue>(() => ({
    state, route, activeTab, canGoBack: activeTab.historyIndex > 0, canGoForward: activeTab.historyIndex < activeTab.history.length - 1,
    startGame, returnToTitle, navigate, goBack, goForward, refresh, openStudentTab, focusSchoolTab, switchTab, closeTab, resetTabs,
    loginStudent, logoutStudent, resetStudentSessions, addSavedAccount, removeSavedAccount, setStudentTabCaptcha, clearStudentTabCaptcha, setEvidenceSidebarCollapsed, resetGame,
    discoverClue, clearClue, readMessage, openBackup, openVirtualFile, closeVirtualFile, forceEvent, resetChapterOne, resetChapterTwo,
    revealFileSection, recordAccessQuery, recordChapterThreeEvidence, markSearchResiduePlayed, markClassCountAnomalyPlayed,
    beginChapterEnding, finishAddressGlitch, dismissChapterEnding,
    beginChapterTwoEnding, finishChapterTwoAddressGlitch, dismissChapterTwoEnding, playChapterTwoEnding, clearChapterTwoAnomalyHistory,
  }), [state, route, activeTab, startGame, returnToTitle, navigate, goBack, goForward, refresh, openStudentTab, focusSchoolTab, switchTab, closeTab, resetTabs, loginStudent, logoutStudent, resetStudentSessions, addSavedAccount, removeSavedAccount, setStudentTabCaptcha, clearStudentTabCaptcha, setEvidenceSidebarCollapsed, resetGame, discoverClue, clearClue, readMessage, openBackup, openVirtualFile, closeVirtualFile, forceEvent, resetChapterOne, resetChapterTwo, revealFileSection, recordAccessQuery, recordChapterThreeEvidence, markSearchResiduePlayed, markClassCountAnomalyPlayed, beginChapterEnding, finishAddressGlitch, dismissChapterEnding, beginChapterTwoEnding, finishChapterTwoAddressGlitch, dismissChapterTwoEnding, playChapterTwoEnding, clearChapterTwoAnomalyHistory])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame 必须在 GameProvider 内使用')
  return context
}

export function useOptionalGame(): GameContextValue | null { return useContext(GameContext) }

export { PROTOTYPE_VERSION }
