// src/services/authService.ts
import axios from 'axios'
import type { LoginRequest, RegisterRequest, AuthResponse, User, UpdateUserRequest } from '@/types/auth'

// Bestimme die korrekte Backend-URL
const getBackendUrl = () => {
  const isDevelopment = import.meta.env.MODE === 'development'
  return isDevelopment
    ? import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080'
    : import.meta.env.VITE_BACKEND_BASE_URL || 'https://watchlist-backend-vb24.onrender.com'
}

const baseUrl = getBackendUrl()

export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${baseUrl}/auth/login`, credentials)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data
      }
      throw new Error('Netzwerk-Fehler beim Login')
    }
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${baseUrl}/auth/register`, userData)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data
      }
      throw new Error('Netzwerk-Fehler bei der Registrierung')
    }
  }

  static async getUser(userId: number): Promise<User> {
    try {
      const response = await axios.get(`${baseUrl}/auth/user/${userId}`)
      return response.data
    } catch (error) {
      throw new Error('Fehler beim Laden der Benutzerdaten')
    }
  }

  static async updateUser(userId: number, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await axios.put(`${baseUrl}/auth/user/${userId}`, userData)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Fehler beim Aktualisieren des Benutzers')
      }
      throw new Error('Netzwerk-Fehler beim Aktualisieren')
    }
  }
}
