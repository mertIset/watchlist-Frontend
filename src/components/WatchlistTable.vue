<template>
  <div style="margin: 20px;">
    <div>
      <table>
        <thead>
        <tr>
          <th>Title</th>
          <th>Type</th>
          <th>Genre</th>
          <th>Watched</th>
          <th>Rating</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="items.length === 0">
          <td colspan="6">No watchlist items yet</td>
        </tr>
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.title }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.genre }}</td>
          <td>{{ item.watched ? 'Yes' : 'No' }}</td>
          <td>{{ item.rating }}</td>
          <td>
            <button
              @click="deleteItem(item)"
              class="delete-btn"
              :disabled="deleting === item.id"
            >
              {{ deleting === item.id ? 'Deleting...' : 'Delete' }}
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import axios from 'axios'
import type {Watchlist} from '@/types'

defineProps<{
  items: Watchlist[]
}>()

const emit = defineEmits<{
  itemDeleted: [id: number]
}>()

const deleting = ref<number | null>(null)

// Bestimme die korrekte Backend-URL
const getBackendUrl = () => {
  const isDevelopment = import.meta.env.MODE === 'development'
  const url = isDevelopment
    ? import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080'
    : import.meta.env.VITE_BACKEND_BASE_URL || 'https://watchlist-backend-vb24.onrender.com'
  return url
}

async function deleteItem(item: Watchlist) {
  if (!item.id) {
    console.error('Cannot delete item without ID')
    return
  }

  if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
    return
  }

  try {
    deleting.value = item.id
    console.log('=== Deleting Watchlist Item ===')
    const baseUrl = getBackendUrl()
    const endpoint = `${baseUrl}/Watchlist/${item.id}`

    console.log('Deleting item from:', endpoint)

    await axios.delete(endpoint)
    console.log('✅ Successfully deleted item:', item.title)

    // Emit delete event to parent
    emit('itemDeleted', item.id)

  } catch (error) {
    console.error('❌ Error deleting watchlist item:', error)

    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status)
      console.error('Status Text:', error.response?.statusText)
      console.error('Response Data:', error.response?.data)
    }

    alert(`Error deleting item: ${error}`)
  } finally {
    deleting.value = null
  }
}
</script>

<style scoped>
h3 {
  text-align: center;
  margin-bottom: 20px;
}

table {
  margin-left: auto;
  margin-right: auto;
  border-collapse: collapse;
  width: 100%;
  max-width: 800px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f5f5f5;
}

button {
  color: blue;
  padding: 5px 15px;
  border: 1px solid blue;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  margin: 0 5px;
}

button:hover {
  background-color: #f0f0f0;
}

.delete-btn {
  color: red;
  border-color: red;
  padding: 3px 8px;
  font-size: 12px;
}

.delete-btn:hover {
  background-color: #ffe6e6;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-btn:disabled:hover {
  background-color: white;
}
</style>
