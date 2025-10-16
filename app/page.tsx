"use client"

import { useCallback, useState } from "react"
import FileUpload from "@/components/FileUpload"
import { SubmitButton } from "@/components/SubmitButton"
import type { FileWithPreview } from "@/hooks/use-file-upload"

export default function Home() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFilesChange = useCallback((files: FileWithPreview[]) => {
    setFiles(files)
    console.log("Fichiers sélectionnés:", files)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      alert("Veuillez sélectionner au moins un fichier PDF")
      return
    }

    setIsSubmitting(true)

    try {
      // Logique de conversion à implémenter
      console.log("Conversion de", files.length, "fichier(s)...")
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulation
      alert("Conversion réussie !")
    } catch (error) {
      console.error("Erreur:", error)
      alert("Une erreur est survenue lors de la conversion")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Upload de fichiers PDF
            </h1>
            <p className="text-muted-foreground">
              Téléversez jusqu&apos;à 5 fichiers PDF de 50MB maximum chacun
            </p>
          </div>

          <FileUpload
            maxFiles={5}
            maxSize={50 * 1024 * 1024}
            accept=".pdf,application/pdf"
            multiple={true}
            onFilesChange={handleFilesChange}
          />

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
