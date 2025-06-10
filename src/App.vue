<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuth } from '@/stores/auth'
import HelloWorld from './components/HelloWorld.vue'

const { isAuthenticated, currentUser } = useAuth()
</script>

<template>
  <div class="app-container">
    <!-- Header nur anzeigen wenn eingeloggt -->
    <header v-if="isAuthenticated" class="app-header">
      <div class="header-content">
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="60" height="60" />

        <div class="header-info">
          <HelloWorld msg="Watchlist" />
          <div class="user-welcome">
            Hallo, {{ currentUser?.firstName }}!
          </div>
        </div>

        <nav class="main-nav">
          <RouterLink to="/" class="nav-link">🏠 Home</RouterLink>
          <RouterLink to="/about" class="nav-link">➕ Eintrag erstellen</RouterLink>
          <RouterLink to="/account" class="nav-link">👤 Account</RouterLink>
        </nav>
      </div>
    </header>

    <!-- Main Content nimmt volle Breite -->
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Kompakter Header */
.app-header {
  width: 100%;
  background: #000000; /* Schwarzer Hintergrund */
  border-bottom: 2px solid #333333;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.logo {
  flex-shrink: 0;
}

.header-info {
  flex: 1;
  text-align: center;
}

.user-welcome {
  color: #cccccc;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  opacity: 0.8;
}

/* Navigation rechts */
.main-nav {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.nav-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  border: 2px solid #333333;
  border-radius: 8px;
  text-decoration: none;
  color: #ffffff; /* Weiße Schrift auf schwarzem Hintergrund */
  transition: all 0.3s;
  font-weight: 500;
}

.nav-link:hover {
  background-color: rgba(255, 0, 0, 0.2);
  border-color: #ff0000;
  color: #ff0000;
}

.nav-link.router-link-exact-active {
  background-color: #ff0000;
  color: white;
  border-color: #ff0000;
}

/* Main Content - VOLLE BREITE */
.main-content {
  flex: 1;
  width: 100%;
  /* Kein max-width, kein margin - volle Breite! */
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .header-info {
    order: 1;
  }

  .logo {
    order: 2;
    width: 50px;
    height: 50px;
  }

  .main-nav {
    order: 3;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }

  .main-nav {
    width: 100%;
    justify-content: space-around;
  }

  .nav-link {
    flex: 1;
    text-align: center;
    min-width: 100px;
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
  }
}

/* Override für HelloWorld component */
:deep(.greetings h1) {
  font-size: 1.8rem;
  margin: 0;
  color: #ffffff; /* Weiße Schrift für besseren Kontrast */
}

:deep(.greetings h3) {
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
  color: #cccccc; /* Hellgraue Schrift für den Untertitel */
}

@media (max-width: 1024px) {
  :deep(.greetings h1),
  :deep(.greetings h3) {
    text-align: center;
  }
}
</style>
