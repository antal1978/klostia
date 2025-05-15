"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { loadMaterialsDatabase, analyzeFabricComposition, getSustainabilityRating } from "@/lib/materials-utils"

export default function SharedResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const encodedData = searchParams.get("data")

  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        if (!encodedData) {
          throw new Error("No se encontraron datos para mostrar")
        }

        // Decodificar los datos compartidos
        const sharedData = JSON.parse(atob(encodedData))

        // Cargar la base de datos de materiales
        const database = await loadMaterialsDatabase()

        // Analizar la composición
        const result = analyzeFabricComposition(sharedData.materials, database)
        setAnalysisResult(result)
      } catch (err) {
        console.error("Error loading shared data:", err)
        setError("Error al cargar los datos compartidos. El enlace podría ser inválido.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [encodedData])

  // Función para determinar el color del puntaje
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6.5) return "text-yellow-600"
    if (score >= 5) return "text-orange-500"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-[#415643] text-white p-4 flex items-center">
          <h1 className="text-xl font-bold text-white mb-0">Resultado Compartido</h1>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#415643] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#2E2E2E]">Cargando resultados...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analysisResult) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-[#415643] text-white p-4">
          <h1 className="text-xl font-bold text-white mb-0">Resultado Compartido</h1>
        </header>
        <div className="flex-1 p-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p>{error || "No se pudieron cargar los resultados compartidos"}</p>
              <div className="mt-6">
                <Link href="/">
                  <Button className="bg-[#415643] hover:bg-[#415643]/90">Ir a la página principal</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const rating = getSustainabilityRating(analysisResult.totalScore)

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#415643] text-white p-4">
        <h1 className="text-xl font-bold text-white mb-0">Resultado Compartido</h1>
      </header>

      <div className="p-4 bg-[#D9BCA3]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-[#2E2E2E] mb-1">Composición analizada:</h2>
            <div className="text-sm">
              {analysisResult.materialBreakdown.map((material: any, index: number) => (
                <span key={index}>
                  {material.name} {material.percentage}%
                  {index < analysisResult.materialBreakdown.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`text-3xl font-bold ${getScoreColor(analysisResult.totalScore)}`}>
              {analysisResult.totalScore}/10
            </div>
            <div className="text-xs text-[#2E2E2E]">Eco Score</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div
              className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium mb-3 bg-${rating.color}-500`}
            >
              {rating.label}
            </div>
            <p className="text-[#2E2E2E]">{rating.description}</p>

            <div className="mt-6 p-4 bg-[#F5F1EC] rounded-lg">
              <div className="flex items-start">
                <Leaf className="h-5 w-5 text-[#415643] mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">¿Quieres analizar tus propias prendas?</p>
                  <p className="text-sm">
                    Descubre el impacto ambiental de tu ropa con KLOSTIA. Toma una foto de la etiqueta y obtén un
                    análisis detallado de sostenibilidad.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/">
                <Button className="w-full bg-[#415643] hover:bg-[#415643]/90">Probar KLOSTIA</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
