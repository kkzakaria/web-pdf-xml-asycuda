import { NextRequest, NextResponse } from "next/server"

/**
 * API Route pour télécharger le fichier XML d'un job de conversion
 * Fait proxy vers l'API externe avec authentification
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params

    // Vérifier les variables d'environnement
    const apiBaseUrl = process.env.API_BASE_URL
    const apiKey = process.env.API_KEY

    if (!apiBaseUrl || !apiKey) {
      console.error("Variables d'environnement manquantes:", {
        API_BASE_URL: !!apiBaseUrl,
        API_KEY: !!apiKey,
      })
      return NextResponse.json(
        { detail: "Configuration serveur invalide" },
        { status: 500 }
      )
    }

    // Appeler l'API externe avec authentification
    const response = await fetch(`${apiBaseUrl}/convert/${jobId}/download`, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    // Transférer le blob directement au client
    const blob = await response.blob()

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/xml",
        "Content-Disposition": response.headers.get("Content-Disposition") || "attachment; filename=output.xml",
      },
    })
  } catch (error) {
    console.error("Erreur dans /api/jobs/[jobId]/download:", error)
    return NextResponse.json(
      { detail: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
