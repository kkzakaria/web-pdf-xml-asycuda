"use client"

import { useState } from "react"
import {
  AlertCircleIcon,
  DownloadIcon,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileUpIcon,
  HeadphonesIcon,
  ImageIcon,
  VideoIcon,
  XIcon,
  RefreshCwIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react"

import {
  formatBytes,
  useFileUpload,
  type FileUploadOptions,
  type FileWithPreview,
} from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import { ProcessingStatesOverlay } from "@/components/ProcessingStatesOverlay"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

type FileUploadProps = FileUploadOptions & {
  className?: string
  showFileList?: boolean
  showClearAllButton?: boolean
  disabled?: boolean
  isProcessing?: boolean
  isDownloading?: boolean
  isSuccess?: boolean
  isWarning?: boolean
  warningMessage?: string
  warningDescription?: string
  isError?: boolean
  errorMessage?: string
  errorDescription?: string
  onFileDownload?: (fileId: string) => void
  onFileRetry?: (fileId: string) => void
  onFileTauxChange?: (fileId: string, taux: number) => void
  controlledFiles?: FileWithPreview[]
  onClearFiles?: () => void
}

const getFileIcon = (file: { file: File | { type: string; name: string } }) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type
  const fileName = file.file instanceof File ? file.file.name : file.file.name

  if (
    fileType.includes("pdf") ||
    fileName.endsWith(".pdf") ||
    fileType.includes("word") ||
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx")
  ) {
    return <FileTextIcon className="size-4 opacity-60" />
  } else if (
    fileType.includes("zip") ||
    fileType.includes("archive") ||
    fileName.endsWith(".zip") ||
    fileName.endsWith(".rar")
  ) {
    return <FileArchiveIcon className="size-4 opacity-60" />
  } else if (
    fileType.includes("excel") ||
    fileName.endsWith(".xls") ||
    fileName.endsWith(".xlsx")
  ) {
    return <FileSpreadsheetIcon className="size-4 opacity-60" />
  } else if (fileType.includes("video/")) {
    return <VideoIcon className="size-4 opacity-60" />
  } else if (fileType.includes("audio/")) {
    return <HeadphonesIcon className="size-4 opacity-60" />
  } else if (fileType.startsWith("image/")) {
    return <ImageIcon className="size-4 opacity-60" />
  }
  return <FileIcon className="size-4 opacity-60" />
}

const getFileActionIcon = (
  status: string | undefined,
  disabled: boolean,
  onRemove: () => void,
  errorMessage?: string,
  onDownload?: () => void,
  onRetry?: () => void
) => {
  // Processing state - blue for active conversion
  if (status === "processing") {
    return <Spinner className="size-4 text-blue-600" />
  }

  // Idle state (waiting in queue) - gray spinner
  if (status === "idle") {
    return <Spinner className="size-4 text-muted-foreground" />
  }

  // Downloading state
  if (status === "downloading") {
    return <Spinner className="size-4 text-blue-600" />
  }

  // Error state - afficher bouton retry
  if (status === "error") {
    return (
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="size-8 flex items-center justify-center">
              <AlertCircleIcon
                className="size-4 text-destructive"
                aria-hidden="true"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            className="bg-destructive/10 text-destructive border border-destructive/20"
            hideArrow
          >
            <p className="text-xs max-w-xs">
              {errorMessage || "Une erreur est survenue lors du traitement"}
            </p>
          </TooltipContent>
        </Tooltip>
        {onRetry && (
          <Button
            size="icon"
            variant="ghost"
            className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-primary"
            onClick={onRetry}
            aria-label="Réessayer la conversion"
          >
            <RefreshCwIcon className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    )
  }

  // Success state - afficher bouton download
  if (status === "success") {
    return (
      <Button
        size="icon"
        variant="ghost"
        className="-me-2 size-8 text-green-600 hover:bg-transparent hover:text-green-700"
        onClick={onDownload}
        aria-label="Télécharger le fichier XML"
      >
        <DownloadIcon className="size-4" aria-hidden="true" />
      </Button>
    )
  }

  // Default: show delete button
  return (
    <Button
      size="icon"
      variant="ghost"
      className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
      onClick={onRemove}
      aria-label="Supprimer le fichier"
    >
      <XIcon className="size-4" aria-hidden="true" />
    </Button>
  )
}

export default function FileUpload({
  className,
  showFileList = true,
  showClearAllButton = true,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB par défaut
  accept = "*",
  multiple = true,
  initialFiles = [],
  onFilesChange,
  onFilesAdded,
  disabled = false,
  isProcessing = false,
  isDownloading = false,
  isSuccess = false,
  isWarning = false,
  warningMessage,
  warningDescription,
  isError = false,
  errorMessage,
  errorDescription,
  onFileDownload,
  onFileRetry,
  onFileTauxChange,
  controlledFiles,
  onClearFiles,
}: FileUploadProps) {
  const [
    { files: internalFiles, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles: clearInternalFiles,
      getInputProps,
      applyTauxToAll,
      applyTauxToFiles,
    },
  ] = useFileUpload({
    multiple,
    maxFiles,
    maxSize,
    accept,
    initialFiles,
    onFilesChange,
    onFilesAdded,
  })

  // Bulk application state
  const [bulkTaux, setBulkTaux] = useState<number>(563.53)
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set())
  const [individualInputsVisible, setIndividualInputsVisible] = useState<boolean>(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false)
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {})

  // Use controlled files if provided, otherwise use internal state
  const files = controlledFiles ?? internalFiles

  // Clear both internal and external state
  const clearFiles = () => {
    clearInternalFiles()
    onClearFiles?.()
  }

  // Check if any files would be replaced
  const checkNeedsConfirmation = (targetFiles: FileWithPreview[]): boolean => {
    return targetFiles.some(
      (file) => file.tauxDouane && file.tauxDouane !== 563.53
    )
  }

  // Handle applying taux to all files
  const handleApplyToAll = () => {
    const idleFiles = files.filter((f) => !f.status || f.status === "idle")
    if (idleFiles.length === 0) return

    const needsConfirm = checkNeedsConfirmation(idleFiles)
    if (needsConfirm) {
      setConfirmAction(() => () => {
        applyTauxToAll(bulkTaux)
        setShowConfirmDialog(false)
      })
      setShowConfirmDialog(true)
    } else {
      applyTauxToAll(bulkTaux)
    }
  }

  // Handle applying taux to selected files
  const handleApplyToSelected = () => {
    const selectedFiles = files.filter((f) => selectedFileIds.has(f.id))
    if (selectedFiles.length === 0) return

    const needsConfirm = checkNeedsConfirmation(selectedFiles)
    if (needsConfirm) {
      setConfirmAction(() => () => {
        applyTauxToFiles(Array.from(selectedFileIds), bulkTaux)
        setSelectedFileIds(new Set())
        setShowConfirmDialog(false)
      })
      setShowConfirmDialog(true)
    } else {
      applyTauxToFiles(Array.from(selectedFileIds), bulkTaux)
      setSelectedFileIds(new Set())
    }
  }

  // Handle checkbox toggle
  const handleCheckboxToggle = (fileId: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev)
      if (next.has(fileId)) {
        next.delete(fileId)
      } else {
        next.add(fileId)
      }
      return next
    })
  }

  const isMaxFilesReached = multiple && maxFiles !== Infinity && files.length >= maxFiles
  const isDisabled = disabled || isMaxFilesReached
  const hasActiveState = isProcessing || isDownloading || isSuccess || isWarning || isError

  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      {/* États de traitement OU Zone de drop */}
      {hasActiveState ? (
        <ProcessingStatesOverlay
          isProcessing={isProcessing}
          isDownloading={isDownloading}
          isSuccess={isSuccess}
          isWarning={isWarning}
          warningMessage={warningMessage}
          warningDescription={warningDescription}
          isError={isError}
          errorMessage={errorMessage}
          errorDescription={errorDescription}
          filesCount={files.length}
        />
      ) : (
        <div
          role="button"
          onClick={isDisabled ? undefined : openFileDialog}
          onDragEnter={isDisabled ? undefined : handleDragEnter}
          onDragLeave={isDisabled ? undefined : handleDragLeave}
          onDragOver={isDisabled ? undefined : handleDragOver}
          onDrop={isDisabled ? undefined : handleDrop}
          data-dragging={isDragging || undefined}
          data-disabled={isDisabled || undefined}
          className={`flex min-h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-4 transition-all has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50 dark:border-gray-700 ${
            isDisabled
              ? "cursor-not-allowed bg-muted/30"
              : "hover:bg-accent/50 cursor-pointer"
          }`}
        >
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload files"
            disabled={isDisabled}
          />

          <div className="flex flex-col items-center justify-center text-center">
            <div
              className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
              aria-hidden="true"
            >
              <FileUpIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">
              {isMaxFilesReached
                ? `Maximum atteint (${files.length}/${maxFiles} fichiers)`
                : multiple
                  ? files.length > 0
                    ? `Téléverser des fichiers (${files.length}/${maxFiles !== Infinity ? maxFiles : "∞"})`
                    : "Téléverser des fichiers"
                  : "Téléverser un fichier"}
            </p>
            <p className="mb-2 text-xs text-muted-foreground">
              {isMaxFilesReached
                ? "Supprimez des fichiers pour en ajouter d'autres"
                : "Glisser-déposer ou cliquer pour parcourir"}
            </p>
            {!isMaxFilesReached && (
              <div className="flex flex-wrap justify-center gap-1 text-xs text-muted-foreground/70">
                {accept !== "*" && <span>{accept}</span>}
                {accept !== "*" && <span>∙</span>}
                {multiple && maxFiles !== Infinity && (
                  <>
                    <span>Max {maxFiles} fichiers</span>
                    <span>∙</span>
                  </>
                )}
                {maxSize !== Infinity && (
                  <span>Jusqu&apos;à {formatBytes(maxSize)}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Affichage des erreurs */}
      {errors.length > 0 && (
        <div
          className="flex items-center gap-1 text-xs text-destructive"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {/* Liste des fichiers */}
      {showFileList && files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="rounded-lg border bg-background p-2 pe-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* Checkbox pour sélection groupée */}
                  {(!file.status || file.status === "idle") && (
                    <input
                      type="checkbox"
                      checked={selectedFileIds.has(file.id)}
                      onChange={() => handleCheckboxToggle(file.id)}
                      disabled={disabled || isProcessing}
                      className="size-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label={`Sélectionner ${file.file instanceof File ? file.file.name : file.file.name}`}
                    />
                  )}
                  <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                    {getFileIcon(file)}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate text-[13px] font-medium">
                      {file.status === "success" && file.outputFileName
                        ? file.outputFileName
                        : file.file instanceof File
                          ? file.file.name
                          : file.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(
                        file.file instanceof File
                          ? file.file.size
                          : file.file.size
                      )}
                    </p>
                  </div>
                </div>

                {getFileActionIcon(
                  file.status,
                  disabled,
                  () => removeFile(file.id),
                  file.errorMessage,
                  onFileDownload ? () => onFileDownload(file.id) : undefined,
                  onFileRetry ? () => onFileRetry(file.id) : undefined
                )}
              </div>

              {/* Input pour le taux de change (collapsible) */}
              {individualInputsVisible &&
              (!file.status || file.status === "idle") ? (
                <div className="mt-2 flex items-center gap-2">
                  <label
                    htmlFor={`taux-${file.id}`}
                    className="text-xs text-muted-foreground whitespace-nowrap"
                  >
                    Taux de change:
                  </label>
                  <input
                    id={`taux-${file.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={file.tauxDouane || 563.53}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      if (!isNaN(value) && onFileTauxChange) {
                        onFileTauxChange(file.id, value)
                      }
                    }}
                    disabled={disabled || isProcessing}
                    className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Ex: 563.53"
                  />
                  <span className="text-xs text-muted-foreground">
                    (ex: USD/XOF)
                  </span>
                </div>
              ) : null}
            </div>
          ))}

          {/* Application groupée du taux de change */}
          {files.some((f) => !f.status || f.status === "idle") && (
            <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4 space-y-3">
              {/* Header avec toggle pour inputs individuels */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">
                  Application groupée du taux
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setIndividualInputsVisible(!individualInputsVisible)
                  }
                  className="text-xs"
                >
                  {individualInputsVisible ? (
                    <>
                      <ChevronUpIcon className="size-3 mr-1" />
                      Masquer les inputs individuels
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="size-3 mr-1" />
                      Afficher les inputs individuels
                    </>
                  )}
                </Button>
              </div>

              {/* Input global et bouton "Appliquer à tous" */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="bulk-taux"
                  className="text-xs text-muted-foreground whitespace-nowrap"
                >
                  Taux global:
                </label>
                <input
                  id="bulk-taux"
                  type="number"
                  min="0"
                  step="0.01"
                  value={bulkTaux}
                  onChange={(e) => setBulkTaux(parseFloat(e.target.value))}
                  disabled={disabled || isProcessing}
                  className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ex: 563.53"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyToAll}
                  disabled={
                    disabled ||
                    isProcessing ||
                    !bulkTaux ||
                    isNaN(bulkTaux) ||
                    bulkTaux <= 0
                  }
                  className="whitespace-nowrap"
                >
                  Appliquer à tous
                </Button>
              </div>

              {/* Bouton "Appliquer à la sélection" */}
              {selectedFileIds.size > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-primary/20">
                  <span className="text-xs text-muted-foreground">
                    {selectedFileIds.size} fichier
                    {selectedFileIds.size > 1 ? "s" : ""} sélectionné
                    {selectedFileIds.size > 1 ? "s" : ""}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleApplyToSelected}
                    disabled={
                      disabled ||
                      isProcessing ||
                      !bulkTaux ||
                      isNaN(bulkTaux) ||
                      bulkTaux <= 0
                    }
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    Appliquer à la sélection
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Bouton pour supprimer tous les fichiers */}
          {showClearAllButton && files.length > 1 && (
            <div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={clearFiles}
                disabled={disabled}
              >
                Supprimer tous les fichiers
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowConfirmDialog(false)}
        >
          <div
            className="relative w-full max-w-md rounded-lg bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Confirmation</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Certains fichiers ont déjà un taux de change personnalisé.
                  Voulez-vous les remplacer par le nouveau taux ?
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Annuler
                </Button>
                <Button type="button" onClick={confirmAction}>Confirmer</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
