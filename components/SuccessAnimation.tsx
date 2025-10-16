"use client"

import Lottie from "lottie-react"
import { cn } from "@/lib/utils"
import successAnimation from "@/public/animations/success-animation.json"

interface SuccessAnimationProps {
  message?: string
  description?: string
  className?: string
  loop?: boolean
}

export function SuccessAnimation({
  message = "Succès !",
  description,
  className,
  loop = false,
}: SuccessAnimationProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-4", className)}>
      {/* Animation Lottie */}
      <div className="w-24 h-24">
        <Lottie
          animationData={successAnimation}
          loop={loop}
          autoplay={true}
        />
      </div>

      {/* Message de succès */}
      <div className="text-center space-y-1">
        <p className="text-base font-semibold text-foreground">{message}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

export type { SuccessAnimationProps }
