<template>
  <div style="margin: 20px;">
    <div class="table-controls">
      <button
        @click="refreshAllPosters"
        class="refresh-all-btn"
        :disabled="refreshingAll"
      >
        {{ refreshingAll ? 'Cover werden aktualisiert...' : 'Alle Cover aktualisieren' }}
      </button>
    </div>

    <div class="table-container">
      <table class="watchlist-table">
        <thead>
        <tr>
          <th>Cover</th>
          <th>Title</th>
          <th>Type</th>
          <th>Genre</th>
          <th>Watched</th>
          <th>Rating</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="items.length === 0">
          <td colspan="7" class="no-items">Noch keine Watchlist-Einträge vorhanden</td>
        </tr>
        <tr v-for="item in items" :key="item.id" class="table-row">
          <!-- Cover Column -->
          <td class="cover-cell">
            <div class="cover-container">
              <img
                v-if="item.posterUrl && item.posterUrl !== 'N/A'"
                :src="item.posterUrl"
                :alt="item.title + ' Cover'"
                class="cover-image"
                @error="handleImageError"
                @click="openImageModal(item.posterUrl, item.title)"
              />
              <div v-else class="no-cover">
                <span class="no-cover-icon">🎬</span>
                <span class="no-cover-text">Kein Cover</span>
              </div>

            </div>
          </td>

          <!-- Content Columns -->
          <td class="title-cell">
            <strong>{{ item.title }}</strong>
          </td>
          <td class="type-cell">
            <strong>{{ item.type}}</strong>
          </td>
          <td>{{ item.genre || 'Unbekannt' }}</td>
          <td class="watched-cell">
            <strong>{{ item.watched ? 'Ja' : 'Nein' }}</strong>
          </td>
          <td class="rating-cell">
            <div v-if="item.watched && item.rating > 0" class="rating-display">
              <span class="rating-stars">{{ getStarRating(item.rating) }}</span>
              <span class="rating-number">{{ item.rating }}/10</span>
            </div>
            <span v-else class="no-rating">-</span>
          </td>
          <td class="actions-cell">
            <button
              @click="deleteItem(item)"
              class="delete-btn"
              :disabled="deleting === item.id"
              title="Eintrag löschen"
            >
              {{ deleting === item.id ? '⏳' : '🗑️' }}
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Image Modal -->
    <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
      <div class="image-modal-content" @click.stop>
        <button class="modal-close-btn" @click="closeImageModal">✕</button>
        <img :src="modalImageUrl" :alt="modalImageTitle" class="modal-image" />
        <p class="modal-title">{{ modalImageTitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import axios from 'axios'
import type {Watchlist} from '@/types'
import { useAuth } from '@/stores/auth'

defineProps<{
  items: Watchlist[]
}>()

const emit = defineEmits<{
  itemDeleted: [id: number]
  itemUpdated: [item: Watchlist]
}>()

const { currentUser } = useAuth()
const deleting = ref<number | null>(null)
const refreshingSingle = ref<number | null>(null)
const refreshingAll = ref(false)

// Image Modal
const showImageModal = ref(false)
const modalImageUrl = ref('')
const modalImageTitle = ref('')

// Bestimme die korrekte Backend-URL
const getBackendUrl = () => {
  const isDevelopment = import.meta.env.MODE === 'development'
  const url = isDevelopment
    ? import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080'
    : import.meta.env.VITE_BACKEND_BASE_URL || 'https://watchlist-backend-vb24.onrender.com'
  return url
}

async function deleteItem(item: Watchlist) {
  if (!item.id) {
    console.error('Cannot delete item without ID')
    return
  }

  const userId = currentUser.value?.id
  if (!userId) {
    alert('Benutzer nicht eingeloggt!')
    return
  }

  if (!confirm(`Sind Sie sicher, dass Sie "${item.title}" löschen möchten?`)) {
    return
  }

  try {
    deleting.value = item.id
    console.log('=== Deleting Watchlist Item ===')
    const baseUrl = getBackendUrl()
    const endpoint = `${baseUrl}/Watchlist/${item.id}?userId=${userId}`

    console.log('Deleting item from:', endpoint)

    await axios.delete(endpoint)
    console.log('✅ Successfully deleted item:', item.title)

    emit('itemDeleted', item.id)

  } catch (error) {
    console.error('❌ Error deleting watchlist item:', error)

    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status)
      console.error('Status Text:', error.response?.statusText)
      console.error('Response Data:', error.response?.data)
    }

    alert(`Fehler beim Löschen: ${error}`)
  } finally {
    deleting.value = null
  }
}

async function refreshSinglePoster(item: Watchlist) {
  if (!item.id) return

  const userId = currentUser.value?.id
  if (!userId) {
    alert('Benutzer nicht eingeloggt!')
    return
  }

  try {
    refreshingSingle.value = item.id
    const baseUrl = getBackendUrl()
    const endpoint = `${baseUrl}/Watchlist/${item.id}/refresh-poster?userId=${userId}`

    console.log('🔄 Refreshing poster for:', item.title)

    const response = await axios.post(endpoint)
    const updatedItem = response.data

    console.log('✅ Successfully refreshed poster for:', item.title)
    emit('itemUpdated', updatedItem)

  } catch (error) {
    console.error('❌ Error refreshing poster:', error)
    alert(`Fehler beim Aktualisieren des Covers für "${item.title}"`)
  } finally {
    refreshingSingle.value = null
  }
}

async function refreshAllPosters() {
  const userId = currentUser.value?.id
  if (!userId) {
    alert('Benutzer nicht eingeloggt!')
    return
  }

  if (!confirm('Möchten Sie alle fehlenden Cover aktualisieren? Dies kann etwas dauern.')) {
    return
  }

  try {
    refreshingAll.value = true
    const baseUrl = getBackendUrl()
    const endpoint = `${baseUrl}/Watchlist/refresh-all-posters?userId=${userId}`

    console.log('🔄 Refreshing all posters...')

    await axios.post(endpoint)
    console.log('✅ Successfully started refreshing all posters')

    alert('Cover-Update gestartet! Die Seite wird in 3 Sekunden neu geladen.')

    setTimeout(() => {
      window.location.reload()
    }, 3000)

  } catch (error) {
    console.error('❌ Error refreshing all posters:', error)
    alert('Fehler beim Aktualisieren aller Cover')
  } finally {
    refreshingAll.value = false
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  console.log('❌ Image failed to load:', img.src)
  // Hier könnten wir ein Fallback-Bild setzen
}

function openImageModal(imageUrl: string, title: string) {
  modalImageUrl.value = imageUrl
  modalImageTitle.value = title
  showImageModal.value = true
}

function closeImageModal() {
  showImageModal.value = false
  modalImageUrl.value = ''
  modalImageTitle.value = ''
}

function getTypeIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'film':
    case 'movie':
      return '🎬'
    case 'serie':
    case 'series':
      return '📺'
    case 'dokumentation':
    case 'documentary':
      return '📚'
    case 'anime':
      return '🎌'
    default:
      return '🎭'
  }
}

function getTypeBadgeClass(type: string) {
  switch (type?.toLowerCase()) {
    case 'film':
    case 'movie':
      return 'type-movie'
    case 'serie':
    case 'series':
      return 'type-series'
    case 'dokumentation':
    case 'documentary':
      return 'type-documentary'
    case 'anime':
      return 'type-anime'
    default:
      return 'type-default'
  }
}

function getStarRating(rating: number) {
  const stars = Math.round(rating / 2) // Convert 1-10 to 1-5 stars
  return '⭐'.repeat(Math.max(1, Math.min(5, stars)))
}
</script>

<style scoped>
.table-controls {
  margin-bottom: 1rem;
  text-align: right;
}

.refresh-all-btn {
  background: linear-gradient(45deg, rgba(0, 0, 0, 0.49), rgba(255, 255, 255, 0.47));
  color: white;
  border: white;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.refresh-all-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #45a049, #3d8b40);
  transform: translateY(-2px);
}

.refresh-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.table-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 1.5rem;
  overflow-x: auto;
}

.watchlist-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

.watchlist-table th,
.watchlist-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  vertical-align: middle;
}

.watchlist-table th {
  background: rgba(255, 255, 255, 0.1);
  font-weight: bold;
  color: var(--color-heading);
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.table-row:hover {
  background: rgba(255, 0, 0, 0.1);
}

/* Cover Styles */
.cover-cell {
  width: 120px;
  padding: 0.5rem;
}

.cover-container {
  position: relative;
  width: 80px;
  height: 120px;
  margin: 0 auto;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.cover-image:hover {
  transform: scale(1.05);
}

.no-cover {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 2px dashed rgba(255, 255, 255, 0.3);
}

.no-cover-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.no-cover-text {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
}

.refresh-single-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.refresh-single-btn:hover:not(:disabled) {
  background: rgba(255, 0, 0, 0.8);
  transform: scale(1.1);
}

.refresh-single-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Content Styles */
.title-cell {
  min-width: 200px;
}

.title-cell strong {
  color: var(--color-heading);
  font-size: 1.1rem;
}

.type-cell {
  min-width: 120px;
}

.type-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
}

.type-movie {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.type-series {
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
  border: 1px solid rgba(0, 123, 255, 0.3);
}

.type-documentary {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.type-anime {
  background: rgba(255, 20, 147, 0.2);
  color: #ff1493;
  border: 1px solid rgba(255, 20, 147, 0.3);
}

.type-default {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.3);
}

.watched-cell {
  min-width: 100px;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.watched {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.3);
}

.status-badge.unwatched {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.rating-cell {
  min-width: 120px;
}

.rating-display {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.rating-stars {
  font-size: 1rem;
}

.rating-number {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.no-rating {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.actions-cell {
  min-width: 80px;
  text-align: center;
}

.delete-btn {
  background: transparent;
  color: #ff4444;
  border: 2px solid #ff4444;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.delete-btn:hover:not(:disabled) {
  background: #ff4444;
  color: white;
  transform: translateY(-2px);
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.no-items {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

/* Image Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.image-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  text-align: center;
}

.modal-close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
}

.modal-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal-title {
  color: white;
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .table-container {
    padding: 1rem;
  }

  .watchlist-table th,
  .watchlist-table td {
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .cover-container {
    width: 60px;
    height: 90px;
  }

  .title-cell {
    min-width: 150px;
  }

  .type-cell,
  .watched-cell,
  .rating-cell {
    min-width: 80px;
  }
}
</style>
