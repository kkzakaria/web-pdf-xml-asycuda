/**
 * Middleware Supabase pour la protection des routes
 * Vérifie l'authentification et gère les sessions
 *
 * Pattern recommandé par Supabase pour Next.js App Router
 */

import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Créer une réponse Next.js
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Créer un client Supabase pour le middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Ne pas exécuter de code entre createServerClient et auth.getUser()
  // Un simple oubli pourrait rendre très difficile le débogage de déconnexions aléatoires

  // IMPORTANT: NE PAS SUPPRIMER auth.getUser()
  // Cet appel rafraîchit la session utilisateur
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si l'utilisateur n'est pas connecté et n'est pas sur /login ou /auth/*
  // Rediriger vers /login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Si l'utilisateur est connecté et essaie d'accéder à /login
  // Rediriger vers la page principale
  if (user && request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // IMPORTANT: Retourner l'objet supabaseResponse tel quel
  // Si vous créez une nouvelle réponse avec NextResponse.next(), assurez-vous de:
  // 1. Passer la requête dedans: const myNewResponse = NextResponse.next({ request })
  // 2. Copier les cookies: myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Modifier myNewResponse selon vos besoins, mais SANS toucher aux cookies
  // 4. Finalement: return myNewResponse
  // Si cela n'est pas fait, le navigateur et le serveur peuvent se désynchroniser
  // et terminer prématurément la session de l'utilisateur
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf:
     * - _next/static (fichiers statiques)
     * - _next/image (fichiers d'optimisation d'images)
     * - favicon.ico (favicon)
     * - Images et autres assets statiques (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
