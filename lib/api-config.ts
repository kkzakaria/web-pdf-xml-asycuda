/**
 * Configuration de l'API PDF-XML-ASYCUDA
 */

export const API_CONFIG = {
  baseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://pdf-xml-asycuda-api.onrender.com",
  endpoints: {
    convert: "/api/v1/convert",
    convertAsync: "/api/v1/convert/async",
    jobStatus: (jobId: string) => `/api/v1/convert/${jobId}`,
    jobResult: (jobId: string) => `/api/v1/convert/${jobId}/result`,
    downloadXml: (jobId: string) => `/api/v1/convert/${jobId}/download`,
  },
  timeout: 120000, // 2 minutes pour la conversion synchrone
} as const
