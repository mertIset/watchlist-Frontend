// src/stores/auth.ts
import { ref, computed } from 'vue'
import type { User } from '@/types/auth'

// Global state
const currentUser = ref<User | null>(null)
const isAuthenticated = computed(() => currentUser.value !== null)

// Load user from localStorage on app start
const storedUser = localStorage.getItem('currentUser')
if (storedUser) {
  try {
    currentUser.value = JSON.parse(storedUser)
  } catch (error) {
    console.error('Error parsing stored user:', error)
    localStorage.removeItem('currentUser')
  }
}

export function useAuth() {
  const setUser = (user: User | null) => {
    currentUser.value = user
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('currentUser')
    }
  }

  const logout = () => {
    setUser(null)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return {
    currentUser: computed(() => currentUser.value),
    isAuthenticated,
    setUser,
    logout,
    updateUser
  }
}
