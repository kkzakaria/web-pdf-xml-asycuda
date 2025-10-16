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
    </div>
  )
}

export type { FileConversionAnimationProps }
