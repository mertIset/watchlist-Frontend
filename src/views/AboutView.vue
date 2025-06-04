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
/* Container mit voller Viewport-Breite */
.about-container {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  min-height: 100vh;
  background: #1b1b1b; /* Schwarzer Hintergrund */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* Wrapper für die Form - zentral und größer */
.form-wrapper {
  width: 100%;
  max-width: 800px; /* Maximale Breite für bessere Lesbarkeit */
  margin: 0 auto;
}

/* Überschreibe DynamicForm Styles für größere Darstellung */
:deep(.form-wrapper > div) {
  border: 2px solid #333333 !important;
  padding: 3rem !important;
  margin: 0 !important;
  background: #1a1a1a !important; /* Dunkelgrauer Hintergrund für Kontrast */
  border-radius: 15px !important;
}

/* Titel größer und zentral */
:deep(h3) {
  text-align: center !important;
  font-size: 2.5rem !important;
  color: #ffffff !important;
  margin-bottom: 2rem !important;
  background: linear-gradient(45deg, #ff0000, #ffffff) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

/* Beschreibungstext */
:deep(p) {
  text-align: center !important;
  color: #cccccc !important;
  font-size: 1.2rem !important;
  margin-bottom: 2rem !important;
}

/* Form-Container größer */
:deep(div:nth-of-type(2)) {
  display: flex !important;
  gap: 1.5rem !important;
  justify-content: center !important;
  align-items: center !important;
  margin-bottom: 2rem !important;
  flex-wrap: wrap !important;
  padding: 2rem !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 10px !important;
}

/* Input-Felder größer und heller */
:deep(input), :deep(select) {
  padding: 12px 16px !important;
  border: 2px solid #444444 !important;
  border-radius: 8px !important;
  background: #2a2a2a !important;
  color: #ffffff !important;
  font-size: 1rem !important;
  min-width: 200px !important;
  transition: all 0.3s ease !important;
}

:deep(input:focus), :deep(select:focus) {
  outline: none !important;
  border-color: #ff0000 !important;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.3) !important;
}

:deep(input::placeholder) {
  color: #888888 !important;
}

/* Select-Optionen */
:deep(select option) {
  background: #2a2a2a !important;
  color: #ffffff !important;
}

/* Label für Checkbox größer */
:deep(label) {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  color: #ffffff !important;
  font-size: 1rem !important;
  font-weight: 500 !important;
}

:deep(input[type="checkbox"]) {
  min-width: 20px !important;
  width: 20px !important;
  height: 20px !important;
  accent-color: #ff0000 !important;
}

/* Buttons größer und ansprechender */
:deep(button) {
  color: #ffffff !important;
  padding: 12px 24px !important;
  border: 2px solid #ff0000 !important;
  border-radius: 8px !important;
  background: linear-gradient(45deg, #ff0000, #cc0000) !important;
  cursor: pointer !important;
  margin: 0 8px !important;
  font-size: 1rem !important;
  font-weight: bold !important;
  transition: all 0.3s ease !important;
  min-width: 150px !important;
}

:deep(button:hover) {
  background: linear-gradient(45deg, #cc0000, #990000) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(255, 0, 0, 0.4) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .about-container {
    padding: 1rem;
  }

  .form-wrapper {
    max-width: none;
  }

  :deep(.form-wrapper > div) {
    padding: 2rem 1.5rem !important;
  }

  :deep(h3) {
    font-size: 2rem !important;
  }

  :deep(div:nth-of-type(2)) {
    flex-direction: column !important;
    align-items: stretch !important;
    padding: 1.5rem !important;
  }

  :deep(input), :deep(select) {
    min-width: unset !important;
    width: 100% !important;
  }

  :deep(button) {
    width: 100% !important;
    margin: 0.5rem 0 !important;
    min-width: unset !important;
  }
}
</style>
