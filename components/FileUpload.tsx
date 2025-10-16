"use client"

import {
  AlertCircleIcon,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileUpIcon,
  HeadphonesIcon,
  ImageIcon,
  VideoIcon,
  XIcon,
} from "lucide-react"

import {
  formatBytes,
  useFileUpload,
  type FileUploadOptions,
} from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import { FileConversionAnimation } from "@/components/FileConversionAnimation"
import { Spinner } from "@/components/ui/spinner"

type FileUploadProps = FileUploadOptions & {
  className?: string
  showFileList?: boolean
  showClearAllButton?: boolean
  disabled?: boolean
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
}: FileUploadProps) {
  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
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

  const isMaxFilesReached = multiple && maxFiles !== Infinity && files.length >= maxFiles
  const isDisabled = disabled || isMaxFilesReached

  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      {/* Zone de drop */}
      <div
        role="button"
        onClick={isDisabled ? undefined : openFileDialog}
        onDragEnter={isDisabled ? undefined : handleDragEnter}
        onDragLeave={isDisabled ? undefined : handleDragLeave}
        onDragOver={isDisabled ? undefined : handleDragOver}
        onDrop={isDisabled ? undefined : handleDrop}
        data-dragging={isDragging || undefined}
        data-disabled={isDisabled || undefined}
        className={`flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-input p-4 transition-all has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50 ${
          isDisabled
            ? "cursor-not-allowed opacity-50 bg-muted/30"
            : "hover:bg-accent/50 cursor-pointer"
        }`}
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload files"
          disabled={isDisabled}
        />

        {disabled ? (
          <FileConversionAnimation />
        ) : (
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
                  ? "Téléverser des fichiers"
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
        )}
      </div>

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
              className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                  {getFileIcon(file)}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate text-[13px] font-medium">
                    {file.file instanceof File
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

              <Button
                size="icon"
                variant="ghost"
                className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                onClick={() => removeFile(file.id)}
                aria-label="Supprimer le fichier"
                disabled={disabled}
              >
                {disabled ? (
                  <Spinner className="size-4" />
                ) : (
                  <XIcon className="size-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          ))}

          {/* Bouton pour supprimer tous les fichiers */}
          {showClearAllButton && files.length > 1 && (
            <div>
              <Button
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
    </div>
  )
}
