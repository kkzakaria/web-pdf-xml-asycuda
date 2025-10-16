"use client"

import Lottie from "lottie-react"
import { cn } from "@/lib/utils"
import errorAnimation from "@/public/animations/error-animation.json"

interface ErrorAnimationProps {
  message?: string
  description?: string
  className?: string
  loop?: boolean
}

export function ErrorAnimation({
  message = "Erreur !",
  description,
  className,
  loop = false,
}: ErrorAnimationProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-4", className)}>
      {/* Animation Lottie */}
      <div className="w-24 h-24">
        <Lottie
          animationData={errorAnimation}
          loop={loop}
          autoplay={true}
        />
      </div>

      {/* Message d'erreur */}
      <div className="text-center space-y-1">
        <p className="text-base font-semibold text-foreground">{message}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

export type { ErrorAnimationProps }
