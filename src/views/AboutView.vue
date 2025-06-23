<script setup lang="ts">
import {ref} from 'vue'
import DynamicForm from '../components/DynamicForm.vue'
import type {Watchlist} from '@/types'

function handleItemsLoaded(items: Watchlist[]) {
  console.log('Items loaded in AboutView:', items)
}

function handleItemAdded(item: Watchlist) {
  console.log('Item added in AboutView:', item)
}
</script>

<template>
  <!-- Container mit voller Breite -->
  <div class="about-container">
    <div class="form-wrapper">
      <DynamicForm
        title="Meine Watchlist"
        @items-loaded="handleItemsLoaded"
        @item-added="handleItemAdded"
      />
    </div>
  </div>
</template>

<style scoped>
/* Container mit voller Viewport-Breite und Header-Abstand */
.about-container {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem 2rem; /* Top-Padding für Header */
}

/* Wrapper für die Form - zentral und responsive */
.form-wrapper {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .about-container {
    padding: 5rem 1rem 2rem; /* Weniger Abstand auf Mobile */
    align-items: flex-start; /* Form startet oben statt zentriert */
  }

  .form-wrapper {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .about-container {
    padding: 4.5rem 0.5rem 1rem; /* Minimaler Abstand auf sehr kleinen Bildschirmen */
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
</style>
