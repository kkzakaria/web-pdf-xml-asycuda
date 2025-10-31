/**
 * Client Supabase pour les Server Components et API Routes
 * Utilise createServerClient de @supabase/ssr avec gestion des cookies Next.js
 */

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // Les cookies peuvent échouer en lecture seule (dans un middleware par exemple)
            // L'erreur est ignorée car le middleware gère les cookies différemment
          }
        },
      },
    }
  )
}
