import { NextRequest, NextResponse } from "next/server"

/**
 * API Route pour la conversion PDF vers XML ASYCUDA
 * Fait proxy vers l'API externe avec authentification
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { detail: "Aucun fichier fourni" },
        { status: 400 }
      )
    }

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

    // Créer le FormData pour l'API externe
    const externalFormData = new FormData()
    externalFormData.append("file", file)

    // Appeler l'API externe avec authentification
    const response = await fetch(`${apiBaseUrl}/convert/async`, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
      },
      body: externalFormData,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur dans /api/convert:", error)
    return NextResponse.json(
      { detail: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
