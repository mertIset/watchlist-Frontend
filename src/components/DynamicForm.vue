<template>
  <div class="form-container">
    <div class="form-header">
      <h1>➕ Neuen Eintrag erstellen</h1>
      <p>Fügen Sie einen Film, eine Serie oder Dokumentation zu Ihrer persönlichen Watchlist hinzu</p>
    </div>

    <div class="form-content">
      <!-- Form Section -->
      <div class="form-section">
        <form @submit.prevent="save" class="entry-form">
          <div class="form-grid">
            <!-- Title Input -->
            <div class="form-group full-width">
              <label for="title" class="form-label">Titel</label>
              <input
                id="title"
                v-model="titleField"
                type="text"
                class="form-input"
                placeholder="z.B. Inception, Breaking Bad, Planet Earth..."
                required
                :disabled="saving"
              />
            </div>

            <!-- Type and Genre Row -->
            <div class="form-group">
              <label for="type" class="form-label">Kategorie</label>
              <select
                id="type"
                v-model="typeField"
                class="form-select"
                required
                :disabled="saving"
              >
                <option value="" disabled>Kategorie wählen</option>
                <option value="Film">Film</option>
                <option value="Serie">Serie</option>
                <option value="Dokumentation">Dokumentation</option>
                <option value="Anime">Anime</option>
              </select>
            </div>

            <div class="form-group">
              <label for="genre" class="form-label">Genre</label>
              <input
                id="genre"
                v-model="genreField"
                type="text"
                class="form-input"
                placeholder="z.B. Action, Drama, Komödie..."
                :disabled="saving"
              />
            </div>

            <!-- Watched and Rating Row -->
            <div class="form-group">
              <label class="form-label">Status</label>
              <div class="checkbox-container">
                <input
                  id="watched"
                  v-model="watchedField"
                  type="checkbox"
                  class="form-checkbox"
                  :disabled="saving"
                />
                <label for="watched" class="checkbox-label">
                  <span class="checkbox-custom"></span>
                  Bereits gesehen
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="rating" class="form-label">Bewertung</label>
              <div class="rating-container">
                <input
                  id="rating"
                  v-model="ratingField"
                  type="number"
                  min="1"
                  max="10"
                  class="form-input rating-input"
                  placeholder="1-10"
                  :disabled="saving"
                />
                <span class="rating-suffix">/ 10</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="saving"
            >
              {{ saving ? 'Speichern...' : 'Eintrag speichern' }}
            </button>

            <button
              type="button"
              @click="testBackend"
              class="btn btn-secondary"
              :disabled="saving"
            >
              Backend testen
            </button>
          </div>

          <!-- Status Messages -->
          <div v-if="statusMessage" class="status-message" :class="statusType">
            <span class="status-icon">{{ statusType === 'success' ? '✅' : '❌' }}</span>
            {{ statusMessage }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import axios from 'axios'
import type {AxiosResponse} from 'axios'
import type {Watchlist} from '@/types'
import { useAuth } from '@/stores/auth'

defineProps<{
  title: string
}>()

// Use authentication store
const { currentUser } = useAuth()

// Emit events für Kommunikation mit Parent Component
const emit = defineEmits<{
  itemAdded: [item: Watchlist]
  itemsLoaded: [items: Watchlist[]]
}>()

const titleField = ref('')
const typeField = ref('')
const genreField = ref('')
const watchedField = ref(false)
const ratingField = ref(0)
const saving = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')

// Bestimme die korrekte Backend-URL
const getBackendUrl = () => {
  console.log('Environment Mode:', import.meta.env.MODE)
  console.log('All env vars:', import.meta.env)

  const isDevelopment = import.meta.env.MODE === 'development'
  const url = isDevelopment
    ? import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080'
    : import.meta.env.VITE_BACKEND_BASE_URL || 'https://watchlist-backend-vb24.onrender.com'

  console.log('Backend URL determined:', url)
  return url
}

const showStatus = (message: string, type: 'success' | 'error') => {
  statusMessage.value = message
  statusType.value = type

  setTimeout(() => {
    statusMessage.value = ''
  }, 5000)
}

async function testBackend() {
  console.log('Testing backend connection...')
  const baseUrl = getBackendUrl()
  const userId = currentUser.value?.id

  if (!userId) {
    showStatus('Benutzer nicht eingeloggt!', 'error')
    return
  }

  const endpoint = `${baseUrl}/Watchlist?userId=${userId}`

  try {
    console.log('Making request to:', endpoint)
    const response = await axios.get(endpoint)
    console.log('Backend response:', response)
    showStatus(`Backend erreichbar! ${response.data.length} Items gefunden.`, 'success')
  } catch (error) {
    console.error('Backend connection failed:', error)
    showStatus(`Backend nicht erreichbar: ${error}`, 'error')
  }
}

async function loadWatchlistItems() {
  try {
    console.log('=== Loading Watchlist Items ===')
    const baseUrl = getBackendUrl()
    const userId = currentUser.value?.id

    if (!userId) {
      console.error('❌ No user logged in')
      return
    }

    const endpoint = `${baseUrl}/Watchlist?userId=${userId}`
    console.log('Loading items from:', endpoint)

    const response: AxiosResponse = await axios.get(endpoint)
    const responseData: Watchlist[] = response.data
    console.log('✅ Successfully loaded items:', responseData)

    // Emit items to parent
    emit('itemsLoaded', responseData)
  } catch (error) {
    console.error('❌ Error loading watchlist items:', error)

    // Zeige detaillierte Fehlerinformationen
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status)
      console.error('Status Text:', error.response?.statusText)
      console.error('Response Data:', error.response?.data)
      console.error('Request URL:', error.config?.url)
    }

    // Fallback für Demo
    const fallbackItems = [
      { id: 999, title: 'Fallback Movie (Backend nicht erreichbar)', type: 'Movie', genre: 'Demo', watched: false, rating: 0 }
    ]
    emit('itemsLoaded', fallbackItems)
  }
}

async function save() {
  if (!titleField.value || !typeField.value) {
    showStatus('Bitte füllen Sie mindestens Titel und Kategorie aus.', 'error')
    return
  }

  saving.value = true

  try {
    console.log('=== Saving Watchlist Item ===')
    const baseUrl = getBackendUrl()
    const userId = currentUser.value?.id

    if (!userId) {
      showStatus('Benutzer nicht eingeloggt!', 'error')
      return
    }

    const endpoint = `${baseUrl}/Watchlist`

    const data = {
      title: titleField.value,
      type: typeField.value,
      genre: genreField.value,
      watched: watchedField.value,
      rating: ratingField.value,
      userId: userId
    }

    console.log('Saving data to:', endpoint)
    console.log('Payload:', data)

    const response: AxiosResponse = await axios.post(endpoint, data)
    const responseData: Watchlist = response.data
    console.log('✅ Successfully saved:', responseData)

    // Clear form
    titleField.value = ''
    typeField.value = ''
    genreField.value = ''
    watchedField.value = false
    ratingField.value = 0

    // Show success message
    showStatus('Eintrag erfolgreich erstellt!', 'success')

    // Emit new item to parent and reload items
    emit('itemAdded', responseData)
    await loadWatchlistItems()

  } catch (error) {
    console.error('❌ Error saving watchlist item:', error)

    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status)
      console.error('Status Text:', error.response?.statusText)
      console.error('Response Data:', error.response?.data)
    }

    showStatus('Fehler beim Speichern des Eintrags.', 'error')
  } finally {
    saving.value = false
  }
}

// Expose loadWatchlistItems function to parent
defineExpose({
  loadWatchlistItems
})

// Lifecycle hooks
onMounted(async () => {
  console.log('🚀 DynamicForm mounted, loading items...')
  await loadWatchlistItems()
})
</script>

<style scoped>
.form-container {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  min-height: 100vh;
  background: var(--color-background);
  padding: 2rem;
  padding-top: 6rem; /* Platz für den fixierten Header */
}

.form-header {
  text-align: center;
  margin-bottom: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.form-header h1 {
  font-size: 3rem;
  color: var(--color-heading);
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ff0000, #cc0000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-header p {
  font-size: 1.2rem;
  color: var(--color-text);
  opacity: 0.8;
}

.form-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.form-section,
.info-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-section h2,
.info-section h2 {
  font-size: 1.8rem;
  color: var(--color-heading);
  margin-bottom: 1.5rem;
}

.entry-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: bold;
  color: var(--color-heading);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input,
.form-select {
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0);
  color: var(--color-text);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #ff0000;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-input:disabled,
.form-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-select option {
  background: #2a2a2a;
  color: #ffffff;
}

/* Rating Input */
.rating-container {
  position: relative;
  display: flex;
  align-items: center;
}

.rating-input {
  padding-right: 3rem;
}

.rating-suffix {
  position: absolute;
  right: 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  pointer-events: none;
}

/* Custom Checkbox */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 0;
}

.form-checkbox {
  display: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 500;
  user-select: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.form-checkbox:checked + .checkbox-label .checkbox-custom {
  background: linear-gradient(45deg, #ff0000, #cc0000);
  border-color: #ff0000;
}

.form-checkbox:checked + .checkbox-label .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* Action Buttons */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: linear-gradient(45deg, #ff0000, #cc0000);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(45deg, #cc0000, #990000);
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.69);
}

/* Status Messages */
.status-message {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-weight: 500;
}

.status-message.success {
  background: rgba(0, 255, 0, 0.2);
  border: 1px solid #00ff00;
  color: #00ff00;
}

.status-message.error {
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid #ff0000;
  color: #ff0000;
}

.status-icon {
  font-size: 1.2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-container {
    padding: 1rem;
    padding-top: 5rem;
  }

  .form-header h1 {
    font-size: 2.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding-top: 4.5rem;
  }

  .form-header h1 {
    font-size: 2rem;
  }

  .form-section,
  .info-section {
    padding: 1.5rem;
  }
}
</style>
