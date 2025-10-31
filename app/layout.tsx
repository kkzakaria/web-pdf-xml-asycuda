import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserAvatar } from "@/components/UserAvatar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Convertisseur PDF vers XML ASYCUDA",
  description: "Convertissez vos fichiers PDF en format XML ASYCUDA en quelques clics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Header avec avatar utilisateur */}
        <header className="fixed top-0 right-0 z-50 p-4">
          <UserAvatar />
        </header>

        {children}
      </body>
    </html>
  );
}
