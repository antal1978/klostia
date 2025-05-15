import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KLOSTIA - Análisis de Sostenibilidad",
  description: "Analiza la sostenibilidad de tus prendas textiles",
  // Metadatos específicos para móviles
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#415643",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KLOSTIA",
  },
  manifest: "/manifest.json",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <main className="min-h-screen max-w-md mx-auto bg-[#F5F1EC]">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
