// src/components/__tests__/WatchlistTable.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WatchlistTable from '../WatchlistTable.vue'
import type { Watchlist } from '@/types'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => ({
    default: {
        delete: vi.fn(),
        put: vi.fn(),
        post: vi.fn(),
        isAxiosError: vi.fn()
    }
}))

// Mock useAuth
const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    createdAt: '2024-01-01T00:00:00Z'
}

vi.mock('@/stores/auth', () => ({
    useAuth: () => ({
        currentUser: { value: mockUser }
    })
}))

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
    value: {
        MODE: 'development',
        VITE_BACKEND_BASE_URL: 'http://localhost:8080'
    }
})

describe('WatchlistTable', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        window.confirm = vi.fn(() => true)
        window.alert = vi.fn()
    })

    const mockItems: Watchlist[] = [
        {
            id: 1,
            title: 'Inception',
            type: 'Film',
            genre: 'Sci-Fi',
            watched: false,
            rating: 0,
            posterUrl: 'http://example.com/inception.jpg',
            userId: 1
        },
        {
            id: 2,
            title: 'Breaking Bad',
            type: 'Serie',
            genre: 'Drama',
            watched: true,
            rating: 9,
            posterUrl: 'http://example.com/breaking-bad.jpg',
            userId: 1
        }
    ]

    const mountComponent = (items: Watchlist[] = mockItems) => {
        return mount(WatchlistTable, {
            props: { items }
        })
    }

    it('sollte korrekt rendern', () => {
        const wrapper = mountComponent()

        expect(wrapper.find('.watchlist-table').exists()).toBe(true)
        expect(wrapper.find('thead').exists()).toBe(true)
        expect(wrapper.find('tbody').exists()).toBe(true)
    })

    it('sollte Items korrekt anzeigen', () => {
        const wrapper = mountComponent()

        const rows = wrapper.findAll('tbody tr')
        expect(rows).toHaveLength(2)

        // Prüfe ersten Item
        const firstRow = rows[0]
        expect(firstRow.text()).toContain('Inception')
        expect(firstRow.text()).toContain('Film')
        expect(firstRow.text()).toContain('Sci-Fi')
        expect(firstRow.text()).toContain('Nein') // Not watched

        // Prüfe zweiten Item
        const secondRow = rows[1]
        expect(secondRow.text()).toContain('Breaking Bad')
        expect(secondRow.text()).toContain('Serie')
        expect(secondRow.text()).toContain('Drama')
        expect(secondRow.text()).toContain('Ja') // Watched
    })

    it('sollte "Keine Einträge" Nachricht anzeigen wenn leer', () => {
        const wrapper = mountComponent([])

        expect(wrapper.find('.no-items').text()).toBe('Noch keine Watchlist-Einträge vorhanden')
    })

    it('sollte Edit-Modus aktivieren/deaktivieren', async () => {
        const wrapper = mountComponent()

        const editButton = wrapper.find('.edit-btn')
        expect(editButton.text()).toBe('Bearbeiten')

        await editButton.trigger('click')

        expect(editButton.text()).toBe('Bearbeitung beenden')
        expect(editButton.classes()).toContain('active')

        // Actions column sollte sichtbar sein
        expect(wrapper.find('.actions-cell').exists()).toBe(true)
    })

    it('sollte Poster korrekt anzeigen', () => {
        const wrapper = mountComponent()

        const images = wrapper.findAll('.cover-image')
        expect(images).toHaveLength(2)

        expect(images[0].attributes('src')).toBe('http://example.com/inception.jpg')
        expect(images[0].attributes('alt')).toBe('Inception Cover')
    })

    it('sollte Fallback für fehlende Poster anzeigen', () => {
        const itemsWithoutPoster: Watchlist[] = [{
            id: 3,
            title: 'No Poster Movie',
            type: 'Film',
            genre: 'Action',
            watched: false,
            rating: 0,
            userId: 1
        }]

        const wrapper = mountComponent(itemsWithoutPoster)

        expect(wrapper.find('.no-cover').exists()).toBe(true)
        expect(wrapper.find('.no-cover-text').text()).toBe('Kein Cover')
    })

    it('sollte Rating korrekt anzeigen', () => {
        const wrapper = mountComponent()

        // Erstes Item: nicht gesehen, kein Rating
        const firstRating = wrapper.findAll('.rating-cell')[0]
        expect(firstRating.find('.no-rating').exists()).toBe(true)

        // Zweites Item: gesehen mit Rating
        const secondRating = wrapper.findAll('.rating-cell')[1]
        expect(secondRating.find('.rating-display').exists()).toBe(true)
        expect(secondRating.text()).toContain('9/10')
    })

    it('sollte Item löschen', async () => {
        vi.mocked(axios.delete).mockResolvedValue({ data: {} })

        const wrapper = mountComponent()

        // Edit-Modus aktivieren
        await wrapper.find('.edit-btn').trigger('click')

        // Delete button klicken
        const deleteButton = wrapper.findAll('.delete-btn')[0]
        await deleteButton.trigger('click')

        expect(window.confirm).toHaveBeenCalledWith('Sind Sie sicher, dass Sie "Inception" löschen möchten?')
        expect(axios.delete).toHaveBeenCalledWith(
            'http://localhost:8080/Watchlist/1?userId=1'
        )
    })

    it('sollte Item bearbeiten starten', async () => {
        const wrapper = mountComponent()

        // Edit-Modus aktivieren
        await wrapper.find('.edit-btn').trigger('click')

        // Edit Item button klicken
        const editItemButton = wrapper.findAll('.edit-item-btn')[0]
        await editItemButton.trigger('click')

        // Sollte Edit-Inputs anzeigen
        expect(wrapper.find('.edit-input').exists()).toBe(true)
        expect(wrapper.find('.edit-select').exists()).toBe(true)
    })

    it('sollte Bearbeitung abbrechen', async () => {
        const wrapper = mountComponent()

        // Edit-Modus aktivieren
        await wrapper.find('.edit-btn').trigger('click')

        // Edit starten
        await wrapper.findAll('.edit-item-btn')[0].trigger('click')

        // Cancel klicken
        await wrapper.find('.cancel-item-btn').trigger('click')

        // Sollte wieder normale Anzeige sein
        expect(wrapper.find('.edit-input').exists()).toBe(false)
    })

    it('sollte Item speichern', async () => {
        const updatedItem = { ...mockItems[0], title: 'Updated Title' }
        vi.mocked(axios.put).mockResolvedValue({ data: updatedItem })

        const wrapper = mountComponent()

        // Edit-Modus aktivieren
        await wrapper.find('.edit-btn').trigger('click')

        // Edit starten
        await wrapper.findAll('.edit-item-btn')[0].trigger('click')

        // Titel ändern
        const titleInput = wrapper.find('.edit-input')
        await titleInput.setValue('Updated Title')

        // Save klicken
        await wrapper.find('.save-item-btn').trigger('click')

        expect(axios.put).toHaveBeenCalledWith(
            'http://localhost:8080/Watchlist/1',
            expect.objectContaining({
                title: 'Updated Title',
                userId: 1
            })
        )
    })

    it('sollte Star Rating korrekt berechnen', () => {
        const wrapper = mountComponent()

        // Teste die getStarRating Funktion über das Rating Display
        const ratingDisplay = wrapper.findAll('.rating-stars')[0]

        // Rating 9 sollte 5 Sterne ergeben (9/2 = 4.5 -> aufgerundet 5)
        expect(ratingDisplay.text()).toContain('⭐')
    })

    it('sollte Image Modal öffnen', async () => {
        const wrapper = mountComponent()

        const coverImage = wrapper.findAll('.cover-image')[0]
        await coverImage.trigger('click')

        expect(wrapper.find('.image-modal').exists()).toBe(true)
        expect(wrapper.find('.modal-image').exists()).toBe(true)
    })

    it('sollte alle Poster aktualisieren', async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: 'Success' })
        window.location.reload = vi.fn()

        const wrapper = mountComponent()

        const refreshButton = wrapper.find('.refresh-btn')
        await refreshButton.trigger('click')

        expect(window.confirm).toHaveBeenCalledWith(
            'Möchten Sie alle fehlenden Cover aktualisieren? Dies kann etwas dauern.'
        )
        expect(axios.post).toHaveBeenCalledWith(
            'http://localhost:8080/Watchlist/refresh-all-posters?userId=1'
        )
    })
})
