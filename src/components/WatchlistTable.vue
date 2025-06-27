<template>
  <div style="margin: 20px;">
    <div class="table-controls">
      <button
        @click="refreshAllPosters"
        class="control-btn refresh-btn"
        :disabled="refreshingAll"
      >
        {{ refreshingAll ? 'Cover werden aktualisiert...' : 'Alle Cover aktualisieren' }}
      </button>

      <button
        @click="toggleEditMode"
        class="control-btn edit-btn"
        :class="{ 'active': editMode }"
      >
        {{ editMode ? 'Bearbeitung beenden' : 'Bearbeiten' }}
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
          <th v-if="editMode">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="items.length === 0">
          <td :colspan="editMode ? 7 : 6" class="no-items">Noch keine Watchlist-Einträge vorhanden</td>
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

          <!-- Title Column -->
          <td class="title-cell">
            <div v-if="!editMode || !isEditing(item.id!)">
              <strong>{{ item.title }}</strong>
            </div>
            <input
              v-else
              v-model="getEditData(item.id!).title"
              type="text"
              class="edit-input"
              placeholder="Titel eingeben"
            />
          </td>

          <!-- Type Column -->
          <td class="type-cell">
            <div v-if="!editMode || !isEditing(item.id!)">
              <strong>{{ item.type }}</strong>
            </div>
            <select
              v-else
              v-model="getEditData(item.id!).type"
              class="edit-select"
            >
              <option value="Film">Film</option>
              <option value="Serie">Serie</option>
              <option value="Dokumentation">Dokumentation</option>
              <option value="Anime">Anime</option>
            </select>
          </td>

          <!-- Genre Column -->
          <td class="genre-cell">
            <div v-if="!editMode || !isEditing(item.id!)">
              {{ item.genre || 'Unbekannt' }}
            </div>
            <input
              v-else
              v-model="getEditData(item.id!).genre"
              type="text"
              class="edit-input"
              placeholder="Genre eingeben"
            />
          </td>

          <!-- Watched Column -->
          <td class="watched-cell">
            <div v-if="!editMode || !isEditing(item.id!)">
              <strong>{{ item.watched ? 'Ja' : 'Nein' }}</strong>
            </div>
            <label v-else class="checkbox-container">
              <input
                v-model="getEditData(item.id!).watched"
                type="checkbox"
                class="edit-checkbox"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">Gesehen</span>
            </label>
          </td>

          <!-- Rating Column -->
          <td class="rating-cell">
            <div v-if="!editMode || !isEditing(item.id!)">
              <div v-if="item.watched && item.rating > 0" class="rating-display">
                <span class="rating-stars">{{ getStarRating(item.rating) }}</span>
                <span class="rating-number">{{ item.rating }}/10</span>
              </div>
              <span v-else class="no-rating">-</span>
            </div>
            <input
              v-else
              v-model.number="getEditData(item.id!).rating"
              type="number"
              min="0"
              max="10"
              class="edit-input rating-input"
              placeholder="1-10"
            />
          </td>

          <!-- Actions Column - im Edit-Modus -->
          <td v-if="editMode" class="actions-cell">
            <div v-if="!isEditing(item.id!)" class="action-buttons">
              <button
                @click="startEditing(item)"
                class="edit-item-btn"
                title="Eintrag bearbeiten"
              >
                ✏️
              </button>
              <button
                @click="deleteItem(item)"
                class="delete-btn"
                :disabled="deleting === item.id"
                title="Eintrag löschen"
              >
                {{ deleting === item.id ? '⏳' : '🗑️' }}
              </button>
            </div>
            <div v-else class="action-buttons">
              <button
                @click="saveEdit(item)"
                class="save-item-btn"
                :disabled="saving === item.id"
                title="Änderungen speichern"
              >
                {{ saving === item.id ? '⏳' : '💾' }}
              </button>
              <button
                @click="cancelEdit(item.id!)"
                class="cancel-item-btn"
                title="Bearbeitung abbrechen"
              >
                ❌
              </button>
            </div>
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
const saving = ref<number | null>(null)
const refreshingAll = ref(false)
const editMode = ref(false)

// Edit-State Management
const editingItems = ref<Set<number>>(new Set())
const editData = ref<Map<number, Partial<Watchlist>>>(new Map())

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

const toggleEditMode = () => {
  editMode.value = !editMode.value
  // Beim Verlassen des Edit-Modus alle Bearbeitungen abbrechen
  if (!editMode.value) {
    editingItems.value.clear()
    editData.value.clear()
  }
}

const isEditing = (itemId: number) => {
  return editingItems.value.has(itemId)
}

const getEditData = (itemId: number) => {
  if (!editData.value.has(itemId)) {
    console.warn(`No edit data found for item ${itemId}`)
    return { title: '', type: '', genre: '', watched: false, rating: 0 }
  }
  return editData.value.get(itemId)!
}

const startEditing = (item: Watchlist) => {
  if (!item.id) return

  // Erstelle eine Kopie der aktuellen Daten für die Bearbeitung
  editData.value.set(item.id, {
    title: item.title,
    type: item.type,
    genre: item.genre,
    watched: item.watched,
    rating: item.rating
  })

  editingItems.value.add(item.id)
}

const cancelEdit = (itemId: number) => {
  editingItems.value.delete(itemId)
  editData.value.delete(itemId)
}

const saveEdit = async (item: Watchlist) => {
  if (!item.id) return

  const userId = currentUser.value?.id
  if (!userId) {
    alert('Benutzer nicht eingeloggt!')
    return
  }

  const updatedData = editData.value.get(item.id)
  if (!updatedData) return

  try {
    saving.value = item.id
    console.log('=== Updating Watchlist Item ===')
    const baseUrl = getBackendUrl()
    const endpoint = `${baseUrl}/Watchlist/${item.id}`

    const updatePayload = {
      title: updatedData.title,
      type: updatedData.type,
      genre: updatedData.genre,
      watched: updatedData.watched,
      rating: updatedData.rating,
      posterUrl: item.posterUrl, // Behalte die aktuelle Poster URL
      userId: userId
    }

    console.log('Updating item at:', endpoint)
    console.log('Update payload:', updatePayload)

    const response = await axios.put(endpoint, updatePayload)
    const updatedItem = response.data

    console.log('✅ Successfully updated item:', updatedItem.title)

    // Beende die Bearbeitung
    editingItems.value.delete(item.id)
    editData.value.delete(item.id)

    // Emittiere das Update an die Parent-Komponente
    emit('itemUpdated', updatedItem)

  } catch (error) {
    console.error('❌ Error updating watchlist item:', error)

    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status)
      console.error('Status Text:', error.response?.statusText)
      console.error('Response Data:', error.response?.data)
    }

    alert(`Fehler beim Aktualisieren von "${item.title}": ${error}`)
  } finally {
    saving.value = null
  }
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

function getStarRating(rating: number) {
  const stars = Math.round(rating / 2) // Convert 1-10 to 1-5 stars
  return '⭐'.repeat(Math.max(1, Math.min(5, stars)))
}
</script>

<style scoped>
.table-controls {
  margin-bottom: 1rem;
  text-align: right;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.control-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 2px solid white;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 2px solid white;
}

.edit-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.edit-btn.active {
  background: rgba(255, 0, 0, 0.2);
  border-color: #ff0000;
  color: #ff0000;
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

.genre-cell {
  min-width: 120px;
}

.watched-cell {
  min-width: 120px;
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

/* Edit Input Styles */
.edit-input,
.edit-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
  font-size: 0.9rem;
}

.edit-input:focus,
.edit-select:focus {
  outline: none;
  border-color: #ff0000;
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.3);
}

.rating-input {
  max-width: 80px;
}

.edit-select option {
  background: #2a2a2a;
  color: #ffffff;
}

/* Custom Checkbox for Edit Mode */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-text);
}

.edit-checkbox {
  display: none;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.edit-checkbox:checked + .checkbox-custom {
  background: linear-gradient(45deg, #ff0000, #cc0000);
  border-color: #ff0000;
}

.edit-checkbox:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.checkbox-label {
  font-size: 0.8rem;
}

/* Action Buttons */
.actions-cell {
  min-width: 100px;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.edit-item-btn,
.save-item-btn,
.cancel-item-btn,
.delete-btn {
  background: transparent;
  border: 2px solid;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.edit-item-btn {
  color: #4CAF50;
  border-color: #4CAF50;
}

.edit-item-btn:hover:not(:disabled) {
  background: #4CAF50;
  color: white;
}

.save-item-btn {
  color: #2196F3;
  border-color: #2196F3;
}

.save-item-btn:hover:not(:disabled) {
  background: #2196F3;
  color: white;
}

.cancel-item-btn {
  color: #FF9800;
  border-color: #FF9800;
}

.cancel-item-btn:hover:not(:disabled) {
  background: #FF9800;
  color: white;
}

.delete-btn {
  color: #ff4444;
  border-color: #ff4444;
}

.delete-btn:hover:not(:disabled) {
  background: #ff4444;
  color: white;
}

.edit-item-btn:disabled,
.save-item-btn:disabled,
.cancel-item-btn:disabled,
.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  .table-controls {
    flex-direction: column;
    text-align: center;
  }

  .control-btn {
    width: 100%;
  }

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
  .genre-cell,
  .watched-cell,
  .rating-cell {
    min-width: 80px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }

  .edit-item-btn,
  .save-item-btn,
  .cancel-item-btn,
  .delete-btn {
    padding: 0.3rem 0.5rem;
    font-size: 0.8rem;
  }
}
</style>
