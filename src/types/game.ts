export type SiteType = 'school' | 'student' | 'archive' | 'unknown'
export type TabId = string
export type StudentAccountId = string

export type ComponentKey =
  | 'school-home' | 'school-news' | 'school-news-detail' | 'school-notices' | 'school-notice-detail'
  | 'school-search' | 'school-removed' | 'school-lab-management' | 'school-duty-schedule' | 'school-duty-log'
  | 'school-information-center' | 'school-maintenance-ticket'
  | 'school-system-services' | 'school-admin-denied'
  | 'student-entry' | 'student-login' | 'student-dashboard' | 'student-status' | 'student-attendance'
  | 'student-card-records' | 'student-class-list' | 'student-messages' | 'student-downloads'
  | 'student-group-history' | 'student-status-cache' | 'student-access-query' | 'student-lab-access-records'
  | 'student-lab-reservations' | 'student-equipment-loans' | 'student-camera-exceptions' | 'student-missing' | 'not-found'
  | 'student-system-search' | 'student-admin-attempts' | 'student-permission-help' | 'student-admin-history'
  | 'student-login-devices' | 'student-device-detail' | 'student-cache-recovery'
  | 'student-account-relations' | 'student-last-activity'
  | 'school-assets' | 'school-network-archive'
  | 'student-floor-plan' | 'student-network-access' | 'student-camera-recovery'
  | 'student-media-metadata' | 'student-terminal-cache' | 'student-pending-detail' | 'student-sync-status'
  | 'school-legacy-archive' | 'school-legacy-index'
  | 'student-class-archive' | 'student-monitor-records' | 'student-transfer-records'
  | 'archive-home' | 'archive-manifest' | 'archive-plan' | 'archive-incident'

export interface GameRoute { hostname: string; pathname: string; url: string; pageTitle: string; siteType: SiteType; componentKey: ComponentKey; params?: { id?: string } }
export interface StudentTabSession { accountId: StudentAccountId | null }
export interface BrowserTabState {
  id: TabId; siteType: 'school' | 'student'; currentUrl: string; history: string[]; historyIndex: number
  pageTitle: string; refreshToken: number; studentSession?: StudentTabSession; openVirtualFileId?: string | null
}
export interface SavedStudentAccount { accountId: StudentAccountId; studentNumber: string; displayName: string; savedAt: string }
export interface StudentAccountState { lastLoginAt: string | null; lastVisitedUrl: string }
export type StudentAccountStates = Record<StudentAccountId, StudentAccountState>

export type ChapterOneClueId =
  | 'dropout_notice' | 'zhou_credentials' | 'student_status_dropout' | 'attendance_after_dropout'
  | 'photo_after_dropout' | 'card_record_old_building' | 'old_building_closed' | 'zhou_message'
  | 'investigation_backup' | 'shenzhi_name'
export type ChapterTwoClueId =
  | 'chapter_two_search_note' | 'shenzhi_search_residue' | 'class_size_mismatch' | 'seat_chart_shenzhi'
  | 'hidden_grade_row' | 'shenzhi_essay' | 'guyan_denial' | 'shenzhi_removed_from_group'
  | 'shenzhi_dropout_backdated' | 'shenzhi_old_building_group' | 'shenzhi_exit_missing' | 'shenzhi_last_record'
export type ChapterThreeClueId =
  | 'old_building_duty_record' | 'old_building_access_log' | 'admin_permission_trace' | 'system_upgrade_notice'
  | 'old_building_reservation' | 'equipment_missing_record' | 'duty_log_record'
  | 'camera_exception_record' | 'system_maintenance_ticket'
export type ChapterFourClueId =
  | 'permission_limit' | 'legacy_admin_entry' | 'admin_access_denied' | 'zhou_admin_attempt'
  | 'permission_request_manual' | 'history_query_access' | 'student_status_modify_log'
  | 'admin03_permission_group' | 'linmo_target_record'
export type ChapterFiveClueId =
  | 'account_relation_warning' | 'zhou_post_disappearance_login' | 'decommissioned_terminal_activity'
  | 'shenzhi_cache_recovered' | 'shenzhi_zhou_terminal_link' | 'three_account_relation'
  | 'zhou_last_draft' | 'draft_modified_after_logout' | 'zhou_last_login_summary'
export type ChapterSixClueId =
  | 'terminal_status_fluctuation' | 'terminal_decommission_record' | 'third_floor_route'
  | 'terminal_same_network_port' | 'network_port_location' | 'camera_storage_index'
  | 'damaged_recording_metadata' | 'pending_object_records' | 'zhou_local_session_note'
  | 'terminal03_summary'
export type ChapterSevenClueId =
  | 'original_class_roster' | 'monitor_resubmission_notice' | 'shenzhi_removed_after_incident'
  | 'zhou_questioned_monitor' | 'monitor_unsent_statement' | 'terminal_external_export'
  | 'external_backup_index' | 'qiming_plan_name' | 'external_backup_verified'
  | 'outside_system_summary'
export type ClueId = ChapterOneClueId | ChapterTwoClueId | ChapterThreeClueId | ChapterFourClueId | ChapterFiveClueId | ChapterSixClueId | ChapterSevenClueId

export type ChapterOneEventId = 'old_building_contradiction' | 'zhou_draft_revealed' | 'investigation_backup_unlocked' | 'chapter_one_completed'
export type ChapterTwoEventId = 'chapter_two_started' | 'shenzhi_cache_unlocked' | 'old_building_access_unlocked' | 'chapter_two_final_file_unlocked' | 'chapter_two_completed'
export type ChapterThreeEventId = 'chapter_three_started' | 'chapter_three_final_unlocked' | 'chapter_three_completed'
export type ChapterFourEventId = 'chapter_four_started' | 'chapter_four_admin_unlocked' | 'chapter_four_final_unlocked' | 'chapter_four_completed'
export type ChapterFiveEventId =
  | 'chapter_five_started' | 'chapter_five_cache_unlocked' | 'chapter_five_relation_unlocked'
  | 'chapter_five_final_unlocked' | 'chapter_five_completed'
export type ChapterSixEventId =
  | 'chapter_six_started' | 'chapter_six_map_unlocked' | 'chapter_six_media_unlocked'
  | 'chapter_six_terminal_cache_unlocked' | 'chapter_six_final_unlocked' | 'chapter_six_completed'
export type ChapterSevenEventId =
  | 'chapter_seven_started' | 'chapter_seven_class_archive_unlocked' | 'chapter_seven_monitor_records_unlocked'
  | 'chapter_seven_external_index_unlocked' | 'chapter_seven_external_backup_unlocked'
  | 'chapter_seven_final_unlocked' | 'chapter_seven_completed'
export type StoryEventId = ChapterOneEventId | ChapterTwoEventId | ChapterThreeEventId | ChapterFourEventId | ChapterFiveEventId | ChapterSixEventId | ChapterSevenEventId

export type ChapterThreeEvidenceAction =
  | 'duty-record' | 'access-log' | 'admin-trace' | 'system-upgrade'
  | 'reservation-record' | 'equipment-record' | 'duty-log' | 'camera-exception' | 'maintenance-ticket'
export type ChapterFourEvidenceAction =
  | 'permission-search' | 'legacy-entry' | 'access-denied' | 'zhou-attempt' | 'permission-manual'
  | 'history-access' | 'student-status-log' | 'admin-group' | 'linmo-target'
export type ChapterFiveEvidenceAction =
  | 'account-warning' | 'post-disappearance-login' | 'terminal-status' | 'cache-recovered'
  | 'terminal-link' | 'account-relation' | 'last-draft' | 'draft-time'
export type ChapterSixEvidenceAction =
  | 'status-fluctuation' | 'decommission-record' | 'floor-route' | 'same-network-port'
  | 'network-port-location' | 'camera-storage-index' | 'recording-metadata'
  | 'pending-objects' | 'local-session-note'
export type ChapterSevenEvidenceAction =
  | 'local-reference' | 'original-roster' | 'resubmission-notice' | 'roster-difference'
  | 'monitor-chat' | 'monitor-statement' | 'external-index' | 'external-export'
  | 'external-backup' | 'plan-name'

export type ClueCategory =
  | '公开资料' | '学生档案' | '系统记录' | '私人信息' | '身份痕迹' | '班级资料'
  | '学籍记录' | '人物关系' | '旧实验楼' | '账号安全' | '登录记录' | '设备状态'
  | '缓存恢复' | '账号关联' | '周寻草稿' | '时间异常'
  | '外部归档'
export interface ClueProgress { id: ClueId; discovered: boolean; discoveredAt: string | null; sourceUrl: string | null; category: ClueCategory; isKeyClue: boolean }
export type ClueProgressMap = Record<ClueId, ClueProgress>

export interface GameSaveV1 { schemaVersion: 1; prototypeVersion: string; isStarted: boolean; currentUrl: string; history: string[]; historyIndex: number; studentLoggedIn: boolean; visitedPages: string[]; savedAt: string }
export interface GameSaveV2 { schemaVersion: 2; prototypeVersion: string; isStarted: boolean; currentUrl: string; history: string[]; historyIndex: number; studentLoggedIn: boolean; visitedPages: string[]; clues: ClueProgressMap; triggeredEvents: string[]; unreadMessageIds: string[]; readMessageIds: string[]; unlockedFileIds: string[]; chapterOneCompleted: boolean; chapterOneCompletedAt: string | null; chapterEndingPlayed: boolean; savedAt: string }
export interface GameSaveV3 { schemaVersion: 3; prototypeVersion: string; isStarted: boolean; tabs: BrowserTabState[]; activeTabId: TabId; currentStudentAccount: StudentAccountId | null; studentAccountStates: StudentAccountStates; visitedPages: string[]; clues: ClueProgressMap; triggeredEvents: StoryEventId[]; unreadMessageIds: string[]; readMessageIds: string[]; unlockedFileIds: string[]; openVirtualFileId: string | null; chapterOneCompleted: boolean; chapterOneCompletedAt: string | null; chapterEndingPlayed: boolean; savedAt: string }
export interface GameSaveV4 { schemaVersion: 4; prototypeVersion: string; isStarted: boolean; tabs: BrowserTabState[]; activeTabId: TabId; savedStudentAccounts: SavedStudentAccount[]; studentAccountStates: StudentAccountStates; evidenceSidebarCollapsed: boolean; visitedPages: string[]; clues: ClueProgressMap; triggeredEvents: StoryEventId[]; unreadMessageIds: string[]; readMessageIds: string[]; unlockedFileIds: string[]; chapterOneCompleted: boolean; chapterOneCompletedAt: string | null; chapterEndingPlayed: boolean; savedAt: string }

export interface GameSaveV5 {
  schemaVersion: 5; prototypeVersion: string; isStarted: boolean; tabs: BrowserTabState[]; activeTabId: TabId
  savedStudentAccounts: SavedStudentAccount[]; studentAccountStates: StudentAccountStates; evidenceSidebarCollapsed: boolean
  visitedPages: string[]; clues: ClueProgressMap; triggeredEvents: StoryEventId[]; unreadMessageIds: string[]; readMessageIds: string[]; unlockedFileIds: string[]
  chapterOneCompleted: boolean; chapterOneCompletedAt: string | null; chapterEndingPlayed: boolean
  chapterTwoStarted: boolean; chapterTwoCompleted: boolean; chapterTwoCompletedAt: string | null; chapterTwoEndingPlayed: boolean
  searchResiduePlayed: boolean; classCountAnomalyPlayed: boolean; chapterTwoAnomalyHistoryAdded: boolean; revealedFileSections: string[]
  savedAt: string
}

export interface GameState extends Omit<GameSaveV5, 'schemaVersion' | 'prototypeVersion' | 'savedAt'> {
  hasSave: boolean
  studentTabCaptchas: Record<TabId, string>
  currentUrl: string; history: string[]; historyIndex: number; refreshToken: number; openVirtualFileId: string | null
  addressGlitchActive: boolean; chapterEndingVisible: boolean
  chapterTwoAddressGlitchActive: boolean; chapterTwoEndingVisible: boolean
  chapterThreeEndingVisible: boolean
  chapterFourEndingVisible: boolean
  chapterFiveEndingVisible?: boolean
  chapterFiveSessionGlitchActive?: boolean
  chapterSixEndingVisible?: boolean
  chapterSixSyncGlitchActive?: boolean
  chapterSevenEndingVisible?: boolean
}
