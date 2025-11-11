"use client"

import { useState, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/SubmitButton"
import FileUpload from "@/components/FileUpload"
import { convertPdfWithChassis, getXmlBlob, downloadXmlFile } from "@/lib/api-service"
import { generateChassisConfig } from "@/types/api"
import type { RapportType } from "@/types/api"
import type { FileWithPreview } from "@/hooks/use-file-upload"

type ConversionState = {
  status: "idle" | "processing" | "completed" | "error"
  fileName?: string
  jobId?: string
  error?: string
  progress: number
}

export function ChassisConversion() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [quantity, setQuantity] = useState<number>(1)
  const [tauxDouane, setTauxDouane] = useState<number>(572.021)
  const [rapportPaiement, setRapportPaiement] = useState<RapportType>("KARTA")
  const [conversionState, setConversionState] = useState<ConversionState>({
    status: "idle",
    progress: 0,
  })
  const [fileUploadKey, setFileUploadKey] = useState(0)

  const handleFilesChange = useCallback((newFiles: FileWithPreview[]) => {
    // Pour chassis, on accepte qu'un seul fichier
    queueMicrotask(() => {
      if (newFiles.length > 0) {
        setFiles([newFiles[0]])
        setConversionState({ status: "idle", progress: 0 })
      }
    })
  }, [])

  const handleClearFiles = useCallback(() => {
    queueMicrotask(() => {
      setFiles([])
      setConversionState({ status: "idle", progress: 0 })
    })
  }, [])

  const handleFileTauxChange = useCallback((fileId: string, taux: number) => {
    setTauxDouane(taux)
  }, [])

  const handleFileRapportChange = useCallback((fileId: string, rapport: RapportType) => {
    setRapportPaiement(rapport)
  }, [])

  const handleConvert = async () => {
    if (files.length === 0) return

    const file = files[0].file as File

    try {
      setConversionState({
        status: "processing",
        fileName: file.name,
        progress: 0,
      })

      // Générer la configuration châssis avec valeurs aléatoires
      const chassisConfig = generateChassisConfig(quantity)

      // Lancer la conversion avec génération VIN
      const jobId = await convertPdfWithChassis(
        file,
        tauxDouane,
        rapportPaiement,
        chassisConfig,
        (status, progress) => {
          setConversionState((prev) => ({
            ...prev,
            progress,
          }))
        }
      )

      setConversionState({
        status: "completed",
        fileName: file.name,
        jobId,
        progress: 100,
      })
    } catch (error) {
      console.error("Erreur de conversion:", error)
      setConversionState({
        status: "error",
        fileName: file.name,
        error:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la conversion",
        progress: 0,
      })
    }
  }

  const handleDownload = async () => {
    if (!conversionState.jobId) return

    try {
      const blob = await getXmlBlob(conversionState.jobId)
      const xmlFileName = conversionState.fileName?.replace(".pdf", ".xml") || "output.xml"
      downloadXmlFile(blob, xmlFileName)
    } catch (error) {
      console.error("Erreur de téléchargement:", error)
      setConversionState((prev) => ({
        ...prev,
        status: "error",
        error: "Erreur lors du téléchargement du fichier XML",
      }))
    }
  }

  const handleReset = () => {
    setFiles([])
    setQuantity(1)
    setTauxDouane(572.021)
    setRapportPaiement("KARTA")
    setConversionState({ status: "idle", progress: 0 })
    setFileUploadKey((prev) => prev + 1)
  }

  const showActionButtons = conversionState.status === "completed" || conversionState.status === "error"

  return (
    <div className="space-y-6">
      {/* Zone de téléversement avec FileUpload */}
      <FileUpload
        key={fileUploadKey}
        maxFiles={1}
        maxSize={2 * 1024 * 1024}
        accept=".pdf,application/pdf"
        multiple={false}
        onFilesChange={handleFilesChange}
        onClearFiles={handleClearFiles}
        disabled={conversionState.status === "processing"}
        isProcessing={conversionState.status === "processing"}
        isSuccess={conversionState.status === "completed"}
        isError={conversionState.status === "error"}
        errorMessage={conversionState.error}
        errorDescription="La conversion avec génération de châssis a échoué"
        controlledFiles={files}
        onFileTauxChange={handleFileTauxChange}
        onFileRapportChange={handleFileRapportChange}
        showClearAllButton={false}
      />

      {/* Champ quantité de châssis */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="quantity-chassis">Quantité de numéros de châssis (VIN)</Label>
          <Input
            id="quantity-chassis"
            type="number"
            min={1}
            max={1000}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            disabled={conversionState.status === "processing"}
            placeholder="Nombre de VIN à générer (1-1000)"
          />
          <p className="text-xs text-muted-foreground">
            Génération automatique conforme ISO 3779
          </p>
        </div>
      )}

      {/* Boutons d'action */}
      {!showActionButtons && files.length > 0 && (
        <SubmitButton
          onClick={handleConvert}
          isSubmitting={conversionState.status === "processing"}
          submittingText="Conversion en cours..."
          className="w-full"
          disabled={conversionState.status === "processing" || files.length === 0}
        >
          Convertir avec Châssis
        </SubmitButton>
      )}

      {showActionButtons && (
        <div className="flex gap-2">
          {conversionState.status === "completed" && (
            <SubmitButton
              onClick={handleDownload}
              variant="default"
              className="flex-1"
            >
              Télécharger XML
            </SubmitButton>
          )}
          <SubmitButton
            onClick={handleReset}
            variant="outline"
            className="flex-1"
          >
            Réinitialiser
          </SubmitButton>
        </div>
      )}
    </div>
  )
}
