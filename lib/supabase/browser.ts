/**
 * Client Supabase pour les composants client
 * Utilise createBrowserClient de @supabase/ssr pour gérer les cookies automatiquement
 */

import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
