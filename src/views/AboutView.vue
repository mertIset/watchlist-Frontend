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
  <div class="about">
    <DynamicForm
      title="Meine Watchlist"
      @items-loaded="handleItemsLoaded"
      @item-added="handleItemAdded"
    />
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
