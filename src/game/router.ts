import type { ComponentKey, GameRoute, SiteType } from '../types/game'

const SCHOOL_HOST = 'www.qiming-high.edu.cn'
const STUDENT_HOST = 'stu.qiming-high.edu.cn'

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
  { pattern: /^\/downloads$/, componentKey: 'student-downloads', pageTitle: '文件下载 - 学生信息系统' },
  { pattern: /^\/student\/2024010318$/, componentKey: 'student-missing', pageTitle: '沈栀' },
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
  return {
    hostname,
    pathname,
    url: `${hostname}${pathname}`,
    pageTitle: '无法访问此网站',
    siteType: 'unknown',
    componentKey: 'not-found',
  }
}
