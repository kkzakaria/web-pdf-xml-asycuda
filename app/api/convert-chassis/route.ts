import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * API Route pour la conversion PDF vers XML ASYCUDA avec génération de châssis VIN
 * Fait proxy vers l'API externe (v2.1.0) avec authentification
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
    const chassisConfigJson = formData.get("chassis_config")

    // Validation du fichier
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { detail: "Aucun fichier fourni" },
        { status: 400 }
      )
    }

    // Validation du taux de douane
    if (!tauxDouane) {
      return NextResponse.json(
        { detail: "Le taux de douane est obligatoire" },
        { status: 400 }
      )
    }

    const tauxValue = parseFloat(tauxDouane.toString())
    if (isNaN(tauxValue) || tauxValue <= 0) {
      return NextResponse.json(
        { detail: "Le taux de douane doit être un nombre positif" },
        { status: 400 }
      )
    }

    // Validation du rapport de paiement
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

    // Validation de la configuration châssis
    if (!chassisConfigJson || typeof chassisConfigJson !== "string") {
      return NextResponse.json(
        { detail: "La configuration châssis est obligatoire" },
        { status: 400 }
      )
    }

    let chassisConfig
    try {
      chassisConfig = JSON.parse(chassisConfigJson)
    } catch (error) {
      return NextResponse.json(
        { detail: "Configuration châssis invalide (JSON malformé)" },
        { status: 400 }
      )
    }

    // Valider la structure ChassisConfig
    if (
      typeof chassisConfig !== "object" ||
      typeof chassisConfig.generate_chassis !== "boolean" ||
      typeof chassisConfig.quantity !== "number" ||
      typeof chassisConfig.wmi !== "string" ||
      typeof chassisConfig.vds !== "string" ||
      typeof chassisConfig.year !== "number" ||
      typeof chassisConfig.plant_code !== "string" ||
      typeof chassisConfig.ensure_unique !== "boolean"
    ) {
      return NextResponse.json(
        { detail: "Structure ChassisConfig invalide" },
        { status: 400 }
      )
    }

    // Validation des contraintes VIN (ISO 3779)
    if (chassisConfig.wmi.length !== 3) {
      return NextResponse.json(
        { detail: "WMI doit contenir exactement 3 caractères" },
        { status: 400 }
      )
    }

    if (chassisConfig.vds.length !== 5) {
      return NextResponse.json(
        { detail: "VDS doit contenir exactement 5 caractères" },
        { status: 400 }
      )
    }

    if (chassisConfig.plant_code.length !== 1) {
      return NextResponse.json(
        { detail: "plant_code doit contenir exactement 1 caractère" },
        { status: 400 }
      )
    }

    if (chassisConfig.quantity < 1 || chassisConfig.quantity > 1000) {
      return NextResponse.json(
        { detail: "La quantité doit être entre 1 et 1000" },
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

    // Créer le FormData pour l'API externe avec chassis_config
    const externalFormData = new FormData()
    externalFormData.append("file", blob, file.name)
    externalFormData.append("taux_douane", tauxValue.toString())
    externalFormData.append("rapport_paiement", rapportValue)
    externalFormData.append("chassis_config", JSON.stringify(chassisConfig))

    // Appeler l'API externe v2.1.0 avec chassis_config
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
    console.error("Erreur dans /api/convert-chassis:", error)
    return NextResponse.json(
      { detail: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
