# Sécurité des routes API

## Vue d'ensemble

Toutes les routes API de conversion sont maintenant sécurisées et nécessitent une authentification Supabase valide. Cette sécurité garantit que seuls les utilisateurs authentifiés peuvent effectuer des conversions PDF vers XML.

## Routes sécurisées

### 1. POST /api/convert
Démarre une conversion PDF vers XML ASYCUDA.

**Sécurité**: ✅ Authentification Supabase requise

**Vérification d'authentification**:
```typescript
const supabase = await createClient()
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  return NextResponse.json(
    { detail: "Non autorisé - Authentification requise" },
    { status: 401 }
  )
}
```

**Comportement**:
- ✅ Utilisateur authentifié → Traitement de la conversion
- ❌ Utilisateur non authentifié → HTTP 401 Unauthorized

### 2. GET /api/jobs/[jobId]/status
Récupère le statut d'un job de conversion.

**Sécurité**: ✅ Authentification Supabase requise

**Comportement**:
- ✅ Utilisateur authentifié → Retourne le statut du job
- ❌ Utilisateur non authentifié → HTTP 401 Unauthorized

### 3. GET /api/jobs/[jobId]/download
Télécharge le fichier XML résultant d'une conversion.

**Sécurité**: ✅ Authentification Supabase requise

**Comportement**:
- ✅ Utilisateur authentifié → Stream du fichier XML
- ❌ Utilisateur non authentifié → HTTP 401 Unauthorized

## Architecture de sécurité

### Double couche de sécurité

1. **Middleware (routes frontend)**:
   - Protège toutes les routes frontend (`/`, `/login`, etc.)
   - Redirige vers `/login` si non authentifié
   - Gère les cookies de session

2. **API Routes (backend)**:
   - Protège les routes API (`/api/*`)
   - Vérifie l'authentification pour chaque requête
   - Retourne HTTP 401 si non authentifié

### Flux de sécurité

```
User Request
     ↓
Middleware (vérifie session)
     ↓
Frontend (React)
     ↓
API Route (vérifie authentification)
     ↓
External API (avec API_KEY)
```

## Implémentation technique

### Pattern utilisé

Toutes les routes API suivent le même pattern de sécurité:

```typescript
import { createClient } from "@/lib/supabase/server"

export async function POST/GET(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { detail: "Non autorisé - Authentification requise" },
        { status: 401 }
      )
    }

    // 2. Traiter la requête si authentifié
    // ...
  } catch (error) {
    // 3. Gestion des erreurs
    // ...
  }
}
```

### Vérification côté serveur

- **Client Supabase**: Utilise `createClient()` de `lib/supabase/server.ts`
- **Méthode**: `supabase.auth.getUser()` pour valider la session
- **Cookies**: Gérés automatiquement par `@supabase/ssr`
- **Session**: Rafraîchie automatiquement si valide

## Tests de sécurité

### Scénarios de test

#### Test 1: Accès authentifié
```bash
# Se connecter d'abord sur http://localhost:3000/login
# Puis appeler l'API via le frontend
→ Résultat attendu: HTTP 200 (succès)
```

#### Test 2: Accès non authentifié
```bash
# Essayer d'appeler l'API directement sans session
curl -X POST http://localhost:3000/api/convert
→ Résultat attendu: HTTP 401 Unauthorized
```

#### Test 3: Session expirée
```bash
# Session expirée ou invalide
→ Résultat attendu: HTTP 401 Unauthorized
→ Frontend redirige vers /login
```

### Validation automatique

Les hooks pré-commit valident:
- ✅ Types TypeScript corrects
- ✅ Pas d'erreurs ESLint critiques
- ✅ Build Next.js réussi

## Gestion des erreurs

### Codes de statut HTTP

| Code | Description | Cause |
|------|-------------|-------|
| 200 | Succès | Utilisateur authentifié, requête traitée |
| 401 | Non autorisé | Pas de session valide |
| 500 | Erreur serveur | Configuration invalide ou erreur interne |

### Messages d'erreur

**401 Unauthorized**:
```json
{
  "detail": "Non autorisé - Authentification requise"
}
```

**500 Internal Server Error**:
```json
{
  "detail": "Configuration serveur invalide"
}
```

## Impact sur le frontend

### Client-side API calls

Le frontend appelle les API routes via `lib/api-service.ts`:

```typescript
// La session Supabase est automatiquement incluse via les cookies
const response = await fetch('/api/convert', {
  method: 'POST',
  body: formData
})

if (response.status === 401) {
  // Session invalide ou expirée
  // Le middleware redirige automatiquement vers /login
}
```

### Pas de changement nécessaire

Les hooks existants (`usePdfConversion`, `use-file-upload`) continuent de fonctionner sans modification car:
- Les cookies de session sont gérés automatiquement
- Le middleware redirige vers `/login` si la session expire
- Les erreurs 401 sont gérées par le flux existant

## Considérations de sécurité

### Points sécurisés ✅

- ✅ **Authentification obligatoire** pour toutes les conversions
- ✅ **Cookies httpOnly** via Supabase SSR (pas d'accès JavaScript)
- ✅ **Session server-side** uniquement
- ✅ **API_KEY externe** toujours server-side (jamais exposée)
- ✅ **Validation double** (middleware + API routes)

### Protection contre

- ✅ **Accès non autorisé** aux conversions
- ✅ **Vol de session** (cookies httpOnly)
- ✅ **CSRF** (cookies SameSite)
- ✅ **XSS** (pas de stockage localStorage)

### Limitations connues

- ⚠️ **Pas d'isolation des jobs**: Un utilisateur peut potentiellement accéder aux jobs d'un autre utilisateur s'il connaît le `jobId`
  - **Mitigation future**: Associer les jobs aux users dans une base de données

## Évolution future

### Améliorations possibles

1. **Association user-job**:
   - Stocker les jobs dans Supabase avec `user_id`
   - Vérifier que le job appartient à l'utilisateur

2. **Rate limiting**:
   - Limiter le nombre de conversions par utilisateur
   - Protection contre l'abus de l'API

3. **Audit logs**:
   - Logger toutes les conversions avec user_id
   - Traçabilité complète

4. **Quotas utilisateur**:
   - Limiter les conversions par période
   - Plans tarifaires différenciés

## Ressources

- [Supabase Auth Server-Side](https://supabase.com/docs/guides/auth/server-side)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [OWASP Security Guidelines](https://owasp.org/www-project-api-security/)
