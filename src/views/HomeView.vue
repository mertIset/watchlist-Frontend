<script setup lang="ts">
import {ref, onMounted} from 'vue'
import WatchlistTable from '../components/WatchlistTable.vue'
import DynamicForm from '../components/DynamicForm.vue'
import type {Watchlist} from '@/types'
import type {Ref} from 'vue'

const watchlistItems: Ref<Watchlist[]> = ref([])
const dynamicFormRef = ref<InstanceType<typeof DynamicForm> | null>(null)

// YouTube Playlist Configuration
const youtubePlaylistId = ref('PLHj9uMZo6puv11aV1kjbL0kq9hY_f7zHj')
const showYouTubePlayer = ref(true) // Always show - no toggle needed

function handleItemsLoaded(items: Watchlist[]) {
  watchlistItems.value = items
}

function handleItemAdded(item: Watchlist) {
  console.log('New item added:', item)
}

async function handleItemDeleted(deletedId: number) {
  console.log('Item deleted with ID:', deletedId)
  watchlistItems.value = watchlistItems.value.filter(item => item.id !== deletedId)

  if (dynamicFormRef.value) {
    await dynamicFormRef.value.loadWatchlistItems()
  }
}
onMounted(async () => {
  console.log('HomeView mounted')
})
</script>

<template>
  <!-- WICHTIG: Container mit voller Viewport-Breite -->
  <div class="fullwidth-container">

    <!-- YouTube Section - GANZ OBEN, VOLLE BREITE -->
    <section class="youtube-section">


      <!-- YouTube Player Container -->
      <div class="player-section">
        <div class="video-container">
          <iframe
            :src="`https://www.youtube.com/embed/videoseries?list=${youtubePlaylistId}&autoplay=1&controls=1&modestbranding=1&rel=0&mute=1&loop=1`"
            title="YouTube Playlist - Automatisch abspielend"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      </div>
    </section>



    <!-- Watchlist Section -->
    <section id="watchlist-section" class="watchlist-section">
      <div class="watchlist-header">
        <h1>Meine Watchlist</h1>
        <p>Verwalten Sie Ihre persönliche Film- und Seriensammlung</p>
      </div>

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
        />
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
  background: var(--color-background);
}

/* YouTube Section - VOLLE BREITE */
.youtube-section {
  width: 100%;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.youtube-header {
  text-align: center;
  margin-bottom: 2rem;
}

.youtube-header h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ff0000, #ffaa00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Removed button styles - no controls needed */

/* Player Section */
.player-section {
  max-width: 1400px;
  margin: 0 auto;
}

.video-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 */
  margin-bottom: 2rem;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  background: #000;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Removed playlist configuration styles - no longer needed */

/* Section Separator */
.section-separator {
  height: 5px;
  background: linear-gradient(90deg, transparent, #ff0000, #ffaa00, #ff0000, transparent);
  box-shadow: 0 2px 10px rgba(255, 0, 0, 0.3);
}

/* Watchlist Section */
.watchlist-section {
  width: 100%;
  padding: 3rem 2rem;
  background: var(--color-background);
  min-height: 60vh;
}

.watchlist-header {
  text-align: center;
  margin-bottom: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.watchlist-header h1 {
  font-size: 3rem;
  color: var(--color-heading);
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ff0000, #cc0000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.watchlist-header p {
  font-size: 1.2rem;
  color: var(--color-text);
  opacity: 0.8;
}

/* Table Wrapper für volle Breite */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* Überschreibung für volle Tabellenbreite */
:deep(.table-wrapper table) {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .youtube-section {
    padding: 1.5rem;
  }

  .watchlist-section {
    padding: 2rem 1rem;
  }

  .youtube-header h2 {
    font-size: 2rem;
  }

  .watchlist-header h1 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .fullwidth-container {
    margin-left: -50vw;
    margin-right: -50vw;
  }
}

/* Smooth Scrolling */
html {
  scroll-behavior: smooth;
}
</style>
