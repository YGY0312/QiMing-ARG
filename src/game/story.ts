import {
  BACKUP_FILE_ID,
  CHAPTER_FOUR_BACKUP_FILE_ID,
  CHAPTER_FOUR_FINAL_FILE_ID,
  CHAPTER_FIVE_BACKUP_FILE_ID,
  CHAPTER_FIVE_FINAL_FILE_ID,
  CHAPTER_SIX_BACKUP_FILE_ID,
  CHAPTER_SIX_FINAL_FILE_ID,
  CHAPTER_SEVEN_BACKUP_FILE_ID,
  CHAPTER_SEVEN_FINAL_FILE_ID,
  CHAPTER_SEVEN_INCIDENT_HISTORY_URL,
  CHAPTER_THREE_BACKUP_FILE_ID,
  CHAPTER_THREE_FINAL_FILE_ID,
  CHAPTER_TWO_FINAL_FILE_ID,
  GUYAN_DRAFT_MESSAGE_ID,
  OLD_BUILDING_ACCESS_FILE_ID,
  SHENZHI_ANOMALY_URL,
  SHENZHI_STUDENT_ANOMALY_URL,
  SHENZHI_CACHE_FILE_ID,
  ZHOU_CREDENTIALS_MESSAGE_ID,
  ZHOU_MESSAGE_ID,
  ACCOUNT_SECURITY_MESSAGE_ID,
  TERM_OLD_03_HISTORY_URL,
  TERM_OLD_03_SYNC_HISTORY_URL,
} from './constants'
import { chapterFiveClueIds, chapterFourClueIds, chapterSevenClueIds, chapterSixClueIds, chapterThreeClueIds, chapterTwoClueIds, createEmptyClues, shenzhiCacheEvidenceIds, storyEventRequirements } from '../data/story'
import type { ChapterFiveEvidenceAction, ChapterFourEvidenceAction, ChapterSevenEvidenceAction, ChapterSixEvidenceAction, ChapterThreeEvidenceAction, ClueId, GameState, StoryEventId } from '../types/game'

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
  trigger('chapter_three_started', next.chapterTwoCompleted, (current) => ({
    ...current,
    unlockedFileIds: [...new Set([...current.unlockedFileIds, CHAPTER_THREE_BACKUP_FILE_ID])],
  }))
  trigger('chapter_three_final_unlocked', next.triggeredEvents.includes('chapter_three_started') && allDiscovered(next, storyEventRequirements.chapter_three_final_unlocked), (current) => ({
    ...current,
    unlockedFileIds: [...new Set([...current.unlockedFileIds, CHAPTER_THREE_FINAL_FILE_ID])],
  }))
  trigger('chapter_four_started', next.triggeredEvents.includes('chapter_three_completed'), (current) => ({
    ...current,
    unlockedFileIds: [...new Set([...current.unlockedFileIds, CHAPTER_FOUR_BACKUP_FILE_ID])],
  }))
  trigger('chapter_four_admin_unlocked', next.triggeredEvents.includes('chapter_four_started') && allDiscovered(next, storyEventRequirements.chapter_four_admin_unlocked), (current) => current)
  trigger('chapter_four_final_unlocked', next.triggeredEvents.includes('chapter_four_admin_unlocked') && allDiscovered(next, storyEventRequirements.chapter_four_final_unlocked), (current) => ({
    ...current,
    unlockedFileIds: [...new Set([...current.unlockedFileIds, CHAPTER_FOUR_FINAL_FILE_ID])],
  }))
  trigger('chapter_five_started', next.triggeredEvents.includes('chapter_four_completed'), (current) => ({
    ...current,
    unreadMessageIds: current.readMessageIds.includes(ACCOUNT_SECURITY_MESSAGE_ID)
      ? current.unreadMessageIds
      : [...new Set([...current.unreadMessageIds, ACCOUNT_SECURITY_MESSAGE_ID])],
    unlockedFileIds: [...new Set([...current.unlockedFileIds, CHAPTER_FIVE_BACKUP_FILE_ID])],
  }))
  trigger('chapter_five_cache_unlocked', next.triggeredEvents.includes('chapter_five_started') && allDiscovered(next, storyEventRequirements.chapter_five_cache_unlocked), (current) => current)
  trigger('chapter_five_relation_unlocked', next.triggeredEvents.includes('chapter_five_cache_unlocked') && allDiscovered(next, storyEventRequirements.chapter_five_relation_unlocked), (current) => current)
  trigger('chapter_five_final_unlocked', next.triggeredEvents.includes('chapter_five_relation_unlocked') && allDiscovered(next, storyEventRequirements.chapter_five_final_unlocked), (current) => ({
    ...current,
    unlockedFileIds: [...new Set([...current.unlockedFileIds, CHAPTER_FIVE_FINAL_FILE_ID])],
  }))
  trigger('chapter_six_started', next.triggeredEvents.includes('chapter_five_completed'), (current) => ({
    ...current, unlockedFileIds: [...new Set([...current.unlockedFileIds, CHAPTER_SIX_BACKUP_FILE_ID])],
  }))
  trigger('chapter_six_map_unlocked', next.triggeredEvents.includes('chapter_six_started') && allDiscovered(next, storyEventRequirements.chapter_six_map_unlocked), (current) => current)
  trigger('chapter_six_media_unlocked', next.triggeredEvents.includes('chapter_six_started') && allDiscovered(next, storyEventRequirements.chapter_six_media_unlocked), (current) => current)
  trigger('chapter_six_terminal_cache_unlocked', next.triggeredEvents.includes('chapter_six_started') && allDiscovered(next, storyEventRequirements.chapter_six_terminal_cache_unlocked), (current) => current)
  trigger('chapter_six_final_unlocked', next.triggeredEvents.includes('chapter_six_started') && allDiscovered(next, storyEventRequirements.chapter_six_final_unlocked), (current) => ({
    ...current, unlockedFileIds: [...new Set([...current.unlockedFileIds, CHAPTER_SIX_FINAL_FILE_ID])],
  }))
  trigger('chapter_seven_started', next.triggeredEvents.includes('chapter_six_completed'), (current) => ({
    ...current, unlockedFileIds: [...new Set([...current.unlockedFileIds, CHAPTER_SEVEN_BACKUP_FILE_ID])],
  }))
  trigger('chapter_seven_monitor_records_unlocked', next.triggeredEvents.includes('chapter_seven_class_archive_unlocked') && allDiscovered(next, storyEventRequirements.chapter_seven_monitor_records_unlocked), (current) => current)
  trigger('chapter_seven_external_index_unlocked', next.triggeredEvents.includes('chapter_seven_monitor_records_unlocked') && allDiscovered(next, storyEventRequirements.chapter_seven_external_index_unlocked), (current) => current)
  trigger('chapter_seven_external_backup_unlocked', next.triggeredEvents.includes('chapter_seven_external_index_unlocked') && allDiscovered(next, storyEventRequirements.chapter_seven_external_backup_unlocked), (current) => current)
  trigger('chapter_seven_final_unlocked', next.triggeredEvents.includes('chapter_seven_external_backup_unlocked') && allDiscovered(next, storyEventRequirements.chapter_seven_final_unlocked), (current) => ({
    ...current, unlockedFileIds: [...new Set([...current.unlockedFileIds, CHAPTER_SEVEN_FINAL_FILE_ID])],
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

export function recordChapterThreeEvidence(
  state: GameState,
  action: ChapterThreeEvidenceAction,
  sourceUrl: string,
  now = new Date().toISOString(),
): GameState {
  if (!state.triggeredEvents.includes('chapter_three_started')) return state
  const clueByAction: Record<ChapterThreeEvidenceAction, ClueId> = {
    'duty-record': 'old_building_duty_record',
    'access-log': 'old_building_access_log',
    'admin-trace': 'admin_permission_trace',
    'system-upgrade': 'system_upgrade_notice',
    'reservation-record': 'old_building_reservation',
    'equipment-record': 'equipment_missing_record',
    'duty-log': 'duty_log_record',
    'camera-exception': 'camera_exception_record',
    'maintenance-ticket': 'system_maintenance_ticket',
  }
  return discoverStoryClue(state, clueByAction[action], sourceUrl, now)
}

export function completeChapterThree(state: GameState): GameState {
  if (!state.triggeredEvents.includes('chapter_three_final_unlocked')) return state
  if (state.triggeredEvents.includes('chapter_three_completed')) return state
  return evaluateStoryEvents({
    ...state,
    triggeredEvents: [...state.triggeredEvents, 'chapter_three_completed'],
    chapterThreeEndingVisible: true,
  })
}

export function recordChapterFourEvidence(
  state: GameState,
  action: ChapterFourEvidenceAction,
  sourceUrl: string,
  now = new Date().toISOString(),
): GameState {
  if (!state.triggeredEvents.includes('chapter_four_started')) return state
  const clueByAction: Record<ChapterFourEvidenceAction, ClueId> = {
    'permission-search': 'permission_limit',
    'legacy-entry': 'legacy_admin_entry',
    'access-denied': 'admin_access_denied',
    'zhou-attempt': 'zhou_admin_attempt',
    'permission-manual': 'permission_request_manual',
    'history-access': 'history_query_access',
    'student-status-log': 'student_status_modify_log',
    'admin-group': 'admin03_permission_group',
    'linmo-target': 'linmo_target_record',
  }
  return discoverStoryClue(state, clueByAction[action], sourceUrl, now)
}

export function completeChapterFour(state: GameState): GameState {
  if (!state.triggeredEvents.includes('chapter_four_final_unlocked')) return state
  if (state.triggeredEvents.includes('chapter_four_completed')) return state
  return evaluateStoryEvents({
    ...state,
    triggeredEvents: [...state.triggeredEvents, 'chapter_four_completed'],
    chapterFourEndingVisible: true,
  })
}

export function recordChapterFiveEvidence(
  state: GameState,
  action: ChapterFiveEvidenceAction,
  sourceUrl: string,
  now = new Date().toISOString(),
): GameState {
  if (!state.triggeredEvents.includes('chapter_five_started')) return state
  const clueByAction: Record<ChapterFiveEvidenceAction, ClueId> = {
    'account-warning': 'account_relation_warning',
    'post-disappearance-login': 'zhou_post_disappearance_login',
    'terminal-status': 'decommissioned_terminal_activity',
    'cache-recovered': 'shenzhi_cache_recovered',
    'terminal-link': 'shenzhi_zhou_terminal_link',
    'account-relation': 'three_account_relation',
    'last-draft': 'zhou_last_draft',
    'draft-time': 'draft_modified_after_logout',
  }
  return discoverStoryClue(state, clueByAction[action], sourceUrl, now)
}

export function completeChapterFive(state: GameState, now = new Date().toISOString()): GameState {
  if (!state.triggeredEvents.includes('chapter_five_final_unlocked')) return state
  if (state.triggeredEvents.includes('chapter_five_completed')) return state
  const withSummary = discoverStoryClue(state, 'zhou_last_login_summary', 'stu.qiming-high.edu.cn/downloads', now)
  const active = withSummary.tabs.find((tab) => tab.id === withSummary.activeTabId)
  if (!active) return withSummary
  const historyAdded = withSummary.revealedFileSections.includes('chapter-five-terminal-history-added')
  const history = historyAdded ? active.history : [...active.history.slice(0, active.historyIndex + 1), TERM_OLD_03_HISTORY_URL]
  const tabs = withSummary.tabs.map((tab) => tab.id === active.id
    ? { ...tab, history, pageTitle: '会话已在其他设备重新建立' }
    : tab)
  return evaluateStoryEvents({
    ...withSummary,
    tabs,
    triggeredEvents: [...withSummary.triggeredEvents, 'chapter_five_completed'],
    revealedFileSections: historyAdded ? withSummary.revealedFileSections : [...withSummary.revealedFileSections, 'chapter-five-terminal-history-added'],
    chapterFiveEndingVisible: true,
    chapterFiveSessionGlitchActive: true,
  })
}

export function recordChapterSixEvidence(state: GameState, action: ChapterSixEvidenceAction, sourceUrl: string, now = new Date().toISOString()): GameState {
  if (!state.triggeredEvents.includes('chapter_six_started')) return state
  const clueByAction: Record<ChapterSixEvidenceAction, ClueId> = {
    'status-fluctuation': 'terminal_status_fluctuation',
    'decommission-record': 'terminal_decommission_record',
    'floor-route': 'third_floor_route',
    'same-network-port': 'terminal_same_network_port',
    'network-port-location': 'network_port_location',
    'camera-storage-index': 'camera_storage_index',
    'recording-metadata': 'damaged_recording_metadata',
    'pending-objects': 'pending_object_records',
    'local-session-note': 'zhou_local_session_note',
  }
  return discoverStoryClue(state, clueByAction[action], sourceUrl, now)
}

export function completeChapterSix(state: GameState, now = new Date().toISOString()): GameState {
  if (!state.triggeredEvents.includes('chapter_six_final_unlocked') || state.triggeredEvents.includes('chapter_six_completed')) return state
  const withSummary = discoverStoryClue(state, 'terminal03_summary', 'stu.qiming-high.edu.cn/downloads', now)
  const active = withSummary.tabs.find((tab) => tab.id === withSummary.activeTabId)
  if (!active) return withSummary
  const historyAdded = withSummary.revealedFileSections.includes('chapter-six-sync-history-added')
  const history = historyAdded || active.history.includes(TERM_OLD_03_SYNC_HISTORY_URL)
    ? active.history : [...active.history.slice(0, active.historyIndex + 1), TERM_OLD_03_SYNC_HISTORY_URL]
  return {
    ...withSummary,
    tabs: withSummary.tabs.map((tab) => tab.id === active.id ? { ...tab, history } : tab),
    triggeredEvents: [...withSummary.triggeredEvents, 'chapter_six_completed'],
    revealedFileSections: historyAdded ? withSummary.revealedFileSections : [...withSummary.revealedFileSections, 'chapter-six-sync-history-added'],
    chapterSixEndingVisible: true,
    chapterSixSyncGlitchActive: true,
  }
}

export function recordChapterSevenEvidence(state: GameState, action: ChapterSevenEvidenceAction, sourceUrl: string, now = new Date().toISOString()): GameState {
  if (!state.triggeredEvents.includes('chapter_seven_started')) return state
  if (action === 'local-reference') {
    const sections = state.revealedFileSections.includes('chapter-seven-local-reference-parsed')
      ? state.revealedFileSections : [...state.revealedFileSections, 'chapter-seven-local-reference-parsed']
    return evaluateStoryEvents(forceStoryEvent({ ...state, revealedFileSections: sections }, 'chapter_seven_class_archive_unlocked'), now)
  }
  const clueByAction: Record<Exclude<ChapterSevenEvidenceAction, 'local-reference'>, ClueId> = {
    'original-roster': 'original_class_roster',
    'resubmission-notice': 'monitor_resubmission_notice',
    'roster-difference': 'shenzhi_removed_after_incident',
    'monitor-chat': 'zhou_questioned_monitor',
    'monitor-statement': 'monitor_unsent_statement',
    'external-index': 'external_backup_index',
    'external-export': 'terminal_external_export',
    'external-backup': 'external_backup_verified',
    'plan-name': 'qiming_plan_name',
  }
  return discoverStoryClue(state, clueByAction[action], sourceUrl, now)
}

export function completeChapterSeven(state: GameState, now = new Date().toISOString()): GameState {
  if (!state.triggeredEvents.includes('chapter_seven_final_unlocked') || state.triggeredEvents.includes('chapter_seven_completed')) return state
  const withSummary = discoverStoryClue(state, 'outside_system_summary', 'stu.qiming-high.edu.cn/downloads', now)
  const active = withSummary.tabs.find((tab) => tab.id === withSummary.activeTabId)
  if (!active) return withSummary
  const historyAdded = withSummary.revealedFileSections.includes('chapter-seven-incident-history-added')
  const history = historyAdded || active.history.includes(CHAPTER_SEVEN_INCIDENT_HISTORY_URL)
    ? active.history : [...active.history.slice(0, active.historyIndex + 1), CHAPTER_SEVEN_INCIDENT_HISTORY_URL]
  return {
    ...withSummary,
    tabs: withSummary.tabs.map((tab) => tab.id === active.id ? { ...tab, history } : tab),
    triggeredEvents: [...withSummary.triggeredEvents, 'chapter_seven_completed'],
    revealedFileSections: historyAdded ? withSummary.revealedFileSections : [...withSummary.revealedFileSections, 'chapter-seven-incident-history-added'],
    chapterSevenEndingVisible: true,
  }
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
  if (eventId === 'chapter_five_completed') return completeChapterFive(forceStoryEvent(state, 'chapter_five_final_unlocked'))
  if (eventId === 'chapter_six_completed') return completeChapterSix(forceStoryEvent(state, 'chapter_six_final_unlocked'))
  if (eventId === 'chapter_seven_completed') return completeChapterSeven(forceStoryEvent(state, 'chapter_seven_final_unlocked'))
  const base = { ...state, triggeredEvents: [...state.triggeredEvents, eventId] }
  if (eventId === 'investigation_backup_unlocked') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, BACKUP_FILE_ID])] }
  if (eventId === 'chapter_one_completed') return { ...base, chapterOneCompleted: true, chapterOneCompletedAt: new Date().toISOString() }
  if (eventId === 'chapter_two_started') return { ...base, chapterTwoStarted: true }
  if (eventId === 'shenzhi_cache_unlocked') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, SHENZHI_CACHE_FILE_ID])] }
  if (eventId === 'old_building_access_unlocked') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, OLD_BUILDING_ACCESS_FILE_ID])] }
  if (eventId === 'chapter_two_final_file_unlocked') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, CHAPTER_TWO_FINAL_FILE_ID])] }
  if (eventId === 'chapter_two_completed') return { ...base, chapterTwoCompleted: true, chapterTwoCompletedAt: new Date().toISOString() }
  if (eventId === 'chapter_three_started') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, CHAPTER_THREE_BACKUP_FILE_ID])] }
  if (eventId === 'chapter_three_final_unlocked') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, CHAPTER_THREE_FINAL_FILE_ID])] }
  if (eventId === 'chapter_four_started') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, CHAPTER_FOUR_BACKUP_FILE_ID])] }
  if (eventId === 'chapter_four_final_unlocked') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, CHAPTER_FOUR_FINAL_FILE_ID])] }
  if (eventId === 'chapter_four_completed') return evaluateStoryEvents(base)
  if (eventId === 'chapter_five_started') return {
    ...base,
    unreadMessageIds: base.readMessageIds.includes(ACCOUNT_SECURITY_MESSAGE_ID)
      ? base.unreadMessageIds
      : [...new Set([...base.unreadMessageIds, ACCOUNT_SECURITY_MESSAGE_ID])],
    unlockedFileIds: [...new Set([...base.unlockedFileIds, CHAPTER_FIVE_BACKUP_FILE_ID])],
  }
  if (eventId === 'chapter_five_final_unlocked') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, CHAPTER_FIVE_FINAL_FILE_ID])] }
  if (eventId === 'chapter_six_started') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, CHAPTER_SIX_BACKUP_FILE_ID])] }
  if (eventId === 'chapter_six_final_unlocked') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, CHAPTER_SIX_FINAL_FILE_ID])] }
  if (eventId === 'chapter_seven_started') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, CHAPTER_SEVEN_BACKUP_FILE_ID])] }
  if (eventId === 'chapter_seven_final_unlocked') return { ...base, unlockedFileIds: [...new Set([...base.unlockedFileIds, CHAPTER_SEVEN_FINAL_FILE_ID])] }
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
    chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false, chapterThreeEndingVisible: false, chapterFourEndingVisible: false,
    chapterFiveEndingVisible: false, chapterFiveSessionGlitchActive: false,
    chapterSixEndingVisible: false, chapterSixSyncGlitchActive: false,
    chapterSevenEndingVisible: false,
  }
}

export function resetChapterTwoProgress(state: GameState): GameState {
  const clues = { ...state.clues }
  for (const id of chapterTwoClueIds) clues[id] = { ...clues[id], discovered: false, discoveredAt: null, sourceUrl: null }
  for (const id of chapterThreeClueIds) clues[id] = { ...clues[id], discovered: false, discoveredAt: null, sourceUrl: null }
  for (const id of chapterFourClueIds) clues[id] = { ...clues[id], discovered: false, discoveredAt: null, sourceUrl: null }
  for (const id of chapterFiveClueIds) clues[id] = { ...clues[id], discovered: false, discoveredAt: null, sourceUrl: null }
  for (const id of chapterSixClueIds) clues[id] = { ...clues[id], discovered: false, discoveredAt: null, sourceUrl: null }
  for (const id of chapterSevenClueIds) clues[id] = { ...clues[id], discovered: false, discoveredAt: null, sourceUrl: null }
  const chapterTwoEvents: StoryEventId[] = ['chapter_two_started', 'shenzhi_cache_unlocked', 'old_building_access_unlocked', 'chapter_two_final_file_unlocked', 'chapter_two_completed', 'chapter_three_started', 'chapter_three_final_unlocked', 'chapter_three_completed', 'chapter_four_started', 'chapter_four_admin_unlocked', 'chapter_four_final_unlocked', 'chapter_four_completed', 'chapter_five_started', 'chapter_five_cache_unlocked', 'chapter_five_relation_unlocked', 'chapter_five_final_unlocked', 'chapter_five_completed', 'chapter_six_started', 'chapter_six_map_unlocked', 'chapter_six_media_unlocked', 'chapter_six_terminal_cache_unlocked', 'chapter_six_final_unlocked', 'chapter_six_completed', 'chapter_seven_started', 'chapter_seven_class_archive_unlocked', 'chapter_seven_monitor_records_unlocked', 'chapter_seven_external_index_unlocked', 'chapter_seven_external_backup_unlocked', 'chapter_seven_final_unlocked', 'chapter_seven_completed']
  return evaluateStoryEvents({
    ...state, clues, triggeredEvents: state.triggeredEvents.filter((id) => !chapterTwoEvents.includes(id)),
    unlockedFileIds: state.unlockedFileIds.filter((id) => ![SHENZHI_CACHE_FILE_ID, OLD_BUILDING_ACCESS_FILE_ID, CHAPTER_TWO_FINAL_FILE_ID, CHAPTER_THREE_BACKUP_FILE_ID, CHAPTER_THREE_FINAL_FILE_ID, CHAPTER_FOUR_BACKUP_FILE_ID, CHAPTER_FOUR_FINAL_FILE_ID, CHAPTER_FIVE_BACKUP_FILE_ID, CHAPTER_FIVE_FINAL_FILE_ID, CHAPTER_SIX_BACKUP_FILE_ID, CHAPTER_SIX_FINAL_FILE_ID, CHAPTER_SEVEN_BACKUP_FILE_ID, CHAPTER_SEVEN_FINAL_FILE_ID].includes(id)),
    chapterTwoStarted: false, chapterTwoCompleted: false, chapterTwoCompletedAt: null, chapterTwoEndingPlayed: false,
    searchResiduePlayed: false, classCountAnomalyPlayed: false, chapterTwoAnomalyHistoryAdded: false, revealedFileSections: [],
    chapterTwoAddressGlitchActive: false, chapterTwoEndingVisible: false, chapterThreeEndingVisible: false, chapterFourEndingVisible: false,
    chapterFiveEndingVisible: false, chapterFiveSessionGlitchActive: false,
    chapterSixEndingVisible: false, chapterSixSyncGlitchActive: false,
    chapterSevenEndingVisible: false,
  })
}

export function resetChapterFiveProgress(state: GameState): GameState {
  const clues = { ...state.clues }
  for (const id of chapterFiveClueIds) clues[id] = { ...clues[id], discovered: false, discoveredAt: null, sourceUrl: null }
  const events: StoryEventId[] = ['chapter_five_started', 'chapter_five_cache_unlocked', 'chapter_five_relation_unlocked', 'chapter_five_final_unlocked', 'chapter_five_completed']
  const sections = state.revealedFileSections.filter((key) => !key.startsWith('chapter-five-') && !key.startsWith('chapter_five_') && !key.startsWith('cache-recovery-'))
  const tabs = state.tabs.map((tab) => {
    const history = [...tab.history]
    if (state.revealedFileSections.includes('chapter-five-terminal-history-added')) {
      const index = history.lastIndexOf(TERM_OLD_03_HISTORY_URL)
      if (index >= 0) history.splice(index, 1)
    }
    return {
      ...tab,
      history: history.length ? history : [tab.currentUrl],
      historyIndex: Math.min(tab.historyIndex, Math.max(history.length - 1, 0)),
      openVirtualFileId: [CHAPTER_FIVE_BACKUP_FILE_ID, CHAPTER_FIVE_FINAL_FILE_ID].includes(tab.openVirtualFileId ?? '') ? null : tab.openVirtualFileId,
    }
  })
  return evaluateStoryEvents({
    ...state,
    tabs,
    clues,
    triggeredEvents: state.triggeredEvents.filter((id) => !events.includes(id)),
    unlockedFileIds: state.unlockedFileIds.filter((id) => ![CHAPTER_FIVE_BACKUP_FILE_ID, CHAPTER_FIVE_FINAL_FILE_ID].includes(id)),
    unreadMessageIds: state.unreadMessageIds.filter((id) => id !== ACCOUNT_SECURITY_MESSAGE_ID),
    readMessageIds: state.readMessageIds.filter((id) => id !== ACCOUNT_SECURITY_MESSAGE_ID),
    revealedFileSections: sections,
    chapterFiveEndingVisible: false,
    chapterFiveSessionGlitchActive: false,
  })
}

export function resetChapterSixProgress(state: GameState): GameState {
  const clues = { ...state.clues }
  for (const id of chapterSixClueIds) clues[id] = { ...clues[id], discovered: false, discoveredAt: null, sourceUrl: null }
  for (const id of chapterSevenClueIds) clues[id] = { ...clues[id], discovered: false, discoveredAt: null, sourceUrl: null }
  const events: StoryEventId[] = ['chapter_six_started', 'chapter_six_map_unlocked', 'chapter_six_media_unlocked', 'chapter_six_terminal_cache_unlocked', 'chapter_six_final_unlocked', 'chapter_six_completed', 'chapter_seven_started', 'chapter_seven_class_archive_unlocked', 'chapter_seven_monitor_records_unlocked', 'chapter_seven_external_index_unlocked', 'chapter_seven_external_backup_unlocked', 'chapter_seven_final_unlocked', 'chapter_seven_completed']
  const sections = state.revealedFileSections.filter((key) => !key.startsWith('chapter-six-') && !key.startsWith('chapter_six_') && !key.startsWith('chapter-seven-') && !key.startsWith('chapter_seven_'))
  const tabs = state.tabs.map((tab) => {
    const history = tab.history.filter((url) => url !== TERM_OLD_03_SYNC_HISTORY_URL)
    return {
      ...tab,
      history: history.length ? history : [tab.currentUrl],
      historyIndex: Math.min(tab.historyIndex, Math.max(history.length - 1, 0)),
      openVirtualFileId: [CHAPTER_SIX_BACKUP_FILE_ID, CHAPTER_SIX_FINAL_FILE_ID, CHAPTER_SEVEN_BACKUP_FILE_ID, CHAPTER_SEVEN_FINAL_FILE_ID].includes(tab.openVirtualFileId ?? '') ? null : tab.openVirtualFileId,
    }
  })
  return evaluateStoryEvents({
    ...state, tabs, clues,
    triggeredEvents: state.triggeredEvents.filter((id) => !events.includes(id)),
    unlockedFileIds: state.unlockedFileIds.filter((id) => ![CHAPTER_SIX_BACKUP_FILE_ID, CHAPTER_SIX_FINAL_FILE_ID, CHAPTER_SEVEN_BACKUP_FILE_ID, CHAPTER_SEVEN_FINAL_FILE_ID].includes(id)),
    revealedFileSections: sections,
    chapterSixEndingVisible: false,
    chapterSixSyncGlitchActive: false,
    chapterSevenEndingVisible: false,
  })
}

export function resetChapterSevenProgress(state: GameState): GameState {
  const clues = { ...state.clues }
  for (const id of chapterSevenClueIds) clues[id] = { ...clues[id], discovered: false, discoveredAt: null, sourceUrl: null }
  const events: StoryEventId[] = ['chapter_seven_started', 'chapter_seven_class_archive_unlocked', 'chapter_seven_monitor_records_unlocked', 'chapter_seven_external_index_unlocked', 'chapter_seven_external_backup_unlocked', 'chapter_seven_final_unlocked', 'chapter_seven_completed']
  const tabs = state.tabs.map((tab) => {
    const history = tab.history.filter((url) => url !== CHAPTER_SEVEN_INCIDENT_HISTORY_URL)
    return { ...tab, history: history.length ? history : [tab.currentUrl], historyIndex: Math.min(tab.historyIndex, Math.max(history.length - 1, 0)), openVirtualFileId: [CHAPTER_SEVEN_BACKUP_FILE_ID, CHAPTER_SEVEN_FINAL_FILE_ID].includes(tab.openVirtualFileId ?? '') ? null : tab.openVirtualFileId }
  })
  return evaluateStoryEvents({
    ...state, tabs, clues,
    triggeredEvents: state.triggeredEvents.filter((id) => !events.includes(id)),
    unlockedFileIds: state.unlockedFileIds.filter((id) => ![CHAPTER_SEVEN_BACKUP_FILE_ID, CHAPTER_SEVEN_FINAL_FILE_ID].includes(id)),
    revealedFileSections: state.revealedFileSections.filter((key) => !key.startsWith('chapter-seven-') && !key.startsWith('chapter_seven_')),
    chapterSevenEndingVisible: false,
  })
}
