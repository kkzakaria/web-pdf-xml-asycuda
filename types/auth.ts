/**
 * Types pour l'authentification Supabase
 * Cohérent avec le pattern existant dans types/api.ts
 */

import type { User } from "@supabase/supabase-js"

/**
 * Données de connexion
 */
export type LoginCredentials = {
  email: string
  password: string
}

/**
 * Erreur d'authentification
 */
export type AuthError = {
  message: string
  status?: number
}

/**
 * Résultat d'authentification
 */
export type AuthResult = {
  user: User | null
  error: AuthError | null
}

/**
 * État d'authentification
 */
export type AuthState = {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
}
