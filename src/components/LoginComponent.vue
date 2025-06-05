<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>🎬 Watchlist</h1>
        <h2>Anmelden</h2>
        <p>Melden Sie sich an, um Ihre persönliche Watchlist zu verwalten</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Benutzername</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Benutzername eingeben"
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
            placeholder="Passwort eingeben"
            required
            :disabled="loading"
          />
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Anmelden...' : 'Anmelden' }}
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>

      <div class="register-link">
        <p>Noch kein Account?</p>
        <router-link to="/register" class="register-btn">
          Registrieren Sie sich hier
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
import type { LoginRequest } from '@/types/auth'

const router = useRouter()
const { setUser } = useAuth()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    errorMessage.value = 'Bitte füllen Sie alle Felder aus'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const credentials: LoginRequest = {
      username: username.value,
      password: password.value
    }

    const response = await AuthService.login(credentials)

    if (response.success && response.user) {
      setUser(response.user)
      router.push('/')
    } else {
      errorMessage.value = response.message || 'Login fehlgeschlagen'
    }
  } catch (error) {
    errorMessage.value = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 2rem;
}

.login-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ff0000, #ffaa00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-header h2 {
  font-size: 2rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #cccccc;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.login-btn {
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

.login-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #cc0000, #990000);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 0, 0, 0.4);
}

.login-btn:disabled {
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

.register-link {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.register-link p {
  color: #cccccc;
  margin-bottom: 1rem;
}

.register-btn {
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

.register-btn:hover {
  background: #ffaa00;
  color: #1a1a1a;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }

  .login-card {
    padding: 2rem;
  }

  .login-header h1 {
    font-size: 2.5rem;
  }

  .login-header h2 {
    font-size: 1.8rem;
  }
}
</style>
