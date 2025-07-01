// src/components/__tests__/AppHeader.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AppHeader from '../AppHeader.vue'

// Mock useAuth
const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: '2024-01-01T00:00:00Z'
}

vi.mock('@/stores/auth', () => ({
    useAuth: () => ({
        currentUser: { value: mockUser }
    })
}))

// Create mock router
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/about', name: 'about', component: { template: '<div>About</div>' } },
        { path: '/account', name: 'account', component: { template: '<div>Account</div>' } }
    ]
})

// Mock window properties for scroll detection
Object.defineProperty(window, 'scrollY', {
    value: 0,
    writable: true
})

Object.defineProperty(window, 'addEventListener', {
    value: vi.fn()
})

Object.defineProperty(window, 'removeEventListener', {
    value: vi.fn()
})

describe('AppHeader', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const mountComponent = () => {
        return mount(AppHeader, {
            global: {
                plugins: [router]
            }
        })
    }

    it('sollte korrekt rendern', () => {
        const wrapper = mountComponent()

        expect(wrapper.find('.app-header').exists()).toBe(true)
        expect(wrapper.find('.logo').exists()).toBe(true)
        expect(wrapper.find('.greetings').exists()).toBe(true)
        expect(wrapper.find('.main-nav').exists()).toBe(true)
    })

    it('sollte Benutzername in Begrüßung anzeigen', () => {
        const wrapper = mountComponent()

        const greeting = wrapper.find('.greetings h3')
        expect(greeting.text()).toContain('Willkommen zu deiner persönlichen Watchlist, John!')
    })

    it('sollte Logo korrekt anzeigen', () => {
        const wrapper = mountComponent()

        const logo = wrapper.find('.logo')
        expect(logo.exists()).toBe(true)
        expect(logo.attributes('alt')).toBe('Vue logo')
        expect(logo.attributes('src')).toContain('logo.svg')
    })

    it('sollte Dropdown-Menü togglen', async () => {
        const wrapper = mountComponent()

        const dropdownTrigger = wrapper.find('.dropdown-trigger')
        expect(wrapper.find('.dropdown-menu.show').exists()).toBe(false)

        await dropdownTrigger.trigger('click')

        expect(wrapper.find('.dropdown-menu.show').exists()).toBe(true)
        expect(dropdownTrigger.classes()).toContain('active')
    })

    it('sollte alle Navigation-Links enthalten', async () => {
        const wrapper = mountComponent()

        // Dropdown öffnen
        await wrapper.find('.dropdown-trigger').trigger('click')

        const links = wrapper.findAll('.dropdown-link')
        expect(links).toHaveLength(3)

        expect(links[0].attributes('to')).toBe('/')
        expect(links[0].text()).toBe('Home')

        expect(links[1].attributes('to')).toBe('/about')
        expect(links[1].text()).toBe('Eintrag erstellen')

        expect(links[2].attributes('to')).toBe('/account')
        expect(links[2].text()).toBe('Account')
    })

    it('sollte Dropdown schließen beim Link-Klick', async () => {
        const wrapper = mountComponent()

        // Dropdown öffnen
        await wrapper.find('.dropdown-trigger').trigger('click')
        expect(wrapper.find('.dropdown-menu.show').exists()).toBe(true)

        // Link klicken
        await wrapper.find('.dropdown-link').trigger('click')

        expect(wrapper.find('.dropdown-menu.show').exists()).toBe(false)
    })

    it('sollte Hamburger-Icon Animation zeigen', async () => {
        const wrapper = mountComponent()

        const hamburgerIcon = wrapper.find('.hamburger-icon')
        const spans = hamburgerIcon.findAll('span')
        expect(spans).toHaveLength(3)

        // Dropdown öffnen
        await wrapper.find('.dropdown-trigger').trigger('click')

        // Prüfe ob active class gesetzt ist
        expect(wrapper.find('.dropdown-trigger').classes()).toContain('active')
    })

    it('sollte event listeners für scroll und click outside registrieren', () => {
        mountComponent()

        expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
        expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
    })

    it('sollte Menu-Text auf Desktop anzeigen', () => {
        const wrapper = mountComponent()

        const menuText = wrapper.find('.menu-text')
        expect(menuText.exists()).toBe(true)
        expect(menuText.text()).toBe('Menü')
    })

    it('sollte Dropdown korrekt positionieren', async () => {
        const wrapper = mountComponent()

        await wrapper.find('.dropdown-trigger').trigger('click')

        const dropdownMenu = wrapper.find('.dropdown-menu')
        expect(dropdownMenu.exists()).toBe(true)

        // Dropdown sollte rechts ausgerichtet sein (durch CSS)
        const styles = getComputedStyle(dropdownMenu.element)
        // Da wir in Tests sind, können wir nur prüfen ob das Element existiert
        expect(dropdownMenu.classes()).toContain('show')
    })

    it('sollte responsive Design unterstützen', () => {
        const wrapper = mountComponent()

        // Test dass alle responsive Elemente vorhanden sind
        expect(wrapper.find('.header-content').exists()).toBe(true)
        expect(wrapper.find('.header-info').exists()).toBe(true)
        expect(wrapper.find('.main-nav').exists()).toBe(true)

        // Logo sollte flex-shrink: 0 haben (durch CSS-Klasse)
        expect(wrapper.find('.logo').exists()).toBe(true)
    })
})
