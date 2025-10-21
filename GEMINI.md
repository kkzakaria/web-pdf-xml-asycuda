# GEMINI.md - Project Overview

This document provides a comprehensive overview of the "web-pdf-xml-asycuda" project, designed to be used as instructional context for Large Language Models (LLMs) like Gemini.

## Project Overview

This is a Next.js web application that allows users to convert PDF files to XML format, specifically for use with the ASYCUDA (Automated System for Customs Data) system. The application provides a user-friendly interface for uploading PDF files, tracking the conversion process, and downloading the resulting XML files.

The application is designed with a secure architecture where the Next.js server acts as a proxy between the client and an external API that performs the PDF to XML conversion. This ensures that sensitive information, such as API keys, is not exposed to the client.

## Key Technologies

- **Framework:** [Next.js](https://nextjs.org/) (v15.5.5) with Turbopack
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [React](https://react.dev/) (v19.1.0)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Button, Tooltip)
- **Animations:** [Lottie](https://lottiefiles.com/) for success/error animations
- **Linting:** [ESLint](https://eslint.org/)
- **Package Manager:** [pnpm](https://pnpm.io/)

## Architecture

The application follows a client-server architecture:

### Frontend

- Built with Next.js App Router.
- The main page is `app/page.tsx`, which contains the file upload and conversion logic.
- Reusable UI components are located in the `components/` directory.
- Custom hooks, such as `use-file-upload.ts` and `use-pdf-conversion.ts`, are used to manage the application's state and logic.

### Backend (Proxy)

- Next.js API routes are used to create a secure proxy to the external conversion API. These are located in `app/api/`.
- The API routes are responsible for:
  - Receiving file uploads from the client.
  - Forwarding requests to the external API with the necessary authentication (`X-API-Key`).
  - Polling for the status of conversion jobs.
  - Streaming the converted XML files back to the client for download.

### External API

- An external service, hosted at the URL specified in the `API_BASE_URL` environment variable, is responsible for the actual PDF to XML conversion.

## Features

- **Asynchronous File Conversion:** Files are converted asynchronously, allowing users to track the progress of each file individually.
- **Bulk Upload:** Users can upload up to 5 PDF files at a time.
- **Progress Tracking:** The UI displays the status of each file (e.g., "processing", "success", "error").
- **Error Handling:** The application includes a retry mechanism for failed conversions and displays detailed error messages.
- **Secure API Communication:** The Next.js server acts as a proxy, ensuring that the external API key is never exposed to the client.
- **Individual and Bulk Downloads:** Users can download converted XML files individually or as a single ZIP archive.

## Building and Running

### 1. Installation

To install the project dependencies, run:

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the root of the project and add the following environment variables:

```env
# The base URL of the external PDF to XML conversion API
API_BASE_URL=https://pdf-xml-asycuda-api.onrender.com

# The API key for the external API
API_KEY=<your-api-key>
```

**Note:** These variables are only used on the server-side and are not exposed to the client.

### 3. Running the Development Server

To start the development server, run:

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### 4. Building for Production

To build the application for production, run:

```bash
pnpm build
```

### 5. Linting

To run the linter, use:

```bash
pnpm lint
```

## Development Conventions

- **Linting:** The project uses ESLint with the `eslint-config-next` configuration.
- **Pre-commit Hooks:** [Husky](https://typicode.github.io/husky/) is used to run linting and type-checking before each commit. The configuration is in `.husky/pre-commit` and `lint-staged` in `package.json`.
- **TypeScript:** The project is written in TypeScript and uses strict type checking.
- **Styling:** Tailwind CSS is used for styling, with custom components built using `class-variance-authority` and `clsx`.
