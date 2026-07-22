export function UnknownSiteError({ hostname }: { hostname: string }) {
  return (
    <div className="network-error">
      <div className="network-error-icon" aria-hidden="true">⌁</div>
      <h2>无法访问此网站</h2>
      <p>无法找到 <strong>{hostname || '输入的地址'}</strong> 的服务器。</p>
      <p className="error-code">ERR_NAME_NOT_RESOLVED</p>
      <div className="network-tip">请检查游戏内地址是否正确。可访问 www.qiming-high.edu.cn 或 stu.qiming-high.edu.cn。</div>
    </div>
  )
}
