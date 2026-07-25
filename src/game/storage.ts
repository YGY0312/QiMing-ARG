import { LEGACY_SAVE_KEY, LEGACY_V2_SAVE_KEY, LEGACY_V3_SAVE_KEY, LEGACY_V4_SAVE_KEY, PROTOTYPE_VERSION, SAVE_KEY, STORAGE_PREFIX, ZHOU_CREDENTIALS_MESSAGE_ID } from './constants'
import { createEmptyClues, mergeClues } from '../data/story'
import { addSavedStudentAccount, createDefaultSavedAccounts } from './savedAccounts'
import { createSchoolTab, createStudentTab, SCHOOL_TAB_ID, studentTabTitle } from './tabs'
import { parseGameUrl } from './router'
import type { BrowserTabState, ClueProgressMap, GameSaveV2, GameSaveV5, GameState, SavedStudentAccount, StoryEventId, StudentAccountStates } from '../types/game'

export function createStudentAccountStates(): StudentAccountStates {
  return {
    lin_mo: { lastLoginAt: null, lastVisitedUrl: 'stu.qiming-high.edu.cn/dashboard' },
    zhou_xun: { lastLoginAt: null, lastVisitedUrl: 'stu.qiming-high.edu.cn/dashboard' },
  }
}

export function createSave(state: GameState): GameSaveV5 {
  return {
    schemaVersion: 5,
    prototypeVersion: PROTOTYPE_VERSION,
    isStarted: state.isStarted,
    tabs: state.tabs.map((tab) => ({ ...tab, history: [...tab.history], refreshToken: 0, studentSession: tab.studentSession ? { ...tab.studentSession } : undefined })),
    activeTabId: state.activeTabId,
    savedStudentAccounts: state.savedStudentAccounts.map((account) => ({ ...account })),
    studentAccountStates: { ...state.studentAccountStates },
    evidenceSidebarCollapsed: state.evidenceSidebarCollapsed,
    visitedPages: [...state.visitedPages],
    clues: state.clues,
    triggeredEvents: [...state.triggeredEvents],
    unreadMessageIds: [...state.unreadMessageIds],
    readMessageIds: [...state.readMessageIds],
    unlockedFileIds: [...state.unlockedFileIds],
    chapterOneCompleted: state.chapterOneCompleted,
    chapterOneCompletedAt: state.chapterOneCompletedAt,
    chapterEndingPlayed: state.chapterEndingPlayed,
    chapterTwoStarted: state.chapterTwoStarted,
    chapterTwoCompleted: state.chapterTwoCompleted,
    chapterTwoCompletedAt: state.chapterTwoCompletedAt,
    chapterTwoEndingPlayed: state.chapterTwoEndingPlayed,
    searchResiduePlayed: state.searchResiduePlayed,
    classCountAnomalyPlayed: state.classCountAnomalyPlayed,
    chapterTwoAnomalyHistoryAdded: state.chapterTwoAnomalyHistoryAdded,
    revealedFileSections: [...state.revealedFileSections],
    savedAt: new Date().toISOString(),
  }
}

function stringArray(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [] }
function storyEvents(value: unknown): StoryEventId[] {
  const allowed: StoryEventId[] = ['old_building_contradiction', 'zhou_draft_revealed', 'investigation_backup_unlocked', 'chapter_one_completed', 'chapter_two_started', 'shenzhi_cache_unlocked', 'old_building_access_unlocked', 'chapter_two_final_file_unlocked', 'chapter_two_completed', 'chapter_three_started', 'chapter_three_final_unlocked', 'chapter_three_completed', 'chapter_four_started', 'chapter_four_admin_unlocked', 'chapter_four_final_unlocked', 'chapter_four_completed', 'chapter_five_started', 'chapter_five_cache_unlocked', 'chapter_five_relation_unlocked', 'chapter_five_final_unlocked', 'chapter_five_completed']
  return stringArray(value).map((id) => id === 'zhou_message_unlocked' ? 'zhou_draft_revealed' : id).filter((id): id is StoryEventId => allowed.includes(id as StoryEventId))
}

function chapterTwoDefaults(raw?: Record<string, unknown>) {
  return {
    chapterTwoStarted: Boolean(raw?.chapterTwoStarted),
    chapterTwoCompleted: Boolean(raw?.chapterTwoCompleted),
    chapterTwoCompletedAt: typeof raw?.chapterTwoCompletedAt === 'string' ? raw.chapterTwoCompletedAt : null,
    chapterTwoEndingPlayed: Boolean(raw?.chapterTwoEndingPlayed),
    searchResiduePlayed: Boolean(raw?.searchResiduePlayed),
    classCountAnomalyPlayed: Boolean(raw?.classCountAnomalyPlayed),
    chapterTwoAnomalyHistoryAdded: Boolean(raw?.chapterTwoAnomalyHistoryAdded),
    revealedFileSections: stringArray(raw?.revealedFileSections),
  }
}
function messageState(unreadValue: unknown, readValue: unknown): { unread: string[]; read: string[] } {
  const unread = stringArray(unreadValue); const read = stringArray(readValue)
  if (!unread.includes(ZHOU_CREDENTIALS_MESSAGE_ID) && !read.includes(ZHOU_CREDENTIALS_MESSAGE_ID)) unread.push(ZHOU_CREDENTIALS_MESSAGE_ID)
  return { unread, read }
}
function validTab(value: unknown): value is BrowserTabState {
  if (!value || typeof value !== 'object') return false
  const tab = value as Partial<BrowserTabState>
  return typeof tab.id === 'string' && tab.id.length > 0 && (tab.siteType === 'school' || tab.siteType === 'student' || tab.id === SCHOOL_TAB_ID)
    && typeof tab.currentUrl === 'string' && Array.isArray(tab.history) && typeof tab.historyIndex === 'number'
}
function normalizeTab(tab: BrowserTabState, forcedId?: string, migratedAccountId?: string | null): BrowserTabState {
  const id = forcedId ?? tab.id
  const siteType = id === SCHOOL_TAB_ID ? 'school' : 'student'
  const history = stringArray(tab.history); const safeHistory = history.length ? history : [tab.currentUrl]
  const historyIndex = Math.min(Math.max(tab.historyIndex, 0), safeHistory.length - 1); const currentUrl = safeHistory[historyIndex] ?? tab.currentUrl
  const accountId = siteType === 'student'
    ? (typeof migratedAccountId === 'string' ? migratedAccountId : typeof tab.studentSession?.accountId === 'string' ? tab.studentSession.accountId : null)
    : null
  return {
    id, siteType, history: safeHistory, historyIndex, currentUrl,
    pageTitle: siteType === 'student' ? studentTabTitle(accountId) : parseGameUrl(currentUrl).pageTitle,
    refreshToken: 0,
    studentSession: siteType === 'student' ? { accountId } : undefined,
    openVirtualFileId: typeof tab.openVirtualFileId === 'string' ? tab.openVirtualFileId : null,
  }
}
function uniqueTabs(values: BrowserTabState[]): BrowserTabState[] {
  const seen = new Set<string>()
  return values.filter((tab) => { if (seen.has(tab.id)) return false; seen.add(tab.id); return true })
}
function normalizeSavedAccounts(value: unknown): SavedStudentAccount[] {
  if (!Array.isArray(value)) return []
  const accounts: SavedStudentAccount[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const account = item as Partial<SavedStudentAccount>
    if (typeof account.accountId !== 'string' || typeof account.studentNumber !== 'string' || typeof account.displayName !== 'string') continue
    if (accounts.some((current) => current.accountId === account.accountId)) continue
    accounts.push({ accountId: account.accountId, studentNumber: account.studentNumber, displayName: account.displayName, savedAt: typeof account.savedAt === 'string' ? account.savedAt : new Date().toISOString() })
  }
  return accounts
}
function normalizeAccountStates(value: unknown): StudentAccountStates {
  const result = createStudentAccountStates()
  if (!value || typeof value !== 'object') return result
  for (const [id, incoming] of Object.entries(value as Record<string, unknown>)) {
    if (!incoming || typeof incoming !== 'object') continue
    const state = incoming as Partial<{ lastLoginAt: string | null; lastVisitedUrl: string }>
    result[id] = { lastLoginAt: typeof state.lastLoginAt === 'string' ? state.lastLoginAt : null, lastVisitedUrl: typeof state.lastVisitedUrl === 'string' ? state.lastVisitedUrl : 'stu.qiming-high.edu.cn/dashboard' }
  }
  return result
}

export function migrateSave(value: unknown): GameSaveV5 | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>

  if (raw.schemaVersion === 5 || raw.schemaVersion === 4) {
    let tabs = uniqueTabs((Array.isArray(raw.tabs) ? raw.tabs.filter(validTab) : []).map((tab) => normalizeTab(tab)))
    const school = tabs.find((tab) => tab.id === SCHOOL_TAB_ID)
    tabs = [school ?? createSchoolTab(), ...tabs.filter((tab) => tab.id !== SCHOOL_TAB_ID && tab.siteType === 'student')]
    const activeTabId = typeof raw.activeTabId === 'string' && tabs.some((tab) => tab.id === raw.activeTabId) ? raw.activeTabId : SCHOOL_TAB_ID
    const messages = messageState(raw.unreadMessageIds, raw.readMessageIds)
    const chapterDefaults = chapterTwoDefaults(raw)
    const triggeredEvents = storyEvents(raw.triggeredEvents)
    if (chapterDefaults.revealedFileSections.includes('chapter-three-final-read') && !triggeredEvents.includes('chapter_three_completed')) {
      triggeredEvents.push('chapter_three_completed')
    }
    if (chapterDefaults.revealedFileSections.includes('chapter-four-final-read') && !triggeredEvents.includes('chapter_four_completed')) {
      triggeredEvents.push('chapter_four_completed')
    }
    if (chapterDefaults.revealedFileSections.includes('chapter-five-final-read') && !triggeredEvents.includes('chapter_five_completed')) {
      triggeredEvents.push('chapter_five_completed')
    }
    return {
      schemaVersion: 5, prototypeVersion: PROTOTYPE_VERSION, isStarted: Boolean(raw.isStarted), tabs, activeTabId,
      savedStudentAccounts: normalizeSavedAccounts(raw.savedStudentAccounts), studentAccountStates: normalizeAccountStates(raw.studentAccountStates),
      evidenceSidebarCollapsed: Boolean(raw.evidenceSidebarCollapsed), visitedPages: stringArray(raw.visitedPages),
      clues: mergeClues(raw.clues as Partial<ClueProgressMap> | undefined), triggeredEvents,
      unreadMessageIds: messages.unread, readMessageIds: messages.read, unlockedFileIds: stringArray(raw.unlockedFileIds),
      chapterOneCompleted: Boolean(raw.chapterOneCompleted), chapterOneCompletedAt: typeof raw.chapterOneCompletedAt === 'string' ? raw.chapterOneCompletedAt : null,
      chapterEndingPlayed: Boolean(raw.chapterEndingPlayed), savedAt: typeof raw.savedAt === 'string' ? raw.savedAt : new Date().toISOString(),
      ...chapterDefaults,
    }
  }

  if (raw.schemaVersion === 3) {
    const oldTabs = Array.isArray(raw.tabs) ? raw.tabs.filter(validTab) : []
    const oldAccountId = typeof raw.currentStudentAccount === 'string' ? raw.currentStudentAccount : null
    const schoolSource = oldTabs.find((tab) => tab.id === SCHOOL_TAB_ID || tab.siteType === 'school')
    const studentSource = oldTabs.find((tab) => tab.siteType === 'student' || tab.id === 'student-system')
    const school = schoolSource ? normalizeTab(schoolSource, SCHOOL_TAB_ID) : createSchoolTab()
    const student = studentSource ? normalizeTab(studentSource, 'student-1', oldAccountId) : null
    if (student && typeof raw.openVirtualFileId === 'string') student.openVirtualFileId = raw.openVirtualFileId
    const tabs = student ? [school, student] : [school]
    const activeTabId = raw.activeTabId === 'student-system' && student ? student.id : SCHOOL_TAB_ID
    let savedAccounts = createDefaultSavedAccounts()
    if (oldAccountId === 'zhou_xun') savedAccounts = addSavedStudentAccount(savedAccounts, 'zhou_xun')
    const messages = messageState(raw.unreadMessageIds, raw.readMessageIds)
    return {
      schemaVersion: 5, prototypeVersion: PROTOTYPE_VERSION, isStarted: Boolean(raw.isStarted), tabs, activeTabId,
      savedStudentAccounts: savedAccounts, studentAccountStates: normalizeAccountStates(raw.studentAccountStates), evidenceSidebarCollapsed: false,
      visitedPages: stringArray(raw.visitedPages), clues: mergeClues(raw.clues as Partial<ClueProgressMap> | undefined), triggeredEvents: storyEvents(raw.triggeredEvents),
      unreadMessageIds: messages.unread, readMessageIds: messages.read, unlockedFileIds: stringArray(raw.unlockedFileIds),
      chapterOneCompleted: Boolean(raw.chapterOneCompleted), chapterOneCompletedAt: typeof raw.chapterOneCompletedAt === 'string' ? raw.chapterOneCompletedAt : null,
      chapterEndingPlayed: Boolean(raw.chapterEndingPlayed), savedAt: typeof raw.savedAt === 'string' ? raw.savedAt : new Date().toISOString(),
      ...chapterTwoDefaults(),
    }
  }

  const legacy = raw as unknown as Partial<GameSaveV2>
  if (typeof legacy.currentUrl !== 'string' || !Array.isArray(legacy.history) || typeof legacy.historyIndex !== 'number') return null
  const history = stringArray(legacy.history); const safeIndex = Math.min(Math.max(legacy.historyIndex, 0), Math.max(history.length - 1, 0))
  const currentUrl = history[safeIndex] ?? legacy.currentUrl; const currentSite = parseGameUrl(currentUrl).siteType
  const schoolHistory = history.filter((url) => parseGameUrl(url).siteType === 'school'); const studentHistory = history.filter((url) => parseGameUrl(url).siteType === 'student')
  const school = createSchoolTab(schoolHistory.at(-1), schoolHistory)
  const student = currentSite === 'student' ? createStudentTab(currentUrl, studentHistory.length ? studentHistory : [currentUrl], Math.max(studentHistory.length - 1, 0), 'student-1', legacy.studentLoggedIn ? 'lin_mo' : null) : null
  const messages = messageState(legacy.unreadMessageIds, legacy.readMessageIds); const schemaVersion = Number(raw.schemaVersion)
  return {
    schemaVersion: 5, prototypeVersion: PROTOTYPE_VERSION, isStarted: Boolean(legacy.isStarted), tabs: student ? [school, student] : [school], activeTabId: student ? student.id : SCHOOL_TAB_ID,
    savedStudentAccounts: createDefaultSavedAccounts(), studentAccountStates: createStudentAccountStates(), evidenceSidebarCollapsed: false,
    visitedPages: stringArray(legacy.visitedPages), clues: schemaVersion === 2 ? mergeClues(legacy.clues) : createEmptyClues(), triggeredEvents: storyEvents(legacy.triggeredEvents),
    unreadMessageIds: messages.unread, readMessageIds: messages.read, unlockedFileIds: stringArray(legacy.unlockedFileIds),
    chapterOneCompleted: Boolean(legacy.chapterOneCompleted), chapterOneCompletedAt: typeof legacy.chapterOneCompletedAt === 'string' ? legacy.chapterOneCompletedAt : null,
    chapterEndingPlayed: Boolean(legacy.chapterEndingPlayed), savedAt: typeof legacy.savedAt === 'string' ? legacy.savedAt : new Date().toISOString(),
    ...chapterTwoDefaults(),
  }
}

export function writeSave(state: GameState, storage: Storage = window.localStorage): void {
  storage.setItem(SAVE_KEY, JSON.stringify(createSave(state)))
  for (const key of [LEGACY_V4_SAVE_KEY, LEGACY_V3_SAVE_KEY, LEGACY_V2_SAVE_KEY, LEGACY_SAVE_KEY]) storage.removeItem(key)
}
export function readSave(storage: Storage = window.localStorage): GameSaveV5 | null {
  for (const key of [SAVE_KEY, LEGACY_V4_SAVE_KEY, LEGACY_V3_SAVE_KEY, LEGACY_V2_SAVE_KEY, LEGACY_SAVE_KEY]) {
    const raw = storage.getItem(key); if (!raw) continue
    try { const migrated = migrateSave(JSON.parse(raw) as unknown); if (migrated) return migrated } catch { /* 安全回退 */ }
  }
  return null
}
export function hasGameSave(storage: Storage = window.localStorage): boolean { return readSave(storage) !== null }
export function resetGameStorage(storage: Storage = window.localStorage): void {
  const keys: string[] = []; for (let index = 0; index < storage.length; index += 1) { const key = storage.key(index); if (key?.startsWith(STORAGE_PREFIX)) keys.push(key) }
  keys.forEach((key) => storage.removeItem(key))
}
