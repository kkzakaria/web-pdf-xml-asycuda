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

/**
 * Convertit un fichier PDF en XML ASYCUDA (synchrone)
 * @param file - Fichier PDF à convertir
 * @param options - Options de la requête
 * @returns Résultat de la conversion
 */
export async function convertPdfToXml(
  file: File,
  options: ApiRequestOptions = {}
): Promise<ConvertResponse> {
  const { timeout = API_CONFIG.timeout } = options

  const formData = new FormData()
  formData.append("file", file)

  const controller = createTimeoutController(timeout)

  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.convert}`,
      {
        method: "POST",
        body: formData,
        signal: controller.signal,
      }
    )

    if (!response.ok) {
      await handleApiError(response)
    }

    return (await response.json()) as ConvertResponse
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiServiceError("La conversion a expiré (timeout)", 408)
    }
    throw error
  }
}

/**
 * Démarre une conversion PDF en XML ASYCUDA (asynchrone)
 * @param file - Fichier PDF à convertir
 * @returns Informations sur le job créé
 */
export async function convertPdfAsync(
  file: File
): Promise<ConvertAsyncResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(
    `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.convertAsync}`,
    {
      method: "POST",
      body: formData,
    }
  )

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
  const response = await fetch(
    `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.jobStatus(jobId)}`,
    {
      method: "GET",
    }
  )

  if (!response.ok) {
    await handleApiError(response)
  }

  return (await response.json()) as JobStatusResponse
}

/**
 * Récupère le résultat complet d'un job de conversion
 * @param jobId - ID du job
 * @returns Résultat du job
 */
export async function getJobResult(jobId: string): Promise<JobResultResponse> {
  const response = await fetch(
    `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.jobResult(jobId)}`,
    {
      method: "GET",
    }
  )

  if (!response.ok) {
    await handleApiError(response)
  }

  return (await response.json()) as JobResultResponse
}

/**
 * Télécharge le fichier XML résultant d'une conversion
 * @param jobId - ID du job
 * @param filename - Nom du fichier à télécharger (optionnel)
 * @returns Blob contenant le fichier XML
 */
export async function downloadXmlFile(
  jobId: string,
  filename?: string
): Promise<Blob> {
  const response = await fetch(
    `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.downloadXml(jobId)}`,
    {
      method: "GET",
    }
  )

  if (!response.ok) {
    await handleApiError(response)
  }

  const blob = await response.blob()

  // Déclencher le téléchargement automatique
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename || `asycuda-${jobId}.xml`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)

  return blob
}

/**
 * Convertit et télécharge un fichier PDF en XML ASYCUDA
 * Gère automatiquement le processus complet
 * @param file - Fichier PDF à convertir
 * @param onProgress - Callback pour suivre la progression
 * @returns ID du job de conversion
 */
export async function convertAndDownload(
  file: File,
  onProgress?: (status: string, progress: number) => void
): Promise<string> {
  // Démarrer la conversion asynchrone
  onProgress?.("Envoi du fichier...", 10)
  const asyncResponse = await convertPdfAsync(file)
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
        30 + statusResponse.progress * 0.6
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

  // Télécharger le fichier XML
  onProgress?.("Téléchargement du fichier...", 90)
  await downloadXmlFile(jobId, file.name.replace(/\.pdf$/i, ".xml"))

  onProgress?.("Terminé", 100)
  return jobId
}
