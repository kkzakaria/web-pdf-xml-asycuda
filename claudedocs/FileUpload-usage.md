# FileUpload Component - Guide d'utilisation

Composant React pour le téléversement de fichiers avec support du glisser-déposer, créé à partir du template Origin UI.

## Localisation

- **Composant**: `components/FileUpload.tsx`
- **Hook**: `hooks/use-file-upload.ts`

## Fonctionnalités

- ✅ Glisser-déposer de fichiers
- ✅ Sélection multiple ou unique
- ✅ Validation de taille et de type
- ✅ Aperçu des fichiers avec icônes
- ✅ Gestion des erreurs
- ✅ Support des fichiers initiaux
- ✅ Callbacks pour les changements

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `className` | `string` | - | Classes CSS personnalisées |
| `showFileList` | `boolean` | `true` | Afficher la liste des fichiers |
| `showClearAllButton` | `boolean` | `true` | Afficher le bouton "Supprimer tout" |
| `maxFiles` | `number` | `10` | Nombre maximum de fichiers |
| `maxSize` | `number` | `104857600` | Taille maximale en octets (100MB) |
| `accept` | `string` | `"*"` | Types de fichiers acceptés |
| `multiple` | `boolean` | `true` | Autoriser plusieurs fichiers |
| `initialFiles` | `FileMetadata[]` | `[]` | Fichiers initiaux à afficher |
| `onFilesChange` | `(files) => void` | - | Callback lors du changement |
| `onFilesAdded` | `(files) => void` | - | Callback lors de l'ajout |

## Exemples d'utilisation

### Usage basique (multiple files)

```tsx
import FileUpload from "@/components/FileUpload"

export default function Page() {
  return (
    <FileUpload
      maxFiles={5}
      maxSize={10 * 1024 * 1024} // 10MB
    />
  )
}
```

### Fichier unique avec types spécifiques

```tsx
import FileUpload from "@/components/FileUpload"

export default function Page() {
  const handleFileChange = (files) => {
    console.log("Fichiers sélectionnés:", files)
  }

  return (
    <FileUpload
      multiple={false}
      accept=".pdf,.doc,.docx"
      maxSize={5 * 1024 * 1024} // 5MB
      onFilesChange={handleFileChange}
    />
  )
}
```

### Images uniquement avec aperçu

```tsx
import FileUpload from "@/components/FileUpload"

export default function Page() {
  const handleFilesAdded = (newFiles) => {
    // Traiter les nouveaux fichiers ajoutés
    console.log("Nouveaux fichiers:", newFiles)
  }

  return (
    <FileUpload
      accept="image/*"
      maxFiles={3}
      maxSize={2 * 1024 * 1024} // 2MB
      onFilesAdded={handleFilesAdded}
    />
  )
}
```

### Avec fichiers initiaux (ex: édition)

```tsx
import FileUpload from "@/components/FileUpload"

export default function Page() {
  const initialFiles = [
    {
      name: "document.pdf",
      size: 528737,
      type: "application/pdf",
      url: "https://example.com/document.pdf",
      id: "doc-123",
    },
  ]

  return (
    <FileUpload
      initialFiles={initialFiles}
      maxFiles={5}
    />
  )
}
```

### Upload personnalisé sans liste de fichiers

```tsx
import FileUpload from "@/components/FileUpload"
import { useState } from "react"

export default function Page() {
  const [files, setFiles] = useState([])

  return (
    <div>
      <FileUpload
        showFileList={false}
        showClearAllButton={false}
        onFilesChange={setFiles}
      />

      {/* Liste personnalisée */}
      <div className="mt-4">
        <h3>Fichiers sélectionnés: {files.length}</h3>
        {files.map(f => (
          <p key={f.id}>{f.file.name}</p>
        ))}
      </div>
    </div>
  )
}
```

## Types de fichiers supportés

Le composant reconnaît automatiquement les types de fichiers suivants et affiche l'icône appropriée:

- 📄 Documents: PDF, DOC, DOCX
- 📦 Archives: ZIP, RAR
- 📊 Feuilles de calcul: XLS, XLSX
- 🎬 Vidéos: MP4, AVI, etc.
- 🎵 Audio: MP3, WAV, etc.
- 🖼️ Images: JPG, PNG, GIF, etc.

## Format `accept`

Exemples de valeurs pour la prop `accept`:

- `"*"` - Tous les fichiers
- `"image/*"` - Toutes les images
- `".pdf"` - Uniquement PDF
- `".pdf,.doc,.docx"` - PDF et Word
- `"image/*,.pdf"` - Images et PDF

## Gestion des erreurs

Les erreurs sont affichées automatiquement sous la zone de drop:

- Fichier trop volumineux
- Type de fichier non accepté
- Nombre maximum de fichiers dépassé
- Fichiers dupliqués (en mode multiple)

## Notes techniques

- Le composant utilise le hook `useFileUpload` pour la logique
- Les aperçus d'images utilisent `URL.createObjectURL()`
- Les URLs des objets sont automatiquement révoquées lors de la suppression
- Le composant est accessible (ARIA labels, rôles)
- Support complet du clavier et des lecteurs d'écran
