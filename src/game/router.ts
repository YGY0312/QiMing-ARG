import type { ComponentKey, GameRoute, SiteType } from '../types/game'

const SCHOOL_HOST = 'www.qiming-high.edu.cn'
const STUDENT_HOST = 'stu.qiming-high.edu.cn'
const ARCHIVE_HOST = 'archive.qm-node.local'

interface RouteDefinition {
  pattern: RegExp
  componentKey: ComponentKey
  pageTitle: string
}

const schoolRoutes: RouteDefinition[] = [
  { pattern: /^\/$/, componentKey: 'school-home', pageTitle: '启明市第一中学' },
  { pattern: /^\/news$/, componentKey: 'school-news', pageTitle: '校园新闻 - 启明市第一中学' },
  { pattern: /^\/news\/([^/]+)$/, componentKey: 'school-news-detail', pageTitle: '新闻详情 - 启明市第一中学' },
  { pattern: /^\/notices$/, componentKey: 'school-notices', pageTitle: '通知公告 - 启明市第一中学' },
  { pattern: /^\/notices\/([^/]+)$/, componentKey: 'school-notice-detail', pageTitle: '公告详情 - 启明市第一中学' },
  { pattern: /^\/search\/([^/]+)$/, componentKey: 'school-search', pageTitle: '站内搜索 - 启明市第一中学' },
  { pattern: /^\/removed\/([^/]+)$/, componentKey: 'school-removed', pageTitle: '页面已删除 - 启明市第一中学' },
  { pattern: /^\/services\/laboratory$/, componentKey: 'school-lab-management', pageTitle: '实验室管理 - 启明市第一中学' },
  { pattern: /^\/services\/laboratory\/duty-june-2026$/, componentKey: 'school-duty-schedule', pageTitle: '2026年6月实验楼值班安排 - 启明市第一中学' },
  { pattern: /^\/services\/laboratory\/duty-log$/, componentKey: 'school-duty-log', pageTitle: '实验楼值班日志 - 启明市第一中学' },
  { pattern: /^\/services\/information-center$/, componentKey: 'school-information-center', pageTitle: '信息中心 - 启明市第一中学' },
  { pattern: /^\/services\/information-center\/maintenance$/, componentKey: 'school-maintenance-ticket', pageTitle: '系统维护记录 - 启明市第一中学' },
  { pattern: /^\/services\/information-center\/system-services$/, componentKey: 'school-system-services', pageTitle: '系统服务 - 启明市第一中学' },
  { pattern: /^\/admin$/, componentKey: 'school-admin-denied', pageTitle: '403 Forbidden' },
  { pattern: /^\/services\/assets$/, componentKey: 'school-assets', pageTitle: '设备报废公示 - 启明市第一中学' },
  { pattern: /^\/services\/information-center\/network-archive$/, componentKey: 'school-network-archive', pageTitle: '网络归档检索 - 启明市第一中学' },
  { pattern: /^\/services\/legacy-archive$/, componentKey: 'school-legacy-archive', pageTitle: '校园旧服务归档 - 启明市第一中学' },
  { pattern: /^\/services\/legacy-archive\/CLS-ARCHIVE-18$/i, componentKey: 'school-legacy-index', pageTitle: '高二（3）班公共资料索引' },
  { pattern: /^\/student\/shenzhi$/, componentKey: 'not-found', pageTitle: '未找到的学生' },
]

const studentRoutes: RouteDefinition[] = [
  { pattern: /^\/$/, componentKey: 'student-entry', pageTitle: '学生信息系统' },
  { pattern: /^\/login$/, componentKey: 'student-login', pageTitle: '登录 - 学生信息系统' },
  { pattern: /^\/dashboard$/, componentKey: 'student-dashboard', pageTitle: '系统首页 - 学生信息系统' },
  { pattern: /^\/student-status$/, componentKey: 'student-status', pageTitle: '学籍信息 - 学生信息系统' },
  { pattern: /^\/student-status\/cache$/, componentKey: 'student-status-cache', pageTitle: '学籍变更记录缓存 - 学生信息系统' },
  { pattern: /^\/attendance$/, componentKey: 'student-attendance', pageTitle: '考勤记录 - 学生信息系统' },
  { pattern: /^\/card-records$/, componentKey: 'student-card-records', pageTitle: '校园卡记录 - 学生信息系统' },
  { pattern: /^\/class-list$/, componentKey: 'student-class-list', pageTitle: '班级名单 - 学生信息系统' },
  { pattern: /^\/messages$/, componentKey: 'student-messages', pageTitle: '消息中心 - 学生信息系统' },
  { pattern: /^\/class-group-history$/, componentKey: 'student-group-history', pageTitle: '班级群历史 - 学生信息系统' },
  { pattern: /^\/access-query$/, componentKey: 'student-access-query', pageTitle: '门禁记录查询 - 学生信息系统' },
  { pattern: /^\/lab-access-records$/, componentKey: 'student-lab-access-records', pageTitle: '实验楼访问记录 - 学生信息系统' },
  { pattern: /^\/lab-reservations$/, componentKey: 'student-lab-reservations', pageTitle: '实验室使用申请记录 - 学生信息系统' },
  { pattern: /^\/equipment-loans$/, componentKey: 'student-equipment-loans', pageTitle: '实验室设备借用记录 - 学生信息系统' },
  { pattern: /^\/camera-exceptions$/, componentKey: 'student-camera-exceptions', pageTitle: '监控存储异常记录 - 学生信息系统' },
  { pattern: /^\/system-search$/, componentKey: 'student-system-search', pageTitle: '系统检索 - 学生信息系统' },
  { pattern: /^\/admin-attempts$/, componentKey: 'student-admin-attempts', pageTitle: '访问失败记录 - 学生信息系统' },
  { pattern: /^\/system-help\/permission-request$/, componentKey: 'student-permission-help', pageTitle: '权限申请说明 - 学生信息系统' },
  { pattern: /^\/admin\/history$/, componentKey: 'student-admin-history', pageTitle: '历史查询 - 学生信息系统' },
  { pattern: /^\/security\/devices$/, componentKey: 'student-login-devices', pageTitle: '登录与设备 - 学生信息系统' },
  { pattern: /^\/security\/device\/TERM-OLD-03$/i, componentKey: 'student-device-detail', pageTitle: '维护终端03 - 学生信息系统' },
  { pattern: /^\/files\/student-cache-2024010318\/recover$/, componentKey: 'student-cache-recovery', pageTitle: '缓存恢复 - 学生信息系统' },
  { pattern: /^\/investigation\/account-relations$/, componentKey: 'student-account-relations', pageTitle: '账号关联查询 - 学生信息系统' },
  { pattern: /^\/security\/activity$/, componentKey: 'student-last-activity', pageTitle: '最后活动 - 学生信息系统' },
  { pattern: /^\/downloads$/, componentKey: 'student-downloads', pageTitle: '文件下载 - 学生信息系统' },
  { pattern: /^\/investigation\/floor-plan$/, componentKey: 'student-floor-plan', pageTitle: '旧实验楼三层平面图 - 学生信息系统' },
  { pattern: /^\/investigation\/network-access$/, componentKey: 'student-network-access', pageTitle: '网络接入记录 - 学生信息系统' },
  { pattern: /^\/files\/camera-cache\/recover$/, componentKey: 'student-camera-recovery', pageTitle: 'CAM-07缓存恢复 - 学生信息系统' },
  { pattern: /^\/files\/camera-cache\/media\/([^/]+)$/, componentKey: 'student-media-metadata', pageTitle: '媒体元数据 - 学生信息系统' },
  { pattern: /^\/terminal\/TERM-OLD-03\/cache$/, componentKey: 'student-terminal-cache', pageTitle: '终端缓存目录 - 学生信息系统' },
  { pattern: /^\/terminal\/TERM-OLD-03\/pending\/2024010307$/, componentKey: 'student-sync-status', pageTitle: '同步状态' },
  { pattern: /^\/terminal\/TERM-OLD-03\/pending\/([^/]+)$/, componentKey: 'student-pending-detail', pageTitle: '待同步对象属性 - 学生信息系统' },
  { pattern: /^\/investigation\/class-archive$/, componentKey: 'student-class-archive', pageTitle: '原始班级名单恢复 - 学生信息系统' },
  { pattern: /^\/investigation\/monitor-records$/, componentKey: 'student-monitor-records', pageTitle: '班长缓存记录 - 学生信息系统' },
  { pattern: /^\/investigation\/data-transfer$/, componentKey: 'student-transfer-records', pageTitle: '数据传输记录 - 学生信息系统' },
  { pattern: /^\/student\/2024010318$/, componentKey: 'student-missing', pageTitle: '沈栀' },
]

const archiveRoutes: RouteDefinition[] = [
  { pattern: /^\/EXT-BACKUP-QM-0616$/, componentKey: 'archive-home', pageTitle: '外部归档节点' },
  { pattern: /^\/EXT-BACKUP-QM-0616\/manifest$/, componentKey: 'archive-manifest', pageTitle: '外部备份清单' },
  { pattern: /^\/EXT-BACKUP-QM-0616\/plan$/, componentKey: 'archive-plan', pageTitle: '计划目录' },
  { pattern: /^\/EXT-BACKUP-QM-0616\/incident\/0616$/, componentKey: 'archive-incident', pageTitle: '0616事件记录' },
]

function cleanInput(input: string): { hostname: string; pathname: string } {
  let value = input.trim().replace(/^https?:\/\//i, '')
  value = value.split(/[?#]/, 1)[0] ?? ''
  const slashIndex = value.indexOf('/')
  const hostname = (slashIndex === -1 ? value : value.slice(0, slashIndex)).toLowerCase()
  let pathname = slashIndex === -1 ? '/' : value.slice(slashIndex)
  pathname = `/${pathname.replace(/^\/+/, '').replace(/\/{2,}/g, '/')}`
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, '')
  return { hostname, pathname }
}

function matchRoute(
  hostname: string,
  pathname: string,
  siteType: SiteType,
  definitions: RouteDefinition[],
): GameRoute {
  for (const definition of definitions) {
    const match = pathname.match(definition.pattern)
    if (match) {
      return {
        hostname,
        pathname,
        url: `${hostname}${pathname}`,
        pageTitle: definition.pageTitle,
        siteType,
        componentKey: definition.componentKey,
        params: match[1] ? { id: decodeURIComponent(match[1]) } : undefined,
      }
    }
  }
  return {
    hostname,
    pathname,
    url: `${hostname}${pathname}`,
    pageTitle: '页面未找到',
    siteType,
    componentKey: 'not-found',
  }
}

export function parseGameUrl(input: string): GameRoute {
  const { hostname, pathname } = cleanInput(input)
  if (hostname === SCHOOL_HOST) return matchRoute(hostname, pathname, 'school', schoolRoutes)
  if (hostname === STUDENT_HOST) return matchRoute(hostname, pathname, 'student', studentRoutes)
  if (hostname === ARCHIVE_HOST) return matchRoute(hostname, pathname, 'archive', archiveRoutes)
  return {
    hostname,
    pathname,
    url: `${hostname}${pathname}`,
    pageTitle: '无法访问此网站',
    siteType: 'unknown',
    componentKey: 'not-found',
  }
}
