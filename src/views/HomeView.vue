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

    <!-- YouTube Section - GANZ OBEN, VOLLE BREITE, VOLLE HÖHE -->
    <section class="youtube-section">
      <!-- YouTube Player Container - Vollbild -->
      <div class="video-container-fullscreen">
        <iframe
          :src="`https://www.youtube.com/embed/videoseries?list=${youtubePlaylistId}&autoplay=1&controls=1&modestbranding=1&rel=0&mute=1&loop=1`"
          title="YouTube Playlist - Automatisch abspielend"
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
      <div class="watchlist-header">
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  background: var(--color-background);
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
  /* Entfernt: background, border-radius, padding, backdrop-filter, border, box-shadow */
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

  .table-wrapper {
    /* Entfernt: padding */
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

  .table-wrapper {
    /* Entfernt: padding */
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
    var(--color-background) 100%
  );
  z-index: 1;
}

.watchlist-section > * {
  position: relative;
  z-index: 2;
}
</style>
