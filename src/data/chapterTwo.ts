import { newsItems, noticeItems, type ArticleRecord } from './content'

export interface SchoolSearchResult { article: ArticleRecord; section: 'news' | 'notices' }
const aliases: Record<string, string[]> = {
  '高二三班': ['高二（3）班'],
  '高二(3)班': ['高二（3）班'],
  '实验楼': ['实验楼', '实验器材'],
  '实验器材整理': ['实验器材整理'],
  '旧实验楼': ['旧实验楼', '实验器材整理'],
  '写给未来的自己': ['写给未来的自己'],
  '窗外': ['写给未来的自己'],
  '第十二号座位': ['写给未来的自己'],
  '顾言': ['顾言'],
}

export function searchSchoolContent(query: string): SchoolSearchResult[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized || normalized.includes('沈栀') || normalized.includes('2024010318')) return []
  const terms = [...new Set([normalized, ...(aliases[normalized] ?? [])])]
  return [...newsItems.map((article) => ({ article, section: 'news' as const })), ...noticeItems.map((article) => ({ article, section: 'notices' as const }))]
    .filter(({ article }) => terms.some((term) => `${article.title}${article.summary}${article.paragraphs.join('')}`.toLowerCase().includes(term.toLowerCase())))
}

export function isShenzhiSearch(query: string): boolean {
  const normalized = query.trim().toLowerCase()
  return normalized.includes('沈栀') || normalized.includes('2024010318')
}
