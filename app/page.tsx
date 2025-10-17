"use client"

import { useCallback, useEffect, useState } from "react"
import FileUpload from "@/components/FileUpload"
import { SubmitButton } from "@/components/SubmitButton"
import type { FileWithPreview } from "@/hooks/use-file-upload"
import { usePdfConversion } from "@/hooks/use-pdf-conversion"

export default function Home() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [conversionState, { convertFiles, getFileStatus }] =
    usePdfConversion()

  const handleFilesChange = useCallback((newFiles: FileWithPreview[]) => {
    queueMicrotask(() => {
      setFiles(newFiles)
      setIsSuccess(false)
      setIsError(false)
      setErrorMessage("")
    })
  }, [])

  // Mettre à jour les statuts des fichiers en fonction de la conversion
  useEffect(() => {
    if (conversionState.files.size === 0) return

    const updatedFiles = files.map((file) => {
      const conversionStatus = getFileStatus(file.id)
      if (!conversionStatus) return file

      return {
        ...file,
        status: conversionStatus.status,
        errorMessage: conversionStatus.error,
      }
    })

    setFiles(updatedFiles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversionState.files, getFileStatus])

  // Gérer les états globaux de succès/erreur
  useEffect(() => {
    if (!conversionState.isConverting && conversionState.files.size > 0) {
      const totalFiles = conversionState.files.size

      // Tous les fichiers ont été convertis avec succès
      if (conversionState.completedCount === totalFiles) {
        setIsSuccess(true)
        setIsError(false)

        // Masquer l'animation de succès après 3 secondes
        setTimeout(() => {
          setIsSuccess(false)
        }, 3000)
      }
      // Au moins un fichier a échoué
      else if (conversionState.errorCount > 0) {
        setIsError(true)
        setIsSuccess(false)
        setErrorMessage(
          `${conversionState.errorCount} fichier${conversionState.errorCount > 1 ? "s" : ""} n'${conversionState.errorCount > 1 ? "ont" : "a"} pas pu être converti${conversionState.errorCount > 1 ? "s" : ""}`
        )
      }
    }
  }, [conversionState])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      setIsError(true)
      setErrorMessage("Veuillez sélectionner au moins un fichier PDF")
      return
    }

    setIsSuccess(false)
    setIsError(false)
    setErrorMessage("")

    try {
      await convertFiles(files)
    } catch (error) {
      console.error("Erreur lors de la conversion:", error)
      setIsError(true)
      setErrorMessage("Une erreur inattendue est survenue")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Conversion PDF vers XML ASYCUDA
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
            disabled={conversionState.isConverting}
            isSuccess={isSuccess}
            isError={isError}
            errorMessage={errorMessage}
            errorDescription={
              isError && !errorMessage.includes("fichier")
                ? "Vérifiez que vos fichiers sont des PDF valides"
                : undefined
            }
            controlledFiles={files}
          />

          {files.length > 0 && !isSuccess && (
            <SubmitButton
              isSubmitting={conversionState.isConverting}
              submittingText="Conversion en cours..."
              className="w-full"
              disabled={conversionState.isConverting}
            >
              Convertir en XML ASYCUDA
            </SubmitButton>
          )}
        </form>
      </div>
    </div>
  )
}
