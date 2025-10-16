"use client"

import { useCallback, useState } from "react"
import FileUpload from "@/components/FileUpload"
import { Button } from "@/components/ui/button"
import type { FileWithPreview, FileStatus } from "@/hooks/use-file-upload"

type AnimationState = "normal" | "processing" | "success" | "warning" | "error"

export default function TestAnimationsPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [currentState, setCurrentState] = useState<AnimationState>("normal")

  const handleFilesChange = useCallback((newFiles: FileWithPreview[]) => {
    queueMicrotask(() => {
      setFiles(newFiles)
      console.log("Fichiers sélectionnés:", newFiles)
    })
  }, [])

  const setFileState = (fileId: string, status: FileStatus) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === fileId ? { ...file, status } : file))
    )
  }

  const handleFileDownload = (fileId: string) => {
    console.log("Téléchargement du fichier:", fileId)
    alert(`Téléchargement du fichier: ${files.find((f) => f.id === fileId)?.file.name}`)
  }

  const resetToNormal = () => {
    setCurrentState("normal")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 gap-8">
      <div className="w-full max-w-2xl">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Test des animations
          </h1>
          <p className="text-muted-foreground">
            Testez les différents états du composant FileUpload
          </p>
        </div>

        {/* Contrôles d'état */}
        <div className="mb-8 p-6 rounded-lg border bg-card">
          <h2 className="text-lg font-semibold mb-4">
            État actuel: <span className="text-primary">{currentState}</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setCurrentState("normal")}
              variant={currentState === "normal" ? "default" : "outline"}
            >
              Normal
            </Button>
            <Button
              onClick={() => setCurrentState("processing")}
              variant={currentState === "processing" ? "default" : "outline"}
            >
              Processing
            </Button>
            <Button
              onClick={() => setCurrentState("success")}
              variant={currentState === "success" ? "default" : "outline"}
            >
              Success
            </Button>
            <Button
              onClick={() => setCurrentState("warning")}
              variant={currentState === "warning" ? "default" : "outline"}
            >
              Warning
            </Button>
            <Button
              onClick={() => setCurrentState("error")}
              variant={currentState === "error" ? "default" : "outline"}
            >
              Error
            </Button>
          </div>
        </div>

        {/* Contrôles des états de fichiers */}
        {files.length > 0 && (
          <div className="mb-8 p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-4">États des fichiers</h2>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-4 p-3 rounded border bg-background"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      État: {file.status || "idle"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={file.status === "idle" ? "default" : "outline"}
                      onClick={() => setFileState(file.id, "idle")}
                    >
                      Idle
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        file.status === "processing" ? "default" : "outline"
                      }
                      onClick={() => setFileState(file.id, "processing")}
                    >
                      Process
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        file.status === "downloading" ? "default" : "outline"
                      }
                      onClick={() => setFileState(file.id, "downloading")}
                    >
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant={file.status === "success" ? "default" : "outline"}
                      onClick={() => setFileState(file.id, "success")}
                    >
                      Success
                    </Button>
                    <Button
                      size="sm"
                      variant={file.status === "error" ? "default" : "outline"}
                      onClick={() => setFileState(file.id, "error")}
                    >
                      Error
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Composant FileUpload */}
        <FileUpload
          maxFiles={5}
          maxSize={50 * 1024 * 1024}
          accept=".pdf,application/pdf"
          multiple={true}
          controlledFiles={files}
          onFilesChange={handleFilesChange}
          disabled={currentState === "processing"}
          isSuccess={currentState === "success"}
          isWarning={currentState === "warning"}
          warningMessage="Attention !"
          warningDescription={`${files.length || 2} fichier${files.length > 1 ? "s" : ""} nécessite${files.length > 1 ? "nt" : ""} votre attention`}
          isError={currentState === "error"}
          errorMessage="Erreur de conversion"
          errorDescription="Une erreur est survenue lors du traitement des fichiers"
          onFileDownload={handleFileDownload}
        />

        {/* Informations de débogage */}
        <div className="mt-8 p-4 rounded-lg border bg-muted/30">
          <h3 className="text-sm font-semibold mb-2">Informations</h3>
          <div className="text-xs space-y-1 text-muted-foreground">
            <p>État: {currentState}</p>
            <p>Fichiers: {files.length}</p>
            <p>disabled: {currentState === "processing" ? "true" : "false"}</p>
            <p>isSuccess: {currentState === "success" ? "true" : "false"}</p>
            <p>isWarning: {currentState === "warning" ? "true" : "false"}</p>
            <p>isError: {currentState === "error" ? "true" : "false"}</p>
          </div>
        </div>

        {/* Bouton de réinitialisation */}
        {currentState !== "normal" && (
          <div className="mt-4 text-center">
            <Button onClick={resetToNormal} variant="outline">
              Réinitialiser à l&apos;état normal
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
