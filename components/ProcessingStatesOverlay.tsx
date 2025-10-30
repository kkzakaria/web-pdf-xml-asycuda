"use client"

import { FileConversionAnimation } from "@/components/FileConversionAnimation"
import { SuccessAnimation } from "@/components/SuccessAnimation"
import { WarningAnimation } from "@/components/WarningAnimation"
import { ErrorAnimation } from "@/components/ErrorAnimation"
import { Spinner } from "@/components/ui/spinner"

interface ProcessingStatesOverlayProps {
  isProcessing?: boolean
  isDownloading?: boolean
  isSuccess?: boolean
  isWarning?: boolean
  warningMessage?: string
  warningDescription?: string
  isError?: boolean
  errorMessage?: string
  errorDescription?: string
  filesCount?: number
}

export function ProcessingStatesOverlay({
  isProcessing = false,
  isDownloading = false,
  isSuccess = false,
  isWarning = false,
  warningMessage,
  warningDescription,
  isError = false,
  errorMessage,
  errorDescription,
  filesCount = 0,
}: ProcessingStatesOverlayProps) {
  // Ne rien afficher si aucun état actif
  if (!isProcessing && !isDownloading && !isSuccess && !isWarning && !isError) {
    return null
  }

  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-input p-4 bg-background">
      {isError ? (
        <ErrorAnimation
          message={errorMessage}
          description={errorDescription}
        />
      ) : isWarning ? (
        <WarningAnimation
          message={warningMessage}
          description={warningDescription}
        />
      ) : isDownloading ? (
        <div className="flex flex-col items-center justify-center gap-3">
          <Spinner className="size-8 text-blue-600" />
          <div className="text-center">
            <p className="text-sm font-medium">Téléchargement en cours...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Préparation de vos fichiers
            </p>
          </div>
        </div>
      ) : isSuccess ? (
        <SuccessAnimation
          message="Conversion réussie !"
          description={`${filesCount} fichier${filesCount > 1 ? "s" : ""} converti${filesCount > 1 ? "s" : ""} avec succès`}
        />
      ) : isProcessing ? (
        <FileConversionAnimation />
      ) : null}
    </div>
  )
}

export type { ProcessingStatesOverlayProps }
