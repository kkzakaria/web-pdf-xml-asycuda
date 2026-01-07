import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * API Route pour la génération indépendante de numéros VIN
 * Fait proxy vers l'API externe /api/v1/chassis/generate
 * SÉCURISÉ: Nécessite une authentification Supabase
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { quantity, wmi, vds, year, plant_code } = body

    // Validation de la quantité
    if (!quantity || typeof quantity !== "number") {
      return NextResponse.json(
        { detail: "La quantité est obligatoire" },
        { status: 400 }
      )
    }

    if (quantity < 1 || quantity > 10000) {
      return NextResponse.json(
        { detail: "La quantité doit être entre 1 et 10000" },
        { status: 400 }
      )
    }

    // Validation du WMI
    if (!wmi || typeof wmi !== "string" || wmi.length !== 3) {
      return NextResponse.json(
        { detail: "WMI doit contenir exactement 3 caractères" },
        { status: 400 }
      )
    }

    // Validation de l'année
    if (!year || typeof year !== "number" || year < 2001 || year > 2030) {
      return NextResponse.json(
        { detail: "L'année doit être entre 2001 et 2030" },
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

    // Construire les paramètres de formulaire (x-www-form-urlencoded)
    const params = new URLSearchParams()
    params.append("quantity", quantity.toString())
    params.append("wmi", wmi)
    params.append("year", year.toString())

    // Paramètres optionnels
    if (vds && typeof vds === "string") {
      params.append("vds", vds)
    }
    if (plant_code && typeof plant_code === "string") {
      params.append("plant_code", plant_code)
    }
    params.append("output_format", "json")

    // Appeler l'API externe avec application/x-www-form-urlencoded
    const response = await fetch(
      `${apiBaseUrl}/chassis/generate`,
      {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur dans /api/chassis/generate:", error)
    return NextResponse.json(
      { detail: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
