/**
 * Types pour l'API PDF-XML-ASYCUDA
 * Basé sur la spécification OpenAPI de l'API v2.3.0
 */

/**
 * Types de rapport de paiement disponibles
 * Labels UI uniquement - les valeurs réelles sont mappées côté serveur
 */
export type RapportType = "KARTA" | "DJAM"

/**
 * Format de numéro de rapport de paiement (API v2.3.0)
 * Exemple: "25P2003J"
 */
export type RapportPaiement = string

/**
 * Métriques de conversion (enrichies selon OpenAPI v1.4.10)
 */
export type ConversionMetrics = {
  items_count: number
  containers_count: number
  fill_rate: number // Taux de remplissage en %
  warnings_count: number
  warnings: string[]
  xml_valid: boolean
  has_exporter: boolean
  has_consignee: boolean
  processing_time: number // En secondes
  total_weight?: number
  total_value?: number
  [key: string]: number | string | boolean | string[] | undefined
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
 * Configuration pour la génération de numéros de châssis VIN (API v2.3.0)
 * Conforme à la norme ISO 3779
 */
export type ChassisConfig = {
  quantity: number // Nombre de VIN à générer (1-1000)
  wmi: string // World Manufacturer Identifier (3 caractères)
  year: number // Année de fabrication (1980-2055)
  vds?: string // Vehicle Descriptor Section (5 caractères, défaut: "HCKZS")
  plant_code?: string // Code usine (1 caractère, défaut: "S")
}

/**
 * Requête de conversion avec génération de châssis
 */
export type ConvertChassisRequest = {
  taux_douane: number
  rapport_paiement: RapportType
  quantity: number // Quantité de VIN à générer
}

/**
 * Options pour les requêtes API
 */
export type ApiRequestOptions = {
  timeout?: number
  onProgress?: (progress: number) => void
}

/**
 * Génère un composant aléatoire pour VIN conforme ISO 3779
 * Exclut les caractères I, O, Q
 */
export function generateRandomVinComponent(length: number): string {
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789" // Sans I, O, Q
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Génère une configuration ChassisConfig complète avec valeurs aléatoires
 */
export function generateChassisConfig(quantity: number): ChassisConfig {
  return {
    quantity,
    wmi: generateRandomVinComponent(3),
    vds: generateRandomVinComponent(5),
    year: new Date().getFullYear(),
    plant_code: generateRandomVinComponent(1),
  }
}
