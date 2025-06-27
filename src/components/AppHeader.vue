<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/stores/auth'

const { currentUser } = useAuth()
const isDropdownOpen = ref(false)
const isOverVideo = ref(true) // Startet als true, da Header initial über Video ist

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

// Scroll-Detection für transparenten Header
const handleScroll = () => {
  const scrollY = window.scrollY
  const videoSection = document.querySelector('.youtube-section') as HTMLElement

  if (videoSection) {
    const videoHeight = videoSection.offsetHeight
    const headerHeight = 80 // Angepasst für dünneren Header

    // Header ist über Video wenn scroll position < video height - header height
    isOverVideo.value = scrollY < (videoHeight - headerHeight)
  }
}

// Event Listener für Click Outside
const handleClickOutside = (event: Event) => {
  const dropdown = document.querySelector('.dropdown-container')
  if (dropdown && !dropdown.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
  // Initial check
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header
    class="app-header"
    :class="{
      'over-video': isOverVideo,
      'over-content': !isOverVideo
    }"
  >
    <div class="header-content">
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="60" height="60" />

      <div class="header-info">
        <div class="greetings">
          <h1 class="green">Watchlist</h1>
          <h3>Willkommen zu deiner persönlichen Watchlist, {{ currentUser?.firstName }}!</h3>
        </div>
      </div>

      <!-- Dropdown Navigation -->
      <nav class="main-nav">
        <div class="dropdown-container">
          <button
            @click="toggleDropdown"
            class="dropdown-trigger"
            :class="{ 'active': isDropdownOpen }"
          >
            <span class="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
            <span class="menu-text">Menü</span>
          </button>

          <div
            class="dropdown-menu"
            :class="{ 'show': isDropdownOpen }"
          >
            <RouterLink
              to="/"
              class="dropdown-link"
              @click="closeDropdown"
            >
              Home
            </RouterLink>
            <RouterLink
              to="/about"
              class="dropdown-link"
              @click="closeDropdown"
            >
              Eintrag erstellen
            </RouterLink>
            <RouterLink
              to="/account"
              class="dropdown-link"
              @click="closeDropdown"
            >
              Account
            </RouterLink>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
/* Header Basis-Styling */
.app-header {
  width: 100%;
  padding: 0.5rem 0; /* Reduziert von 1rem auf 0.5rem */
  position: fixed; /* Fixed statt sticky für bessere Kontrolle */
  top: 0;
  left: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

/* Header über Video - Komplett transparent */
.app-header.over-video {
  background: transparent;
  border-bottom: none; /* Entfernt die Kante */
  box-shadow: none; /* Entfernt den Schatten für nahtlosen Übergang */
}

/* Header über Content - Solider schwarzer Hintergrund */
.app-header.over-content {
  background: #000000;
  border-bottom: 2px solid #333333;
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
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
}

.header-info {
  flex: 1;
  text-align: left;
}

.greetings h1 {
  font-weight: 500;
  font-size: 1.8rem;
  margin: 0;
  color: hsl(0, 100%, 50%);
  transition: 0.4s;
  padding: 3px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.greetings h3 {
  font-size: 1rem;
  margin: 0;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

/* Dropdown Navigation */
.main-nav {
  position: relative;
  flex-shrink: 0;
}

.dropdown-container {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  background: transparent; /* Kein Button-Hintergrund */
  border: none; /* Kein Border */
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  min-width: auto; /* Automatische Breite */
  justify-content: center;
}

.dropdown-trigger:hover {
  background: rgba(255, 255, 255, 0.1); /* Subtiler Hover-Effekt */
  transform: none; /* Kein Transform beim Hover */
  box-shadow: none; /* Kein Schatten */
}

.dropdown-trigger.active {
  background: rgba(255, 255, 255, 0.15); /* Leicht sichtbar wenn aktiv */
}

/* Hamburger Icon */
.hamburger-icon {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 20px;
}

.hamburger-icon span {
  width: 100%;
  height: 2px;
  background: white;
  border-radius: 1px;
  transition: all 0.3s ease;
  /* Schatten entfernt für cleanen Look */
}

.dropdown-trigger.active .hamburger-icon span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.dropdown-trigger.active .hamburger-icon span:nth-child(2) {
  opacity: 0;
}

.dropdown-trigger.active .hamburger-icon span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.menu-text {
  font-size: 0.9rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); /* Behält Lesbarkeit */
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 250px;
  background: rgba(0, 0, 0, 0.3); /* Transparenter Hintergrund */
  backdrop-filter: blur(20px); /* Stärkerer Blur für bessere Lesbarkeit */
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1001;
  overflow: hidden;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-link {
  display: block;
  padding: 1rem 1.5rem;
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-link:last-child {
  border-bottom: none;
}

.dropdown-link:hover {
  background: rgba(255, 0, 0, 0.3);
  color: #ff0000;
  padding-left: 2rem;
}

.dropdown-link.router-link-exact-active {
  background: linear-gradient(90deg, rgba(255, 0, 0, 0.4), transparent);
  color: #ff0000;
  border-left: 4px solid #ff0000;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: row; /* Behält horizontale Anordnung bei */
    text-align: left;
    gap: 1rem;
    padding: 0 1rem;
  }

  .logo {
    width: 50px;
    height: 50px;
  }

  .greetings h1 {
    font-size: 1.5rem;
  }

  .greetings h3 {
    font-size: 0.9rem;
  }

  .dropdown-menu {
    right: 0;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }

  .dropdown-trigger {
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
  }

  .dropdown-menu {
    min-width: 200px;
  }

  .menu-text {
    font-size: 0.8rem;
  }

  .greetings h1 {
    font-size: 1.3rem;
  }

  .greetings h3 {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .dropdown-trigger {
    padding: 0.3rem 0.5rem;
  }

  .menu-text {
    display: none;
  }

  .dropdown-menu {
    min-width: 180px;
  }

  .dropdown-link {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }

  .greetings h1 {
    font-size: 1.2rem;
  }

  .greetings h3 {
    display: none; /* Versteckt Untertitel auf sehr kleinen Bildschirmen */
  }
}
</style>
