// src/components/__tests__/LoginComponent.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import LoginComponent from '../LoginComponent.vue'
import { AuthService } from '@/services/authService'
import type { AuthResponse } from '@/types/auth'

// Mock AuthService
vi.mock('@/services/authService', () => ({
  AuthService: {
    login: vi.fn()
  }
}))

// Mock useAuth
vi.mock('@/stores/auth', () => ({
  useAuth: () => ({
    setUser: vi.fn()
  })
}))

// Create mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/register', component: { template: '<div>Register</div>' } }
  ]
})

describe('LoginComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mountComponent = () => {
    return mount(LoginComponent, {
      global: {
        plugins: [router]
      }
    })
  }

  it('sollte korrekt rendern', () => {
    const wrapper = mountComponent()

    expect(wrapper.find('h2').text()).toBe('Anmelden')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('sollte Fehler anzeigen wenn Felder leer sind', async () => {
    const wrapper = mountComponent()

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.find('.error-message').text()).toBe('Bitte füllen Sie alle Felder aus')
  })

  it('sollte erfolgreich einloggen', async () => {
    const mockResponse: AuthResponse = {
      success: true,
      message: 'Login erfolgreich!',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: '2024-01-01T00:00:00Z'
      }
    }

    vi.mocked(AuthService.login).mockResolvedValue(mockResponse)

    const wrapper = mountComponent()

    // Felder ausfüllen
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpassword')

    // Form submitten
    await wrapper.find('form').trigger('submit.prevent')

    expect(AuthService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'testpassword'
    })
  })

  it('sollte Fehler bei ungültigen Anmeldedaten anzeigen', async () => {
    const mockResponse: AuthResponse = {
      success: false,
      message: 'Ungültige Anmeldedaten!'
    }

    vi.mocked(AuthService.login).mockResolvedValue(mockResponse)

    const wrapper = mountComponent()

    await wrapper.find('input[type="text"]').setValue('wronguser')
    await wrapper.find('input[type="password"]').setValue('wrongpassword')
    await wrapper.find('form').trigger('submit.prevent')

    // Wait for DOM update
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-message').text()).toBe('Ungültige Anmeldedaten!')
  })

  it('sollte Loading-State korrekt anzeigen', async () => {
    // Mock eine verzögerte Antwort
    vi.mocked(AuthService.login).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        message: 'Success'
      }), 100))
    )

    const wrapper = mountComponent()

    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpassword')

    const submitButton = wrapper.find('button[type="submit"]')
    await wrapper.find('form').trigger('submit.prevent')

    // Should show loading state
    expect(submitButton.text()).toBe('Anmelden...')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('sollte Netzwerk-Fehler behandeln', async () => {
    vi.mocked(AuthService.login).mockRejectedValue(new Error('Network Error'))

    const wrapper = mountComponent()

    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpassword')
    await wrapper.find('form').trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-message').text()).toBe('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
  })

  it('sollte Register-Link enthalten', () => {
    const wrapper = mountComponent()

    const registerLink = wrapper.find('router-link[to="/register"]')
    expect(registerLink.exists()).toBe(true)
    expect(registerLink.text()).toBe('Registrieren Sie sich hier')
  })
})
