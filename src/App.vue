<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth } from '@/stores/auth'
import AppHeader from './components/AppHeader.vue'

const { isAuthenticated } = useAuth()
</script>

<template>
  <div class="app-container">
    <!-- Header nur anzeigen wenn eingeloggt -->
    <AppHeader v-if="isAuthenticated" />

    <!-- Main Content nimmt volle Breite -->
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Main Content - VOLLE BREITE */
.main-content {
  flex: 1;
  width: 100%;
  /* Kein max-width, kein margin - volle Breite! */
}
</style>
