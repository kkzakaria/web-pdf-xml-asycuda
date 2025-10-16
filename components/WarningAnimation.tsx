"use client"

import Lottie from "lottie-react"
import { cn } from "@/lib/utils"
import warningAnimation from "@/public/animations/warning-animation.json"

interface WarningAnimationProps {
  message?: string
  description?: string
  className?: string
  loop?: boolean
}

export function WarningAnimation({
  message = "Attention !",
  description,
  className,
  loop = false,
}: WarningAnimationProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-4", className)}>
      {/* Animation Lottie */}
      <div className="w-24 h-24">
        <Lottie
          animationData={warningAnimation}
          loop={loop}
          autoplay={true}
        />
      </div>

      {/* Message d'avertissement */}
      <div className="text-center space-y-1">
        <p className="text-base font-semibold text-foreground">{message}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

export type { WarningAnimationProps }
