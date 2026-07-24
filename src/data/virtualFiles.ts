import type { ClueId } from '../types/game'

export type VirtualFileKind = 'text' | 'document' | 'table' | 'seat-chart'
export interface VirtualFileReveal { key: string; label: string; clueId: ClueId; content?: string }
export interface VirtualFileDefinition {
  id: string; name: string; kind: VirtualFileKind; source: string; content?: string
  headers?: string[]; rows?: string[][]; hiddenRows?: string[][]; seats?: { number: number; name: string; hiddenName?: string }[]
  metadata?: [string, string][]; reveal?: VirtualFileReveal; onOpenClueId?: ClueId
}

const simple = (id: string, name: string, kind: 'text' | 'document', source: string, content: string): VirtualFileDefinition => ({ id, name, kind, source, content })

export const virtualFiles: Record<string, VirtualFileDefinition> = {
  'leave-form': simple('leave-form', '学生请假申请表.doc', 'document', '教务处', '启明市第一中学学生请假申请表\n\n姓名：__________　班级：__________\n请假日期：__________\n请假事由：____________________________\n\n学生签字：__________　监护人签字：__________'),
  'lab-safety-guide': simple('lab-safety-guide', '实验室安全须知.pdf', 'document', '实验中心', '实验室安全须知\n\n一、进入实验室前须接受安全教育。\n二、未经教师许可，不得操作实验设备。\n三、实验结束后关闭电源、水源并清理台面。\n四、旧实验楼封闭区域禁止学生进入。'),
  'schedule-file': simple('schedule-file', '高二年级作息时间表.txt', 'text', '年级组', '启明市第一中学高二年级作息时间表\n\n07:20  晨检\n08:00  第一节课\n08:50  第二节课\n10:00  第三节课\n12:00  午休\n14:00  下午课程\n18:30  晚自习'),
  'backup-readme': simple('backup-readme', '调查备份_01.zip / readme.txt', 'text', '周寻', '不要直接问老师。\n\n他们已经改过一次记录了。\n\n如果我也变成“退学”，说明我查对了。\n\n继续查旧实验楼。\n\n关键词：沈栀'),

  'chapter-two-search-note': { id: 'chapter-two-search-note', name: '检索记录.txt', kind: 'text', source: '周寻个人文件', content: '检索对象：沈栀\n\n官网公开页面：0条\n学生系统当前记录：0条\n\n关联词：高二（3）班、五月座位表、期中成绩、校园征文、实验器材整理', onOpenClueId: 'chapter_two_search_note' },
  'seat-chart-may': { id: 'seat-chart-may', name: '高二（3）班座位表_五月.pdf', kind: 'seat-chart', source: '年级组缓存', seats: Array.from({ length: 18 }, (_, index) => ({ number: index + 1, name: index === 11 ? '沈□' : ['陈嘉禾','许宁','王澄','苏晴','江唯','方可','林默','赵清遥','严希','贺闻','顾言','', '周寻','唐雨','宋乔','叶臻','程夏','温宁'][index], ...(index === 11 ? { hiddenName: '沈栀' } : {}) })), reveal: { key: 'seat-chart-seat-12', label: '恢复标注', clueId: 'seat_chart_shenzhi' } },
  'midterm-grades': { id: 'midterm-grades', name: '高二三班期中成绩汇总.csv', kind: 'table', source: '教务缓存', headers: ['序号', '姓名', '状态'], rows: [['10','许悦','正常'],['11','周寻','正常'],['13','顾言','正常'],['14','林默','正常']], hiddenRows: [['12','沈栀','数据已删除']], content: '统计人数：18', reveal: { key: 'grades-hidden-row-12', label: '显示隐藏记录', clueId: 'hidden_grade_row' } },
  'essay-window': { id: 'essay-window', name: '二等奖作品_窗外.docx', kind: 'document', source: '校园文学社', content: '《窗外》\n\n我坐在靠窗的位置。\n\n课间的时候，大家会从我身边经过，但很少有人停下来。\n\n他们讨论运动会、讨论周末去哪里，也讨论下一次换座位。\n\n有时候我觉得，教室里的座位不是按人数摆的。\n\n我是多出来的那一个。\n\n如果以后还有人坐在第十二号座位，希望她不会觉得自己是透明的。', metadata: [['标题','窗外'],['作者栏',''],['创建者','沈栀'],['创建时间','2026-05-24'],['最后修改','2026-05-26']], reveal: { key: 'essay-file-properties', label: '查看文件属性', clueId: 'shenzhi_essay' } },
  'guyan-note': { id: 'guyan-note', name: '顾言不认识她？.txt', kind: 'text', source: '周寻个人文件', content: '顾言说他不认识沈栀。\n\n五月实验分组表里，他们在同一组。\n\n群成员记录里，顾言是管理员。\n\n', onOpenClueId: 'guyan_denial' },
  'lab-group-sheet': { id: 'lab-group-sheet', name: '实验器材整理活动分组表.pdf', kind: 'table', source: '实验中心资料', headers: ['组别', '时间', '地点', '成员'], rows: [['第4组','2026-06-16 19:30—21:00','旧实验楼三层广播设备室','顾言、沈栀、何岚、唐棠']], reveal: { key: 'lab-group-four-detail', label: '查看第4组详情', clueId: 'shenzhi_old_building_group' } },
  'last-record-0616': { id: 'last-record-0616', name: '最后记录_0616.txt', kind: 'text', source: '周寻个人文件', content: '沈栀不是正常转学。\n\n6月16日晚，她进入了旧实验楼。\n\n6月17日，她的学籍变更已经生效。\n\n退学申请文件是在之后创建的。\n\n门禁系统里有她的进入记录。\n\n没有查到离开记录。\n\n下一步：找当晚的值班记录。', onOpenClueId: 'shenzhi_last_record' },
  'lab-reservation-0616': { id: 'lab-reservation-0616', name: '实验室使用申请记录.xlsx', kind: 'table', source: '周寻个人调查资料', headers: ['申请日期', '使用日期', '地点', '用途', '申请人', '审批状态', '审批部门'], rows: [['2026-06-15', '2026-06-16', '旧实验楼 A-302', '资料整理', '沈栀', '通过', '信息中心']] },
  'equipment-loan-0616': simple('equipment-loan-0616', '实验室设备借用记录.txt', 'text', '周寻个人调查资料', '日期：2026-06-16\n\n借用人：沈栀\n\n设备：\n便携摄像设备\n存储卡\n数据线\n\n状态：未归还'),
  'duty-log-0616': simple('duty-log-0616', '实验楼值班日志.txt', 'text', '实验中心值班记录', '2026-06-16\n\n19:10\n旧实验楼开放。\n\n19:21\n发现学生进入A区。\n\n21:45\n收到系统维护通知。\n\n22:30\n执行系统同步。\n\n23:00\n值班结束。'),
  'camera-exception-0616': simple('camera-exception-0616', '监控存储异常记录.txt', 'text', '周寻个人调查资料', '设备：旧实验楼东门摄像头\n\n日期：2026-06-16\n\n异常时间：22:25-22:40\n\n异常类型：数据覆盖\n\n处理状态：已恢复'),
  'maintenance-ticket-sys-0616': simple('maintenance-ticket-sys-0616', '系统维护记录_SYS-0616.txt', 'text', '信息中心维护记录', '编号：SYS-0616\n\n时间：2026-06-16 22:20\n\n类型：数据同步维护\n\n影响范围：学生信息系统\n\n执行部门：信息中心'),
  'investigation-backup-02': simple('investigation-backup-02', '调查备份_02.txt', 'text', '周寻个人文件', '我找到了一些东西。\n\n6月16日晚，\n\n沈栀提前申请进入旧实验楼。\n\n她不是临时过去。\n\n她在那里寻找某个东西。\n\n继续查访问记录。'),
  'investigation-backup-02-final': simple('investigation-backup-02-final', '调查备份_02.txt', 'text', '周寻个人文件', '我还原了6月16日晚。\n\n沈栀19:21进入旧实验楼A区。\n\n她提前申请了实验室，\n\n借用了设备。\n\n22点以后，\n\n有人处理了现场记录。\n\n监控被覆盖。\n\n门禁记录被修改。\n\n执行操作的不是普通教师。\n\n系统只留下：\n\nADMIN_03\n\n但我还不知道这个账号是谁。'),
}

export function getVirtualFile(id: string | null): VirtualFileDefinition | null { return id ? virtualFiles[id] ?? null : null }
