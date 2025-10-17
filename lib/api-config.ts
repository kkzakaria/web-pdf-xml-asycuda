/**
 * Configuration de l'API PDF-XML-ASYCUDA
 *
 * Les appels API passent maintenant par les routes Next.js (/app/api/*)
 * qui font proxy vers l'API externe avec authentification côté serveur.
 *
 * Aucune variable d'environnement n'est exposée au client.
 */

export const API_CONFIG = {
  // Routes Next.js internes (proxy sécurisé)
  endpoints: {
    convertAsync: "/api/convert",
    jobStatus: (jobId: string) => `/api/jobs/${jobId}/status`,
    downloadXml: (jobId: string) => `/api/jobs/${jobId}/download`,
  },
  timeout: 120000, // 2 minutes pour la conversion synchrone
} as const
