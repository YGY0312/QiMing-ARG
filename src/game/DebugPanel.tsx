import { clueDefinitions } from '../data/story'
import { useGame } from './GameContext'
import type { ClueId } from '../types/game'

export const DEBUG_PANEL_MARKER = 'QIMING_DEV_DEBUG_PANEL'
export function shouldShowDebugPanel(isDev: boolean): boolean { return isDev }

export function DebugPanel() {
  const {
    state, activeTab, discoverClue, clearClue, forceEvent, resetChapterOne, resetChapterTwo,
    loginStudent, logoutStudent, resetStudentSessions, addSavedAccount, removeSavedAccount,
    openStudentTab, focusSchoolTab, resetTabs, setEvidenceSidebarCollapsed, playChapterTwoEnding, clearChapterTwoAnomalyHistory, navigate, revealFileSection,
  } = useGame()
  const activeAccount = activeTab.studentSession?.accountId ?? '未登录'

  return (
    <details className="debug-panel" data-dev-marker={DEBUG_PANEL_MARKER}>
      <summary>DEV · 章节调试</summary>
      <div className="debug-body">
        <p>存档版本：5　第一章：{state.chapterOneCompleted ? '已完成' : '调查中'}　第二章：{state.chapterTwoCompleted ? '已完成' : state.chapterTwoStarted ? '调查中' : '未开始'}　当前标签账号：{activeAccount}</p>
        <div className="debug-actions">
          <button type="button" onClick={() => loginStudent('lin_mo', activeTab.id)}>在当前标签登录林默</button>
          <button type="button" onClick={() => loginStudent('zhou_xun', activeTab.id)}>在当前标签登录周寻</button>
          <button type="button" onClick={() => logoutStudent(activeTab.id)}>退出当前标签账号</button>
          <button type="button" onClick={resetStudentSessions}>重置所有学生会话</button>
          <button type="button" onClick={() => discoverClue('zhou_credentials')}>发现 zhou_credentials</button>
          <button type="button" onClick={focusSchoolTab}>聚焦学校官网标签</button>
          <button type="button" onClick={openStudentTab}>新建学生系统标签</button>
          <button type="button" onClick={resetTabs}>重置多标签布局</button>
          <button type="button" onClick={() => addSavedAccount('lin_mo')}>保存林默账号</button>
          <button type="button" onClick={() => addSavedAccount('zhou_xun')}>保存周寻账号</button>
          <button type="button" onClick={() => removeSavedAccount('lin_mo')}>移除林默账号</button>
          <button type="button" onClick={() => removeSavedAccount('zhou_xun')}>移除周寻账号</button>
          <button type="button" onClick={() => setEvidenceSidebarCollapsed(!state.evidenceSidebarCollapsed)}>切换关键事实侧栏</button>
          <button type="button" onClick={() => forceEvent('zhou_draft_revealed')}>解锁周寻草稿</button>
          <button type="button" onClick={() => forceEvent('investigation_backup_unlocked')}>解锁调查备份</button>
          <button type="button" onClick={() => forceEvent('chapter_one_completed')}>标记第一章完成</button>
          <button type="button" onClick={resetChapterOne}>重置第一章进度</button>
          <button type="button" onClick={() => forceEvent('chapter_two_started')}>开始第二章</button>
          <button type="button" onClick={() => forceEvent('shenzhi_cache_unlocked')}>解锁学籍缓存</button>
          <button type="button" onClick={() => forceEvent('old_building_access_unlocked')}>解锁门禁查询</button>
          <button type="button" onClick={() => forceEvent('chapter_two_final_file_unlocked')}>解锁第二章最终文件</button>
          <button type="button" onClick={() => forceEvent('chapter_two_completed')}>标记第二章完成</button>
          <button type="button" onClick={resetChapterTwo}>仅重置第二章进度</button>
          <button type="button" onClick={playChapterTwoEnding}>播放第二章结尾</button>
          <button type="button" onClick={clearChapterTwoAnomalyHistory}>清除第二章异常历史</button>
          <button type="button" onClick={() => navigate('www.qiming-high.edu.cn/search/%E6%B2%88%E6%A0%80')}>跳转官网搜索</button>
          <button type="button" onClick={() => navigate('stu.qiming-high.edu.cn/class-list')}>跳转名单历史</button>
          <button type="button" onClick={() => discoverClue('class_size_mismatch')}>标记名单人数核对</button>
          <button type="button" onClick={() => navigate('stu.qiming-high.edu.cn/downloads')}>跳转周寻文件页</button>
          <button type="button" onClick={() => discoverClue('seat_chart_shenzhi')}>标记座位恢复</button>
          <button type="button" onClick={() => discoverClue('hidden_grade_row')}>标记隐藏成绩</button>
          <button type="button" onClick={() => navigate('stu.qiming-high.edu.cn/class-group-history')}>跳转班级群历史</button>
          <button type="button" onClick={() => discoverClue('shenzhi_removed_from_group')}>标记移群记录</button>
          <button type="button" onClick={() => navigate('stu.qiming-high.edu.cn/student-status/cache')}>跳转学籍缓存</button>
          <button type="button" onClick={() => discoverClue('shenzhi_dropout_backdated')}>标记日期倒签</button>
          <button type="button" onClick={() => navigate('stu.qiming-high.edu.cn/access-query')}>跳转门禁查询</button>
          <button type="button" onClick={() => revealFileSection('access-query-enter')}>注入进入查询结果</button>
          <button type="button" onClick={() => revealFileSection('access-query-exit')}>注入离开查询结果</button>
          <button type="button" onClick={() => discoverClue('shenzhi_exit_missing')}>标记门禁比对</button>
        </div>
        <details><summary>查看所有标签状态</summary><pre>{JSON.stringify({ activeTabId: state.activeTabId, tabs: state.tabs }, null, 2)}</pre></details>
        <details><summary>按标签调试学生会话</summary><div className="debug-actions">{state.tabs.filter((tab) => tab.siteType === 'student').map((tab) => <div key={tab.id}><code>{tab.id} · {tab.studentSession?.accountId ?? '未登录'}</code><button type="button" onClick={() => loginStudent('lin_mo', tab.id)}>登录林默</button><button type="button" onClick={() => loginStudent('zhou_xun', tab.id)}>登录周寻</button><button type="button" onClick={() => logoutStudent(tab.id)}>退出</button></div>)}</div></details>
        <details><summary>查看已保存账号</summary><pre>{JSON.stringify(state.savedStudentAccounts, null, 2)}</pre></details>
        <ul>{(Object.keys(clueDefinitions) as ClueId[]).map((id) => <li key={id}><span>{clueDefinitions[id].title}</span><code>{id}</code><button type="button" onClick={() => state.clues[id].discovered ? clearClue(id) : discoverClue(id)}>{state.clues[id].discovered ? '清除' : '发现'}</button></li>)}</ul>
        <p>已触发事件：{state.triggeredEvents.join('、') || '无'}</p>
        <p>第二章事件：{state.triggeredEvents.filter((id) => id.startsWith('chapter_two') || id.includes('shenzhi_cache') || id.includes('old_building_access')).join('、') || '无'}</p>
      </div>
    </details>
  )
}
