/**
 * Composant UserProfile (optionnel)
 * Affiche l'utilisateur connecté et permet la déconnexion
 *
 * Usage dans app/layout.tsx:
 * import { UserProfile } from '@/components/UserProfile'
 * // Ajouter <UserProfile /> dans le layout où vous voulez afficher le profil
 */

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/browser"
import { logout } from "@/app/login/actions"
import type { User } from "@supabase/supabase-js"
import { SubmitButton } from "./SubmitButton"

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Récupérer l'utilisateur au chargement
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsLoading(false)
    })

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await logout()
  }

  if (isLoading) {
    return null
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <div className="flex-1">
        <p className="text-sm font-medium">Connecté en tant que</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <form action={handleLogout}>
        <SubmitButton variant="outline" size="sm">
          Déconnexion
        </SubmitButton>
      </form>
    </div>
  )
}
