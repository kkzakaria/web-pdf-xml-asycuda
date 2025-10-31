import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * API Route pour récupérer le statut d'un job de conversion
 * Fait proxy vers l'API externe avec authentification
 * SÉCURISÉ: Nécessite une authentification Supabase
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Vérifier l'authentification
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { detail: "Non autorisé - Authentification requise" },
        { status: 401 }
      )
    }

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

    // Appeler l'API externe avec authentification (v1.4.10)
    const response = await fetch(`${apiBaseUrl}/convert/${jobId}`, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur dans /api/jobs/[jobId]/status:", error)
    return NextResponse.json(
      { detail: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
