import type { ChapterEightClueId, ChapterFiveClueId, ChapterFourClueId, ChapterNineClueId, ChapterSevenClueId, ChapterSixClueId, ChapterThreeClueId, ChapterTwoClueId, ClueId, ClueProgress, ClueProgressMap, StoryEventId } from '../types/game'

export interface ClueDefinition extends Omit<ClueProgress, 'discovered' | 'discoveredAt' | 'sourceUrl'> { title: string; source: string; description: string; sidebarFacts: string[] }

export const chapterTwoClueIds: ChapterTwoClueId[] = [
  'chapter_two_search_note', 'shenzhi_search_residue', 'class_size_mismatch', 'seat_chart_shenzhi', 'hidden_grade_row', 'shenzhi_essay',
  'guyan_denial', 'shenzhi_removed_from_group', 'shenzhi_dropout_backdated', 'shenzhi_old_building_group', 'shenzhi_exit_missing', 'shenzhi_last_record',
]

export const chapterThreeClueIds: ChapterThreeClueId[] = [
  'old_building_duty_record', 'old_building_access_log', 'old_building_reservation', 'equipment_missing_record',
  'duty_log_record', 'camera_exception_record', 'system_maintenance_ticket', 'admin_permission_trace', 'system_upgrade_notice',
]

export const chapterFourClueIds: ChapterFourClueId[] = [
  'permission_limit', 'legacy_admin_entry', 'admin_access_denied', 'zhou_admin_attempt',
  'permission_request_manual', 'history_query_access', 'student_status_modify_log',
  'admin03_permission_group', 'linmo_target_record',
]

export const chapterFiveClueIds: ChapterFiveClueId[] = [
  'account_relation_warning', 'zhou_post_disappearance_login', 'decommissioned_terminal_activity',
  'shenzhi_cache_recovered', 'shenzhi_zhou_terminal_link', 'three_account_relation',
  'zhou_last_draft', 'draft_modified_after_logout', 'zhou_last_login_summary',
]
export const chapterSixClueIds: ChapterSixClueId[] = [
  'terminal_status_fluctuation', 'terminal_decommission_record', 'third_floor_route',
  'terminal_same_network_port', 'network_port_location', 'camera_storage_index',
  'damaged_recording_metadata', 'pending_object_records', 'zhou_local_session_note', 'terminal03_summary',
]
export const chapterSevenClueIds: ChapterSevenClueId[] = [
  'original_class_roster', 'monitor_resubmission_notice', 'shenzhi_removed_after_incident',
  'zhou_questioned_monitor', 'monitor_unsent_statement', 'terminal_external_export',
  'external_backup_index', 'qiming_plan_name', 'external_backup_verified', 'outside_system_summary',
]
export const chapterEightClueIds: ChapterEightClueId[] = [
  'shenzhi_last_route', 'equipment_room_override', 'emergency_signal_received',
  'external_rescue_delayed', 'cam_tmp_recovered', 'medical_identity_matched',
  'shenzhi_death_confirmed', 'incident_report_falsified',
  'post_incident_cleanup_order', 'june_sixteenth_summary',
]
export const chapterNineClueIds: ChapterNineClueId[] = [
  'zhou_local_session_verified', 'zhou_export_completed', 'delayed_verification_tasks',
  'admin_proxy_session', 'admin03_operator_identified', 'monitoring_target_linmo',
  'monitor_last_sighting', 'external_alive_signature', 'zhou_alive_and_departed',
  'last_account_summary',
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
  permission_limit: { id: 'permission_limit', title: '权限限制', source: '学生系统检索', description: 'ADMIN_03存在历史引用，但普通学生账号无法查询其详情。', category: '系统记录', isKeyClue: true, sidebarFacts: ['ADMIN_03：存在历史引用', '查询权限：不足'] },
  legacy_admin_entry: { id: 'legacy_admin_entry', title: '旧版管理入口', source: '学校官网系统服务', description: '信息中心的系统服务页面保留了旧版管理入口 /admin。', category: '公开资料', isKeyClue: true, sidebarFacts: ['旧版入口：/admin'] },
  admin_access_denied: { id: 'admin_access_denied', title: '管理员入口拒绝访问', source: '旧版管理入口', description: '访问旧版管理入口时返回403权限不足。', category: '系统记录', isKeyClue: true, sidebarFacts: ['403 Forbidden', '权限不足'] },
  zhou_admin_attempt: { id: 'zhou_admin_attempt', title: '周寻管理员访问记录', source: '周寻账号调查资料', description: '周寻曾尝试访问管理员历史页面 /admin/history。', category: '私人信息', isKeyClue: true, sidebarFacts: ['访问目标：/admin/history', '结果：拒绝访问'] },
  permission_request_manual: { id: 'permission_request_manual', title: '权限申请说明', source: '学生系统帮助', description: '历史数据访问需要维护编号、管理员授权记录与访问申请。', category: '系统记录', isKeyClue: true, sidebarFacts: ['维护编号', '管理员授权记录', '访问申请'] },
  history_query_access: { id: 'history_query_access', title: '历史查询入口', source: '学生系统', description: '满足调查条件后，旧版历史查询入口出现在周寻账号中。', category: '系统记录', isKeyClue: true, sidebarFacts: ['入口：管理员历史查询'] },
  student_status_modify_log: { id: 'student_status_modify_log', title: '学生状态修改记录', source: '管理员历史查询', description: '沈栀的状态由正常在籍修改为异常注销。', category: '学籍记录', isKeyClue: true, sidebarFacts: ['原状态：正常在籍', '修改：异常注销'] },
  admin03_permission_group: { id: 'admin03_permission_group', title: 'ADMIN_03权限组', source: '管理员历史查询', description: 'ADMIN_03不是普通账号，而是一组系统权限。', category: '系统记录', isKeyClue: true, sidebarFacts: ['StudentStatusModify', 'ArchiveAccess', 'RecordCleanup'] },
  linmo_target_record: { id: 'linmo_target_record', title: '林默调查记录', source: '管理员历史查询', description: '管理员记录中出现了林默的学号，状态为调查中。', category: '私人信息', isKeyClue: true, sidebarFacts: ['目标：2024010307', '状态：调查中'] },
  account_relation_warning: { id: 'account_relation_warning', title: '账号关联提醒', source: '林默账号安全提醒', description: '林默账号被系统认定与2024010312存在异常关联。', category: '账号安全', isKeyClue: true, sidebarFacts: ['关联账号：2024010312', '处理状态：监测中'] },
  zhou_post_disappearance_login: { id: 'zhou_post_disappearance_login', title: '失踪后的登录', source: '周寻账号登录与设备', description: '周寻退学后，账号仍从旧实验楼相关设备登录。', category: '登录记录', isKeyClue: true, sidebarFacts: ['周寻退学后仍从旧实验楼设备登录'] },
  decommissioned_terminal_activity: { id: 'decommissioned_terminal_activity', title: '停用终端活动', source: 'TERM-OLD-03设备详情', description: '停用终端在数月后仍产生周寻账号登录记录。', category: '设备状态', isKeyClue: true, sidebarFacts: ['TERM-OLD-03于6月18日停用', '2026-09-15仍产生登录记录'] },
  shenzhi_cache_recovered: { id: 'shenzhi_cache_recovered', title: '沈栀缓存恢复', source: '学生缓存_2024010318.dat', description: '损坏缓存恢复出沈栀的最后有效身份和登录设备。', category: '缓存恢复', isKeyClue: true, sidebarFacts: ['2024010318对应沈栀', '最后登录设备：TERM-OLD-03'] },
  shenzhi_zhou_terminal_link: { id: 'shenzhi_zhou_terminal_link', title: '终端关联', source: '沈栀缓存关联字段', description: '沈栀与周寻的账号记录都指向TERM-OLD-03。', category: '账号关联', isKeyClue: true, sidebarFacts: ['沈栀与周寻均关联TERM-OLD-03'] },
  three_account_relation: { id: 'three_account_relation', title: '三个账号的关联', source: '账号关联查询', description: '沈栀与周寻共同关联停用终端，林默则因周寻账号被列为监测对象。', category: '账号关联', isKeyClue: true, sidebarFacts: ['沈栀 → TERM-OLD-03', '周寻 → TERM-OLD-03', '林默 → 周寻'] },
  zhou_last_draft: { id: 'zhou_last_draft', title: '周寻最后的草稿', source: '周寻未发送草稿', description: '周寻警告林默，继续使用他的账号会让系统把两人关联起来。', category: '周寻草稿', isKeyClue: true, sidebarFacts: ['状态：草稿 · 未发送', '继续查询会建立账号关联'] },
  draft_modified_after_logout: { id: 'draft_modified_after_logout', title: '草稿时间异常', source: '草稿时间比对', description: '周寻账号会话中断以后，草稿仍发生修改。', category: '时间异常', isKeyClue: true, sidebarFacts: ['会话中断：00:02', '草稿修改：00:04'] },
  zhou_last_login_summary: { id: 'zhou_last_login_summary', title: '最后登录', source: '调查备份_04.txt', description: '周寻失踪后账号仍在停用终端活动，最后一次操作身份无法确认。', category: '登录记录', isKeyClue: true, sidebarFacts: ['失踪后账号仍在TERM-OLD-03活动', '最后一次操作身份无法确认'] },
  terminal_status_fluctuation: { id: 'terminal_status_fluctuation', title: '终端状态波动', source: 'TERM-OLD-03状态变化记录', description: 'TERM-OLD-03已登记停用，但仍产生在线心跳。', category: '设备状态', isKeyClue: true, sidebarFacts: ['公开状态：已停用', '心跳记录：仍有在线状态'] },
  terminal_decommission_record: { id: 'terminal_decommission_record', title: '终端报废记录', source: '设备报废公示', description: 'TERM-OLD-03未被搬离，而是原地封存。', category: '公开资料', isKeyClue: true, sidebarFacts: ['封存位置：旧实验楼三层设备间'] },
  third_floor_route: { id: 'third_floor_route', title: '三层调查路径', source: '旧实验楼三层平面图', description: '三个区域形成连续调查路径。', category: '旧实验楼', isKeyClue: true, sidebarFacts: ['A-302 → 广播设备室 → 三层设备间'] },
  terminal_same_network_port: { id: 'terminal_same_network_port', title: '相同网络节点', source: '网络接入记录', description: 'TERM-OLD-03在六月和九月通过相同节点接入。', category: '系统记录', isKeyClue: true, sidebarFacts: ['OLD-BLDG-3F-SW02'] },
  network_port_location: { id: 'network_port_location', title: '端口覆盖区域', source: '信息中心网络归档', description: '网络端口覆盖三个关键房间。', category: '公开资料', isKeyClue: true, sidebarFacts: ['A-302', '广播设备室', '三层设备间'] },
  camera_storage_index: { id: 'camera_storage_index', title: '摄像设备缓存', source: '设备归还缓存_CAM-07.dat', description: 'CAM-07留下四个媒体文件。', category: '缓存恢复', isKeyClue: true, sidebarFacts: ['CAM-07留下四个媒体文件'] },
  damaged_recording_metadata: { id: 'damaged_recording_metadata', title: '损坏录音元数据', source: 'CAM-07媒体元数据', description: '22:19后出现门锁、人声和“终端”残片，随后中断。', category: '系统记录', isKeyClue: true, sidebarFacts: ['22:19 后出现门锁、人声和“终端”残片'] },
  pending_object_records: { id: 'pending_object_records', title: '待同步对象', source: 'TERM-OLD-03缓存目录', description: 'pending目录中同时存在三个等待同步对象。', category: '系统记录', isKeyClue: true, sidebarFacts: ['2024010318', '2024010312', '2024010307'] },
  zhou_local_session_note: { id: 'zhou_local_session_note', title: '周寻的本地备注', source: '2024010312.pending', description: '本地会话残留备注，但写入者身份无法确认。', category: '私人信息', isKeyClue: true, sidebarFacts: ['不要从系统里找我'] },
  terminal03_summary: { id: 'terminal03_summary', title: '终端03', source: '调查备份_05.txt', description: 'TERM-OLD-03位于旧实验楼三层，并保存着三个待同步对象。', category: '设备状态', isKeyClue: true, sidebarFacts: ['旧实验楼三层', '三个待同步对象'] },
  original_class_roster: { id: 'original_class_roster', title: '原始班级名单', source: '高二（3）班原始信息核对表', description: '6月16日晚保存的原始名单中，沈栀仍是班级正式成员。', category: '班级资料', isKeyClue: true, sidebarFacts: ['2026-06-16晚', '人数18', '包含沈栀'] },
  monitor_resubmission_notice: { id: 'monitor_resubmission_notice', title: '重新提交名单的通知', source: '班级名单重新提交通知', description: '沈栀失联后的第二天早晨，班长被要求按照系统当前名单重新提交班级材料。', category: '班级资料', isKeyClue: true, sidebarFacts: ['2026-06-17早晨', '要求以系统当前名单重新提交'] },
  shenzhi_removed_after_incident: { id: 'shenzhi_removed_after_incident', title: '事故后的名单删除', source: '新旧班级名单比对', description: '沈栀在旧实验楼异常事件后被从重新提交的名单中删除。', category: '班级资料', isKeyClue: true, sidebarFacts: ['原始版：18人', '提交版：17人', '删除：2024010318 沈栀'] },
  zhou_questioned_monitor: { id: 'zhou_questioned_monitor', title: '周寻询问班长', source: '班长与周寻聊天缓存', description: '周寻追问是谁要求重新提交名单，并要求班长保留原始文件。', category: '人物关系', isKeyClue: true, sidebarFacts: ['周寻追问：是谁要求重新提交名单'] },
  monitor_unsent_statement: { id: 'monitor_unsent_statement', title: '班长未发送的说明', source: '班长未发送说明', description: '班长承认未见离校手续，只是按照通知重新提交名单。', category: '私人信息', isKeyClue: true, sidebarFacts: ['未见退学申请', '未见转学手续'] },
  terminal_external_export: { id: 'terminal_external_export', title: '终端外部导出', source: 'TERM-OLD-03数据传输记录', description: '周寻最后一次本地会话期间，终端将ARCHIVE_0616导出至校外节点。', category: '系统记录', isKeyClue: true, sidebarFacts: ['TERM-OLD-03 → EXT-NODE-04', '对象：ARCHIVE_0616'] },
  external_backup_index: { id: 'external_backup_index', title: '系统外备份索引', source: '校园旧服务归档', description: '周寻利用旧服务留下了不属于学生系统的外部备份编号。', category: '外部归档', isKeyClue: true, sidebarFacts: ['EXT-BACKUP-QM-0616', '旧站不走学生系统'] },
  qiming_plan_name: { id: 'qiming_plan_name', title: '启明计划', source: '外部备份计划目录', description: '“启明”也是一个内部试运行计划的名称。', category: '外部归档', isKeyClue: true, sidebarFacts: ['启明学生风险干预计划', '项目代号QM'] },
  external_backup_verified: { id: 'external_backup_verified', title: '外部备份验证', source: '外部备份manifest', description: 'TERM-OLD-03导出的外部备份真实存在，完整性为71%。', category: '外部归档', isKeyClue: true, sidebarFacts: ['ARCHIVE_0616', '完整性71%', '包含名单、媒体、计划和事件索引'] },
  outside_system_summary: { id: 'outside_system_summary', title: '系统之外', source: '调查备份_06.txt', description: '原始名单与校外备份证明，真正的记录被保存在校园系统之外。', category: '外部归档', isKeyClue: true, sidebarFacts: ['原始名单仍有18人', '终端之外存在备份', 'incident/0616等待验证'] },
  shenzhi_last_route: { id: 'shenzhi_last_route', title: '沈栀最后路线', source: 'incident/0616时间线', description: 'CAM-07与终端缓存还原了沈栀在旧实验楼内的最后路线。', category: '外部归档', isKeyClue: true, sidebarFacts: ['19:21 旧实验楼入口', '20:58 广播设备室', '22:19 三层设备间'] },
  equipment_room_override: { id: 'equipment_room_override', title: '设备间维护覆盖', source: '旧实验楼门禁覆盖记录', description: '录音中断后，ADMIN_03权限锁定了设备间与封闭通道出口。', category: '系统记录', isKeyClue: true, sidebarFacts: ['22:21 维护覆盖', '权限：ADMIN_03', '状态：出口锁定'] },
  emergency_signal_received: { id: 'emergency_signal_received', title: '紧急信号已接收', source: '封闭通道紧急按钮记录', description: '校园安保已查看紧急信号，但先按设备故障进行内部处置。', category: '系统记录', isKeyClue: true, sidebarFacts: ['22:31 触发', '22:32 安保查看', '外部急救：未呼叫'] },
  external_rescue_delayed: { id: 'external_rescue_delayed', title: '外部急救延误', source: '安保与外部急救时间比对', description: '紧急按钮触发后14分34秒，外部急救才被呼叫。', category: '系统记录', isKeyClue: true, sidebarFacts: ['外部急救呼叫：22:46:18', '延误：14分34秒'] },
  cam_tmp_recovered: { id: 'cam_tmp_recovered', title: 'CAM临时文件', source: '222801.tmp', description: '损坏缓存记录到求助、撞击与设备失稳。', category: '缓存恢复', isKeyClue: true, sidebarFacts: ['22:28 求助、撞击、设备失稳'] },
  medical_identity_matched: { id: 'medical_identity_matched', title: '医疗身份匹配', source: '匿名医疗接收记录', description: '当晚从旧实验楼送医的未确认女学生已匹配为沈栀。', category: '身份痕迹', isKeyClue: true, sidebarFacts: ['患者：沈栀', '学号：2024010318', '来源：旧实验楼'] },
  shenzhi_death_confirmed: { id: 'shenzhi_death_confirmed', title: '沈栀死亡确认', source: '医疗抢救结论', description: '沈栀于2026年6月16日23:58经抢救无效死亡。', category: '身份痕迹', isKeyClue: true, sidebarFacts: ['2026-06-16 23:58', '抢救无效死亡'] },
  incident_report_falsified: { id: 'incident_report_falsified', title: '事件报告被伪造', source: '原始事件摘要与对外登记比对', description: '校内旧实验楼事件被改写为校外个人意外。', category: '系统记录', isKeyClue: true, sidebarFacts: ['校内旧实验楼事件 → 校外个人意外'] },
  post_incident_cleanup_order: { id: 'post_incident_cleanup_order', title: '事后记录清理命令', source: 'SYS-0616清理任务', description: 'ADMIN_03权限参与清理名单、学籍、设备和事件记录。', category: '系统记录', isKeyClue: true, sidebarFacts: ['SYS-0616', 'ADMIN_03', '名单、学籍、设备与记录清理'] },
  june_sixteenth_summary: { id: 'june_sixteenth_summary', title: '六月十六日', source: '调查备份_07.txt', description: '0616事件的路线、求助、急救、医疗与事后记录已形成完整证据链。', category: '外部归档', isKeyClue: true, sidebarFacts: ['0616事件时间线已恢复', '公开记录与内部记录冲突'] },
  zhou_local_session_verified: { id: 'zhou_local_session_verified', title: '周寻本地会话', source: '0914本地会话时间线', description: '9月14日23:48至次日00:02的TERM-OLD-03本地会话由周寻本人完成。', category: '登录记录', isKeyClue: true, sidebarFacts: ['23:48至00:02', 'TERM-OLD-03', 'LOCAL_SESSION'] },
  zhou_export_completed: { id: 'zhou_export_completed', title: '外部导出完成', source: 'ARCHIVE_0616导出记录', description: '周寻在会话中断前完成外部导出并写入个人校验密钥。', category: '外部归档', isKeyClue: true, sidebarFacts: ['ARCHIVE_0616 → EXT-NODE-04', 'ZX-KEY-01已写入'] },
  delayed_verification_tasks: { id: 'delayed_verification_tasks', title: '预设验证任务', source: 'ZX-VERIFY-01任务组', description: '周寻提前建立条件任务，让证据核对者逐步取得外部材料。', category: '系统记录', isKeyClue: true, sidebarFacts: ['任务组：ZX-VERIFY-01', '来源：周寻预设'] },
  admin_proxy_session: { id: 'admin_proxy_session', title: '管理员代理会话', source: 'ADMIN_03代理会话', description: '周寻本地会话中断后，ADMIN_03从IC-SEC-02建立代理会话。', category: '登录记录', isKeyClue: true, sidebarFacts: ['00:03以后', 'IC-SEC-02', 'ADMIN_03'] },
  admin03_operator_identified: { id: 'admin03_operator_identified', title: 'ADMIN_03关键操作者', source: '门禁、设备与授权成员比对', description: '三类记录共同指向信息中心技术负责人许承安。', category: '人物关系', isKeyClue: true, sidebarFacts: ['许承安', '信息中心副主任', '启明计划技术负责人'] },
  monitoring_target_linmo: { id: 'monitoring_target_linmo', title: '林默被加入监测', source: '周寻草稿隐藏追踪标记', description: 'ADMIN_03通过固定剧情追踪字段确认林默继续调查，并将其加入监测队列。', category: '账号安全', isKeyClue: true, sidebarFacts: ['TRACE_TARGET → 2024010307', '监测状态：等待同步'] },
  monitor_last_sighting: { id: 'monitor_last_sighting', title: '班长最后目击', source: '顾言未发送说明', description: '顾言在东门外见到清醒并能自主行动的周寻。', category: '人物关系', isKeyClue: true, sidebarFacts: ['9月15日00:37', '学校东门外', '周寻清醒并能自主行动'] },
  external_alive_signature: { id: 'external_alive_signature', title: '系统外存活签名', source: 'EXT-NODE-04签名消息', description: '周寻离校三天后使用预先写入的密钥发出有效消息。', category: '外部归档', isKeyClue: true, sidebarFacts: ['9月18日04:12', 'ZX-KEY-01', '验证通过'] },
  zhou_alive_and_departed: { id: 'zhou_alive_and_departed', title: '周寻仍然活着', source: '目击、投递与签名证据链', description: '证据确认周寻仍然活着并已离开学校，具体位置未公开。', category: '身份痕迹', isKeyClue: true, sidebarFacts: ['确认存活', '已离开学校', '具体位置未公开'] },
  last_account_summary: { id: 'last_account_summary', title: '最后一个账号', source: '调查备份_08.txt', description: '周寻本人、预设任务和ADMIN_03代理活动已经被明确区分。', category: '外部归档', isKeyClue: true, sidebarFacts: ['00:02前：周寻本人', '00:03后：管理员代理', '周寻确认存活'] },
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
  chapter_three_completed: [],
  chapter_four_started: [],
  chapter_four_admin_unlocked: ['permission_limit', 'legacy_admin_entry', 'admin_access_denied', 'zhou_admin_attempt', 'permission_request_manual'],
  chapter_four_final_unlocked: [
    'permission_limit', 'legacy_admin_entry', 'admin_access_denied', 'zhou_admin_attempt',
    'permission_request_manual', 'history_query_access', 'student_status_modify_log',
    'admin03_permission_group', 'linmo_target_record',
  ],
  chapter_four_completed: [],
  chapter_five_started: [],
  chapter_five_cache_unlocked: ['decommissioned_terminal_activity', 'admin03_permission_group'],
  chapter_five_relation_unlocked: ['shenzhi_cache_recovered', 'shenzhi_zhou_terminal_link'],
  chapter_five_final_unlocked: [
    'account_relation_warning', 'zhou_post_disappearance_login', 'decommissioned_terminal_activity',
    'shenzhi_cache_recovered', 'shenzhi_zhou_terminal_link', 'three_account_relation',
    'zhou_last_draft', 'draft_modified_after_logout',
  ],
  chapter_five_completed: [],
  chapter_six_started: [],
  chapter_six_map_unlocked: ['terminal_status_fluctuation', 'terminal_decommission_record'],
  chapter_six_media_unlocked: ['third_floor_route', 'terminal_same_network_port', 'network_port_location'],
  chapter_six_terminal_cache_unlocked: ['camera_storage_index', 'damaged_recording_metadata', 'network_port_location'],
  chapter_six_final_unlocked: [
    'terminal_status_fluctuation', 'terminal_decommission_record', 'third_floor_route',
    'terminal_same_network_port', 'network_port_location', 'camera_storage_index',
    'damaged_recording_metadata', 'pending_object_records', 'zhou_local_session_note',
  ],
  chapter_six_completed: [],
  chapter_seven_started: [],
  chapter_seven_class_archive_unlocked: [],
  chapter_seven_monitor_records_unlocked: ['original_class_roster', 'monitor_resubmission_notice', 'shenzhi_removed_after_incident'],
  chapter_seven_external_index_unlocked: ['original_class_roster', 'monitor_resubmission_notice', 'zhou_questioned_monitor', 'monitor_unsent_statement'],
  chapter_seven_external_backup_unlocked: ['external_backup_index', 'terminal_external_export'],
  chapter_seven_final_unlocked: [
    'original_class_roster', 'monitor_resubmission_notice', 'shenzhi_removed_after_incident',
    'zhou_questioned_monitor', 'monitor_unsent_statement', 'terminal_external_export',
    'external_backup_index', 'qiming_plan_name', 'external_backup_verified',
  ],
  chapter_seven_completed: [],
  chapter_eight_started: [],
  chapter_eight_incident_unlocked: [],
  chapter_eight_emergency_records_unlocked: ['equipment_room_override', 'cam_tmp_recovered'],
  chapter_eight_medical_records_unlocked: ['shenzhi_last_route', 'cam_tmp_recovered', 'emergency_signal_received', 'external_rescue_delayed'],
  chapter_eight_cleanup_records_unlocked: ['shenzhi_death_confirmed', 'incident_report_falsified'],
  chapter_eight_final_unlocked: [
    'shenzhi_last_route', 'equipment_room_override', 'emergency_signal_received',
    'external_rescue_delayed', 'cam_tmp_recovered', 'medical_identity_matched',
    'shenzhi_death_confirmed', 'incident_report_falsified', 'post_incident_cleanup_order',
  ],
  chapter_eight_final_opened: [],
  chapter_eight_completed: [],
  chapter_nine_started: [],
  chapter_nine_session_unlocked: [],
  chapter_nine_source_classification_unlocked: ['zhou_local_session_verified', 'zhou_export_completed'],
  chapter_nine_admin_trace_unlocked: ['delayed_verification_tasks'],
  chapter_nine_witness_unlocked: ['admin_proxy_session', 'monitoring_target_linmo'],
  chapter_nine_alive_check_unlocked: ['monitor_last_sighting', 'zhou_export_completed'],
  chapter_nine_certificate_chain_unlocked: ['zhou_alive_and_departed', 'admin03_operator_identified', 'monitoring_target_linmo'],
  chapter_nine_final_unlocked: [
    'zhou_local_session_verified', 'zhou_export_completed', 'delayed_verification_tasks',
    'admin_proxy_session', 'admin03_operator_identified', 'monitoring_target_linmo',
    'monitor_last_sighting', 'external_alive_signature', 'zhou_alive_and_departed',
  ],
  chapter_nine_final_opened: [],
  chapter_nine_completed: [],
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
