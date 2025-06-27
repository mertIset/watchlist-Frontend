// src/types/index.ts
export interface Watchlist {
  id?: number;
  title: string;
  type: string;
  genre: string;
  watched: boolean;
  rating: number;
  posterUrl?: string; // Neu: Cover-URL vom OMDb Service
  userId?: number; // Referenz zum User
}

// Authentication types auch hier verfügbar machen
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
}
