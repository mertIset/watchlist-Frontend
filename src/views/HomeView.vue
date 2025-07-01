<script setup lang="ts">
import {ref, onMounted} from 'vue'
import WatchlistTable from '../components/WatchlistTable.vue'
import DynamicForm from '../components/DynamicForm.vue'
import type {Watchlist} from '@/types'
import type {Ref} from 'vue'
import { useAuth } from '@/stores/auth'
import axios from 'axios'

const { currentUser } = useAuth()
const watchlistItems: Ref<Watchlist[]> = ref([])
const dynamicFormRef = ref<InstanceType<typeof DynamicForm> | null>(null)

// Statistik-bezogene reactive variables
const statsLoading = ref(false)
const statsError = ref('')
const watchlistStats = ref({
  total: 0,
  watched: 0,
  unwatched: 0,
  averageRating: '0.0'
})

// YouTube Playlist Configuration
const youtubePlaylistId = ref('PLHj9uMZo6puv11aV1kjbL0kq9hY_f7zHj')
const showYouTubePlayer = ref(true) // Always show - no toggle needed

// Backend URL bestimmen
const getBackendUrl = () => {
  const isDevelopment = import.meta.env.MODE === 'development'
  return isDevelopment
    ? import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080'
    : import.meta.env.VITE_BACKEND_BASE_URL || 'https://watchlist-backend-vb24.onrender.com'
}

function handleItemsLoaded(items: Watchlist[]) {
  watchlistItems.value = items
  calculateStats(items)
}

function handleItemAdded(item: Watchlist) {
  console.log('New item added:', item)
  loadWatchlistStats() // Statistiken neu laden
}

async function handleItemDeleted(deletedId: number) {
  console.log('Item deleted with ID:', deletedId)
  watchlistItems.value = watchlistItems.value.filter(item => item.id !== deletedId)

  if (dynamicFormRef.value) {
    await dynamicFormRef.value.loadWatchlistItems()
  }

  // Statistiken nach Löschung neu berechnen
  calculateStats(watchlistItems.value)
}

function handleItemUpdated(updatedItem: Watchlist) {
  console.log('Item updated:', updatedItem)

  // Finde und aktualisiere das Item in der Liste
  const index = watchlistItems.value.findIndex(item => item.id === updatedItem.id)
  if (index !== -1) {
    watchlistItems.value[index] = updatedItem

    // Statistiken nach Update neu berechnen
    calculateStats(watchlistItems.value)
  }
}

// Watchlist-Statistiken laden
const loadWatchlistStats = async () => {
  if (!currentUser.value?.id) {
    statsError.value = 'Benutzer nicht eingeloggt'
    return
  }

  statsLoading.value = true
  statsError.value = ''

  try {
    console.log('=== Loading Watchlist Statistics ===')
    const baseUrl = getBackendUrl()
    const userId = currentUser.value.id
    const endpoint = `${baseUrl}/Watchlist?userId=${userId}`

    console.log('Loading stats from:', endpoint)

    const response = await axios.get(endpoint)
    const watchlistItemsData: Watchlist[] = response.data

    console.log('✅ Successfully loaded watchlist items:', watchlistItemsData)

    // Statistiken berechnen
    calculateStats(watchlistItemsData)
    watchlistItems.value = watchlistItemsData

    console.log('📊 Calculated statistics:', watchlistStats.value)

  } catch (error) {
    console.error('❌ Error loading watchlist statistics:', error)

    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status)
      console.error('Status Text:', error.response?.statusText)
      console.error('Response Data:', error.response?.data)
    }

    statsError.value = 'Fehler beim Laden der Statistiken'

    // Fallback auf leere Statistiken
    watchlistStats.value = {
      total: 0,
      watched: 0,
      unwatched: 0,
      averageRating: '0.0'
    }
  } finally {
    statsLoading.value = false
  }
}

const calculateStats = (items: Watchlist[]) => {
  const total = items.length
  const watched = items.filter(item => item.watched).length
  const unwatched = total - watched

  // Durchschnittsbewertung nur von bewerteten und gesehenen Filmen berechnen
  const ratedItems = items.filter(item => item.watched && item.rating > 0)
  const averageRating = ratedItems.length > 0
    ? (ratedItems.reduce((sum, item) => sum + item.rating, 0) / ratedItems.length).toFixed(1)
    : '0.0'

  watchlistStats.value = {
    total,
    watched,
    unwatched,
    averageRating
  }
}

onMounted(async () => {
  console.log('HomeView mounted')
  await loadWatchlistStats()
})
</script>

<template>
  <!-- WICHTIG: Container mit voller Viewport-Breite -->
  <div class="fullwidth-container">

    <!-- YouTube Section - GANZ OBEN, VOLLE BREITE, VOLLE HÖHE -->
    <section class="youtube-section">
      <!-- YouTube Player Container - Vollbild -->
      <div class="video-container-fullscreen">
        <iframe
          :src="`https://www.youtube.com/embed/videoseries?list=${youtubePlaylistId}&autoplay=1&controls=0&modestbranding=1&rel=0&mute=1&loop=1&showinfo=0&fs=0&cc_load_policy=0&iv_load_policy=3&disablekb=1&playsinline=1`"
          title="YouTube Playlist - Clean Video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>

        <!-- Overlay für bessere Header-Sichtbarkeit -->
        <div class="video-overlay"></div>
      </div>
    </section>

    <!-- Watchlist Section -->
    <section id="watchlist-section" class="watchlist-section">
      <!-- Hidden Form für Datenmanagement -->
      <DynamicForm
        ref="dynamicFormRef"
        title="Hidden Form"
        @items-loaded="handleItemsLoaded"
        @item-added="handleItemAdded"
        style="display: none;"
      />

      <!-- Watchlist Table -->
      <div class="table-wrapper">
        <WatchlistTable
          :items="watchlistItems"
          @item-deleted="handleItemDeleted"
          @item-updated="handleItemUpdated"
        />
      </div>

      <!-- Statistiken Section - NEU HINZUGEFÜGT -->
      <div class="stats-section">
        <h2>📊 Ihre Watchlist-Statistiken</h2>

        <div v-if="statsLoading" class="loading-stats">
          <p>Lade Statistiken...</p>
        </div>

        <div v-else-if="statsError" class="error-stats">
          <p>{{ statsError }}</p>
          <button @click="loadWatchlistStats" class="retry-btn">Erneut versuchen</button>
        </div>

        <div v-else class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📽️</div>
            <div class="stat-info">
              <h3>{{ watchlistStats.total }}</h3>
              <p>Einträge gesamt</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <h3>{{ watchlistStats.watched }}</h3>
              <p>Gesehen</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
              <h3>{{ watchlistStats.unwatched }}</h3>
              <p>Noch zu sehen</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <h3>{{ watchlistStats.averageRating }}</h3>
              <p>Ø Bewertung</p>
            </div>
          </div>
        </div>
      </div>

    </section>

  </div>
</template>

<style scoped>
/* KRITISCH: Container mit voller Viewport-Breite */
.fullwidth-container {
  width: 100vw; /* Volle Viewport-Breite */
  position: relative;
  left: 50%; /* Zentrieren */
  right: 50%;
  margin-left: -50vw; /* Zurück zur vollen Breite */
  margin-right: -50vw;
  background: #000000; /* Komplett schwarz */
  padding-top: 0; /* Entfernt Padding oben für Header Overlay */
}

/* YouTube Section - VOLLBILD */
.youtube-section {
  width: 100vw;
  height: 100vh; /* Volle Viewport-Höhe */
  position: relative;
  overflow: hidden;
}

/* Vollbild Video Container */
.video-container-fullscreen {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
}

.video-container-fullscreen iframe {
  position: absolute;
  top: 50%;
  left: 50%;
  /* Noch aggressivere Skalierung - garantiert keine schwarzen Balken */
  width: 150vw;
  height: 150vh;
  min-width: 150vw;
  min-height: 150vh;
  transform: translate(-50%, -50%);
  object-fit: cover;
  pointer-events: auto; /* Erlaubt Interaktion mit dem Video falls gewünscht */
}

/* Subtiler Overlay für bessere Header-Lesbarkeit */
.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 90px; /* Reduziert für dünneren Header */
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    transparent 100%
  );
  pointer-events: none; /* Erlaubt Klicks durch das Overlay */
  z-index: 1;
}

/* Watchlist Section */
.watchlist-section {
  width: 100%;
  padding: 4rem 2rem 3rem;
  background: #000000; /* Komplett schwarz */
  min-height: 100vh; /* Mindestens Vollbild-Höhe */
  position: relative;
  z-index: 2;
}

.watchlist-header {
  text-align: center;
  margin-bottom: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.watchlist-header h1 {
  font-size: 3.5rem;
  color: var(--color-heading);
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ff0000, #cc0000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.watchlist-header p {
  font-size: 1.3rem;
  color: var(--color-text);
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

/* Table Wrapper für volle Breite */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 3rem; /* Abstand zu den Statistiken */
}

/* Statistiken Section - NEU */
.stats-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 1200px;
  margin: 0 auto;
}

.stats-section h2 {
  font-size: 1.8rem;
  color: var(--color-heading);
  margin-bottom: 1.5rem;
  text-align: center;
}

.loading-stats {
  text-align: center;
  padding: 2rem;
  color: var(--color-text);
  opacity: 0.8;
}

.error-stats {
  text-align: center;
  padding: 2rem;
  color: #ff0000;
}

.retry-btn {
  background: linear-gradient(45deg, #ff0000, #cc0000);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: linear-gradient(45deg, #cc0000, #990000);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-info h3 {
  font-size: 2rem;
  color: var(--color-heading);
  margin: 0;
}

.stat-info p {
  color: var(--color-text);
  margin: 0;
  opacity: 0.8;
}

/* Überschreibung für volle Tabellenbreite */
:deep(.table-wrapper table) {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  background: transparent !important;
}

:deep(.table-wrapper th) {
  background: rgba(255, 255, 255, 0.05) !important; /* Gleiches Design wie td */
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  font-weight: bold;
  color: var(--color-heading) !important;
}

:deep(.table-wrapper td) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

:deep(.table-wrapper tr:hover) {
  background: rgba(255, 0, 0, 0.1) !important;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .watchlist-section {
    padding: 3rem 1.5rem 2rem;
  }

  .watchlist-header h1 {
    font-size: 3rem;
  }

  .watchlist-header p {
    font-size: 1.1rem;
  }

  .stats-section {
    margin: 0 1rem;
  }
}

@media (max-width: 768px) {
  .watchlist-section {
    padding: 2rem 1rem;
  }

  .watchlist-header h1 {
    font-size: 2.5rem;
  }

  .watchlist-header p {
    font-size: 1rem;
  }

  .stats-section {
    padding: 1.5rem;
    margin: 0 0.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* YouTube Section bleibt Vollbild auch auf Mobile */
  .youtube-section {
    height: 60vh; /* Etwas kleiner auf Mobile für bessere UX */
  }
}

@media (max-width: 480px) {
  .watchlist-header h1 {
    font-size: 2rem;
  }

  .youtube-section {
    height: 50vh; /* Noch kompakter auf sehr kleinen Bildschirmen */
  }

  .video-overlay {
    height: 80px; /* Kleinerer Overlay für dünneren Header auf Mobile */
  }

  .stats-section {
    padding: 1rem;
    margin: 0;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Smooth Scrolling */
html {
  scroll-behavior: smooth;
}

/* Verhindert horizontalen Scroll */
body {
  overflow-x: hidden;
}

/* Zusätzliche Glasmorphism-Effekte für moderne Optik */
.watchlist-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    #000000 100% /* Komplett schwarz */
  );
  z-index: 1;
}

.watchlist-section > * {
  position: relative;
  z-index: 2;
}
</style>
