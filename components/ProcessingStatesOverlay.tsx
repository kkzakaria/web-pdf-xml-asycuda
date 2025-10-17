"use client"

import { FileConversionAnimation } from "@/components/FileConversionAnimation"
import { SuccessAnimation } from "@/components/SuccessAnimation"
import { WarningAnimation } from "@/components/WarningAnimation"
import { ErrorAnimation } from "@/components/ErrorAnimation"

interface ProcessingStatesOverlayProps {
  isProcessing?: boolean
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
  if (!isProcessing && !isSuccess && !isWarning && !isError) {
    return null
  }

  return (
    <>
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
      ) : isSuccess ? (
        <SuccessAnimation
          message="Conversion réussie !"
          description={`${filesCount} fichier${filesCount > 1 ? "s" : ""} converti${filesCount > 1 ? "s" : ""} avec succès`}
        />
      ) : isProcessing ? (
        <FileConversionAnimation />
      ) : null}
    </>
  )
}

export type { ProcessingStatesOverlayProps }
