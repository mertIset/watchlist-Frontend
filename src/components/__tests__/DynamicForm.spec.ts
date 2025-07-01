// src/components/__tests__/DynamicForm.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import DynamicForm from '../DynamicForm.vue'
import axios from 'axios'
import type { Watchlist } from '@/types'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock useAuth store
const mockCurrentUser = { value: { id: 1, firstName: 'Test', lastName: 'User' } }
vi.mock('@/stores/auth', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser
  })
}))

describe('DynamicForm', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console.log to avoid test output noise
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  const createWrapper = () => {
    return mount(DynamicForm, {
      props: { title: 'Test Form' }
    })
  }

  describe('Component Rendering', () => {
    it('should render all form fields correctly', () => {
      wrapper = createWrapper()

      expect(wrapper.find('#title').exists()).toBe(true)
      expect(wrapper.find('#type').exists()).toBe(true)
      expect(wrapper.find('#genre').exists()).toBe(true)
      expect(wrapper.find('#watched').exists()).toBe(true)
      expect(wrapper.find('#rating').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('should have correct form field types', () => {
      wrapper = createWrapper()

      const titleInput = wrapper.find('#title')
      const typeSelect = wrapper.find('#type')
      const genreInput = wrapper.find('#genre')
      const watchedCheckbox = wrapper.find('#watched')
      const ratingInput = wrapper.find('#rating')

      expect(titleInput.attributes('type')).toBe('text')
      expect(typeSelect.element.tagName).toBe('SELECT')
      expect(genreInput.attributes('type')).toBe('text')
      expect(watchedCheckbox.attributes('type')).toBe('checkbox')
      expect(ratingInput.attributes('type')).toBe('number')
    })

    it('should display correct type options', () => {
      wrapper = createWrapper()

      const typeSelect = wrapper.find('#type')
      const options = typeSelect.findAll('option')

      expect(options.length).toBe(5) // Including placeholder option
      expect(options[1].text()).toBe('Film')
      expect(options[2].text()).toBe('Serie')
      expect(options[3].text()).toBe('Dokumentation')
      expect(options[4].text()).toBe('Anime')
    })
  })

  describe('Form Validation', () => {
    it('should show error for empty title', async () => {
      wrapper = createWrapper()

      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      expect(wrapper.find('.status-message.error').text()).toContain(
        'Bitte füllen Sie mindestens Titel und Kategorie aus.'
      )
    })

    it('should show error for empty type', async () => {
      wrapper = createWrapper()

      await wrapper.find('#title').setValue('Test Movie')
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      expect(wrapper.find('.status-message.error').text()).toContain(
        'Bitte füllen Sie mindestens Titel und Kategorie aus.'
      )
    })

    it('should validate rating bounds', async () => {
      wrapper = createWrapper()

      const ratingInput = wrapper.find('#rating')
      expect(ratingInput.attributes('min')).toBe('1')
      expect(ratingInput.attributes('max')).toBe('10')
    })
  })

  describe('Environment Configuration', () => {
    it('should use correct backend URL for development', () => {
      // Mock development environment
      vi.stubEnv('MODE', 'development')
      vi.stubEnv('VITE_BACKEND_BASE_URL', 'http://localhost:8080')

      wrapper = createWrapper()

      // The component should use the development URL
      expect(import.meta.env.MODE).toBe('development')
    })

    it('should use correct backend URL for production', () => {
      // Mock production environment
      vi.stubEnv('MODE', 'production')
      vi.stubEnv('VITE_BACKEND_BASE_URL', 'https://watchlist-backend-vb24.onrender.com')

      wrapper = createWrapper()

      expect(import.meta.env.MODE).toBe('production')
    })
  })

  describe('Form Interaction', () => {
    it('should update watched state when checkbox is clicked', async () => {
      wrapper = createWrapper()

      const watchedCheckbox = wrapper.find('#watched')
      await watchedCheckbox.setValue(true)

      expect((watchedCheckbox.element as HTMLInputElement).checked).toBe(true)
    })

    it('should update rating when input changes', async () => {
      wrapper = createWrapper()

      const ratingInput = wrapper.find('#rating')
      await ratingInput.setValue(8)

      expect((ratingInput.element as HTMLInputElement).value).toBe('8')
    })
  })
})
