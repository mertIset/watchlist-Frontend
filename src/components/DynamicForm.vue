<template>
  <h3>{{ title }}</h3>
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
  </div>
  <div>
    <table>
      <thead>
      <tr>
        <th>Title</th>
        <th>Type</th>
        <th>Genre</th>
        <th>Watched</th>
        <th>Rating</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="items.length === 0">
        <td colspan="5">No watchlist items yet</td>
      </tr>
      <tr v-for="item in items" :key="item.id">
        <td>{{ item.title }}</td>
        <td>{{ item.type }}</td>
        <td>{{ item.genre }}</td>
        <td>{{ item.watched ? 'Yes' : 'No' }}</td>
        <td>{{ item.rating }}</td>
      </tr>
      <tr>
        <td>{{ titleField }}</td>
        <td>{{ typeField }}</td>
        <td>{{ genreField }}</td>
        <td>{{ watchedField ? 'Yes' : 'No' }}</td>
        <td>{{ ratingField }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import axios from 'axios'
import type {AxiosResponse} from 'axios'
import type {Watchlist} from '@/types'
import type {Ref} from 'vue'


defineProps<{
  title: string
}>()

const items: Ref<Watchlist[]> = ref([])
const titleField = ref('')
const typeField = ref('')
const genreField = ref('')
const watchedField = ref(false)
const ratingField = ref(0)

async function loadWatchlistItems () {
  const baseUrl = 'https://watchlist-backend-vb24.onrender.com'
  const endpoint = baseUrl + '/watchlist'
  const response: AxiosResponse = await axios.get(endpoint);
  const responseData: Watchlist[] = response.data;
  items.value = responseData
}

async function save () {
  const baseUrl = 'https://watchlist-backend-vb24.onrender.com'
  const endpoint = baseUrl + '/watchlist'
  const data: Watchlist = {
    title: titleField.value,
    type: typeField.value,
    genre: genreField.value,
    watched: watchedField.value,
    rating: ratingField.value
  }
  const response: AxiosResponse = await axios.post(endpoint, data);
  const responseData: Watchlist = response.data;
  console.log('Success:', responseData)

  // Clear form after successful save
  titleField.value = ''
  typeField.value = ''
  genreField.value = ''
  watchedField.value = false
  ratingField.value = 0

  // Reload items to show the new entry
  await loadWatchlistItems()
}

// Lifecycle hooks
onMounted(async () => {
  await loadWatchlistItems()
})
</script>

<style scoped>
h3 {
  text-align: center;
}

div:first-of-type {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

input, select {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

label {
  display: flex;
  align-items: center;
  gap: 5px;
}

table {
  margin-left: auto;
  margin-right: auto;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

button {
  color: blue;
  padding: 5px 15px;
  border: 1px solid blue;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

button:hover {
  background-color: #f0f0f0;
}
</style>
