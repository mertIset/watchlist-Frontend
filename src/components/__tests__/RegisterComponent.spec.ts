// src/components/__tests__/RegisterComponent.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import RegisterComponent from '../RegisterComponent.vue'
import { AuthService } from '@/services/authService'
import type { AuthResponse } from '@/types/auth'

// Mock AuthService
vi.mock('@/services/authService', () => ({
  AuthService: {
    register: vi.fn()
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
    { path: '/login', component: { template: '<div>Login</div>' } }
  ]
})

describe('RegisterComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mountComponent = () => {
    return mount(RegisterComponent, {
      global: {
        plugins: [router]
      }
    })
  }

  const fillForm = async (wrapper: any, data: any) => {
    await wrapper.find('#firstName').setValue(data.firstName || '')
    await wrapper.find('#lastName').setValue(data.lastName || '')
    await wrapper.find('#username').setValue(data.username || '')
    await wrapper.find('#email').setValue(data.email || '')
    await wrapper.find('#password').setValue(data.password || '')
    await wrapper.find('#confirmPassword').setValue(data.confirmPassword || '')
  }

  it('sollte korrekt rendern', () => {
    const wrapper = mountComponent()

    expect(wrapper.find('h2').text()).toBe('Registrieren')
    expect(wrapper.find('#firstName').exists()).toBe(true)
    expect(wrapper.find('#lastName').exists()).toBe(true)
    expect(wrapper.find('#username').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('#confirmPassword').exists()).toBe(true)
  })

  it('sollte Fehler anzeigen wenn Felder leer sind', async () => {
    const wrapper = mountComponent()

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').text()).toBe('Bitte füllen Sie alle Felder aus')
  })

  it('sollte Fehler anzeigen wenn Passwörter nicht übereinstimmen', async () => {
    const wrapper = mountComponent()

    await fillForm(wrapper, {
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different'
    })

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').text()).toBe('Die Passwörter stimmen nicht überein')
  })

  it('sollte Fehler anzeigen wenn Passwort zu kurz ist', async () => {
    const wrapper = mountComponent()

    await fillForm(wrapper, {
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'test@example.com',
      password: '12345',
      confirmPassword: '12345'
    })

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').text()).toBe('Das Passwort muss mindestens 6 Zeichen lang sein')
  })

  it('sollte erfolgreich registrieren', async () => {
    const mockResponse: AuthResponse = {
      success: true,
      message: 'Registrierung erfolgreich!',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: '2024-01-01T00:00:00Z'
      }
    }

    vi.mocked(AuthService.register).mockResolvedValue(mockResponse)

    const wrapper = mountComponent()

    await fillForm(wrapper, {
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    })

    await wrapper.find('form').trigger('submit.prevent')

    expect(AuthService.register).toHaveBeenCalledWith({
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('sollte Erfolg-Nachricht anzeigen nach erfolgreicher Registrierung', async () => {
    const mockResponse: AuthResponse = {
      success: true,
      message: 'Registrierung erfolgreich!',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: '2024-01-01T00:00:00Z'
      }
    }

    vi.mocked(AuthService.register).mockResolvedValue(mockResponse)

    const wrapper = mountComponent()

    await fillForm(wrapper, {
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    })

    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.success-message').text()).toBe('Registrierung erfolgreich! Sie werden weitergeleitet...')
  })

  it('sollte Fehler bei bereits existierendem Benutzernamen anzeigen', async () => {
    const mockResponse: AuthResponse = {
      success: false,
      message: 'Username bereits vergeben!'
    }

    vi.mocked(AuthService.register).mockResolvedValue(mockResponse)

    const wrapper = mountComponent()

    await fillForm(wrapper, {
      firstName: 'Test',
      lastName: 'User',
      username: 'existinguser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    })

    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-message').text()).toBe('Username bereits vergeben!')
  })

  it('sollte Loading-State korrekt anzeigen', async () => {
    vi.mocked(AuthService.register).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        message: 'Success'
      }), 100))
    )

    const wrapper = mountComponent()

    await fillForm(wrapper, {
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    })

    const submitButton = wrapper.find('button[type="submit"]')
    await wrapper.find('form').trigger('submit.prevent')

    expect(submitButton.text()).toBe('Registrierung läuft...')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('sollte Login-Link enthalten', () => {
    const wrapper = mountComponent()

    const loginLink = wrapper.find('router-link[to="/login"]')
    expect(loginLink.exists()).toBe(true)
    expect(loginLink.text()).toBe('Hier anmelden')
  })
})
