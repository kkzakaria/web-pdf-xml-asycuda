import * as React from "react"
import { Loader2Icon } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"

interface SubmitButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  isSubmitting?: boolean
  submittingText?: string
  asChild?: boolean
}

const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(
  (
    {
      children,
      isSubmitting = false,
      submittingText = "Envoi en cours...",
      disabled,
      variant,
      size,
      className,
      asChild = false,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        type="submit"
        disabled={disabled || isSubmitting}
        variant={variant}
        size={size}
        className={className}
        asChild={asChild}
        {...props}
      >
        {isSubmitting ? (
          <>
            <Loader2Icon className="animate-spin" />
            {submittingText}
          </>
        ) : (
          children
        )}
      </Button>
    )
  }
)

SubmitButton.displayName = "SubmitButton"

export { SubmitButton, type SubmitButtonProps }
