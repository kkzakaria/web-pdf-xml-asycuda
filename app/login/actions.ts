/**
 * Server Actions pour l'authentification
 * Gère les opérations de connexion et déconnexion côté serveur
 */

"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

/**
 * Action de connexion
 * Authentifie l'utilisateur avec email et mot de passe
 */
export async function login(formData: FormData) {
  const supabase = await createClient()

  // Extraire et valider les données du formulaire
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    redirect("/login?error=Veuillez+remplir+tous+les+champs")
  }

  // Validation basique de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    redirect("/login?error=Adresse+email+invalide")
  }

  // Tentative de connexion
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Rediriger avec le message d'erreur
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Connexion réussie - revalider le cache et rediriger
  revalidatePath("/", "layout")
  redirect("/")
}

/**
 * Action de déconnexion
 * Déconnecte l'utilisateur et redirige vers la page de connexion
 */
export async function logout() {
  const supabase = await createClient()

  // Vérifier si un utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  // Revalider le cache et rediriger
  revalidatePath("/", "layout")
  redirect("/login")
}
