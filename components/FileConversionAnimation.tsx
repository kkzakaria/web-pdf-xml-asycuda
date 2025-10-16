"use client"

import { ArrowRightIcon, FileCodeIcon, FileTextIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileConversionAnimationProps {
  fileName?: string
  progress?: number
  className?: string
  fromFormat?: string
  toFormat?: string
}

export function FileConversionAnimation({
  fileName,
  className,
  fromFormat = "PDF",
  toFormat = "XML",
}: FileConversionAnimationProps) {
  return (
    <div className={cn("flex flex-col items-center gap-6 py-8", className)}>
      {/* Conteneur principal de l'animation */}
      <div className="flex items-center justify-center gap-8">
        {/* Fichier source (PDF) */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="flex size-16 items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/5 animate-pulse">
              <FileTextIcon className="size-8 text-primary" />
            </div>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {fromFormat}
          </span>
        </div>

        {/* Animation de flux centrale */}
        <div className="relative flex items-center gap-2">
          <ArrowRightIcon className="size-6 text-muted-foreground" />

          {/* Particules animées */}
          <div className="absolute left-0 right-0 flex justify-between">
            <div
              className="size-2 rounded-full bg-primary animate-[ping_2s_ease-in-out_infinite]"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="size-2 rounded-full bg-primary animate-[ping_2s_ease-in-out_infinite]"
              style={{ animationDelay: "0.7s" }}
            />
            <div
              className="size-2 rounded-full bg-primary animate-[ping_2s_ease-in-out_infinite]"
              style={{ animationDelay: "1.4s" }}
            />
          </div>
        </div>

        {/* Fichier destination (XML) */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="flex size-16 items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/5 animate-pulse">
              <FileCodeIcon className="size-8 text-primary" />
            </div>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {toFormat}
          </span>
        </div>
      </div>

      {/* Nom du fichier (optionnel) */}
      {fileName && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Conversion en cours...
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1 truncate max-w-md">
            {fileName}
          </p>
        </div>
      )}
    </div>
  )
}

export type { FileConversionAnimationProps }
