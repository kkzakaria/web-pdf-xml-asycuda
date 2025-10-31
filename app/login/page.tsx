"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Logo } from "@/components/Logo"
import { SubmitButton } from "@/components/SubmitButton"
import { login } from "./actions"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Récupérer le message d'erreur depuis l'URL
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(errorParam)
    }
  }, [searchParams])

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      await login(formData)
    } catch (error) {
      // Les erreurs sont gérées par les redirections dans l'action
      console.error("Erreur de connexion:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <form action={handleSubmit} className="space-y-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center -mb-2">
              <Logo size={80} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Connexion
            </h1>
            <p className="text-muted-foreground">
              Connectez-vous pour accéder à la conversion PDF vers XML ASYCUDA
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="votre@email.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <SubmitButton
            isSubmitting={isSubmitting}
            submittingText="Connexion en cours..."
            className="w-full"
            disabled={isSubmitting}
          >
            Se connecter
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}
