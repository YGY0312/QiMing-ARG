import { ModalFrame } from './ModalFrame'
import type { VirtualFileDefinition } from '../data/virtualFiles'

export function VirtualFileViewer({ file, onClose, revealed = false, onReveal }: { file: VirtualFileDefinition; onClose: () => void; revealed?: boolean; onReveal?: () => void }) {
  return (
    <ModalFrame title={file.name} onClose={onClose} className="file-viewer-modal">
      <div className="virtual-file-toolbar">
        <span>文件预览</span>
        <small>来源：{file.source} · 只读</small>
      </div>
      {(file.kind === 'text' || file.kind === 'document') && <pre className={`virtual-file-content ${file.kind}`}>{file.content}</pre>}
      {file.kind === 'seat-chart' && <div className="seat-chart" aria-label="五月座位表">{file.seats?.map((seat) => <div className={seat.hiddenName ? 'seat anomaly-seat' : 'seat'} key={seat.number}><small>{seat.number}</small><strong>{revealed && seat.hiddenName ? seat.hiddenName : seat.name}</strong></div>)}</div>}
      {file.kind === 'table' && <div className="virtual-table-wrap"><table className="virtual-table"><thead><tr>{file.headers?.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{file.rows?.map((row, index) => <tr key={`${index}-${row.join('-')}`}>{row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`}>{cell}</td>)}</tr>)}{revealed && file.hiddenRows?.map((row, index) => <tr className="recovered-row" key={`hidden-${index}`}>{row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`}>{cell}</td>)}</tr>)}</tbody></table></div>}
      {file.content && file.kind === 'table' && <p className="virtual-file-note">{file.content}</p>}
      {file.metadata && revealed && <dl className="file-metadata">{file.metadata.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '（空）'}</dd></div>)}</dl>}
      {file.reveal && !revealed && <button className="file-reveal-action" type="button" onClick={onReveal}>{file.reveal.label}</button>}
    </ModalFrame>
  )
}
