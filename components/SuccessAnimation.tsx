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
    <div className={cn("flex flex-col items-center gap-4 py-6", className)}>
      {/* Animation Lottie */}
      <div className="w-32 h-32">
        <Lottie
          animationData={successAnimation}
          loop={loop}
          autoplay={true}
        />
      </div>

      {/* Message de succès */}
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-foreground">{message}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

export type { SuccessAnimationProps }
