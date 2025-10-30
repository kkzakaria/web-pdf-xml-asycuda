"use client"

import { useCallback, useEffect, useState } from "react"
import FileUpload from "@/components/FileUpload"
import { SubmitButton } from "@/components/SubmitButton"
import { Logo } from "@/components/Logo"
import type { FileWithPreview } from "@/hooks/use-file-upload"
import { usePdfConversion } from "@/hooks/use-pdf-conversion"

export default function Home() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [fileUploadKey, setFileUploadKey] = useState(0)

  const [
    conversionState,
    {
      convertFiles,
      downloadFile,
      downloadAllFiles,
      retryFailedFiles,
      resetConversion,
      getFileStatus,
    },
  ] = usePdfConversion()

  const handleFilesChange = useCallback((newFiles: FileWithPreview[]) => {
    queueMicrotask(() => {
      setFiles(newFiles)
      setIsSuccess(false)
      setIsError(false)
      setErrorMessage("")
    })
  }, [])

  const handleClearFiles = useCallback(() => {
    setFiles([])
    setIsSuccess(false)
    setIsError(false)
    setErrorMessage("")
  }, [])

  const handleFileTauxChange = useCallback((fileId: string, taux: number) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === fileId ? { ...file, tauxDouane: taux } : file
      )
    )
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
        outputFileName: conversionStatus.filename,
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

    // Valider que chaque fichier a un taux de change valide
    const filesWithoutTaux = files.filter(
      (file) => !file.tauxDouane || file.tauxDouane <= 0
    )
    if (filesWithoutTaux.length > 0) {
      setIsError(true)
      setErrorMessage(
        `Veuillez saisir un taux de change valide pour ${filesWithoutTaux.length > 1 ? "tous les fichiers" : "le fichier"}`
      )
      return
    }

    setIsSuccess(false)
    setIsError(false)
    setErrorMessage("")

    try {
      // Convertir chaque fichier avec son propre taux
      await convertFiles(files)
    } catch (error) {
      console.error("Erreur lors de la conversion:", error)
      setIsError(true)
      setErrorMessage("Une erreur inattendue est survenue")
    }
  }

  const handleFileDownload = useCallback(
    async (fileId: string) => {
      try {
        await downloadFile(fileId)
      } catch (error) {
        console.error("Erreur lors du téléchargement:", error)
        setIsError(true)
        setErrorMessage("Erreur lors du téléchargement du fichier")
      }
    },
    [downloadFile]
  )

  const handleFileRetry = useCallback(
    async (fileId: string) => {
      const fileToRetry = files.find((f) => f.id === fileId)
      if (!fileToRetry) return

      // Valider que le fichier a un taux valide
      if (!fileToRetry.tauxDouane || fileToRetry.tauxDouane <= 0) {
        setIsError(true)
        setErrorMessage("Veuillez saisir un taux de change valide pour ce fichier")
        return
      }

      try {
        await retryFailedFiles([fileToRetry])
      } catch (error) {
        console.error("Erreur lors de la nouvelle tentative:", error)
      }
    },
    [files, retryFailedFiles]
  )

  const handleDownloadAll = useCallback(async () => {
    try {
      await downloadAllFiles()
    } catch (error) {
      console.error("Erreur lors du téléchargement groupé:", error)
      setIsError(true)
      setErrorMessage("Erreur lors du téléchargement groupé")
    }
  }, [downloadAllFiles])

  const handleRetryFailed = useCallback(async () => {
    // Valider que tous les fichiers en erreur ont un taux valide
    const failedFiles = files.filter((f) => f.status === "error")
    const filesWithoutTaux = failedFiles.filter(
      (file) => !file.tauxDouane || file.tauxDouane <= 0
    )
    if (filesWithoutTaux.length > 0) {
      setIsError(true)
      setErrorMessage("Veuillez saisir un taux de change valide pour tous les fichiers")
      return
    }

    try {
      await retryFailedFiles(files)
    } catch (error) {
      console.error("Erreur lors de la nouvelle tentative:", error)
    }
  }, [files, retryFailedFiles])

  const handleReset = useCallback(() => {
    resetConversion()
    setFiles([])
    setIsSuccess(false)
    setIsError(false)
    setErrorMessage("")
    setFileUploadKey((prev) => prev + 1)
  }, [resetConversion])

  // Compter les fichiers par statut
  const successCount = files.filter((f) => f.status === "success").length
  const errorCount = files.filter((f) => f.status === "error").length
  const showActionButtons =
    !conversionState.isConverting && conversionState.files.size > 0

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center -mb-2">
              <Logo size={80} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Conversion PDF vers XML ASYCUDA
            </h1>
            <p className="text-muted-foreground">
              Téléversez jusqu&apos;à 5 fichiers PDF de 2MB maximum chacun
            </p>
            <p className="text-xs text-muted-foreground">
              Vous pourrez définir un taux de change spécifique pour chaque fichier
            </p>
          </div>

          <FileUpload
            key={fileUploadKey}
            maxFiles={5}
            maxSize={2 * 1024 * 1024}
            accept=".pdf,application/pdf"
            multiple={true}
            onFilesChange={handleFilesChange}
            onClearFiles={handleClearFiles}
            disabled={conversionState.isConverting || conversionState.isDownloading}
            isProcessing={conversionState.isConverting}
            isDownloading={conversionState.isDownloading}
            isSuccess={isSuccess}
            isError={isError}
            errorMessage={errorMessage}
            errorDescription={
              isError && !errorMessage.includes("fichier")
                ? "Vérifiez que vos fichiers sont des PDF valides"
                : undefined
            }
            controlledFiles={files}
            onFileDownload={handleFileDownload}
            onFileRetry={handleFileRetry}
            onFileTauxChange={handleFileTauxChange}
          />

          {files.length > 0 && !showActionButtons && (
            <SubmitButton
              isSubmitting={conversionState.isConverting}
              submittingText="Conversion en cours..."
              className="w-full"
              disabled={conversionState.isConverting}
            >
              Convertir en XML ASYCUDA
            </SubmitButton>
          )}

          {/* Boutons d'action après conversion */}
          {showActionButtons && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {successCount > 1 && (
                  <SubmitButton
                    onClick={handleDownloadAll}
                    className="flex-1"
                    variant="default"
                  >
                    Télécharger tout ({successCount} fichiers ZIP)
                  </SubmitButton>
                )}

                {errorCount > 0 && (
                  <SubmitButton
                    onClick={handleRetryFailed}
                    className="flex-1"
                    variant="outline"
                  >
                    Réessayer les échecs ({errorCount})
                  </SubmitButton>
                )}

                <SubmitButton
                  onClick={handleReset}
                  className="flex-1"
                  variant="outline"
                >
                  Recommencer
                </SubmitButton>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
