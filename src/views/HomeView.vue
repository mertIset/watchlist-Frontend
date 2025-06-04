<script setup lang="ts">
import {ref, onMounted} from 'vue'
import WatchlistTable from '../components/WatchlistTable.vue'
import DynamicForm from '../components/DynamicForm.vue'
import type {Watchlist} from '@/types'
import type {Ref} from 'vue'

const watchlistItems: Ref<Watchlist[]> = ref([])
const dynamicFormRef = ref<InstanceType<typeof DynamicForm> | null>(null)

function handleItemsLoaded(items: Watchlist[]) {
  watchlistItems.value = items
}

function handleItemAdded(item: Watchlist) {
  // Item wird bereits durch loadWatchlistItems aktualisiert
  console.log('New item added:', item)
}

async function handleItemDeleted(deletedId: number) {
  console.log('Item deleted with ID:', deletedId)
  // Remove item from local array immediately for better UX
  watchlistItems.value = watchlistItems.value.filter(item => item.id !== deletedId)

  // Optionally reload all items from backend to ensure consistency
  if (dynamicFormRef.value) {
    await dynamicFormRef.value.loadWatchlistItems()
  }
}

onMounted(async () => {
  // Items werden automatisch durch DynamicForm geladen
  console.log('HomeView mounted')
})
</script>

<template>
  <main>
    <!-- Versteckte DynamicForm nur zum Laden der Daten -->
    <DynamicForm
      ref="dynamicFormRef"
      title="Hidden Form"
      @items-loaded="handleItemsLoaded"
      @item-added="handleItemAdded"
      style="display: none;"
    />

    <!-- Tabelle mit den Watchlist Items -->
    <WatchlistTable
      :items="watchlistItems"
      @item-deleted="handleItemDeleted"
    />
  </main>
</template>
