"use client"

import { useCallback, useState } from "react"
import {
  convertPdfFile,
  getXmlBlob,
  downloadXmlFile,
  ApiServiceError,
} from "@/lib/api-service"
import { createAndDownloadZip } from "@/lib/zip-helper"
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
  filename?: string
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
  downloadFile: (fileId: string) => Promise<void>
  downloadAllFiles: () => Promise<void>
  retryFailedFiles: (files: FileWithPreview[]) => Promise<void>
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
   * Convertit une liste de fichiers (SANS téléchargement automatique)
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
        filename:
          file.file instanceof File
            ? file.file.name.replace(/\.pdf$/i, ".xml")
            : "output.xml",
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

        // Convertir (SANS télécharger)
        const jobId = await convertPdfFile(file, onProgress)

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
   * Télécharge un fichier converti
   */
  const downloadFile = useCallback(async (fileId: string) => {
    const fileState = state.files.get(fileId)
    if (!fileState?.jobId || !fileState.filename) return

    // Mettre à jour le statut à "downloading"
    setState((prev) => {
      const newFiles = new Map(prev.files)
      const file = newFiles.get(fileId)
      if (file) file.status = "downloading"
      return { ...prev, files: newFiles }
    })

    try {
      // Télécharger le fichier
      const blob = await getXmlBlob(fileState.jobId)
      downloadXmlFile(blob, fileState.filename)

      // Retour à l'état "success"
      setState((prev) => {
        const newFiles = new Map(prev.files)
        const file = newFiles.get(fileId)
        if (file) file.status = "success"
        return { ...prev, files: newFiles }
      })
    } catch (error) {
      // En cas d'erreur, marquer comme erreur
      const errorMessage =
        error instanceof ApiServiceError
          ? error.message
          : "Erreur lors du téléchargement"

      setState((prev) => {
        const newFiles = new Map(prev.files)
        const file = newFiles.get(fileId)
        if (file) {
          file.status = "error"
          file.error = errorMessage
        }
        return { ...prev, files: newFiles }
      })
    }
  }, [state.files])

  /**
   * Télécharge tous les fichiers convertis avec succès dans un ZIP
   */
  const downloadAllFiles = useCallback(async () => {
    const successFiles = Array.from(state.files.values()).filter(
      (file) => file.status === "success" && file.jobId && file.filename
    )

    if (successFiles.length === 0) return

    try {
      // Récupérer tous les blobs
      const fileBlobs = await Promise.all(
        successFiles.map(async (file) => ({
          name: file.filename!,
          blob: await getXmlBlob(file.jobId!),
        }))
      )

      // Créer et télécharger le ZIP
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)
      await createAndDownloadZip(fileBlobs, `conversions-${timestamp}.zip`)
    } catch (error) {
      console.error("Erreur lors du téléchargement groupé:", error)
      throw error
    }
  }, [state.files])

  /**
   * Réessaye la conversion des fichiers en erreur
   */
  const retryFailedFiles = useCallback(
    async (files: FileWithPreview[]) => {
      const failedFileIds = Array.from(state.files.entries())
        .filter(([, fileState]) => fileState.status === "error")
        .map(([id]) => id)

      const filesToRetry = files.filter((file) =>
        failedFileIds.includes(file.id)
      )

      if (filesToRetry.length === 0) return

      await convertFiles(filesToRetry)
    },
    [state.files, convertFiles]
  )

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
      downloadFile,
      downloadAllFiles,
      retryFailedFiles,
      resetConversion,
      getFileStatus,
    },
  ]
}
