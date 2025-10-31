/**
 * Composant UserAvatar
 * Affiche l'avatar de l'utilisateur connecté avec un dropdown menu
 * contenant les informations utilisateur et un bouton de déconnexion
 */

"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/browser"
import { logout } from "@/app/login/actions"
import type { User } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User as UserIcon } from "lucide-react"

export function UserAvatar() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const supabase = createClient()

  // Fonction pour récupérer l'utilisateur
  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setIsLoading(false)
  }

  useEffect(() => {
    // Récupérer l'utilisateur au chargement
    fetchUser()

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Rafraîchir l'utilisateur quand la fenêtre regagne le focus
    const handleFocus = () => {
      fetchUser()
    }

    window.addEventListener("focus", handleFocus)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("focus", handleFocus)
    }
  }, [supabase.auth])

  // Rafraîchir l'utilisateur quand la route change
  useEffect(() => {
    fetchUser()
  }, [pathname])

  const handleLogout = async () => {
    await logout()
  }

  // Obtenir les initiales de l'utilisateur
  const getInitials = (email: string) => {
    const name = email.split("@")[0]
    return name
      .split(/[._-]/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  if (isLoading || !user) {
    return null
  }

  // Masquer l'avatar sur la page de connexion
  if (pathname === '/login') {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {user.email ? getInitials(user.email) : <UserIcon className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Mon compte</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
