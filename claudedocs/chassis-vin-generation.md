# Génération automatique de numéros de châssis VIN

Documentation de la fonctionnalité de génération automatique de numéros VIN (Vehicle Identification Number) conforme à la norme ISO 3779, intégrée avec l'API de conversion PDF-XML-ASYCUDA v2.1.0.

## Vue d'ensemble

La fonctionnalité de génération de châssis permet de créer automatiquement des numéros VIN uniques lors de la conversion de PDF RFCV vers XML ASYCUDA. Cette fonctionnalité est accessible via un onglet dédié dans l'interface utilisateur.

### Caractéristiques principales

- **Génération automatique** : WMI, VDS et plant_code générés aléatoirement
- **Conformité ISO 3779** : Structure VIN à 17 caractères réglementaire
- **Unicité garantie** : Option `ensure_unique` activée par défaut
- **Un fichier à la fois** : Pas de traitement par lot pour la génération châssis
- **Année courante** : Année de fabrication automatiquement définie

## Architecture technique

### Structure VIN (ISO 3779)

Un VIN complet contient 17 caractères organisés ainsi :

```
Position 1-3   : WMI (World Manufacturer Identifier)
Position 4-8   : VDS (Vehicle Descriptor Section)
Position 9     : Check digit
Position 10    : Year
Position 11    : Plant code
Position 12-17 : Sequential number
```

### Type ChassisConfig

```typescript
export type ChassisConfig = {
  generate_chassis: boolean    // Toujours true
  quantity: number             // 1-1000, défini par utilisateur
  wmi: string                  // 3 caractères aléatoires
  vds: string                  // 5 caractères aléatoires
  year: number                 // new Date().getFullYear()
  plant_code: string           // 1 caractère aléatoire
  ensure_unique: boolean       // Toujours true
}
```

### Génération de composants aléatoires

La fonction `generateRandomVinComponent()` crée des chaînes conformes ISO 3779 :

- Alphabet autorisé : `ABCDEFGHJKLMNPRSTUVWXYZ0123456789`
- Caractères exclus : I, O, Q (pour éviter la confusion avec 1, 0)
- Longueur variable selon le composant (1, 3 ou 5 caractères)

```typescript
export function generateRandomVinComponent(length: number): string {
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
```

### Configuration automatique complète

```typescript
export function generateChassisConfig(quantity: number): ChassisConfig {
  return {
    generate_chassis: true,
    quantity,
    wmi: generateRandomVinComponent(3),      // Ex: "J7K"
    vds: generateRandomVinComponent(5),      // Ex: "N3P4R"
    year: new Date().getFullYear(),          // Ex: 2025
    plant_code: generateRandomVinComponent(1), // Ex: "A"
    ensure_unique: true,
  }
}
```

## Endpoints API

### POST /api/convert-chassis

Endpoint dédié à la conversion avec génération de châssis.

**Paramètres FormData** :

- `file` : Fichier PDF (1 seul, max 2MB)
- `taux_douane` : Taux de douane (nombre > 0)
- `rapport_paiement` : "KARTA" ou "DJAM"
- `chassis_config` : JSON stringifié de type ChassisConfig

**Exemple de requête** :

```typescript
const formData = new FormData()
formData.append("file", pdfFile)
formData.append("taux_douane", "572.021")
formData.append("rapport_paiement", "KARTA")
formData.append("chassis_config", JSON.stringify({
  generate_chassis: true,
  quantity: 50,
  wmi: "JTD",
  vds: "N3P4R",
  year: 2025,
  plant_code: "A",
  ensure_unique: true
}))

const response = await fetch("/api/convert-chassis", {
  method: "POST",
  body: formData
})
```

**Validation serveur** :

- Authentification Supabase obligatoire
- Validation structure ChassisConfig
- Validation contraintes ISO 3779 :
  - WMI : exactement 3 caractères
  - VDS : exactement 5 caractères
  - plant_code : exactement 1 caractère
  - quantity : entre 1 et 1000

**Réponse** :

```json
{
  "job_id": "uuid",
  "status": "pending",
  "message": "Conversion avec génération VIN démarrée",
  "created_at": "2025-01-10T12:00:00Z"
}
```

## Services API client

### convertPdfWithChassisAsync()

Démarre une conversion asynchrone avec génération VIN.

```typescript
export async function convertPdfWithChassisAsync(
  file: File,
  tauxDouane: number,
  rapportPaiement: "KARTA" | "DJAM",
  chassisConfig: ChassisConfig
): Promise<ConvertAsyncResponse>
```

### convertPdfWithChassis()

Conversion complète avec polling du statut jusqu'à complétion.

```typescript
export async function convertPdfWithChassis(
  file: File,
  tauxDouane: number,
  rapportPaiement: "KARTA" | "DJAM",
  chassisConfig: ChassisConfig,
  onProgress?: (status: string, progress: number) => void
): Promise<string> // Retourne jobId
```

**Workflow** :

1. Envoi du fichier avec chassis_config → job_id
2. Polling toutes les 2 secondes (max 60 tentatives = 2 minutes)
3. Callback `onProgress` pour tracking UI
4. Retourne job_id si succès, throw ApiServiceError si échec

## Composant UI

### ChassisConversion.tsx

Composant React autonome pour la conversion avec génération VIN.

**État interne** :

```typescript
type ConversionState = {
  status: "idle" | "processing" | "completed" | "error"
  fileName?: string
  jobId?: string
  error?: string
  progress: number
}
```

**Fonctionnalités** :

- Upload fichier unique (validation PDF, 2MB max)
- Champ quantité VIN (Input number, 1-1000)
- Taux de douane et rapport de paiement
- Génération automatique des composants VIN
- Affichage des valeurs générées (WMI, VDS, year, plant_code)
- Gestion conversion avec ProcessingStatesOverlay
- Téléchargement XML après succès
- Réinitialisation complète

**Validation client** :

```typescript
// Type de fichier
if (selectedFile.type !== "application/pdf") {
  setConversionState({
    status: "error",
    error: "Seuls les fichiers PDF sont acceptés"
  })
  return
}

// Taille du fichier
if (selectedFile.size > 2 * 1024 * 1024) {
  setConversionState({
    status: "error",
    error: "Le fichier ne doit pas dépasser 2 MB"
  })
  return
}
```

## Interface utilisateur

### Système de tabs

L'application utilise shadcn/ui `<Tabs>` avec 2 onglets :

1. **"Conversion Standard"** : Workflow existant (jusqu'à 5 fichiers)
2. **"Conversion avec Châssis"** : Nouveau workflow (1 fichier unique)

```tsx
<Tabs defaultValue="standard" className="w-full">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="standard">Conversion Standard</TabsTrigger>
    <TabsTrigger value="chassis">Conversion avec Châssis</TabsTrigger>
  </TabsList>

  <TabsContent value="standard">
    {/* FileUpload + SubmitButton existants */}
  </TabsContent>

  <TabsContent value="chassis">
    <ChassisConversion />
  </TabsContent>
</Tabs>
```

### Affichage des informations VIN

```tsx
<div className="rounded-lg bg-muted p-3 text-sm">
  <p className="font-medium mb-1">Génération automatique:</p>
  <ul className="text-muted-foreground space-y-1">
    <li>• WMI (3 caractères): Généré aléatoirement</li>
    <li>• VDS (5 caractères): Généré aléatoirement</li>
    <li>• Année: {new Date().getFullYear()}</li>
    <li>• Code usine: Généré aléatoirement</li>
    <li>• Unicité garantie (ISO 3779)</li>
  </ul>
</div>
```

## Workflow utilisateur

### Étapes de conversion

1. **Sélection du tab** : Cliquer sur "Conversion avec Châssis"
2. **Upload PDF** : Sélectionner un fichier PDF (max 2MB)
3. **Configuration** :
   - Entrer la quantité de VIN (1-1000)
   - Définir le taux de douane
   - Sélectionner KARTA ou DJAM
4. **Conversion** : Cliquer sur "Convertir avec Châssis"
5. **Attente** : ProcessingStatesOverlay affiche la progression
6. **Téléchargement** : Bouton "Télécharger XML" après succès
7. **Réinitialisation** : Bouton "Réinitialiser" pour recommencer

### États visuels

- **Idle** : Formulaire actif, bouton "Convertir" activé
- **Processing** : Spinner, formulaire désactivé, overlay de conversion
- **Completed** : Boutons "Télécharger XML" + "Réinitialiser", overlay de succès
- **Error** : Message d'erreur, bouton "Réinitialiser", overlay d'erreur

## Sécurité

### Authentification

Tous les appels à `/api/convert-chassis` nécessitent une session Supabase valide :

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

### Proxy architecture

- Client ne connaît JAMAIS l'API_KEY ou les valeurs de rapport_paiement
- Toutes les requêtes passent par Next.js API routes
- Mapping des labels (KARTA/DJAM) vers valeurs réelles côté serveur
- Headers d'authentification (`X-API-Key`) ajoutés côté serveur uniquement

### Validation

**Serveur** :
- Structure ChassisConfig complète
- Contraintes ISO 3779 (longueurs WMI, VDS, plant_code)
- Limites quantité (1-1000)
- Validation fichier PDF

**Client** :
- Type MIME PDF uniquement
- Taille max 2MB
- Quantité VIN 1-1000
- Taux de douane > 0

## Exemples d'utilisation

### Utilisation programmatique

```typescript
import { convertPdfWithChassis } from "@/lib/api-service"
import { generateChassisConfig } from "@/types/api"

// Générer configuration avec 100 VIN
const chassisConfig = generateChassisConfig(100)

// Lancer conversion avec tracking progression
const jobId = await convertPdfWithChassis(
  pdfFile,
  572.021,
  "KARTA",
  chassisConfig,
  (status, progress) => {
    console.log(`${status}: ${progress}%`)
  }
)

// Télécharger le XML
const xmlBlob = await getXmlBlob(jobId)
downloadXmlFile(xmlBlob, "output.xml")
```

### Configuration personnalisée

```typescript
// Pour un contrôle total (rare)
const customConfig: ChassisConfig = {
  generate_chassis: true,
  quantity: 250,
  wmi: "ABC",              // Manufacturer spécifique
  vds: "12X4Y",            // Descripteur personnalisé
  year: 2024,              // Année spécifique
  plant_code: "7",         // Code usine spécifique
  ensure_unique: true
}

await convertPdfWithChassis(file, 572.021, "DJAM", customConfig)
```

## Limitations

1. **Un seul fichier** : Pas de traitement par lot pour chassis
2. **Quantité max** : 1000 VIN par conversion
3. **Taille fichier** : 2MB maximum
4. **Timeout** : 2 minutes max pour la conversion
5. **Pas de retry automatique** : L'utilisateur doit réinitialiser manuellement

## Dépannage

### Erreurs courantes

**"Structure ChassisConfig invalide"**
- Vérifier que tous les champs sont présents
- Vérifier les types (boolean, number, string)

**"WMI doit contenir exactement 3 caractères"**
- Utiliser `generateRandomVinComponent(3)` pour WMI
- Vérifier longueur côté client avant envoi

**"La quantité doit être entre 1 et 1000"**
- Valider côté client avec `min={1}` et `max={1000}`
- Vérifier valeur avant appel API

**"Non autorisé - Authentification requise"**
- Vérifier session Supabase active
- Rediriger vers `/login` si nécessaire

### Debug

Activer les logs serveur pour voir les requêtes :

```typescript
console.log("ChassisConfig reçu:", JSON.parse(chassisConfigJson))
```

Vérifier le job status en cas d'échec :

```typescript
const statusResponse = await getJobStatus(jobId)
console.log("Erreur job:", statusResponse.error)
```

## Tests recommandés

### Tests unitaires

- Génération composants VIN (longueur, caractères autorisés)
- Validation ChassisConfig (types, contraintes)
- Mapping rapport_paiement (KARTA → env var)

### Tests d'intégration

- Conversion complète avec 1 VIN
- Conversion avec 1000 VIN (limite max)
- Gestion timeout (2 minutes)
- Authentification requise (401 sans session)

### Tests UI

- Upload fichier PDF valide
- Rejet fichiers non-PDF
- Rejet fichiers > 2MB
- Affichage états (processing, success, error)
- Téléchargement XML après succès

## Maintenance

### Mise à jour API externe

Si l'API externe change la structure ChassisConfig :

1. Mettre à jour type dans `types/api.ts`
2. Ajuster validation dans `/api/convert-chassis/route.ts`
3. Adapter UI dans `ChassisConversion.tsx`
4. Mettre à jour cette documentation

### Évolution futures possibles

- Support de valeurs prédéfinies WMI/VDS (par fabricant)
- Traitement par lot limité (2-3 fichiers)
- Export CSV des VIN générés
- Historique des générations VIN

## Références

- **API OpenAPI spec** : `/openapi.json` sur l'API externe
- **Norme ISO 3779** : Structure VIN internationale
- **Types TypeScript** : `types/api.ts`
- **Endpoint serveur** : `app/api/convert-chassis/route.ts`
- **Service client** : `lib/api-service.ts`
- **Composant UI** : `components/ChassisConversion.tsx`
