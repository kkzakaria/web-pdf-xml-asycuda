"use client"

interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className = "", size = 48 }: LogoProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="PDF to XML ASYCUDA Converter Logo"
      >
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" className="fill-primary/10" />

        {/* Document icon */}
        <rect
          x="30"
          y="25"
          width="35"
          height="45"
          rx="2"
          className="fill-none stroke-primary"
          strokeWidth="2.5"
        />

        {/* Folded corner */}
        <path d="M 55 25 L 65 25 L 65 35 Z" className="fill-primary/30" />

        {/* Document lines representing PDF */}
        <line
          x1="36"
          y1="35"
          x2="53"
          y2="35"
          className="stroke-primary"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="36"
          y1="40"
          x2="58"
          y2="40"
          className="stroke-primary"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="36"
          y1="45"
          x2="55"
          y2="45"
          className="stroke-primary"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Arrow pointing down */}
        <path
          d="M 47.5 50 L 47.5 60 M 44 57 L 47.5 60.5 L 51 57"
          className="stroke-primary"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* XML brackets */}
        <path
          d="M 36 63 L 33 66 L 36 69"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 59 63 L 62 66 L 59 69"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="47.5" cy="66" r="1.5" className="fill-primary" />

        {/* ASYCUDA badge */}
        <rect
          x="25"
          y="77"
          width="50"
          height="10"
          rx="5"
          className="fill-primary"
        />
        <text
          x="50"
          y="84"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="6.5"
          fontWeight="700"
          fill="white"
          textAnchor="middle"
        >
          ASYCUDA
        </text>
      </svg>
    </div>
  )
}
