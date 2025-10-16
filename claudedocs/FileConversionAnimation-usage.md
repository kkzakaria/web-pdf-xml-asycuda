# FileConversionAnimation - Documentation

Composant React animé qui représente visuellement la conversion d'un fichier PDF vers XML.

## Import

```typescript
import { FileConversionAnimation } from "@/components/FileConversionAnimation"
```

## API

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `fileName` | `string` | - | Nom du fichier en cours de conversion (optionnel) |
| `progress` | `number` | - | Progression de 0 à 100 (réservé pour usage futur) |
| `className` | `string` | - | Classes CSS additionnelles |
| `fromFormat` | `string` | `"PDF"` | Format source du fichier |
| `toFormat` | `string` | `"XML"` | Format destination du fichier |

## Design visuel

Le composant affiche:
- **Fichier source** (gauche): Icône FileText avec badge du format source
- **Animation centrale**: Flèche avec particules animées de gauche à droite
- **Fichier destination** (droite): Icône FileCode avec badge du format destination
- **Nom de fichier** (bas): Affiché si fourni, avec texte "Conversion en cours..."

## Animations

- **Icônes de fichiers**: Animation pulse pour indiquer l'activité
- **Particules**: 3 points animés avec effet ping et délais échelonnés (0s, 0.7s, 1.4s)
- **Effet de flux**: Les particules créent un effet de flux continu de gauche à droite

## Exemples d'utilisation

### 1. Utilisation basique

```tsx
import { FileConversionAnimation } from "@/components/FileConversionAnimation"

export default function ConversionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <FileConversionAnimation />
    </div>
  )
}
```

### 2. Avec nom de fichier

```tsx
<FileConversionAnimation fileName="document.pdf" />
```

### 3. Avec formats personnalisés

```tsx
<FileConversionAnimation
  fromFormat="DOCX"
  toFormat="PDF"
  fileName="rapport-annuel.docx"
/>
```

### 4. Intégration dans un formulaire de soumission

```tsx
"use client"

import { useState } from "react"
import { FileConversionAnimation } from "@/components/FileConversionAnimation"
import { SubmitButton } from "@/components/SubmitButton"

export default function UploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentFile, setCurrentFile] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setCurrentFile("document.pdf")

    try {
      // Logique de conversion
      await convertFile()
    } finally {
      setIsSubmitting(false)
      setCurrentFile(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Composants de formulaire */}

      {isSubmitting && (
        <FileConversionAnimation fileName={currentFile || undefined} />
      )}

      <SubmitButton isSubmitting={isSubmitting}>
        Convertir
      </SubmitButton>
    </form>
  )
}
```

### 5. Avec carte conteneur

```tsx
<div className="rounded-lg border bg-card p-6">
  <FileConversionAnimation fileName="document.pdf" />
</div>
```

### 6. Intégration complète dans page d'upload

```tsx
"use client"

import { useState, useCallback } from "react"
import { FileConversionAnimation } from "@/components/FileConversionAnimation"
import FileUpload from "@/components/FileUpload"
import { SubmitButton } from "@/components/SubmitButton"
import type { FileWithPreview } from "@/hooks/use-file-upload"

export default function UploadPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFilesChange = useCallback((files: FileWithPreview[]) => {
    queueMicrotask(() => {
      setFiles(files)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Conversion des fichiers
      for (const file of files) {
        await convertFile(file)
      }
      alert("Conversion réussie !")
    } catch (error) {
      alert("Erreur lors de la conversion")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Upload de fichiers PDF</h1>
            <p className="text-muted-foreground">
              Téléversez jusqu&apos;à 5 fichiers PDF de 50MB maximum
            </p>
          </div>

          {/* Zone d'upload (désactivée pendant conversion) */}
          <FileUpload
            maxFiles={5}
            maxSize={50 * 1024 * 1024}
            accept=".pdf,application/pdf"
            multiple={true}
            onFilesChange={handleFilesChange}
            disabled={isSubmitting}
            disabledMessage="Conversion en cours..."
          />

          {/* Animation de conversion */}
          {isSubmitting && (
            <div className="rounded-lg border bg-card p-6">
              <FileConversionAnimation
                fileName={
                  files[0]?.file instanceof File
                    ? files[0].file.name
                    : undefined
                }
              />
            </div>
          )}

          {/* Bouton de soumission */}
          {files.length > 0 && (
            <SubmitButton
              isSubmitting={isSubmitting}
              submittingText="Conversion en cours..."
              className="w-full"
            >
              Convertir
            </SubmitButton>
          )}
        </form>
      </div>
    </div>
  )
}
```

## Caractéristiques

- **Animation fluide**: Utilise les animations Tailwind CSS optimisées
- **Responsive**: S'adapte aux différentes tailles d'écran
- **Accessible**: Structure sémantique et contrastes respectés
- **Personnalisable**: Formats source/destination configurables
- **TypeScript**: Entièrement typé avec exports de types
- **Performance**: Animations CSS pures, pas de JavaScript pour l'animation
- **Cohérent**: Utilise les couleurs du thème (primary, muted-foreground)

## Notes techniques

- Les animations utilisent `animate-pulse` et `animate-ping` de Tailwind CSS
- Les particules sont espacées avec des `animationDelay` en CSS inline (0s, 0.7s, 1.4s)
- Le composant est marqué `"use client"` pour Next.js
- Les icônes proviennent de `lucide-react`
- La fonction `cn` de `@/lib/utils` permet la fusion de classes CSS

## Personnalisation avancée

Vous pouvez étendre le composant avec des classes CSS personnalisées:

```tsx
<FileConversionAnimation
  className="bg-accent/50 p-8 rounded-2xl"
  fileName="document.pdf"
/>
```

Ou modifier les couleurs en surchargeant les classes Tailwind dans votre configuration de thème.
