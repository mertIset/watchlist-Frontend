<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'

const openReadmeInEditor = () => fetch('/__open-in-editor?file=README.md')
interface WatchlistEntry {
  id: number
  title: string
  type: string
  genre: string
  watched: boolean
  rating: number
}

const watchlist: WatchlistEntry[] = [
  {
    id: 1,
    title: 'Breaking Bad',
    type: 'Serie',
    genre: 'Drama',
    watched: true,
    rating: 10
  },
  {
    id: 2,
    title: 'Inception',
    type: 'Film',
    genre: 'Science-Fiction',
    watched: true,
    rating: 9
  },
  {
    id: 3,
    title: 'Dark',
    type: 'Serie',
    genre: 'Mystery',
    watched: false,
    rating: 0
  }
]
</script>

<template>

  <WelcomeItem>
    <template #icon>
      <SupportIcon />
    </template>
    <template #heading>Watchlist</template>
    <hr />
    <ul>
      <li v-for="entry in watchlist" :key="entry.id">
        <strong>{{ entry.title }}</strong> ({{ entry.type }})<br />
        Genre: {{ entry.genre }}<br />
        Gesehen: {{ entry.watched ? 'Ja' : 'Nein' }}<br />
        Bewertung: {{ entry.rating > 0 ? entry.rating + '/10' : 'Noch nicht bewertet' }}
        <hr />
      </li>
    </ul>
  </WelcomeItem>
</template>

