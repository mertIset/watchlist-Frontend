<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>🎬 Watchlist</h1>
        <h2>Registrieren</h2>
        <p>Erstellen Sie Ihr kostenloses Konto für Ihre persönliche Watchlist</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Vorname</label>
            <input
              id="firstName"
              v-model="firstName"
              type="text"
              placeholder="Vorname"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="lastName">Nachname</label>
            <input
              id="lastName"
              v-model="lastName"
              type="text"
              placeholder="Nachname"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="username">Benutzername</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Benutzername wählen"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="email">E-Mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="ihre@email.com"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">Passwort</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Sicheres Passwort wählen"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Passwort bestätigen</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Passwort wiederholen"
            required
            :disabled="loading"
          />
        </div>

        <button type="submit" class="register-btn" :disabled="loading">
          {{ loading ? 'Registrierung läuft...' : 'Konto erstellen' }}
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </form>

      <div class="login-link">
        <p>Bereits ein Konto?</p>
        <router-link to="/login" class="login-btn-link">
          Hier anmelden
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '@/services/authService'
import { useAuth } from '@/stores/auth'
import type { RegisterRequest } from '@/types/auth'

const router = useRouter()
const { setUser } = useAuth()

const firstName = ref('')
const lastName = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleRegister() {
  // Validation
  if (!firstName.value || !lastName.value || !username.value || !email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Bitte füllen Sie alle Felder aus'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Die Passwörter stimmen nicht überein'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Das Passwort muss mindestens 6 Zeichen lang sein'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const userData: RegisterRequest = {
      firstName: firstName.value,
      lastName: lastName.value,
      username: username.value,
      email: email.value,
      password: password.value
    }

    const response = await AuthService.register(userData)

    if (response.success && response.user) {
      successMessage.value = 'Registrierung erfolgreich! Sie werden weitergeleitet...'
      setUser(response.user)

      // Kurz warten, dann weiterleiten
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      errorMessage.value = response.message || 'Registrierung fehlgeschlagen'
    }
  } catch (error) {
    errorMessage.value = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
    console.error('Register error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 2rem;
}

.register-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 3rem;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ff0000, #ffaa00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-header h2 {
  font-size: 2rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.register-header p {
  color: #cccccc;
  font-size: 1rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #ffffff;
  font-weight: 500;
  font-size: 1rem;
}

.form-group input {
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #ff0000;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-btn {
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #ff0000, #cc0000);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.register-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #cc0000, #990000);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 0, 0, 0.4);
}

.register-btn:disabled {
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
  text-align: center;
  font-weight: 500;
}

.success-message {
  background: rgba(0, 255, 0, 0.2);
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.login-link {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.login-link p {
  color: #cccccc;
  margin-bottom: 1rem;
}

.login-btn-link {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background: transparent;
  color: #ffaa00;
  border: 2px solid #ffaa00;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-btn-link:hover {
  background: #ffaa00;
  color: #1a1a1a;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
  }

  .register-card {
    padding: 2rem;
  }

  .register-header h1 {
    font-size: 2.5rem;
  }

  .register-header h2 {
    font-size: 1.8rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
