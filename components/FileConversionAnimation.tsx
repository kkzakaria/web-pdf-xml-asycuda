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
  className,
}: FileConversionAnimationProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-3", className)}>
      {/* Animation Lottie */}
      <div className="w-24 h-24">
        <Lottie
          animationData={documentCheckingAnimation}
          loop={true}
          autoplay={true}
        />
      </div>

      {/* Message de traitement */}
      <p className="text-sm font-medium text-muted-foreground">
        Traitement en cours...
      </p>

      {/* Message de patience en surbrillance */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg px-4 py-2.5 max-w-md">
        <p className="text-xs text-amber-900 dark:text-amber-100 text-center font-medium">
          La conversion peut prendre jusqu&apos;à 2 minutes. Veuillez patienter et ne pas rafraîchir la page.
        </p>
      </div>
    </div>
  )
}

export type { FileConversionAnimationProps }
