# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js web application for converting PDF files to XML format for ASYCUDA (Automated System for Customs Data). Uses a secure proxy architecture where Next.js API routes act as intermediaries between the client and an external conversion API, keeping API credentials server-side only.

**API Version**: v1.4.10 (requires exchange rate and payment report for all conversions)

**Exchange Rate System**: Each PDF file can have a different exchange rate (e.g., 572.021 for USD/XOF) since files may contain information in different currencies.

**Payment Report System**: Each PDF file must have a payment report type selected (KARTA or DJAM). The client sends only the label ("KARTA" or "DJAM"), and the server securely maps it to the actual value from environment variables (`RAPPORT_DE_PAIEMENT_KRT` or `RAPPORT_DE_PAIEMENT_DJM`). This follows the same proxy architecture pattern as the API_KEY.

## Development Commands

### Setup
```bash
pnpm install                    # Install dependencies
```

### Development
```bash
pnpm dev                        # Start dev server with Turbopack (port 3000)
pnpm build                      # Build for production with Turbopack
pnpm start                      # Start production server
pnpm lint                       # Run ESLint
```

### Type Checking
```bash
npx tsc --noEmit               # Type check without emitting files
```

## Environment Configuration

Required `.env.local` (server-side only):
```env
API_BASE_URL=https://pdf-xml-asycuda-api.onrender.com
API_KEY=<your-api-key>
RAPPORT_DE_PAIEMENT_KRT=<karta-value>
RAPPORT_DE_PAIEMENT_DJM=<djam-value>

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

**Critical**: API_KEY and RAPPORT_DE_PAIEMENT variables are NEVER exposed to the client. All external API calls go through Next.js API routes (`/api/*`) which add authentication headers and map payment report labels to actual values server-side. Supabase variables use `NEXT_PUBLIC_` prefix as they are safely exposed (protected by RLS).

## Authentication System

**Supabase Authentication** integrated with Next.js 15.5.5 App Router following official Supabase SSR patterns.

### Authentication Architecture
- **Packages**: `@supabase/ssr@0.7.0` + `@supabase/supabase-js@2.78.0`
- **Client Types**:
  - Browser client (`lib/supabase/browser.ts`) - Client Components
  - Server client (`lib/supabase/server.ts`) - Server Components/API Routes
- **Middleware**: Route protection with automatic redirection (`middleware.ts`)
- **Login Flow**: Simple email/password authentication (no signup or password reset)
- **Session Management**: Server-side cookies via Supabase SSR

### Protected Routes
- All routes require authentication except:
  - `/login` - Login page
  - `/auth/*` - Auth callbacks
  - Static assets

### Authentication Usage

**Server Component**:
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

**Client Component**:
```typescript
import { createClient } from '@/lib/supabase/browser'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```

**Server Actions**: `app/login/actions.ts` contains `login()` and `logout()` functions.

See `claudedocs/authentication-implementation.md` for detailed documentation.

## Architecture Patterns

### Security Model: Proxy Architecture
- **Client** → **Next.js API Routes** → **External API**
- Client never sees `API_KEY` or directly calls external endpoints
- All authentication (`X-API-Key` header) added server-side in API routes
- API routes validate environment variables before each external call

### API Routes Security (Supabase Auth)
**All API routes require Supabase authentication** to prevent unauthorized access.

**Protected routes**:
- `POST /api/convert` - Start PDF conversion
- `GET /api/jobs/[jobId]/status` - Check job status
- `GET /api/jobs/[jobId]/download` - Download XML file

**Authentication check** (in every API route):
```typescript
const supabase = await createClient()
const { data: { user }, error } = await supabase.auth.getUser()

if (error || !user) {
  return NextResponse.json({ detail: "Non autorisé" }, { status: 401 })
}
```

**Security benefits**:
- ✅ Only authenticated users can convert files
- ✅ Session managed server-side (httpOnly cookies)
- ✅ Double-layer protection (Middleware + API routes)
- ✅ No API access without valid Supabase session

See `claudedocs/api-security.md` for detailed security documentation.

### Conversion Flow Pattern
1. **Upload**: User uploads PDF files and specifies exchange rate + payment report per file in UI
2. **Submit**: Client sends file + `taux_douane` (exchange rate) + `rapport_paiement` (KARTA or DJAM label) to `/api/convert` (Next.js route)
3. **Server Mapping**: Route maps `rapport_paiement` label to actual value from env variables (KARTA → `RAPPORT_DE_PAIEMENT_KRT`, DJAM → `RAPPORT_DE_PAIEMENT_DJM`)
4. **Async Job**: Route proxies to external API (`/api/v1/convert/async`) with mapped rapport value, returns `job_id`
5. **Polling**: Client polls `/api/jobs/[jobId]/status` every 2 seconds (max 2 min)
6. **Download**: On completion, client retrieves XML via `/api/jobs/[jobId]/download`

**Exchange Rate System**:
- Each file has its own `tauxDouane` field (number > 0) - e.g., 572.021 for USD/XOF
- Default value: 572.021 (USD/XOF)
- User can modify the rate for each file before conversion
- Files are converted sequentially, each with their specific rate

**Payment Report System (v1.4.10+)**:
- Each file must have `rapportPaiement` selected: `"KARTA"` or `"DJAM"` (TypeScript: `RapportType`)
- **No default value** - user must make explicit choice (mandatory in UI, optional in API)
- Client sends only the label ("KARTA" or "DJAM")
- Server securely maps: `KARTA` → `env.RAPPORT_DE_PAIEMENT_KRT`, `DJAM` → `env.RAPPORT_DE_PAIEMENT_DJM`
- Actual values NEVER exposed to client (proxy architecture pattern)
- UI provides per-file selection + bulk application feature (like exchange rate)

### State Management Pattern
- **File Upload State**: `hooks/use-file-upload.ts` - File selection, validation, preview management
- **Conversion State**: `hooks/use-pdf-conversion.ts` - Conversion status per file, retry logic, download orchestration
- **UI State**: `app/page.tsx` - Global success/error animations, file upload key for reset

### Retry System
- **Automatic**: Max 2 attempts per file (1 initial + 1 retry) built into `usePdfConversion`
- **Manual**: User can retry all failed files via UI button
- **Retry tracking**: `retryCount` field in `FileConversionState`

### Sequential Processing
Files are converted **one at a time** (not parallel) to avoid overloading the external API. The `convertFiles` function in `hooks/use-pdf-conversion.ts` uses a `for` loop, not `Promise.all()`.

## Key Files and Their Roles

### API Routes (Server-Side Proxy Layer)
- `app/api/convert/route.ts` - Proxies PDF upload + `taux_douane` to external `/api/v1/convert/async`
- `app/api/jobs/[jobId]/status/route.ts` - Proxies job status checks to `/api/v1/convert/{jobId}`
- `app/api/jobs/[jobId]/download/route.ts` - Streams XML file from `/api/v1/convert/{jobId}/download`

### Core Services
- `lib/api-service.ts` - Client-side API calls (to Next.js routes, not external API)
  - `convertPdfFile()` - Full conversion flow with polling
  - `getXmlBlob()` - Fetch XML without auto-download
  - `downloadXmlFile()` - Trigger browser download
- `lib/api-config.ts` - Internal Next.js endpoint URLs (NOT external API URLs)
- `lib/zip-helper.ts` - Bundle multiple XML files into ZIP for bulk download

### Hooks
- `hooks/use-pdf-conversion.ts` - Conversion orchestration, retry logic, per-file state tracking
- `hooks/use-file-upload.ts` - File selection, validation (5 files max, 2MB each), drag-and-drop

### Components
- `components/FileUpload.tsx` - File upload UI with drag-drop, status icons per file
- `components/SubmitButton.tsx` - Handles conversion, individual download, bulk download, retry
- `components/ProcessingStatesOverlay.tsx` - Fullscreen animations (converting, success, error)
- `components/FileConversionAnimation.tsx` - Lottie animation during conversion
- `components/SuccessAnimation.tsx` - Lottie animation on success
- `components/ErrorAnimation.tsx` - Lottie animation on error
- `components/WarningAnimation.tsx` - Lottie animation for warnings

### Types
- `types/api.ts` - TypeScript definitions for all API responses and conversion states
  - **ConversionMetrics** (v1.4.10): `items_count`, `containers_count`, `fill_rate`, `warnings`, `xml_valid`, `has_exporter`, `has_consignee`, `processing_time`

## Pre-commit Hooks

Husky runs `lint-staged` before commits:
- Lints TypeScript files with `eslint --fix`
- Type-checks with `tsc --noEmit --pretty`

If type errors or linting errors exist, the commit will be blocked.

## Important Constraints

### File Limits
- **Max files**: 5 per batch
- **Max size**: 2MB per file
- **Format**: PDF only

### Timeout Configuration
- **Conversion polling**: 2 seconds between checks, 60 attempts max (2 minutes total)
- **Retry delay**: 500ms between retry attempts

### Known Limitations
- No parallel conversion (sequential to avoid API overload)
- No session persistence (state lost on page reload)
- No conversion history or progress recovery after refresh

## Common Development Tasks

### Adding a New Animation
1. Add Lottie JSON file to `public/`
2. Create component in `components/` using `lottie-react`
3. Import in `ProcessingStatesOverlay.tsx` or other parent component
4. Reference in documentation: `claudedocs/[ComponentName]-usage.md`

### Modifying Conversion Logic
- **Client-side orchestration**: `hooks/use-pdf-conversion.ts`
- **API communication**: `lib/api-service.ts`
- **Server-side proxy**: `app/api/convert/route.ts` and status/download routes

### Debugging Conversion Issues
1. Check browser DevTools Network tab for `/api/convert` response
2. Verify environment variables in server logs (API routes log missing vars)
3. Check `FileConversionState` in React DevTools for per-file status/errors
4. External API errors are proxied through Next.js routes with original status codes

## Tech Stack Details

- **Framework**: Next.js 15.5.5 (App Router)
- **Build Tool**: Turbopack (via `--turbopack` flag)
- **React**: 19.1.0 (client components only, no server components in conversion flow)
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Animations**: Lottie React 2.4.1
- **Type Safety**: TypeScript 5 (strict mode)
- **Package Manager**: pnpm
