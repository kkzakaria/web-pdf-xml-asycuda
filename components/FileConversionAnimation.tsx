"use client"

import Lottie from "lottie-react"
import { cn } from "@/lib/utils"
import documentCheckingAnimation from "@/public/animations/document-checking.json"

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
}: FileConversionAnimationProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4 py-4", className)}>
      {/* Animation Lottie */}
      <div className="w-32 h-32">
        <Lottie
          animationData={documentCheckingAnimation}
          loop={true}
          autoplay={true}
        />
      </div>

      {/* Nom du fichier (optionnel) */}
      {fileName && (
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Conversion en cours...
          </p>
          <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">
            {fileName}
          </p>
        </div>
      )}
    </div>
  )
}

export type { FileConversionAnimationProps }
