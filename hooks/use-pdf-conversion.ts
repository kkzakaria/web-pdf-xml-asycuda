"use client"

import { useCallback, useState } from "react"
import { convertAndDownload, ApiServiceError } from "@/lib/api-service"
import type { FileWithPreview, FileStatus } from "./use-file-upload"

/**
 * État de conversion d'un fichier
 */
export type FileConversionState = {
  id: string
  status: FileStatus
  progress: number
  jobId?: string
  error?: string
}

/**
 * État global de la conversion
 */
export type ConversionState = {
  isConverting: boolean
  files: Map<string, FileConversionState>
  completedCount: number
  errorCount: number
}

/**
 * Actions disponibles pour la conversion
 */
export type ConversionActions = {
  convertFiles: (files: FileWithPreview[]) => Promise<void>
  resetConversion: () => void
  getFileStatus: (fileId: string) => FileConversionState | undefined
}

/**
 * Hook pour gérer la conversion de fichiers PDF vers XML ASYCUDA
 */
export function usePdfConversion(): [ConversionState, ConversionActions] {
  const [state, setState] = useState<ConversionState>({
    isConverting: false,
    files: new Map(),
    completedCount: 0,
    errorCount: 0,
  })

  /**
   * Convertit une liste de fichiers
   */
  const convertFiles = useCallback(async (files: FileWithPreview[]) => {
    if (files.length === 0) return

    // Réinitialiser l'état
    const fileStates = new Map<string, FileConversionState>()
    files.forEach((file) => {
      fileStates.set(file.id, {
        id: file.id,
        status: "processing",
        progress: 0,
      })
    })

    setState({
      isConverting: true,
      files: fileStates,
      completedCount: 0,
      errorCount: 0,
    })

    // Convertir les fichiers un par un (pas en parallèle pour éviter la surcharge)
    for (const fileWithPreview of files) {
      if (!(fileWithPreview.file instanceof File)) {
        continue
      }

      const file = fileWithPreview.file
      const fileId = fileWithPreview.id

      try {
        // Mettre à jour la progression
        const onProgress = (status: string, progress: number) => {
          setState((prev) => {
            const newFiles = new Map(prev.files)
            const fileState = newFiles.get(fileId)
            if (fileState) {
              fileState.progress = progress
            }
            return { ...prev, files: newFiles }
          })
        }

        // Convertir et télécharger
        const jobId = await convertAndDownload(file, onProgress)

        // Marquer comme succès
        setState((prev) => {
          const newFiles = new Map(prev.files)
          const fileState = newFiles.get(fileId)
          if (fileState) {
            fileState.status = "success"
            fileState.progress = 100
            fileState.jobId = jobId
          }
          return {
            ...prev,
            files: newFiles,
            completedCount: prev.completedCount + 1,
          }
        })
      } catch (error) {
        // Marquer comme erreur
        const errorMessage =
          error instanceof ApiServiceError
            ? error.message
            : "Une erreur inconnue est survenue"

        setState((prev) => {
          const newFiles = new Map(prev.files)
          const fileState = newFiles.get(fileId)
          if (fileState) {
            fileState.status = "error"
            fileState.error = errorMessage
          }
          return {
            ...prev,
            files: newFiles,
            errorCount: prev.errorCount + 1,
          }
        })
      }
    }

    // Conversion terminée
    setState((prev) => ({
      ...prev,
      isConverting: false,
    }))
  }, [])

  /**
   * Réinitialise l'état de conversion
   */
  const resetConversion = useCallback(() => {
    setState({
      isConverting: false,
      files: new Map(),
      completedCount: 0,
      errorCount: 0,
    })
  }, [])

  /**
   * Récupère l'état d'un fichier spécifique
   */
  const getFileStatus = useCallback(
    (fileId: string): FileConversionState | undefined => {
      return state.files.get(fileId)
    },
    [state.files]
  )

  return [
    state,
    {
      convertFiles,
      resetConversion,
      getFileStatus,
    },
  ]
}
