<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import DynamicForm from '../components/DynamicForm.vue'
</script>

<template>
  <main>
    <!-- Zeige die DynamicForm Komponente an -->
    <DynamicForm title="Meine Watchlist" />

    <!-- Optional: Behalte auch TheWelcome bei -->
    <hr style="margin: 2rem 0;">
    <TheWelcome />
  </main>
</template>
