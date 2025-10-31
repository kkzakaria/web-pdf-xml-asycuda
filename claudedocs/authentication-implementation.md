# Implémentation de l'authentification Supabase

## Vue d'ensemble

L'authentification Supabase a été intégrée avec succès dans l'application Next.js 15.5.5 avec App Router. L'implémentation suit les recommandations officielles de Supabase pour Next.js et maintient l'architecture proxy existante.

## Architecture

### Packages installés
- `@supabase/ssr@0.7.0` - Client SSR pour Next.js
- `@supabase/supabase-js@2.78.0` - Client JavaScript Supabase

### Structure des fichiers

```
├── lib/supabase/
│   ├── browser.ts          # Client pour composants client
│   └── server.ts           # Client pour Server Components/API Routes
├── app/login/
│   ├── page.tsx            # Page de connexion
│   └── actions.ts          # Server Actions (login, logout)
├── components/
│   └── UserProfile.tsx     # Composant optionnel pour afficher l'utilisateur
├── types/
│   └── auth.ts             # Types TypeScript pour l'authentification
└── middleware.ts           # Protection des routes
```

## Flux d'authentification

### 1. Accès à une route protégée
- L'utilisateur tente d'accéder à `/` (page principale)
- Le middleware intercepte la requête
- Si l'utilisateur n'est pas authentifié → redirection vers `/login`
- Si l'utilisateur est authentifié → accès autorisé

### 2. Connexion
- L'utilisateur remplit le formulaire sur `/login`
- Le formulaire appelle le Server Action `login(formData)`
- Supabase authentifie avec `signInWithPassword()`
- Si succès → redirection vers `/`
- Si erreur → affichage du message d'erreur

### 3. Déconnexion
- L'utilisateur clique sur "Déconnexion" (via UserProfile ou autre bouton)
- Appel du Server Action `logout()`
- Supabase déconnecte avec `signOut()`
- Redirection vers `/login`

## Utilisation

### Vérifier l'utilisateur dans un Server Component

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return <div>Bienvenue {user.email}</div>
}
```

### Vérifier l'utilisateur dans un Client Component

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import type { User } from '@supabase/supabase-js'

export default function ClientComponent() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return <div>{user ? `Connecté: ${user.email}` : 'Non connecté'}</div>
}
```

### Ajouter le profil utilisateur dans le layout (optionnel)

Modifier `app/layout.tsx`:

```typescript
import { UserProfile } from '@/components/UserProfile'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <UserProfile /> {/* Affiche l'utilisateur et le bouton de déconnexion */}
        {children}
      </body>
    </html>
  )
}
```

## Configuration

### Variables d'environnement (déjà configurées)

`.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://gdvwhzfdmhtikutzrfpj.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Protection des routes

Le middleware protège automatiquement toutes les routes sauf:
- `/login` - Page de connexion
- `/auth/*` - Callbacks d'authentification
- Fichiers statiques (`_next/static`, images, etc.)

Pour modifier les routes protégées, éditer `middleware.ts`:

```typescript
export const config = {
  matcher: [
    // Ajouter ou retirer des patterns ici
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Sécurité

### Architecture proxy maintenue
- Les cookies sont gérés server-side uniquement
- `ANON_KEY` est publique et sécurisée (RLS dans Supabase)
- Session stockée dans des cookies httpOnly via Supabase SSR

### Validation
- Validation TypeScript stricte
- Validation server-side dans les Server Actions
- Validation des emails avec regex basique
- Messages d'erreur sécurisés (pas de détails sensibles)

### Recommandations Supabase
- Row Level Security (RLS) activé dans Supabase Dashboard
- Politiques de sécurité définies pour chaque table
- Pas d'exposition de secrets côté client

## Prochaines étapes possibles (hors scope actuel)

1. **Page d'inscription** (`/signup`)
2. **Réinitialisation de mot de passe**
3. **Confirmation par email**
4. **OAuth providers** (Google, GitHub, etc.)
5. **Gestion de profil utilisateur**
6. **Rôles et permissions** (via RLS Supabase)

## Dépannage

### Erreur: "Invalid login credentials"
- Vérifier que l'utilisateur existe dans Supabase Dashboard
- Vérifier que le mot de passe est correct
- Vérifier que l'email est confirmé (si confirmation activée)

### Déconnexions aléatoires
- Vérifier que `supabase.auth.getUser()` est appelé dans le middleware
- Vérifier que les cookies sont correctement passés
- Vérifier la configuration du matcher dans `middleware.ts`

### Page de connexion inaccessible
- Vérifier que `/login` est exclu dans le middleware
- Vérifier les logs du serveur pour les erreurs

## Tests

Pour tester le flux complet:

1. Démarrer le serveur: `pnpm dev`
2. Accéder à `http://localhost:3000`
3. Vérifier la redirection vers `/login`
4. Se connecter avec un compte Supabase valide
5. Vérifier la redirection vers `/`
6. Vérifier que l'accès à `/` est autorisé
7. Se déconnecter et vérifier la redirection vers `/login`

## Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Next.js Integration](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
