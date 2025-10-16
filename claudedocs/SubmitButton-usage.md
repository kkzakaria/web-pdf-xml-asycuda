# SubmitButton - Documentation

Composant de bouton de soumission avec état de chargement, basé sur le Button de shadcn UI.

## Import

```typescript
import { SubmitButton } from "@/components/SubmitButton"
```

## API

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `isSubmitting` | `boolean` | `false` | Indique si le formulaire est en cours de soumission |
| `submittingText` | `string` | `"Envoi en cours..."` | Texte affiché pendant la soumission |
| `disabled` | `boolean` | `false` | Désactive le bouton |
| `variant` | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"default"` | Variante de style du bouton |
| `size` | `"default" \| "sm" \| "lg" \| "icon" \| "icon-sm" \| "icon-lg"` | `"default"` | Taille du bouton |
| `className` | `string` | - | Classes CSS additionnelles |
| `asChild` | `boolean` | `false` | Rend le bouton comme son enfant |

Toutes les autres props de `HTMLButtonElement` sont également supportées.

## Exemples d'utilisation

### 1. Utilisation basique

```tsx
"use client"

import { useState } from "react"
import { SubmitButton } from "@/components/SubmitButton"

export default function SimpleForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Votre logique de soumission
      await fetch("/api/submit", { method: "POST" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Vos champs de formulaire */}
      <SubmitButton isSubmitting={isSubmitting}>
        Envoyer
      </SubmitButton>
    </form>
  )
}
```

### 2. Texte personnalisé pendant la soumission

```tsx
<SubmitButton
  isSubmitting={isSubmitting}
  submittingText="Téléversement en cours..."
>
  Téléverser
</SubmitButton>
```

### 3. Avec variantes de style

```tsx
{/* Bouton destructif */}
<SubmitButton
  variant="destructive"
  isSubmitting={isSubmitting}
  submittingText="Suppression..."
>
  Supprimer
</SubmitButton>

{/* Bouton outline */}
<SubmitButton
  variant="outline"
  isSubmitting={isSubmitting}
>
  Sauvegarder le brouillon
</SubmitButton>

{/* Bouton secondaire */}
<SubmitButton
  variant="secondary"
  size="lg"
  isSubmitting={isSubmitting}
>
  Continuer
</SubmitButton>
```

### 4. Avec différentes tailles

```tsx
{/* Petit */}
<SubmitButton
  size="sm"
  isSubmitting={isSubmitting}
>
  Envoyer
</SubmitButton>

{/* Grand */}
<SubmitButton
  size="lg"
  isSubmitting={isSubmitting}
>
  Envoyer
</SubmitButton>
```

### 5. Intégration avec un formulaire de fichiers

```tsx
"use client"

import { useState, useCallback } from "react"
import { SubmitButton } from "@/components/SubmitButton"
import FileUpload from "@/components/FileUpload"
import type { FileWithPreview } from "@/hooks/use-file-upload"

export default function FileSubmissionForm() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFilesChange = useCallback((newFiles: FileWithPreview[]) => {
    setFiles(newFiles)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      alert("Veuillez sélectionner au moins un fichier")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      files.forEach((fileWrapper, index) => {
        if (fileWrapper.file instanceof File) {
          formData.append(`file${index}`, fileWrapper.file)
        }
      })

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      alert("Fichiers téléversés avec succès !")
      // Réinitialiser le formulaire si nécessaire
    } catch (error) {
      console.error("Erreur:", error)
      alert("Une erreur est survenue lors de l'upload")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FileUpload
        maxFiles={5}
        maxSize={50 * 1024 * 1024}
        accept=".pdf,application/pdf"
        multiple={true}
        onFilesChange={handleFilesChange}
      />

      <SubmitButton
        isSubmitting={isSubmitting}
        disabled={files.length === 0}
        submittingText="Téléversement en cours..."
        className="w-full"
      >
        Téléverser les fichiers
      </SubmitButton>
    </form>
  )
}
```

### 6. Avec gestion d'erreur

```tsx
"use client"

import { useState } from "react"
import { SubmitButton } from "@/components/SubmitButton"

export default function FormWithError() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/submit", { method: "POST" })

      if (!response.ok) {
        throw new Error("Erreur lors de la soumission")
      }

      // Succès
      alert("Soumission réussie !")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Vos champs */}

      {error && (
        <div className="text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <SubmitButton isSubmitting={isSubmitting}>
        Envoyer
      </SubmitButton>
    </form>
  )
}
```

## Caractéristiques

- **État de chargement visuel**: Affiche un spinner animé pendant la soumission
- **Désactivation automatique**: Le bouton est automatiquement désactivé pendant la soumission
- **Texte personnalisable**: Le texte de chargement peut être personnalisé
- **Compatible avec shadcn UI**: Utilise toutes les variantes et tailles du Button
- **TypeScript**: Entièrement typé avec TypeScript
- **Accessible**: Hérite de l'accessibilité du composant Button de shadcn UI
- **Icône de chargement**: Utilise `Loader2Icon` de lucide-react avec animation de rotation

## Notes

- Le bouton a toujours `type="submit"` par défaut
- Le spinner apparaît à gauche du texte de soumission
- Pendant la soumission, le bouton ignore l'état `disabled` passé en prop (il est toujours désactivé)
- L'animation du spinner est gérée via Tailwind CSS avec la classe `animate-spin`
