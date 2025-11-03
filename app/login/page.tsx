import { Suspense } from "react"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="space-y-8 animate-pulse">
          <div className="text-center space-y-3">
            <div className="flex justify-center -mb-2">
              <div className="w-20 h-20 bg-muted rounded-full" />
            </div>
            <div className="h-8 bg-muted rounded w-32 mx-auto" />
            <div className="h-4 bg-muted rounded w-64 mx-auto" />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-16" />
              <div className="h-10 bg-muted rounded w-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-10 bg-muted rounded w-full" />
            </div>
          </div>
          <div className="h-10 bg-muted rounded w-full" />
        </div>
      </div>
    </div>
  )
}
