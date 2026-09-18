// MOCK authentication only. There is no real backend, no password hashing,
// no session security — this exists purely so the frontend has a coherent
// signed-in/signed-out flow to build against. Every function here has the
// shape of what would eventually call Django's auth endpoints:
//
//   signup() -> POST /api/auth/signup
//   login()  -> POST /api/auth/login
//   logout() -> POST /api/auth/logout
//   currentUser() -> GET /api/auth/me
import { loadJSON, saveJSON } from './storageService'

export interface AuthUser {
  name: string
  email: string
  company: string
}

interface StoredAuthState {
  user: AuthUser | null
  hasCompletedFactorySetup: boolean
}

const KEY = 'auth'

function delay<T>(v: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(v), ms))
}

export function getAuthState(): StoredAuthState {
  return loadJSON<StoredAuthState>(KEY, { user: null, hasCompletedFactorySetup: false })
}

export async function signup(input: { fullName: string; email: string; company: string; password: string }): Promise<AuthUser> {
  // NOTE: password is intentionally discarded — this is not real auth.
  const user: AuthUser = { name: input.fullName, email: input.email, company: input.company }
  saveJSON(KEY, { user, hasCompletedFactorySetup: false })
  return delay(user)
}

export async function login(input: { email: string; password: string }): Promise<AuthUser> {
  const existing = getAuthState()
  const user: AuthUser = existing.user ?? { name: 'Admin User', email: input.email, company: 'VIT Manufacturing' }
  saveJSON(KEY, { user, hasCompletedFactorySetup: true })
  return delay(user)
}

export async function logout(): Promise<void> {
  saveJSON(KEY, { user: null, hasCompletedFactorySetup: false })
  return delay(undefined)
}

export async function completeFactorySetup(): Promise<void> {
  const state = getAuthState()
  saveJSON(KEY, { ...state, hasCompletedFactorySetup: true })
  return delay(undefined)
}
