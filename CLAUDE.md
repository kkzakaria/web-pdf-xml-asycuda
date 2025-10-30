# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js web application for converting PDF files to XML format for ASYCUDA (Automated System for Customs Data). Uses a secure proxy architecture where Next.js API routes act as intermediaries between the client and an external conversion API, keeping API credentials server-side only.

**API Version**: v1.4.10 (requires exchange rate for all conversions)

**Exchange Rate System**: Each PDF file can have a different exchange rate (e.g., 563.53 for USD/XOF) since files may contain information in different currencies.

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
```

**Critical**: These variables are NEVER exposed to the client. All external API calls go through Next.js API routes (`/api/*`) which add authentication headers server-side.

## Architecture Patterns

### Security Model: Proxy Architecture
- **Client** → **Next.js API Routes** → **External API**
- Client never sees `API_KEY` or directly calls external endpoints
- All authentication (`X-API-Key` header) added server-side in API routes
- API routes validate environment variables before each external call

### Conversion Flow Pattern
1. **Upload**: User uploads PDF files and specifies exchange rate per file in UI
2. **Submit**: Client sends file + `taux_douane` (exchange rate) to `/api/convert` (Next.js route)
3. **Async Job**: Route proxies to external API (`/api/v1/convert/async`), returns `job_id`
4. **Polling**: Client polls `/api/jobs/[jobId]/status` every 2 seconds (max 2 min)
5. **Download**: On completion, client retrieves XML via `/api/jobs/[jobId]/download`

**Exchange Rate System**:
- Each file has its own `tauxDouane` field (number > 0) - e.g., 563.53 for USD/XOF
- Default value: 563.53 (USD/XOF)
- User can modify the rate for each file before conversion
- Files are converted sequentially, each with their specific rate

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
