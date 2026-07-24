import type { ChapterThreeClueId, ChapterTwoClueId, ClueId, ClueProgress, ClueProgressMap, StoryEventId } from '../types/game'

export interface ClueDefinition extends Omit<ClueProgress, 'discovered' | 'discoveredAt' | 'sourceUrl'> { title: string; source: string; description: string; sidebarFacts: string[] }

export const chapterTwoClueIds: ChapterTwoClueId[] = [
  'chapter_two_search_note', 'shenzhi_search_residue', 'class_size_mismatch', 'seat_chart_shenzhi', 'hidden_grade_row', 'shenzhi_essay',
  'guyan_denial', 'shenzhi_removed_from_group', 'shenzhi_dropout_backdated', 'shenzhi_old_building_group', 'shenzhi_exit_missing', 'shenzhi_last_record',
]

export const chapterThreeClueIds: ChapterThreeClueId[] = [
  'old_building_duty_record', 'old_building_access_log', 'old_building_reservation', 'equipment_missing_record',
  'duty_log_record', 'camera_exception_record', 'system_maintenance_ticket', 'admin_permission_trace', 'system_upgrade_notice',
]

export const clueDefinitions: Record<ClueId, ClueDefinition> = {
  dropout_notice: { id: 'dropout_notice', title: '退学公告', source: '学校官网', description: '校方称周寻于9月12日办理退学。', category: '公开资料', isKeyClue: true, sidebarFacts: ['退学生效日期：2026-09-12'] },
  zhou_credentials: { id: 'zhou_credentials', title: '周寻留下的账号', source: '林默账号消息中心', description: '周寻失踪前将自己的学生系统账号留给了林默，并要求他在自己没有到校时登录查看。', category: '私人信息', isKeyClue: true, sidebarFacts: ['学号：2024010312', '密码：ZX0913'] },
  student_status_dropout: { id: 'student_status_dropout', title: '周寻的学籍状态', source: '学生信息系统', description: '系统显示退学生效日期为9月12日。', category: '学生档案', isKeyClue: true, sidebarFacts: ['系统状态：已退学', '生效日期：2026-09-12'] },
  attendance_after_dropout: { id: 'attendance_after_dropout', title: '异常考勤', source: '考勤记录', description: '周寻在退学生效后仍有正常晨读签到。', category: '系统记录', isKeyClue: true, sidebarFacts: ['2026-09-13 07:26', '晨读签到：正常'] },
  photo_after_dropout: { id: 'photo_after_dropout', title: '照片中的周寻', source: '校园新闻', description: '9月13日的活动照片中出现了周寻。', category: '公开资料', isKeyClue: true, sidebarFacts: ['拍摄日期：2026-09-13', '周寻仍在校园'] },
  card_record_old_building: { id: 'card_record_old_building', title: '旧实验楼消费记录', source: '校园卡记录', description: '周寻在9月14日晚于实验楼产生消费。', category: '系统记录', isKeyClue: true, sidebarFacts: ['2026-09-14 21:17', '实验楼自动售货机'] },
  old_building_closed: { id: 'old_building_closed', title: '封闭通知', source: '学校官网', description: '旧实验楼自9月10日起禁止学生进入。', category: '公开资料', isKeyClue: true, sidebarFacts: ['旧实验楼自2026-09-10起封闭'] },
  zhou_message: { id: 'zhou_message', title: '周寻的草稿', source: '周寻账号消息中心', description: '周寻账号中保存着一条未发送的草稿，提醒查看退学日期和9月13日的照片。', category: '私人信息', isKeyClue: true, sidebarFacts: ['状态：草稿 · 未发送'] },
  investigation_backup: { id: 'investigation_backup', title: '调查备份', source: '文件中心', description: '周寻留下的加密调查文件已被打开。', category: '私人信息', isKeyClue: true, sidebarFacts: ['加密调查备份已打开'] },
  shenzhi_name: { id: 'shenzhi_name', title: '沈栀', source: '调查备份', description: '备份文件末尾仅留下了这个名字。', category: '私人信息', isKeyClue: true, sidebarFacts: ['当前仅发现姓名，身份不明'] },

  chapter_two_search_note: { id: 'chapter_two_search_note', title: '检索记录', source: '周寻调查资料', description: '记录中列出了五月和六月的相关班级资料。', category: '身份痕迹', isKeyClue: false, sidebarFacts: [] },
  shenzhi_search_residue: { id: 'shenzhi_search_residue', title: '旧搜索索引残留', source: '学校官网搜索', description: '官网正文没有沈栀，但旧索引仍保留她属于高二（3）班的摘要。', category: '身份痕迹', isKeyClue: true, sidebarFacts: ['旧索引：高二（3）班学生沈栀', '来源页面：已删除'] },
  class_size_mismatch: { id: 'class_size_mismatch', title: '班级人数矛盾', source: '班级名单历史记录', description: '当前名单与五月历史记录的人数不一致。', category: '班级资料', isKeyClue: true, sidebarFacts: ['当前名单：17人', '五月历史记录：18条'] },
  seat_chart_shenzhi: { id: 'seat_chart_shenzhi', title: '沈栀的座位', source: '五月座位表', description: '五月座位表第12号座位属于沈栀。', category: '班级资料', isKeyClue: true, sidebarFacts: ['五月座位表第12号座位：沈栀'] },
  hidden_grade_row: { id: 'hidden_grade_row', title: '隐藏成绩记录', source: '期中成绩汇总', description: '成绩汇总第12行原属于沈栀，当前被标记为已删除。', category: '班级资料', isKeyClue: true, sidebarFacts: ['期中成绩表第12行：沈栀', '状态：数据已删除'] },
  shenzhi_essay: { id: 'shenzhi_essay', title: '学生作品残留', source: '二等奖作品《窗外》', description: '作者栏为空，但文件属性中的创建者仍是沈栀。', category: '身份痕迹', isKeyClue: true, sidebarFacts: ['《窗外》文件创建者：沈栀'] },
  guyan_denial: { id: 'guyan_denial', title: '顾言的说法', source: '周寻调查草稿', description: '顾言声称不认识沈栀。', category: '人物关系', isKeyClue: true, sidebarFacts: ['顾言否认认识沈栀'] },
  shenzhi_removed_from_group: { id: 'shenzhi_removed_from_group', title: '群聊移除', source: '林默账号班级群历史', description: '群历史记录显示顾言以管理员身份移除了沈栀。', category: '人物关系', isKeyClue: true, sidebarFacts: ['2026-06-18', '顾言将沈栀移出高二（3）班群聊'] },
  shenzhi_dropout_backdated: { id: 'shenzhi_dropout_backdated', title: '倒签退学记录', source: '周寻账号学籍历史缓存', description: '日期比对显示退学生效早于申请文件创建。', category: '学籍记录', isKeyClue: true, sidebarFacts: ['生效日期：2026-06-17', '申请文件创建：2026-06-19'] },
  shenzhi_old_building_group: { id: 'shenzhi_old_building_group', title: '旧实验楼活动分组', source: '实验器材整理活动附件', description: '6月16日晚沈栀与顾言等人在旧实验楼参加活动。', category: '旧实验楼', isKeyClue: true, sidebarFacts: ['2026-06-16晚', '旧实验楼三层广播设备室'] },
  shenzhi_exit_missing: { id: 'shenzhi_exit_missing', title: '门禁异常', source: '旧实验楼门禁查询', description: '查询比对显示沈栀有进入记录，但未检索到离开记录。', category: '旧实验楼', isKeyClue: true, sidebarFacts: ['2026-06-16', '沈栀有进入旧实验楼记录', '未检索到离开记录'] },
  shenzhi_last_record: { id: 'shenzhi_last_record', title: '最后记录', source: '周寻调查资料', description: '周寻整理了沈栀最后一段可确认的学校记录。', category: '旧实验楼', isKeyClue: true, sidebarFacts: [] },

  old_building_duty_record: { id: 'old_building_duty_record', title: '旧实验楼值班记录', source: '学校官网实验室管理', description: '官网值班安排显示6月16日晚旧实验楼有教师值班。', category: '旧实验楼', isKeyClue: true, sidebarFacts: ['2026-06-16晚', '旧实验楼值班教师：陈启明'] },
  old_building_access_log: { id: 'old_building_access_log', title: '实验楼异常访问记录', source: '周寻账号调查资料', description: '查询结果显示沈栀进入后，A-302门禁出现异常，并在22:30解除。', category: '系统记录', isKeyClue: true, sidebarFacts: ['19:21 沈栀进入旧实验楼', '19:45 A-302门禁异常', '22:30 异常解除'] },
  old_building_reservation: { id: 'old_building_reservation', title: '旧实验楼使用申请', source: '周寻账号调查资料', description: '申请记录显示沈栀在事发前一天申请使用旧实验楼A-302，并获得信息中心审批。', category: '旧实验楼', isKeyClue: true, sidebarFacts: ['申请日期：2026-06-15', '使用日期：2026-06-16', '地点：旧实验楼 A-302', '审批部门：信息中心'] },
  equipment_missing_record: { id: 'equipment_missing_record', title: '未归还的调查设备', source: '周寻账号调查资料', description: '沈栀在进入旧实验楼前借用了摄像与存储设备，记录状态为未归还。', category: '旧实验楼', isKeyClue: true, sidebarFacts: ['借用人：沈栀', '便携摄像设备、存储卡、数据线', '状态：未归还'] },
  duty_log_record: { id: 'duty_log_record', title: '实验楼值班日志', source: '学校官网实验室管理', description: '值班日志将学生进入、系统维护通知和22:30系统同步记录在同一晚。', category: '旧实验楼', isKeyClue: true, sidebarFacts: ['19:21 发现学生进入A区', '21:45 收到系统维护通知', '22:30 执行系统同步'] },
  camera_exception_record: { id: 'camera_exception_record', title: '监控存储异常', source: '周寻账号调查资料', description: '旧实验楼东门摄像头在22:25至22:40发生数据覆盖，之后被标记为已恢复。', category: '系统记录', isKeyClue: true, sidebarFacts: ['设备：旧实验楼东门摄像头', '异常时间：22:25—22:40', '异常类型：数据覆盖'] },
  system_maintenance_ticket: { id: 'system_maintenance_ticket', title: '系统维护工单', source: '学校官网信息中心', description: '信息中心工单显示6月16日22:20执行了学生信息系统数据同步维护。', category: '系统记录', isKeyClue: true, sidebarFacts: ['工单：SYS-0616', '时间：2026-06-16 22:20', '类型：数据同步维护'] },
  admin_permission_trace: { id: 'admin_permission_trace', title: '管理员权限痕迹', source: '实验楼异常访问记录详情', description: '22:30的异常解除记录来自管理员权限，但没有留下具体账号。', category: '系统记录', isKeyClue: true, sidebarFacts: ['22:30操作来源：管理员权限', '具体账号：未记录'] },
  system_upgrade_notice: { id: 'system_upgrade_notice', title: '校园安全系统升级', source: '学校官网校园新闻', description: '信息中心在事件发生两天后完成了校园安全系统升级。', category: '公开资料', isKeyClue: true, sidebarFacts: ['系统升级完成日期：2026-06-18', '负责部门：信息中心'] },
}

export interface EvidenceFactGroup { id: ClueId; title: string; source: string; facts: string[] }
export function getDiscoveredEvidence(clues: ClueProgressMap): EvidenceFactGroup[] {
  return (Object.keys(clueDefinitions) as ClueId[]).filter((id) => clues[id].discovered && clueDefinitions[id].isKeyClue && clueDefinitions[id].sidebarFacts.length > 0).map((id) => {
    const definition = clueDefinitions[id]
    const facts = id === 'guyan_denial' && clues.shenzhi_removed_from_group.discovered && clues.shenzhi_old_building_group.discovered
      ? ['顾言声称不认识沈栀', '旧分组和群聊记录均显示两人存在直接联系']
      : definition.sidebarFacts
    return { id, title: definition.title, source: definition.source, facts }
  })
}

export const storyEventRequirements: Record<StoryEventId, ClueId[]> = {
  old_building_contradiction: ['card_record_old_building', 'old_building_closed'],
  zhou_draft_revealed: ['zhou_credentials', 'student_status_dropout', 'attendance_after_dropout', 'photo_after_dropout'],
  investigation_backup_unlocked: ['zhou_message', 'card_record_old_building', 'old_building_closed'],
  chapter_one_completed: ['shenzhi_name'],
  chapter_two_started: [], shenzhi_cache_unlocked: [],
  old_building_access_unlocked: ['shenzhi_dropout_backdated', 'shenzhi_old_building_group'],
  chapter_two_final_file_unlocked: ['seat_chart_shenzhi', 'hidden_grade_row', 'shenzhi_essay', 'shenzhi_dropout_backdated', 'shenzhi_old_building_group', 'shenzhi_exit_missing'],
  chapter_two_completed: ['shenzhi_last_record'],
  chapter_three_started: [],
  chapter_three_final_unlocked: [
    'old_building_duty_record', 'old_building_access_log', 'old_building_reservation', 'equipment_missing_record',
    'duty_log_record', 'camera_exception_record', 'system_maintenance_ticket', 'admin_permission_trace', 'system_upgrade_notice',
  ],
}

export const shenzhiCacheEvidenceIds: ClueId[] = ['class_size_mismatch', 'seat_chart_shenzhi', 'hidden_grade_row', 'shenzhi_essay', 'shenzhi_removed_from_group']

export function createEmptyClues(): ClueProgressMap {
  return Object.fromEntries(Object.values(clueDefinitions).map((definition) => [definition.id, { id: definition.id, discovered: false, discoveredAt: null, sourceUrl: null, category: definition.category, isKeyClue: definition.isKeyClue }])) as ClueProgressMap
}
export function mergeClues(value: Partial<ClueProgressMap> | undefined): ClueProgressMap {
  const empty = createEmptyClues()
  for (const id of Object.keys(empty) as ClueId[]) { const incoming = value?.[id]; if (incoming) empty[id] = { ...empty[id], ...incoming, id } }
  return empty
}
