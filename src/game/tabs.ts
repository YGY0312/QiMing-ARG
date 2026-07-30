import { SCHOOL_HOME_URL } from './constants'
import { parseGameUrl } from './router'
import { getStudentAccount } from '../utils/auth'
import type { BrowserTabState, StudentAccountId, TabId } from '../types/game'

export const SCHOOL_TAB_ID = 'school-main'
export const STUDENT_LOGIN_URL = 'stu.qiming-high.edu.cn/login'

export function createSchoolTab(url = SCHOOL_HOME_URL, history?: string[], historyIndex?: number): BrowserTabState {
  return createTab(SCHOOL_TAB_ID, 'school', url, history, historyIndex)
}

export function createStudentTab(
  url = STUDENT_LOGIN_URL,
  history?: string[],
  historyIndex?: number,
  id: TabId = 'student-1',
  accountId: StudentAccountId | null = null,
): BrowserTabState {
  return createTab(id, 'student', url, history, historyIndex, accountId)
}

export function createNextStudentTab(tabs: BrowserTabState[]): BrowserTabState {
  let index = 1
  const ids = new Set(tabs.map((tab) => tab.id))
  while (ids.has(`student-${index}`)) index += 1
  return createStudentTab(STUDENT_LOGIN_URL, undefined, undefined, `student-${index}`)
}

function createTab(id: TabId, siteType: 'school' | 'student', url: string, history = [url], historyIndex = history.length - 1, accountId: StudentAccountId | null = null): BrowserTabState {
  const safeHistory = history.length ? history : [url]
  const safeIndex = Math.min(Math.max(historyIndex, 0), safeHistory.length - 1)
  const currentUrl = safeHistory[safeIndex] ?? url
  const base: BrowserTabState = { id, siteType, currentUrl, history: safeHistory, historyIndex: safeIndex, pageTitle: parseGameUrl(currentUrl).pageTitle, refreshToken: 0, openVirtualFileId: null }
  return siteType === 'student' ? withStudentSession(base, accountId) : base
}

export function studentTabTitle(accountId: StudentAccountId | null): string {
  const account = getStudentAccount(accountId)
  return account ? `学生信息系统 - ${account.name}` : '学生信息系统'
}

export function withStudentSession(tab: BrowserTabState, accountId: StudentAccountId | null): BrowserTabState {
  if (tab.siteType !== 'student') return tab
  return { ...tab, studentSession: { accountId }, pageTitle: studentTabTitle(accountId), openVirtualFileId: accountId ? tab.openVirtualFileId ?? null : null }
}

function titleFor(tab: BrowserTabState, url: string): string {
  const route = parseGameUrl(url)
  return tab.siteType === 'student' && route.siteType === 'student' ? studentTabTitle(tab.studentSession?.accountId ?? null) : route.pageTitle
}

export function navigateTab(tab: BrowserTabState, url: string): BrowserTabState {
  const route = parseGameUrl(url)
  if (tab.currentUrl === route.url) return { ...tab, pageTitle: titleFor(tab, route.url) }
  const history = [...tab.history.slice(0, tab.historyIndex + 1), route.url]
  return { ...tab, currentUrl: route.url, history, historyIndex: history.length - 1, pageTitle: titleFor(tab, route.url) }
}
export function goBackInTab(tab: BrowserTabState): BrowserTabState {
  if (tab.historyIndex <= 0) return tab
  const historyIndex = tab.historyIndex - 1; const currentUrl = tab.history[historyIndex]
  return { ...tab, historyIndex, currentUrl, pageTitle: titleFor(tab, currentUrl) }
}
export function goForwardInTab(tab: BrowserTabState): BrowserTabState {
  if (tab.historyIndex >= tab.history.length - 1) return tab
  const historyIndex = tab.historyIndex + 1; const currentUrl = tab.history[historyIndex]
  return { ...tab, historyIndex, currentUrl, pageTitle: titleFor(tab, currentUrl) }
}
export function refreshTab(tab: BrowserTabState): BrowserTabState { return { ...tab, refreshToken: tab.refreshToken + 1 } }
export function replaceTab(tabs: BrowserTabState[], updated: BrowserTabState): BrowserTabState[] { return tabs.map((tab) => tab.id === updated.id ? updated : tab) }
