# Intégration de l'API PDF-XML-ASYCUDA

## 📋 Résumé

Intégration complète de l'API de conversion PDF vers XML ASYCUDA dans le frontend Next.js.

## 🎯 Fonctionnalités implémentées

### 1. **Architecture de sécurité**

**Routes Next.js (Proxy sécurisé)** :
- `app/api/convert/route.ts` - Conversion PDF asynchrone
- `app/api/jobs/[jobId]/status/route.ts` - Statut de conversion
- `app/api/jobs/[jobId]/download/route.ts` - Téléchargement XML

Toutes les routes :
- Ajoutent l'authentification `X-API-Key` côté serveur
- Valident les variables d'environnement avant chaque appel
- Masquent l'API externe au client (pas d'exposition publique)

### 2. **Configuration API** (`lib/api-config.ts`)

- Endpoints internes Next.js (routes proxy sécurisées)
- Plus d'appel direct à l'API externe depuis le client
- Timeout configurable (2 minutes par défaut)

### 3. **Types TypeScript** (`types/api.ts`)

- Types complets pour toutes les réponses API
- Typage strict des statuts de conversion
- Interfaces pour les métriques de conversion
- Gestion des erreurs API

### 4. **Service API** (`lib/api-service.ts`)

Fonctions principales :

- `convertPdfAsync()` - Démarrage de conversion asynchrone
- `getJobStatus()` - Récupération du statut d'un job
- `getXmlBlob()` - Récupération du fichier XML (Blob)
- `downloadXmlFile()` - Téléchargement du fichier XML
- `convertPdfFile()` - Gestion complète du processus (upload → conversion avec polling)

Fonctionnalités :

- Gestion des erreurs avec classe `ApiServiceError`
- Polling automatique du statut de conversion (toutes les 2 secondes, max 2 minutes)
- Appels via routes Next.js internes (pas d'exposition des credentials)

### 5. **Hook de conversion** (`hooks/use-pdf-conversion.ts`)

- État de conversion pour chaque fichier individuellement
- Suivi de progression (0-100%)
- Gestion des statuts : idle, processing, success, error
- Compteurs de fichiers convertis et en erreur
- Conversion séquentielle pour éviter la surcharge serveur

### 6. **Interface utilisateur** (`app/page.tsx`)

Intégration complète avec :

- Hook `usePdfConversion` pour la logique métier
- Mise à jour dynamique des statuts de fichiers
- Animations de succès/erreur selon les résultats
- Messages d'erreur détaillés par fichier
- Désactivation de l'interface pendant la conversion
- Affichage du nombre de fichiers convertis avec succès/erreur

## 🔧 Configuration

### Variables d'environnement

Fichier `.env.local` (SERVEUR UNIQUEMENT - jamais exposé au client) :

```env
# Configuration API (côté serveur uniquement)
API_BASE_URL=https://pdf-xml-asycuda-api.onrender.com
API_KEY=<votre-clé-api>
```

**Important** : Ces variables sont utilisées uniquement côté serveur dans les routes Next.js. Aucune variable sensible n'est exposée au client.

## 📊 Flux de conversion

1. **Upload** : L'utilisateur sélectionne jusqu'à 5 fichiers PDF (2MB max chacun)
2. **Validation** : Vérification du type et de la taille des fichiers
3. **Conversion** :
   - Envoi du fichier via route Next.js `/api/convert`
   - Route Next.js appelle l'API externe avec authentification `X-API-Key`
   - Polling du statut toutes les 2 secondes (max 2 minutes)
   - Mise à jour de la progression en temps réel
4. **Téléchargement** : Téléchargement automatique du fichier XML via route `/api/jobs/[jobId]/download`
5. **Feedback** : Affichage du résultat avec animations (succès/erreur)

## 🎨 États visuels

### Statuts des fichiers

- **idle** : Fichier en attente
- **processing** : Conversion en cours (avec spinner)
- **success** : Conversion réussie (icône verte)
- **error** : Échec de conversion (icône rouge + tooltip avec message d'erreur)

### Animations globales

- **Conversion en cours** : Animation de conversion
- **Succès** : Animation de succès (3 secondes)
- **Erreur** : Animation d'erreur avec message détaillé

## 🧪 Tests

### Validation

- ✅ Compilation TypeScript sans erreur
- ✅ Linting ESLint sans warning
- ✅ Interface se charge correctement
- ✅ Serveur de développement fonctionne (port 3001)

### À tester manuellement

- [ ] Upload de fichiers PDF valides
- [ ] Conversion réussie et téléchargement XML
- [ ] Gestion des erreurs (fichier invalide, timeout, etc.)
- [ ] Upload de plusieurs fichiers (limite de 5)
- [ ] Responsive design sur mobile

## 📝 Notes techniques

### Choix d'implémentation

- **Conversion séquentielle** : Les fichiers sont convertis un par un pour éviter de surcharger l'API
- **Polling intelligent** : Attente de 2 secondes entre chaque vérification de statut
- **Téléchargement automatique** : Le fichier XML se télécharge automatiquement après conversion
- **État contrôlé** : Le composant FileUpload utilise `controlledFiles` pour synchroniser l'état avec la conversion

### Limitations connues

- Pas de gestion du mode batch (conversion parallèle de plusieurs fichiers)
- Pas de persistance de session (l'état est perdu au rechargement)
- Timeout fixe de 2 minutes pour la conversion

## 🚀 Prochaines étapes possibles

1. Ajouter la gestion du mode batch pour les conversions parallèles
2. Implémenter la persistance des conversions (localStorage ou backend)
3. Ajouter un historique des conversions
4. Implémenter la reprise de conversion après rechargement
5. Ajouter des tests unitaires et E2E
6. Améliorer les métriques de conversion affichées

## 📦 Fichiers créés/modifiés

**Routes API (sécurité)** :
- `app/api/convert/route.ts` - Proxy pour conversion asynchrone
- `app/api/jobs/[jobId]/status/route.ts` - Proxy pour statut de job
- `app/api/jobs/[jobId]/download/route.ts` - Proxy pour téléchargement XML

**Configuration et services** :
- `lib/api-config.ts` - Endpoints internes Next.js
- `lib/api-service.ts` - Service d'appels API sécurisés
- `types/api.ts` - Types TypeScript
- `hooks/use-pdf-conversion.ts` - Hook de gestion de conversion
- `.env.local` - Variables d'environnement serveur uniquement

**Interface** :
- `app/page.tsx` - Interface utilisateur avec conversion
- `components/Logo.tsx` - Logo de l'application
- `app/icon.svg` - Favicon
