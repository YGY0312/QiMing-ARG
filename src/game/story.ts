import {
  BACKUP_FILE_ID,
  CHAPTER_TWO_FINAL_FILE_ID,
  GUYAN_DRAFT_MESSAGE_ID,
  OLD_BUILDING_ACCESS_FILE_ID,
  SHENZHI_ANOMALY_URL,
  SHENZHI_STUDENT_ANOMALY_URL,
  SHENZHI_CACHE_FILE_ID,
  ZHOU_CREDENTIALS_MESSAGE_ID,
  ZHOU_MESSAGE_ID,
} from './constants'
import { chapterTwoClueIds, createEmptyClues, shenzhiCacheEvidenceIds, storyEventRequirements } from '../data/story'
import type { ClueId, GameState, StoryEventId } from '../types/game'

function allDiscovered(state: GameState, clueIds: ClueId[]): boolean {
  return clueIds.every((id) => state.clues[id].discovered)
}

export function evaluateStoryEvents(state: GameState, now = new Date().toISOString()): GameState {
  let next = state
  const trigger = (eventId: StoryEventId, ready: boolean, apply: (current: GameState) => GameState) => {
    if (ready && !next.triggeredEvents.includes(eventId)) {
      next = apply({ ...next, triggeredEvents: [...next.triggeredEvents, eventId] })
    }
  }

  trigger('old_building_contradiction', allDiscovered(next, storyEventRequirements.old_building_contradiction), (current) => current)
  trigger('zhou_draft_revealed', allDiscovered(next, storyEventRequirements.zhou_draft_revealed), (current) => current)
  trigger('investigation_backup_unlocked', allDiscovered(next, storyEventRequirements.investigation_backup_unlocked), (current) => ({
    ...current,
    unlockedFileIds: [...new Set([...current.unlockedFileIds, BACKUP_FILE_ID])],
  }))
  trigger('chapter_one_completed', allDiscovered(next, storyEventRequirements.chapter_one_completed), (current) => ({
    ...current,
    chapterOneCompleted: true,
    chapterOneCompletedAt: current.chapterOneCompletedAt ?? now,
  }))
  trigger('chapter_two_started', next.chapterOneCompleted, (current) => ({ ...current, chapterTwoStarted: true }))
  trigger('shenzhi_cache_unlocked', next.chapterTwoStarted && shenzhiCacheEvidenceIds.filter((id) => next.clues[id].discovered).length >= 3, (current) => ({
    ...current,
    unlockedFileIds: [...new Set([...current.unlockedFileIds, SHENZHI_CACHE_FILE_ID])],
  }))
  trigger('old_building_access_unlocked', next.chapterTwoStarted && allDiscovered(next, storyEventRequirements.old_building_access_unlocked), (current) => ({
    ...current,
    unlockedFileIds: [...new Set([...current.unlockedFileIds, OLD_BUILDING_ACCESS_FILE_ID])],
  }))
  trigger('chapter_two_final_file_unlocked', next.chapterTwoStarted && allDiscovered(next, storyEventRequirements.chapter_two_final_file_unlocked), (current) => ({
    ...current,
    unlockedFileIds: [...new Set([...current.unlockedFileIds, CHAPTER_TWO_FINAL_FILE_ID])],
  }))
  trigger('chapter_two_completed', next.chapterTwoStarted && allDiscovered(next, storyEventRequirements.chapter_two_completed), (current) => ({
    ...current,
    chapterTwoCompleted: true,
    chapterTwoCompletedAt: current.chapterTwoCompletedAt ?? now,
  }))
  return next
}

export function discoverStoryClue(state: GameState, id: ClueId, sourceUrl: string, now = new Date().toISOString()): GameState {
  if (state.clues[id].discovered) return evaluateStoryEvents(state, now)
  return evaluateStoryEvents({
    ...state,
    clues: { ...state.clues, [id]: { ...state.clues[id], discovered: true, discoveredAt: now, sourceUrl } },
  }, now)
}

export function recordAccessQuery(
  state: GameState,
  direction: '进入' | '离开',
  sourceUrl: string,
  now = new Date().toISOString(),
): GameState {
  const key = direction === '进入' ? 'access-query-enter' : 'access-query-exit'
  const revealedFileSections = state.revealedFileSections.includes(key)
    ? state.revealedFileSections
    : [...state.revealedFileSections, key]
  const next = revealedFileSections === state.revealedFileSections ? state : { ...state, revealedFileSections }
  const comparisonComplete = revealedFileSections.includes('access-query-enter')
    && revealedFileSections.includes('access-query-exit')
  return comparisonComplete ? discoverStoryClue(next, 'shenzhi_exit_missing', sourceUrl, now) : next
}

export function clearStoryClue(state: GameState, id: ClueId): GameState {
  return { ...state, clues: { ...state.clues, [id]: { ...state.clues[id], discovered: false, discoveredAt: null, sourceUrl: null } } }
}

export function readStoryMessage(state: GameState, id: string, sourceUrl: string, now = new Date().toISOString()): GameState {
  let next: GameState = {
    ...state,
    unreadMessageIds: state.unreadMessageIds.filter((messageId) => messageId !== id),
    readMessageIds: state.readMessageIds.includes(id) ? state.readMessageIds : [...state.readMessageIds, id],
  }
  const clueByMessage: Partial<Record<string, ClueId>> = {
    [ZHOU_MESSAGE_ID]: 'zhou_message',
    [ZHOU_CREDENTIALS_MESSAGE_ID]: 'zhou_credentials',
    [GUYAN_DRAFT_MESSAGE_ID]: 'guyan_denial',
  }
  const clue = clueByMessage[id]
  if (clue) next = discoverStoryClue(next, clue, sourceUrl, now)
  return evaluateStoryEvents(next, now)
}

export function isBackupPasswordValid(password: string): boolean { return password.trim() === '0726' }

export function openInvestigationBackup(state: GameState, sourceUrl: string, now = new Date().toISOString()): GameState {
  return discoverStoryClue(discoverStoryClue(state, 'investigation_backup', sourceUrl, now), 'shenzhi_name', sourceUrl, now)
}

export function forceStoryEvent(state: GameState, eventId: StoryEventId): GameState {
  if (state.triggeredEvents.includes(eventId)) return state
  const base = { ...state, triggeredEvents: [...state.triggeredEvents, eventId] }
  if (eventId === 'investigation_backup_unlocked') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, BACKUP_FILE_ID])] }
  if (eventId === 'chapter_one_completed') return { ...base, chapterOneCompleted: true, chapterOneCompletedAt: new Date().toISOString() }
  if (eventId === 'chapter_two_started') return { ...base, chapterTwoStarted: true }
  if (eventId === 'shenzhi_cache_unlocked') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, SHENZHI_CACHE_FILE_ID])] }
  if (eventId === 'old_building_access_unlocked') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, OLD_BUILDING_ACCESS_FILE_ID])] }
  if (eventId === 'chapter_two_final_file_unlocked') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, CHAPTER_TWO_FINAL_FILE_ID])] }
  if (eventId === 'chapter_two_completed') return { ...base, chapterTwoCompleted: true, chapterTwoCompletedAt: new Date().toISOString() }
  return base
}

export function appendChapterAnomaly(state: GameState): GameState {
  if (state.chapterEndingPlayed || !state.chapterOneCompleted) return state
  const history = state.history.includes(SHENZHI_ANOMALY_URL) ? state.history : [...state.history.slice(0, state.historyIndex + 1), SHENZHI_ANOMALY_URL]
  const tabs = state.tabs.map((tab) => tab.id === state.activeTabId ? { ...tab, history } : tab)
  return { ...state, tabs, history, chapterEndingPlayed: true, addressGlitchActive: true }
}

export function appendChapterTwoAnomaly(state: GameState): GameState {
  if (state.chapterTwoEndingPlayed || !state.chapterTwoCompleted) return state
  const active = state.tabs.find((tab) => tab.id === state.activeTabId)
  if (!active) return state
  const history = active.history.includes(SHENZHI_STUDENT_ANOMALY_URL)
    ? active.history
    : [...active.history.slice(0, active.historyIndex + 1), SHENZHI_STUDENT_ANOMALY_URL]
  const tabs = state.tabs.map((tab) => tab.id === active.id ? { ...tab, history } : tab)
  return {
    ...state, tabs, history,
    chapterTwoEndingPlayed: true, chapterTwoAnomalyHistoryAdded: true, chapterTwoAddressGlitchActive: true,
  }
}

export function resetChapterProgress(state: GameState): GameState {
  return {
    ...state,
    tabs: state.tabs.map((tab) => ({ ...tab, openVirtualFileId: null })), clues: createEmptyClues(), triggeredEvents: [],
    unreadMessageIds: [ZHOU_CREDENTIALS_MESSAGE_ID], readMessageIds: [], unlockedFileIds: [], openVirtualFileId: null,
    chapterOneCompleted: false, chapterOneCompletedAt: null, chapterEndingPlayed: false, addressGlitchActive: false, chapterEndingVisible: false,
    chapterTwoStarted: false, chapterTwoCompleted: false, chapterTwoCompletedAt: null, chapterTwoEndingPlayed: false,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: false, revealedFileSections: [],
    chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
  }
}

export function resetChapterTwoProgress(state: GameState): GameState {
  const clues = { ...state.clues }
  for (const id of chapterTwoClueIds) clues[id] = { ...clues[id], discovered: false, discoveredAt: null, sourceUrl: null }
  const chapterTwoEvents: StoryEventId[] = ['chapter_two_started', 'shenzhi_cache_unlocked', 'old_building_access_unlocked', 'chapter_two_final_file_unlocked', 'chapter_two_completed']
  return evaluateStoryEvents({
    ...state, clues, triggeredEvents: state.triggeredEvents.filter((id) => !chapterTwoEvents.includes(id)),
    unlockedFileIds: state.unlockedFileIds.filter((id) => ![SHENZHI_CACHE_FILE_ID, OLD_BUILDING_ACCESS_FILE_ID, CHAPTER_TWO_FINAL_FILE_ID].includes(id)),
    chapterTwoStarted: false, chapterTwoCompleted: false, chapterTwoCompletedAt: null, chapterTwoEndingPlayed: false,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: false, revealedFileSections: [],
    chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false,
  })
}
