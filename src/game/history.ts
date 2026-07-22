export interface HistoryState {
  history: string[]
  historyIndex: number
}

export function pushHistory(state: HistoryState, url: string): HistoryState {
  if (state.history[state.historyIndex] === url) return state
  const history = [...state.history.slice(0, state.historyIndex + 1), url]
  return { history, historyIndex: history.length - 1 }
}

export function goBack(state: HistoryState): HistoryState {
  return state.historyIndex > 0 ? { ...state, historyIndex: state.historyIndex - 1 } : state
}

export function goForward(state: HistoryState): HistoryState {
  return state.historyIndex < state.history.length - 1
    ? { ...state, historyIndex: state.historyIndex + 1 }
    : state
}
