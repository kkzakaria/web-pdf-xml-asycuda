"use client"

import { useState, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/SubmitButton"
import { generateChassisVins } from "@/lib/api-service"
import { generateRandomVinComponent } from "@/types/api"
import { Copy, Check, Download } from "lucide-react"

type GenerationState = {
  status: "idle" | "generating" | "completed" | "error"
  error?: string
  vins: string[]
}

export function ChassisGenerator() {
  const [quantity, setQuantity] = useState<number | undefined>(undefined)
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: "idle",
    vins: [],
  })
  const [copiedIndices, setCopiedIndices] = useState<Set<number>>(new Set())
  const [justCopiedIndex, setJustCopiedIndex] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const handleGenerate = async () => {
    if (!isQuantityValid) return

    try {
      setGenerationState({
        status: "generating",
        vins: [],
      })

      const response = await generateChassisVins({
        quantity: quantity!,
        wmi: generateRandomVinComponent(3),
        year: new Date().getFullYear(),
        vds: generateRandomVinComponent(5),
        plant_code: generateRandomVinComponent(1),
      })

      if (response.success && response.vins.length > 0) {
        setGenerationState({
          status: "completed",
          vins: response.vins,
        })
      } else {
        setGenerationState({
          status: "error",
          error: "Aucun VIN généré",
          vins: [],
        })
      }
    } catch (error) {
      console.error("Erreur de génération:", error)
      setGenerationState({
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la génération",
        vins: [],
      })
    }
  }

  const handleCopyVin = useCallback(async (vin: string, index: number) => {
    try {
      await navigator.clipboard.writeText(vin)
      setCopiedIndices(prev => new Set(prev).add(index))
      setJustCopiedIndex(index)
      setTimeout(() => setJustCopiedIndex(null), 1500)
    } catch (error) {
      console.error("Erreur de copie:", error)
    }
  }, [])

  const handleCopyAll = useCallback(async () => {
    try {
      const allVins = generationState.vins.join("\n")
      await navigator.clipboard.writeText(allVins)
      // Marquer tous les VINs comme copiés
      setCopiedIndices(new Set(generationState.vins.map((_, i) => i)))
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    } catch (error) {
      console.error("Erreur de copie:", error)
    }
  }, [generationState.vins])

  const handleDownload = useCallback(() => {
    const allVins = generationState.vins.join("\n")
    const blob = new Blob([allVins], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vins-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }, [generationState.vins])

  const handleReset = () => {
    setQuantity(undefined)
    setGenerationState({ status: "idle", vins: [] })
    setCopiedIndices(new Set())
  }

  const isQuantityValid = quantity !== undefined && quantity >= 1 && quantity <= 10000
  const showResults = generationState.status === "completed" && generationState.vins.length > 0

  return (
    <div className="space-y-6">
      {/* Champ quantité (masqué quand résultats affichés) */}
      {!showResults && (
        <div className="space-y-2">
          <Label htmlFor="quantity-generator">Quantité de numéros VIN à générer</Label>
          <Input
            id="quantity-generator"
            type="number"
            min={1}
            max={10000}
            value={quantity ?? ""}
            onChange={(e) => {
              const val = e.target.value
              setQuantity(val === "" ? undefined : parseInt(val))
            }}
            disabled={generationState.status === "generating"}
            placeholder="Nombre de VIN à générer (1-10000)"
          />
          <p className="text-xs text-muted-foreground">
            Génération conforme ISO 3779
          </p>
        </div>
      )}

      {/* Message d'erreur */}
      {generationState.status === "error" && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{generationState.error}</p>
        </div>
      )}

      {/* Bouton de génération */}
      {!showResults && (
        <SubmitButton
          onClick={handleGenerate}
          isSubmitting={generationState.status === "generating"}
          submittingText="Génération en cours..."
          className="w-full"
          disabled={generationState.status === "generating" || !isQuantityValid}
        >
          Générer les VINs
        </SubmitButton>
      )}

      {/* Résultats */}
      {showResults && (
        <div className="space-y-4">
          {/* En-tête avec actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm font-medium">
                {generationState.vins.length} VIN{generationState.vins.length > 1 ? "s" : ""} généré{generationState.vins.length > 1 ? "s" : ""}
              </p>
              {copiedIndices.size > 0 && (
                <p className="text-xs text-green-600">
                  {copiedIndices.size} copié{copiedIndices.size > 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyAll}
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                {copiedAll ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Tout copier
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                <Download className="h-3.5 w-3.5" />
                Télécharger
              </button>
            </div>
          </div>

          {/* Liste des VINs */}
          <div className="max-h-80 overflow-y-auto rounded-lg border bg-muted/30">
            <ul className="divide-y">
              {generationState.vins.map((vin, index) => {
                const isCopied = copiedIndices.has(index)
                const isJustCopied = justCopiedIndex === index
                return (
                  <li
                    key={index}
                    className={`flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors ${isCopied ? "bg-green-50 dark:bg-green-950/20" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      {isCopied && (
                        <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      )}
                      <code className={`text-sm font-mono ${isCopied ? "text-green-700 dark:text-green-400" : ""}`}>{vin}</code>
                    </div>
                    <button
                      onClick={() => handleCopyVin(vin, index)}
                      className={`ml-2 p-1 rounded transition-colors ${isJustCopied ? "bg-green-100 dark:bg-green-900" : "hover:bg-muted"}`}
                      title={isCopied ? "Copié - Cliquer pour copier à nouveau" : "Copier"}
                    >
                      {isJustCopied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className={`h-4 w-4 ${isCopied ? "text-green-600" : "text-muted-foreground"}`} />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Bouton réinitialiser */}
          <SubmitButton
            onClick={handleReset}
            variant="outline"
            className="w-full"
          >
            Nouvelle génération
          </SubmitButton>
        </div>
      )}
    </div>
  )
}
