export type SiteType = 'school' | 'student' | 'unknown'
export type TabId = string
export type StudentAccountId = string

export type ComponentKey =
  | 'school-home' | 'school-news' | 'school-news-detail' | 'school-notices' | 'school-notice-detail'
  | 'school-search' | 'school-removed'
  | 'student-entry' | 'student-login' | 'student-dashboard' | 'student-status' | 'student-attendance'
  | 'student-card-records' | 'student-class-list' | 'student-messages' | 'student-downloads'
  | 'student-group-history' | 'student-status-cache' | 'student-access-query' | 'student-missing' | 'not-found'

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
export type ClueId = ChapterOneClueId | ChapterTwoClueId

export type ChapterOneEventId = 'old_building_contradiction' | 'zhou_draft_revealed' | 'investigation_backup_unlocked' | 'chapter_one_completed'
export type ChapterTwoEventId = 'chapter_two_started' | 'shenzhi_cache_unlocked' | 'old_building_access_unlocked' | 'chapter_two_final_file_unlocked' | 'chapter_two_completed'
export type StoryEventId = ChapterOneEventId | ChapterTwoEventId

export type ClueCategory = '公开资料' | '学生档案' | '系统记录' | '私人信息' | '身份痕迹' | '班级资料' | '学籍记录' | '人物关系' | '旧实验楼'
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
}
