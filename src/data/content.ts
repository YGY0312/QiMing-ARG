export interface ArticleRecord {
  id: string
  title: string
  date: string
  summary: string
  paragraphs: string[]
  department?: string
  documentCode?: string
  hasInvestigablePhoto?: boolean
  attachmentFileId?: string
  attachmentLabel?: string
}

export const newsItems: ArticleRecord[] = [
  {
    id: 'old-lab-equipment-sorting', title: '高二年级开展实验器材整理活动', date: '2026-06-16', summary: '高二年级部分学生协助完成旧实验器材分类和整理工作。', attachmentFileId: 'lab-group-sheet', attachmentLabel: '打开',
    paragraphs: ['高二年级部分学生协助完成旧实验器材分类和整理工作。', '参与同学按分组进入指定房间，活动记录由实验中心统一归档。'],
  },
  {
    id: 'future-self-essay', title: '我校开展“写给未来的自己”主题征文活动', date: '2026-05-28', summary: '校园文学社公布本学期主题征文获奖名单。', attachmentFileId: 'essay-window', attachmentLabel: '打开',
    paragraphs: ['本次征文共收到高一、高二年级作品百余篇。经评审，《窗外》等作品获得二等奖。', '部分获奖作品将在校园网站陆续刊载，欢迎同学们阅读。'],
  },
  {
    id: 'excellent-student-cadres', title: '五月优秀学生干部风采', date: '2026-05-25', summary: '高二（3）班顾言协助完成班级资料整理。',
    paragraphs: ['顾言同学担任高二（3）班班干部，协助老师维护班级群与活动分组资料。', '他表示，及时清理离班成员是班级信息管理的一部分。'],
  },
  {
    id: 'flag-raising-ceremony', title: '我校举行新学期升旗仪式', date: '2026-09-14', summary: '全校师生齐聚操场，以崭新面貌迎接新学期。',
    paragraphs: ['9月14日上午，我校举行新学期升旗仪式。校领导、全体教师及学生参加仪式。', '学生代表围绕新学期目标作国旗下发言，号召同学们珍惜时间、踏实求知。'],
  },
  {
    id: 'lab-safety', title: '高二年级开展实验室安全教育活动', date: '2026-09-13', summary: '高二年级学生在实验楼参加安全教育活动。', hasInvestigablePhoto: true,
    paragraphs: ['9月13日下午，高二年级组织学生在实验楼前参加安全教育活动。各班学生代表完成应急疏散和器材使用规范学习。', '活动结束后，年级组教师与参与学生在新实验楼门厅前合影。'],
  },
  {
    id: 'basketball-league', title: '校篮球队在市级联赛中取得佳绩', date: '2026-09-11', summary: '校篮球队在本年度市级中学生联赛中取得第三名。',
    paragraphs: ['经过多轮比赛，我校篮球队最终取得第三名。', '学校向参赛队员和指导教师表示祝贺，希望同学们继续发扬团结拼搏的精神。'],
  },
  {
    id: 'mental-health-week', title: '校园心理健康宣传周顺利开展', date: '2026-09-08', summary: '心理辅导室开展主题班会与现场咨询活动。',
    paragraphs: ['本次宣传周以“倾听与陪伴”为主题，开展主题班会、心理讲座等活动。', '心理辅导室将继续在每周二、周四午间面向学生开放。'],
  },
]

export const noticeItems: ArticleRecord[] = [
  {
    id: 'evening-study', title: '关于调整本周晚自习安排的通知', date: '2026-09-16', summary: '因年级教学安排调整，本周三晚自习时间有所变更。', department: '教务处', documentCode: '启一中教字〔2026〕37号',
    paragraphs: ['因年级教学安排调整，本周三晚自习第二节课提前十分钟结束。', '请各班班主任及时告知学生，并做好离校秩序管理。'],
  },
  {
    id: 'student-status-change', title: '关于高二年级学生学籍变动情况的说明', date: '2026-09-15', summary: '高二年级近期学生学籍变动情况说明。', department: '学生发展中心', documentCode: '启一中学字〔2026〕18号',
    paragraphs: ['周寻同学因家庭原因，已于2026年9月12日按照相关规定办理退学手续。', '相关学籍材料已完成归档。如有疑问，请由监护人联系学生发展中心。相关信息可登录学生信息系统查询。'],
  },
  {
    id: 'old-lab-closure', title: '关于旧实验楼区域临时封闭的通知', date: '2026-09-10', summary: '旧实验楼因设备检修及安全评估暂停使用。', department: '总务处', documentCode: '启一中总字〔2026〕12号',
    paragraphs: ['因设备检修及安全评估，自2026年9月10日起，旧实验楼暂停使用，学生不得擅自进入。', '封闭期间请全体师生绕行警戒区域，恢复开放时间另行通知。'],
  },
]
