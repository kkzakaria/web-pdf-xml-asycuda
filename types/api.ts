/**
 * Types pour l'API PDF-XML-ASYCUDA
 * Basé sur la spécification OpenAPI de l'API
 */

/**
 * Métriques de conversion
 */
export type ConversionMetrics = {
  articles_count: number
  total_weight?: number
  total_value?: number
  [key: string]: number | string | undefined
}

/**
 * Réponse de conversion synchrone
 */
export type ConvertResponse = {
  success: boolean
  job_id: string
  filename: string
  output_file: string
  metrics?: ConversionMetrics
  processing_time?: number
}

/**
 * Réponse de conversion asynchrone
 */
export type ConvertAsyncResponse = {
  job_id: string
  status: JobStatus
  message: string
  created_at: string
}

/**
 * Statuts possibles d'un job de conversion
 */
export type JobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"

/**
 * Réponse du statut d'un job
 */
export type JobStatusResponse = {
  job_id: string
  status: JobStatus
  filename?: string
  created_at?: string
  started_at?: string
  completed_at?: string
  progress?: number
  message?: string
  error?: string
}

/**
 * Réponse du résultat d'un job
 */
export type JobResultResponse = {
  job_id: string
  status: JobStatus
  filename: string
  output_file: string
  metrics?: ConversionMetrics
  processing_time?: number
  created_at: string
  completed_at: string
}

/**
 * Erreur API
 */
export type ApiError = {
  detail: string | { msg: string; type: string }[]
}

/**
 * Options pour les requêtes API
 */
export type ApiRequestOptions = {
  timeout?: number
  onProgress?: (progress: number) => void
}
