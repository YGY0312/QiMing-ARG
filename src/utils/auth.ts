import type { StudentAccountId } from '../types/game'

export interface StudentAccountDefinition {
  id: StudentAccountId
  studentId: string
  password: string
  name: string
  className: string
}

export const STUDENT_ACCOUNTS: Record<string, StudentAccountDefinition> = {
  lin_mo: { id: 'lin_mo', studentId: '2024010307', password: 'argtest', name: '林默', className: '高二（3）班' },
  zhou_xun: { id: 'zhou_xun', studentId: '2024010312', password: 'ZX0913', name: '周寻', className: '高二（3）班' },
}

export function generateCaptcha(random: () => number = Math.random): string {
  const value = Math.min(Math.max(random(), 0), 0.999999999)
  return String(1000 + Math.floor(value * 9000))
}

export function generateDifferentCaptcha(currentCaptcha: string, random: () => number = Math.random): string {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const next = generateCaptcha(random)
    if (next !== currentCaptcha) return next
  }
  return currentCaptcha === '9999' ? '1000' : String(Number(currentCaptcha || '999') + 1).padStart(4, '0')
}

export function isCaptchaValid(enteredCaptcha: string, currentCaptcha: string): boolean {
  return /^\d{4}$/.test(currentCaptcha) && enteredCaptcha.trim() === currentCaptcha
}

export function authenticateStudent(studentId: string, password: string, enteredCaptcha: string, currentCaptcha: string): StudentAccountId | null {
  if (!isCaptchaValid(enteredCaptcha, currentCaptcha)) return null
  const normalizedId = studentId.trim()
  const account = Object.values(STUDENT_ACCOUNTS).find((candidate) => candidate.studentId === normalizedId && candidate.password === password)
  return account?.id ?? null
}

export function authenticateSavedStudent(accountId: StudentAccountId, enteredCaptcha: string, currentCaptcha: string): StudentAccountId | null {
  return STUDENT_ACCOUNTS[accountId] && isCaptchaValid(enteredCaptcha, currentCaptcha) ? accountId : null
}

export function getStudentAccount(accountId: StudentAccountId | null | undefined): StudentAccountDefinition | null {
  return accountId ? STUDENT_ACCOUNTS[accountId] ?? null : null
}

export function validateLogin(studentId: string, password: string, enteredCaptcha: string, currentCaptcha: string): boolean {
  return authenticateStudent(studentId, password, enteredCaptcha, currentCaptcha) !== null
}
