<script setup lang="ts">
import DynamicForm from '../components/DynamicForm.vue'
import TheWelcome from "@/components/TheWelcome.vue";
</script>


<template>
  <div class="about">
    <DynamicForm title="Meine Watchlist" />
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
