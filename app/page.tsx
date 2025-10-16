"use client"

import { useCallback } from "react"
import FileUpload from "@/components/FileUpload"
import type { FileWithPreview } from "@/hooks/use-file-upload"

export default function Home() {
  const handleFilesChange = useCallback((files: FileWithPreview[]) => {
    console.log("Fichiers sélectionnés:", files)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl space-y-8">
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
      </div>
    </div>
  )
}
