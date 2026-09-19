import { create } from 'zustand'
import * as authService from '../services/authService'
import type { AuthUser } from '../services/authService'

interface AuthState {
  user: AuthUser | null
  hasCompletedFactorySetup: boolean
  hydrated: boolean

  hydrate: () => void
  signup: (input: {
    fullName: string
    email: string
    company: string
    password: string
  }) => Promise<void>

  login: (input: {
    email: string
    password: string
  }) => Promise<void>

  logout: () => Promise<void>

  markFactorySetupComplete: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  hasCompletedFactorySetup: false,

  hydrated: false,

  hydrate: () => {
    const state = authService.getAuthState()

    set({
      user: state.user,
      hasCompletedFactorySetup:
        state.hasCompletedFactorySetup,
      hydrated: true,
    })
  },

  signup: async (input) => {
    const user = await authService.signup(input)

    set({
      user,
      hasCompletedFactorySetup: false,
    })
  },

  login: async (input) => {
    const user = await authService.login(input)

    const state = authService.getAuthState()

    set({
      user,
      hasCompletedFactorySetup:
        state.hasCompletedFactorySetup,
    })
  },

  logout: async () => {
    await authService.logout()

    set({
      user: null,
      hasCompletedFactorySetup: false,
    })
  },

  markFactorySetupComplete: async () => {
    await authService.completeFactorySetup()

    set({
      hasCompletedFactorySetup: true,
    })
  },
}))