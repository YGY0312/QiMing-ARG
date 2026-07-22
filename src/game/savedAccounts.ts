import { getStudentAccount } from '../utils/auth'
import type { SavedStudentAccount, StudentAccountId } from '../types/game'

export function savedAccountFromId(accountId: StudentAccountId, savedAt = new Date().toISOString()): SavedStudentAccount | null {
  const account = getStudentAccount(accountId)
  return account ? { accountId: account.id, studentNumber: account.studentId, displayName: account.name, savedAt } : null
}

export function createDefaultSavedAccounts(savedAt = new Date().toISOString()): SavedStudentAccount[] {
  const lin = savedAccountFromId('lin_mo', savedAt)
  return lin ? [lin] : []
}

export function addSavedStudentAccount(accounts: SavedStudentAccount[], accountId: StudentAccountId, savedAt = new Date().toISOString()): SavedStudentAccount[] {
  if (accounts.some((account) => account.accountId === accountId)) return accounts
  const saved = savedAccountFromId(accountId, savedAt)
  return saved ? [...accounts, saved] : accounts
}

export function addSavedAccountRecord(accounts: SavedStudentAccount[], account: SavedStudentAccount): SavedStudentAccount[] {
  return accounts.some((item) => item.accountId === account.accountId) ? accounts : [...accounts, account]
}

export function removeSavedStudentAccount(accounts: SavedStudentAccount[], accountId: StudentAccountId): SavedStudentAccount[] {
  return accounts.filter((account) => account.accountId !== accountId)
}

export function formatSavedAccountLabel(account: SavedStudentAccount): string {
  return `${account.studentNumber}（${account.displayName}）`
}
