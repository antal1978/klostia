"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Leaf, Droplet, Clock, Recycle, Info, Award, AlertTriangle, Share2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  loadMaterialsDatabase,
  analyzeFabricComposition,
  getSustainabilityRating,
  type MaterialsDatabase,
  type AnalysisResult,
  type MaterialComposition,
} from "@/lib/materials-utils"

// Primero, importar el hook useToast
import { useToast } from "@/hooks/use-toast"

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const historyId = searchParams.get("id")

  const [activeTab, setActiveTab] = useState("score")
  const [materialsDB, setMaterialsDB] = useState<MaterialsDatabase | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [ocrText, setOcrText] = useState<string | null>(null)
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [usingDemoData, setUsingDemoData] = useState(false)

  // Luego, dentro del componente ResultsPage, añadir:
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        console.log("Loading results data...")

        // Cargar la base de datos de materiales
        const database = await loadMaterialsDatabase()
        setMaterialsDB(database)

        // Si hay un ID de historial, cargar ese análisis
        if (historyId) {
          console.log("Loading analysis from history with ID:", historyId)
          const savedHistory = localStorage.getItem("analysisHistory")
          if (savedHistory) {
            const history = JSON.parse(savedHistory)
            const historyItem = history.find((item: any) => item.id === historyId)

            if (historyItem) {
              // Convertir los materiales del historial al formato necesario
              const materialsComposition: MaterialComposition[] = historyItem.materials.map((m: any) => {
                const material = database.materials.find((dbMat) => dbMat.name === m.name)
                return {
                  materialId: material?.id || "unknown",
                  percentage: m.percentage,
                }
              })

              // Analizar la composición
              const result = analyzeFabricComposition(materialsComposition, database)
              setAnalysisResult(result)
            } else {
              setError("No se encontró el análisis en el historial")
            }
          } else {
            setError("No hay historial de análisis guardado")
          }
        } else {
          // Cargar del análisis más reciente en sessionStorage
          const savedAnalysis = sessionStorage.getItem("analysisData")
          console.log("Saved analysis in sessionStorage:", savedAnalysis ? "Found" : "Not found")

          if (savedAnalysis) {
            const analysisData = JSON.parse(savedAnalysis)
            setAnalysisResult(analysisData.analysisResult)
            setOcrText(analysisData.ocrText)
            setOcrConfidence(analysisData.confidence)
            setUsingDemoData(false)

            // Generar URL para compartir
            const shareData = {
              materials: analysisData.materialsDetected,
              score: analysisData.analysisResult.totalScore,
            }
            const shareParams = new URLSearchParams()
            shareParams.set("data", btoa(JSON.stringify(shareData)))
            setShareUrl(`${window.location.origin}/shared?${shareParams.toString()}`)
          } else {
            console.log("No saved analysis found, using demo data")
            // Si no hay datos guardados, mostrar un error o redirigir
            setError("No se encontraron resultados de análisis. Por favor, realiza un nuevo análisis.")
            setUsingDemoData(true)

            // Opcionalmente, redirigir al usuario a la página de análisis
            // router.push("/analyze");
          }
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Error al cargar los datos. Por favor, inténtalo de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [historyId, router])

  // Reemplazar la función shareResults con esta versión:
  const shareResults = async () => {
    if (!shareUrl) return

    try {
      // Verificar si estamos en un iframe
      const isInIframe = window !== window.parent

      // Verificar si la Web Share API está disponible y no estamos en un iframe
      if (navigator.share && !isInIframe) {
        await navigator.share({
          title: "Análisis de sostenibilidad KLOSTIA",
          text: `Mi prenda tiene una puntuación de sostenibilidad de ${analysisResult?.totalScore}/10. ¡Descubre la tuya!`,
          url: shareUrl,
        })
      } else {
        // Fallback para navegadores que no soportan Web Share API o cuando estamos en un iframe
        await navigator.clipboard.writeText(shareUrl)

        // Mostrar un toast
        toast({
          title: "Enlace copiado",
          description: "El enlace ha sido copiado al portapapeles",
          variant: "success",
        })
      }
    } catch (error) {
      console.error("Error sharing results:", error)

      // Intentar copiar al portapapeles como fallback
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Enlace copiado",
          description: "El enlace ha sido copiado al portapapeles",
          variant: "success",
        })
      } catch (clipboardError) {
        console.error("Error copying to clipboard:", clipboardError)
        toast({
          title: "Error al compartir",
          description: "No se pudo compartir. Por favor, copia el enlace manualmente.",
          variant: "destructive",
        })
      }
    }
  }

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
          <button onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-white mb-0">Resultados del Análisis</h1>
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
        <header className="bg-[#415643] text-white p-4 flex items-center">
          <button onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-white mb-0">Resultados del Análisis</h1>
        </header>
        <div className="flex-1 p-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-center mb-2">Error en el análisis</h2>
              <p className="text-center">
                {error || "No se pudieron analizar los materiales. Por favor, inténtalo de nuevo."}
              </p>
              <div className="mt-6">
                <Button onClick={() => router.push("/analyze")} className="w-full">
                  Volver a intentar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (usingDemoData) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-[#415643] text-white p-4 flex items-center">
          <button onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-white mb-0">Resultados del Análisis</h1>
        </header>
        <div className="flex-1 p-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
              </div>
              <h2 className="text-xl font-semibold text-center mb-2">Datos de demostración</h2>
              <p className="text-center">
                Estás viendo datos de ejemplo. Para ver resultados reales, realiza un análisis de una prenda.
              </p>
              <div className="mt-6">
                <Button onClick={() => router.push("/analyze")} className="w-full">
                  Analizar una prenda
                </Button>
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
      <header className="bg-[#415643] text-white p-4 flex items-center">
        <button onClick={() => router.push("/")} className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-white mb-0">Resultados del Análisis</h1>
      </header>

      <div className="p-4 bg-[#D9BCA3]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-[#2E2E2E] mb-1">Composición detectada:</h2>
            <div className="text-sm">
              {analysisResult.materialBreakdown.map((material, index) => (
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
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div
              className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium mb-3 bg-${rating.color}-500`}
            >
              {rating.label}
            </div>
            <p className="text-[#2E2E2E]">{rating.description}</p>

            {ocrConfidence !== null && (
              <div className="mt-4 text-sm text-gray-500">
                <p>Confianza del OCR: {ocrConfidence.toFixed(1)}%</p>
              </div>
            )}

            {shareUrl && (
              <Button onClick={shareResults} variant="outline" className="mt-4 w-full border-[#415643] text-[#415643]">
                <Share2 className="mr-2 h-4 w-4" />
                Compartir resultados
              </Button>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="score" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="score" className="data-[state=active]:bg-[#415643] data-[state=active]:text-white">
              Análisis
            </TabsTrigger>
            <TabsTrigger value="care" className="data-[state=active]:bg-[#415643] data-[state=active]:text-white">
              Cuidados
            </TabsTrigger>
            <TabsTrigger
              value="certifications"
              className="data-[state=active]:bg-[#415643] data-[state=active]:text-white"
            >
              Certificaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="score">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-4">Impacto Ambiental</h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <Droplet className="h-6 w-6 text-[#A67D88] mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Consumo de agua</h3>
                      <p className="text-sm mb-1">
                        {analysisResult.environmentalImpact.waterUsage.value}{" "}
                        {analysisResult.environmentalImpact.waterUsage.unit}
                      </p>
                      <p className="text-xs text-gray-600">
                        Equivalente a {Math.round(analysisResult.environmentalImpact.waterUsage.value / 150)} días de
                        consumo de agua de una persona.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Recycle className="h-6 w-6 text-[#A67D88] mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Emisiones de CO₂</h3>
                      <p className="text-sm mb-1">
                        {analysisResult.environmentalImpact.co2Emissions.value}{" "}
                        {analysisResult.environmentalImpact.co2Emissions.unit}
                      </p>
                      <p className="text-xs text-gray-600">
                        Equivalente a conducir un coche durante{" "}
                        {Math.round(analysisResult.environmentalImpact.co2Emissions.value * 6)} km.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="h-6 w-6 text-[#A67D88] mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Tiempo de biodegradación</h3>
                      <p className="text-sm mb-1">{analysisResult.environmentalImpact.biodegradationTime}</p>
                      <p className="text-xs text-gray-600">
                        Las fibras sintéticas pueden tardar décadas o siglos en descomponerse.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-3">Desglose por Material</h2>

                {analysisResult.materialBreakdown.map((material, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold">{material.name}</h3>
                      <span>{material.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          material.score >= 8
                            ? "bg-green-500"
                            : material.score >= 6
                              ? "bg-lime-500"
                              : material.score >= 4
                                ? "bg-yellow-500"
                                : material.score >= 2
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                        }`}
                        style={{ width: `${material.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1 text-gray-600">
                      {material.category} • Puntuación: {material.score}/10
                    </p>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-[#F5F1EC] rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-[#415643] mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm mb-0">
                      Las mezclas de materiales naturales y sintéticos suelen ser más difíciles de reciclar. Considera
                      prendas con un solo tipo de material para facilitar su reciclaje al final de su vida útil.
                    </p>
                  </div>
                </div>

                {ocrText && (
                  <div className="mt-6">
                    <details className="text-sm">
                      <summary className="font-medium cursor-pointer">Ver texto detectado</summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-line">{ocrText}</div>
                    </details>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-4">Cuidados Recomendados</h2>

                <div className="space-y-4">
                  <p className="text-sm">
                    Siguiendo estas recomendaciones, prolongarás la vida útil de tu prenda y reducirás su impacto
                    ambiental:
                  </p>

                  <ul className="space-y-3">
                    {analysisResult.careInstructions.map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <Leaf className="h-5 w-5 text-[#415643] mr-2 mt-0.5 flex-shrink-0" />
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-4">Consejos Adicionales</h2>

                <div className="space-y-4">
                  {analysisResult.materialBreakdown.some((m) => m.id.includes("cotton")) && (
                    <div className="p-4 bg-[#F5F1EC] rounded-lg">
                      <h3 className="font-semibold mb-2">Para prendas con algodón:</h3>
                      <ul className="text-sm space-y-2">
                        <li>Lavar con agua fría para evitar encogimiento</li>
                        <li>Evitar secadora para reducir el desgaste de las fibras</li>
                        <li>Usar detergentes suaves y ecológicos</li>
                      </ul>
                    </div>
                  )}

                  {analysisResult.materialBreakdown.some(
                    (m) => m.id.includes("polyester") || m.id.includes("nylon") || m.id.includes("acrylic"),
                  ) && (
                    <div className="p-4 bg-[#F5F1EC] rounded-lg">
                      <h3 className="font-semibold mb-2">Para prendas con fibras sintéticas:</h3>
                      <ul className="text-sm space-y-2">
                        <li>Lavar a temperaturas bajas para evitar la liberación de microplásticos</li>
                        <li>Considerar el uso de bolsas de lavado especiales para microfibras</li>
                        <li>Secar al aire libre para ahorrar energía</li>
                      </ul>
                    </div>
                  )}

                  <div className="p-4 bg-[#F5F1EC] rounded-lg">
                    <h3 className="font-semibold mb-2">Fin de vida útil:</h3>
                    <p className="text-sm">
                      Cuando ya no uses esta prenda, considera donarla, reciclarla o transformarla en algo nuevo en
                      lugar de desecharla.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-4">Certificaciones Recomendadas</h2>

                <p className="text-sm mb-4">
                  Estas son las certificaciones que deberías buscar para prendas con los materiales analizados:
                </p>

                <div className="space-y-4">
                  {analysisResult.recommendedCertifications.map((cert, index) => (
                    <div key={index} className="p-4 bg-[#F5F1EC] rounded-lg">
                      <div className="flex items-start">
                        <Award className="h-5 w-5 text-[#A67D88] mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold">
                            {cert.fullName} ({cert.name})
                          </h3>
                          <p className="text-sm mb-0">{cert.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-4">¿Por qué son importantes?</h2>

                <p className="text-sm">
                  Las certificaciones textiles garantizan que los productos cumplen con estándares específicos de
                  sostenibilidad, ética laboral y seguridad para la salud.
                </p>

                <div className="mt-4 p-4 bg-[#F5F1EC] rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-[#415643] mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm mb-0">
                      Al elegir prendas con certificaciones reconocidas, estás apoyando prácticas más sostenibles en la
                      industria textil y ejerciendo tu poder como consumidor consciente.
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  {analysisResult.recommendedCertifications.slice(0, 3).map((cert, index) => (
                    <Link key={index} href={cert.website} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="text-[#415643] border-[#415643] mb-2 w-full">
                        Más sobre {cert.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 mb-4 flex gap-4">
          <Link href="/analyze" className="flex-1">
            <Button className="w-full bg-[#A67D88] hover:bg-[#A67D88]/90">Analizar otra prenda</Button>
          </Link>
          <Link href="/history" className="flex-1">
            <Button variant="outline" className="w-full border-[#415643] text-[#415643]">
              Ver historial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
