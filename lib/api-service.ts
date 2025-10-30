/**
 * Service API pour la conversion PDF vers XML ASYCUDA
 */

import { API_CONFIG } from "./api-config"
import type {
  ConvertResponse,
  ConvertAsyncResponse,
  JobStatusResponse,
  JobResultResponse,
  ApiError,
  ApiRequestOptions,
} from "@/types/api"

/**
 * Classe d'erreur personnalisée pour les erreurs API
 */
export class ApiServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message)
    this.name = "ApiServiceError"
  }
}

/**
 * Gère les erreurs de réponse API
 */
async function handleApiError(response: Response): Promise<never> {
  let errorMessage = `Erreur API: ${response.status} ${response.statusText}`

  try {
    const errorData = (await response.json()) as ApiError
    if (typeof errorData.detail === "string") {
      errorMessage = errorData.detail
    } else if (Array.isArray(errorData.detail)) {
      errorMessage = errorData.detail.map((e) => e.msg).join(", ")
    }
  } catch {
    // Ignore JSON parsing errors
  }

  throw new ApiServiceError(errorMessage, response.status)
}

/**
 * Crée un AbortController avec timeout
 */
function createTimeoutController(timeout: number): AbortController {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeout)
  return controller
}

// Note: La conversion synchrone n'est plus utilisée
// Nous utilisons maintenant uniquement la conversion asynchrone via convertPdfAsync()

/**
 * Démarre une conversion PDF en XML ASYCUDA (asynchrone)
 * @param file - Fichier PDF à convertir
 * @param tauxDouane - Taux de douane (obligatoire, > 0)
 * @returns Informations sur le job créé
 */
export async function convertPdfAsync(
  file: File,
  tauxDouane: number
): Promise<ConvertAsyncResponse> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("taux_douane", tauxDouane.toString())

  const response = await fetch(API_CONFIG.endpoints.convertAsync, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    await handleApiError(response)
  }

  return (await response.json()) as ConvertAsyncResponse
}

/**
 * Récupère le statut d'un job de conversion
 * @param jobId - ID du job
 * @returns Statut du job
 */
export async function getJobStatus(
  jobId: string
): Promise<JobStatusResponse> {
  const response = await fetch(API_CONFIG.endpoints.jobStatus(jobId), {
    method: "GET",
  })

  if (!response.ok) {
    await handleApiError(response)
  }

  return (await response.json()) as JobStatusResponse
}

// Note: getJobResult() n'est plus utilisé
// Nous utilisons getJobStatus() et getXmlBlob() séparément

/**
 * Récupère le fichier XML résultant d'une conversion (sans téléchargement automatique)
 * @param jobId - ID du job
 * @returns Blob contenant le fichier XML
 */
export async function getXmlBlob(jobId: string): Promise<Blob> {
  const response = await fetch(API_CONFIG.endpoints.downloadXml(jobId), {
    method: "GET",
  })

  if (!response.ok) {
    await handleApiError(response)
  }

  return await response.blob()
}

/**
 * Télécharge un fichier XML à partir d'un Blob
 * @param blob - Le Blob contenant le fichier XML
 * @param filename - Nom du fichier à télécharger
 */
export function downloadXmlFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Convertit un fichier PDF en XML ASYCUDA (SANS téléchargement automatique)
 * Gère le processus de conversion avec polling du statut
 * @param file - Fichier PDF à convertir
 * @param tauxDouane - Taux de douane (obligatoire, > 0)
 * @param onProgress - Callback pour suivre la progression
 * @returns ID du job de conversion
 */
export async function convertPdfFile(
  file: File,
  tauxDouane: number,
  onProgress?: (status: string, progress: number) => void
): Promise<string> {
  // Démarrer la conversion asynchrone
  onProgress?.("Envoi du fichier...", 10)
  const asyncResponse = await convertPdfAsync(file, tauxDouane)
  const jobId = asyncResponse.job_id

  // Polling du statut jusqu'à completion
  onProgress?.("Conversion en cours...", 30)
  let status = asyncResponse.status
  let attempts = 0
  const maxAttempts = 60 // 60 * 2s = 2 minutes max

  while (
    status !== "completed" &&
    status !== "failed" &&
    status !== "cancelled" &&
    attempts < maxAttempts
  ) {
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Attendre 2 secondes
    const statusResponse = await getJobStatus(jobId)
    status = statusResponse.status

    if (statusResponse.progress) {
      onProgress?.(
        "Conversion en cours...",
        30 + statusResponse.progress * 0.7
      )
    }

    attempts++
  }

  if (status === "failed") {
    const statusResponse = await getJobStatus(jobId)
    throw new ApiServiceError(
      statusResponse.error || "La conversion a échoué",
      500
    )
  }

  if (status === "cancelled") {
    throw new ApiServiceError("La conversion a été annulée", 499)
  }

  if (attempts >= maxAttempts) {
    throw new ApiServiceError(
      "La conversion a pris trop de temps (timeout)",
      408
    )
  }

  onProgress?.("Conversion terminée", 100)
  return jobId
}
