<template>
  <div style="border: 2px solid #1f1e1e; padding: 20px; margin: 20px;">
    <p><strong>Erstellen Sie einen neuen Eintrag:</strong></p>

    <div>
      <input v-model="titleField" placeholder="Title" type="text">
      <select v-model="typeField">
        <option value="">Select Type</option>
        <option value="Movie">Movie</option>
        <option value="TV Show">TV Show</option>
        <option value="Documentary">Documentary</option>
        <option value="Anime">Anime</option>
      </select>
      <input v-model="genreField" placeholder="Genre" type="text">
      <label>
        <input v-model="watchedField" type="checkbox"> Watched
      </label>
      <input v-model="ratingField" placeholder="Rating (1-10)" type="number" min="1" max="10">
      <button type="button" @click="save()">Save</button>
      <button type="button" @click="testBackend()">Test Backend</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import axios from 'axios'
import type {AxiosResponse} from 'axios'
import type {Watchlist} from '@/types'

defineProps<{
  title: string
}>()

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

async function testBackend() {
  console.log('Testing backend connection...')
  const baseUrl = getBackendUrl()
  const endpoint = `${baseUrl}/Watchlist`

  try {
    console.log('Making request to:', endpoint)
    const response = await axios.get(endpoint)
    console.log('Backend response:', response)
    alert(`Backend erreichbar! ${response.data.length} Items gefunden.`)
  } catch (error) {
    console.error('Backend connection failed:', error)
    alert(`Backend nicht erreichbar: ${error}`)
  }
}

async function loadWatchlistItems() {
  try {
    console.log('=== Loading Watchlist Items ===')
    const baseUrl = getBackendUrl()
    const endpoint = `${baseUrl}/Watchlist`
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
  try {
    console.log('=== Saving Watchlist Item ===')
    const baseUrl = getBackendUrl()
    const endpoint = `${baseUrl}/Watchlist`

    const data: Omit<Watchlist, 'id'> = {
      title: titleField.value,
      type: typeField.value,
      genre: genreField.value,
      watched: watchedField.value,
      rating: ratingField.value
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
h3 {
  text-align: center;
}

div:nth-of-type(2) {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

input, select {
  padding: 5px;
  border: 1px solid #1f1e1e;
  border-radius: 4px;
}

label {
  display: flex;
  align-items: center;
  gap: 5px;
}

button {
  color: #ff0000;
  padding: 5px 15px;
  border: 1px solid #ff0000;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  margin: 0 5px;
}

button:hover {
  background-color: #f0f0f0;
}
</style>
