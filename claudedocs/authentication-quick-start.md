# Authentication Quick Start

## Résumé de l'implémentation

L'authentification Supabase a été intégrée avec succès dans l'application. La page principale (`/`) est maintenant protégée et nécessite une connexion.

## Fichiers créés

### Configuration Supabase
- ✅ `lib/supabase/browser.ts` - Client pour composants client
- ✅ `lib/supabase/server.ts` - Client pour Server Components/API Routes

### Authentification
- ✅ `app/login/page.tsx` - Page de connexion simple (email/password)
- ✅ `app/login/actions.ts` - Server Actions (login, logout)
- ✅ `middleware.ts` - Protection automatique des routes

### Types et composants
- ✅ `types/auth.ts` - Types TypeScript pour l'authentification
- ✅ `components/UserProfile.tsx` - Composant optionnel pour afficher l'utilisateur

### Documentation
- ✅ `claudedocs/authentication-implementation.md` - Documentation complète
- ✅ `CLAUDE.md` - Mise à jour avec section authentification

## Test rapide

1. **Démarrer le serveur**:
   ```bash
   pnpm dev
   ```

2. **Accéder à l'application**:
   - Ouvrir `http://localhost:3000`
   - Vous serez automatiquement redirigé vers `/login`

3. **Se connecter**:
   - Utiliser un compte Supabase existant (à créer dans le Dashboard Supabase si nécessaire)
   - Email et mot de passe
   - Après connexion → redirection automatique vers `/`

4. **Tester la protection**:
   - Essayer d'accéder à `/` sans être connecté → redirection vers `/login`
   - Se connecter → accès autorisé à `/`

## Créer un utilisateur de test

Dans le Supabase Dashboard:
1. Aller sur `Authentication` → `Users`
2. Cliquer sur `Add user` → `Create new user`
3. Entrer email et mot de passe
4. Confirmer l'email (ou désactiver la confirmation dans les paramètres)

## Ajouter le profil utilisateur (optionnel)

Pour afficher l'utilisateur connecté et un bouton de déconnexion dans toute l'application:

**Modifier `app/layout.tsx`**:
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
        <UserProfile /> {/* ← Ajouter cette ligne */}
        {children}
      </body>
    </html>
  )
}
```

## Configuration Supabase Dashboard

### Row Level Security (RLS)
Si vous utilisez des tables Supabase, activez RLS:

```sql
-- Exemple: Table profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

## Prochaines étapes

### Fonctionnalités additionnelles (non implémentées)
- Page d'inscription (`/signup`)
- Réinitialisation de mot de passe
- Confirmation par email
- OAuth (Google, GitHub, etc.)
- Gestion de profil utilisateur

### Personnalisation
- Modifier le design de la page de connexion
- Ajouter des champs personnalisés au formulaire
- Personnaliser les messages d'erreur
- Ajouter des animations de transition

## Dépannage

### "Invalid login credentials"
→ Vérifier que l'utilisateur existe dans Supabase Dashboard
→ Vérifier que l'email est confirmé

### Déconnexions aléatoires
→ Vérifier que `middleware.ts` appelle `supabase.auth.getUser()`
→ Vérifier les logs du navigateur pour des erreurs de cookies

### Page blanche ou erreur 500
→ Vérifier que les variables d'environnement sont bien définies
→ Vérifier les logs du serveur: `pnpm dev`

## Support

Pour plus de détails, consulter:
- `claudedocs/authentication-implementation.md` - Documentation complète
- [Documentation Supabase](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
