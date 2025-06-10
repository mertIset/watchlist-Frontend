<template>
  <div class="account-container">
    <div class="account-header">
      <h1>👤 Mein Account</h1>
      <p>Verwalten Sie Ihre Kontoinformationen</p>
    </div>

    <div class="account-content">
      <!-- Benutzerinformationen -->
      <div class="info-section">
        <h2>Kontoinformationen</h2>

        <div v-if="!editing" class="info-display">
          <div class="info-grid">
            <div class="info-item">
              <label>Benutzername:</label>
              <span>{{ user?.username }}</span>
            </div>

            <div class="info-item">
              <label>E-Mail:</label>
              <span>{{ user?.email }}</span>
            </div>

            <div class="info-item">
              <label>Vorname:</label>
              <span>{{ user?.firstName }}</span>
            </div>

            <div class="info-item">
              <label>Nachname:</label>
              <span>{{ user?.lastName }}</span>
            </div>

            <div class="info-item">
              <label>Mitglied seit:</label>
              <span>{{ formatDate(user?.createdAt) }}</span>
            </div>

            <div class="info-item">
              <label>Letzter Login:</label>
              <span>{{ formatDate(user?.lastLogin) || 'Noch nie' }}</span>
            </div>
          </div>

          <button @click="startEditing" class="edit-btn">
            ✏️ Bearbeiten
          </button>
        </div>

        <!-- Bearbeitungsformular -->
        <div v-else class="edit-form">
          <form @submit.prevent="saveChanges">
            <div class="form-group">
              <label for="editFirstName">Vorname:</label>
              <input
                id="editFirstName"
                v-model="editForm.firstName"
                type="text"
                required
                :disabled="saving"
              />
            </div>

            <div class="form-group">
              <label for="editLastName">Nachname:</label>
              <input
                id="editLastName"
                v-model="editForm.lastName"
                type="text"
                required
                :disabled="saving"
              />
            </div>

            <div class="form-group">
              <label for="editEmail">E-Mail:</label>
              <input
                id="editEmail"
                v-model="editForm.email"
                type="email"
                required
                :disabled="saving"
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="save-btn" :disabled="saving">
                {{ saving ? 'Speichern...' : '💾 Speichern' }}
              </button>
              <button type="button" @click="cancelEditing" class="cancel-btn" :disabled="saving">
                ❌ Abbrechen
              </button>
            </div>

            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <div v-if="successMessage" class="success-message">
              {{ successMessage }}
            </div>
          </form>
        </div>
      </div>

      <!-- Statistiken -->
      <div class="stats-section">
        <h2>📊 Ihre Watchlist-Statistiken</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📽️</div>
            <div class="stat-info">
              <h3>{{ watchlistStats.total }}</h3>
              <p>Einträge gesamt</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <h3>{{ watchlistStats.watched }}</h3>
              <p>Gesehen</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
              <h3>{{ watchlistStats.unwatched }}</h3>
              <p>Noch zu sehen</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <h3>{{ watchlistStats.averageRating.toFixed(1) }}</h3>
              <p>Ø Bewertung</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Logout Bereich -->
      <div class="logout-section">
        <h2>🔐 Sicherheit</h2>
        <p>Melden Sie sich ab, wenn Sie fertig sind.</p>
        <button @click="handleLogout" class="logout-btn">
          Abmelden
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { AuthService } from '@/services/authService'
import type { UpdateUserRequest } from '@/types/auth'

const router = useRouter()
const { currentUser: user, logout, updateUser } = useAuth()

const editing = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const editForm = ref<UpdateUserRequest>({
  firstName: '',
  lastName: '',
  email: ''
})

// Mock watchlist stats - in einer echten App würden diese vom Backend kommen
const watchlistStats = ref({
  total: 0,
  watched: 0,
  unwatched: 0,
  averageRating: 0
})

const formatDate = (dateString?: string) => {
  if (!dateString) return null

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Ungültiges Datum'
  }
}

const startEditing = () => {
  if (user.value) {
    editForm.value = {
      firstName: user.value.firstName,
      lastName: user.value.lastName,
      email: user.value.email
    }
    editing.value = true
    errorMessage.value = ''
    successMessage.value = ''
  }
}

const cancelEditing = () => {
  editing.value = false
  errorMessage.value = ''
  successMessage.value = ''
}

const saveChanges = async () => {
  if (!user.value) return

  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const updatedUser = await AuthService.updateUser(user.value.id, editForm.value)
    updateUser(updatedUser)
    successMessage.value = 'Änderungen erfolgreich gespeichert!'

    setTimeout(() => {
      editing.value = false
      successMessage.value = ''
    }, 2000)
  } catch (error: any) {
    errorMessage.value = error.message || 'Fehler beim Speichern der Änderungen'
  } finally {
    saving.value = false
  }
}

const handleLogout = () => {
  if (confirm('Möchten Sie sich wirklich abmelden?')) {
    logout()
    router.push('/login')
  }
}

// Load watchlist stats (Mock-Daten)
const loadWatchlistStats = () => {
  // In einer echten App würden hier die echten Statistiken vom Backend geladen
  watchlistStats.value = {
    total: 15,
    watched: 8,
    unwatched: 7,
    averageRating: 7.8
  }
}

onMounted(() => {
  loadWatchlistStats()
})
</script>

<style scoped>
.account-container {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  min-height: 100vh;
  background: var(--color-background);
  padding: 2rem;
}

.account-header {
  text-align: center;
  margin-bottom: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.account-header h1 {
  font-size: 3rem;
  color: var(--color-heading);
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ff0000, #cc0000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.account-header p {
  font-size: 1.2rem;
  color: var(--color-text);
  opacity: 0.8;
}

.account-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.info-section,
.stats-section,
.logout-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-section h2,
.stats-section h2,
.logout-section h2 {
  font-size: 1.8rem;
  color: var(--color-heading);
  margin-bottom: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-weight: bold;
  color: var(--color-heading);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  color: var(--color-text);
  font-size: 1.1rem;
  padding: 0.5rem 0;
}

.edit-btn {
  background: linear-gradient(45deg, #ff0000, #cc0000);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: linear-gradient(45deg, #cc0000, #990000);
  transform: translateY(-2px);
}

.edit-form {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.save-btn,
.cancel-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background: linear-gradient(45deg, #00aa00, #008800);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #008800, #006600);
  transform: translateY(-2px);
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.cancel-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.save-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid #ff0000;
  color: #ff0000;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.success-message {
  background: rgba(0, 255, 0, 0.2);
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-info h3 {
  font-size: 2rem;
  color: var(--color-heading);
  margin: 0;
}

.stat-info p {
  color: var(--color-text);
  margin: 0;
  opacity: 0.8;
}

.logout-section {
  text-align: center;
}

.logout-section p {
  color: var(--color-text);
  margin-bottom: 2rem;
  opacity: 0.8;
}

.logout-btn {
  background: linear-gradient(45deg, #ff4444, #cc0000);
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: linear-gradient(45deg, #cc0000, #990000);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 0, 0, 0.4);
}

@media (max-width: 768px) {
  .account-container {
    padding: 1rem;
  }

  .account-header h1 {
    font-size: 2.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-actions {
    flex-direction: column;
  }

  .save-btn,
  .cancel-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>-group {
display: flex;
flex-direction: column;
gap: 0.5rem;
margin-bottom: 1.5rem;
}

.form-group label {
font-weight: bold;
color: var(--color-heading);
}

.form-group input {
padding: 1rem;
border: 2px solid rgba(255, 255, 255, 0.2);
border-radius: 8px;
background: rgba(255, 255, 255, 0.1);
color: var(--color-text);
font-size: 1rem;
}

.form-group input:focus {
outline: none;
border-color: #ff0000;
box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
}

.form
