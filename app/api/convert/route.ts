import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * API Route pour la conversion PDF vers XML ASYCUDA
 * Fait proxy vers l'API externe avec authentification
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
    const formData = await request.formData()
    const file = formData.get("file")
    const tauxDouane = formData.get("taux_douane")
    const rapportLabel = formData.get("rapport_paiement")

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { detail: "Aucun fichier fourni" },
        { status: 400 }
      )
    }

    if (!tauxDouane) {
      return NextResponse.json(
        { detail: "Le taux de douane est obligatoire" },
        { status: 400 }
      )
    }

    // Valider le taux de douane
    const tauxValue = parseFloat(tauxDouane.toString())
    if (isNaN(tauxValue) || tauxValue <= 0) {
      return NextResponse.json(
        { detail: "Le taux de douane doit être un nombre positif" },
        { status: 400 }
      )
    }

    // Valider le rapport de paiement
    if (!rapportLabel || typeof rapportLabel !== "string") {
      return NextResponse.json(
        { detail: "Le rapport de paiement est obligatoire" },
        { status: 400 }
      )
    }

    if (!["KARTA", "DJAM"].includes(rapportLabel)) {
      return NextResponse.json(
        { detail: "Le rapport de paiement doit être KARTA ou DJAM" },
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

    // Mapper le label du rapport vers la valeur d'environnement (SÉCURITÉ)
    const rapportValue =
      rapportLabel === "KARTA"
        ? process.env.RAPPORT_DE_PAIEMENT_KRT
        : process.env.RAPPORT_DE_PAIEMENT_DJM

    if (!rapportValue) {
      console.error("Variable d'environnement rapport manquante:", {
        label: rapportLabel,
        envVar:
          rapportLabel === "KARTA"
            ? "RAPPORT_DE_PAIEMENT_KRT"
            : "RAPPORT_DE_PAIEMENT_DJM",
      })
      return NextResponse.json(
        { detail: "Configuration serveur invalide" },
        { status: 500 }
      )
    }

    // Convertir le File en Buffer puis Blob pour l'API externe
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const blob = new Blob([buffer], { type: file.type })

    // Créer le FormData pour l'API externe
    const externalFormData = new FormData()
    externalFormData.append("file", blob, file.name)
    externalFormData.append("taux_douane", tauxValue.toString())
    externalFormData.append("rapport_paiement", rapportValue) // Valeur réelle, pas le label

    // Appeler l'API externe avec authentification (v1.4.10)
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
