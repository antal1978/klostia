"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, AlertTriangle, Camera, Edit } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import ImageCapture from "@/components/image-capture"
import ExampleImages from "@/components/example-images"
import ManualInput from "@/components/manual-input"
import { extractMaterialsFromOCR } from "@/lib/materials-utils"

export default function AnalyzePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [captureMode, setCaptureMode] = useState<boolean>(false)
  const [exampleMode, setExampleMode] = useState<boolean>(false)
  const [manualMode, setManualMode] = useState<boolean>(false)
  const [imageData, setImageData] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Verificar si se debe abrir directamente el modo de ejemplos
  useEffect(() => {
    const mode = searchParams.get("mode")
    if (mode === "example" && !imageData && !captureMode && !exampleMode && !manualMode) {
      setExampleMode(true)
    } else if (!imageData && !captureMode && !exampleMode && !manualMode) {
      // Iniciar directamente en modo captura en dispositivos móviles
      setCaptureMode(true)
    }
  }, [searchParams, imageData, captureMode, exampleMode, manualMode])

  const handleImageCaptured = (data: string) => {
    try {
      console.log("Image captured, length:", data.length)
      setImageData(data)
      setCaptureMode(false)
      setExampleMode(false)

      // En lugar de procesar automáticamente, mostrar opciones al usuario
      setIsProcessing(false)
    } catch (error) {
      console.error("Error handling captured image:", error)
      setError("Error al procesar la imagen capturada. Por favor, intenta de nuevo.")
      setIsProcessing(false)
    }
  }

  const handleExampleSelected = (data: string, materials?: any[]) => {
    try {
      console.log("Example selected")
      setImageData(data)
      setCaptureMode(false)
      setExampleMode(false)

      // Si tenemos materiales predefinidos, procesarlos directamente
      if (materials && materials.length > 0) {
        processManualMaterials(materials)
      } else {
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("Error handling example image:", error)
      setError("Error al procesar la imagen de ejemplo. Por favor, intenta de nuevo.")
      setIsProcessing(false)
    }
  }

  const handleManualInput = () => {
    console.log("Switching to manual input mode")
    setManualMode(true)
    // Importante: si hay una imagen capturada, la limpiamos para evitar confusiones
    if (imageData) {
      setImageData(null)
    }
  }

  const processManualMaterials = async (materials: any[]) => {
    try {
      console.log("Starting to process manual materials:", materials)
      setIsProcessing(true)
      setError(null)
      setDebugInfo(null)

      // Validar que los materiales tengan datos válidos
      if (!materials || materials.length === 0) {
        throw new Error("No se proporcionaron materiales para analizar")
      }

      // Verificar que cada material tenga nombre/materialId y porcentaje
      const invalidMaterials = materials.filter((m) => (!m.name && !m.materialId) || !m.percentage)
      if (invalidMaterials.length > 0) {
        throw new Error("Algunos materiales no tienen identificación o porcentaje válido")
      }

      console.log("Materials validated, loading database...")

      // Cargar la base de datos de materiales
      try {
        const materialsDBResponse = await fetch("/data/materials-database.json", {
          cache: "no-store",
          headers: {
            Pragma: "no-cache",
            "Cache-Control": "no-cache",
          },
        })

        if (!materialsDBResponse.ok) {
          throw new Error(
            `Error al cargar la base de datos: ${materialsDBResponse.status} ${materialsDBResponse.statusText}`,
          )
        }

        let materialsDB
        try {
          materialsDB = await materialsDBResponse.json()
        } catch (jsonError) {
          throw new Error(
            `Error al parsear la base de datos: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`,
          )
        }

        console.log("Materials database loaded successfully")

        // Convertir los materiales ingresados manualmente al formato esperado
        const processedMaterials = materials.map((material) => {
          // Si ya tiene materialId, usarlo directamente (caso de ejemplos)
          if (material.materialId) {
            return {
              materialId: material.materialId,
              percentage: material.percentage,
            }
          }

          // Normalizar el nombre del material para buscar coincidencias
          const normalizedName = material.name
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos

          // Buscar el ID del material en la base de datos
          let dbMaterial = materialsDB.materials.find(
            (m: any) =>
              m.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") === normalizedName,
          )

          // Si no se encuentra exactamente, buscar coincidencias parciales
          if (!dbMaterial) {
            dbMaterial = materialsDB.materials.find(
              (m: any) =>
                normalizedName.includes(
                  m.name
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, ""),
                ) ||
                m.name
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .includes(normalizedName),
            )
          }

          // Usar la función de normalización como respaldo
          const materialId = dbMaterial
            ? dbMaterial.id
            : material.name
              ? extractMaterialsFromOCR.normalizeMaterialName(material.name)
              : "unknown"

          console.log(`Material mapping: "${material.name}" -> "${materialId}"`)

          return {
            materialId,
            percentage: material.percentage,
          }
        })

        console.log("Materials processed, sending to API:", processedMaterials)

        // Analizar la composición con los materiales
        try {
          const analysisResult = await fetch("/api/analyze-predefined", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ materials: processedMaterials }),
          })

          if (!analysisResult.ok) {
            let errorText
            try {
              const errorData = await analysisResult.json()
              errorText = errorData.error || `Error ${analysisResult.status}`
              setDebugInfo(JSON.stringify(errorData.details || errorData))
            } catch (e) {
              errorText = await analysisResult.text()
            }
            throw new Error(`Error en la API: ${analysisResult.status} - ${errorText}`)
          }

          let result
          try {
            result = await analysisResult.json()
          } catch (jsonError) {
            throw new Error(
              `Error al parsear la respuesta: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`,
            )
          }

          console.log("API response received:", result)

          if (!result.success) {
            throw new Error(result.error || "Error al analizar los materiales")
          }

          // Guardar los resultados en sessionStorage para acceder desde la página de resultados
          const analysisData = {
            ocrText: materials.map((m) => `${m.percentage}% ${m.name || m.materialId}`).join(", "),
            confidence: 100,
            materialsDetected: processedMaterials,
            analysisResult: result.analysisResult,
          }

          console.log("Saving analysis data to sessionStorage:", analysisData)
          sessionStorage.setItem("analysisData", JSON.stringify(analysisData))

          // Guardar en el historial
          const historyItem = {
            id: Date.now().toString(),
            date: new Date().toLocaleString(),
            materials: materials.map((m) => ({
              name: m.name || materialsDB.materials.find((dbm: any) => dbm.id === m.materialId)?.name || m.materialId,
              percentage: m.percentage,
            })),
            score: result.analysisResult.totalScore,
          }

          // Obtener historial existente
          const existingHistory = localStorage.getItem("analysisHistory")
          const history = existingHistory ? JSON.parse(existingHistory) : []

          // Añadir nuevo item y guardar
          history.unshift(historyItem)
          localStorage.setItem("analysisHistory", JSON.stringify(history.slice(0, 20))) // Limitar a 20 items

          console.log("History saved, redirecting to results page")

          // Redirigir a la página de resultados
          router.push("/results")
        } catch (apiError) {
          console.error("API error:", apiError)
          setError(
            `Error al comunicarse con la API: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
          )
          setDebugInfo(`Error en la comunicación con la API de análisis. Detalles: ${String(apiError)}`)
          setIsProcessing(false)
        }
      } catch (dbError) {
        console.error("Database error:", dbError)
        setError(`Error al cargar la base de datos: ${dbError instanceof Error ? dbError.message : String(dbError)}`)
        setDebugInfo(`Error al cargar la base de datos de materiales. Detalles: ${String(dbError)}`)
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("General error processing materials:", error)
      setError(`Error al procesar los materiales: ${error instanceof Error ? error.message : String(error)}`)
      setDebugInfo(`Error general en el procesamiento de materiales. Detalles: ${String(error)}`)
      setIsProcessing(false)
    }
  }

  // Función para resetear el estado
  const resetState = () => {
    setImageData(null)
    setCaptureMode(true)
    setExampleMode(false)
    setManualMode(false)
    setError(null)
    setDebugInfo(null)
    setIsProcessing(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#415643] text-white p-4 flex items-center">
        <button onClick={() => router.push("/")} className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-white mb-0">Analizar Prenda</h1>
      </header>

      <div className="flex-1 p-4">
        {captureMode && !imageData && !manualMode && (
          <div className="mt-4">
            <ImageCapture onCapture={handleImageCaptured} onCancel={() => router.push("/")} />

            <div className="mt-4">
              <Button onClick={handleManualInput} variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Ingresar manualmente
              </Button>
            </div>
          </div>
        )}

        {exampleMode && !imageData && !manualMode && (
          <div className="mt-4">
            <ExampleImages onSelectImage={handleExampleSelected} />
            <div className="mt-4 flex gap-2">
              <Button onClick={() => setCaptureMode(true)} variant="outline" className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Usar cámara
              </Button>
              <Button onClick={handleManualInput} variant="outline" className="flex-1">
                <Edit className="mr-2 h-4 w-4" />
                Ingresar manualmente
              </Button>
            </div>
          </div>
        )}

        {manualMode && (
          <div className="mt-4">
            <ManualInput
              onSubmit={processManualMaterials}
              onCancel={() => {
                setManualMode(false)
                setCaptureMode(true)
                setImageData(null)
              }}
            />
          </div>
        )}

        {imageData && !manualMode && (
          <div className="mt-4 text-center">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-3">
                  {isProcessing ? "Procesando imagen..." : "Imagen capturada"}
                </h2>
                <div className="relative w-full h-64 mb-4">
                  <img
                    src={imageData || "/placeholder.svg"}
                    alt="Etiqueta capturada"
                    className="w-full h-full object-contain"
                  />
                </div>

                {isProcessing ? (
                  <>
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-[#415643] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-4 text-[#2E2E2E]">Estamos analizando los materiales de tu prenda...</p>
                  </>
                ) : error ? (
                  <>
                    <div className="flex items-center justify-center mb-4">
                      <AlertTriangle className="h-8 w-8 text-red-500 mr-2" />
                      <p className="text-red-500 font-medium">{error}</p>
                    </div>

                    {debugInfo && <p className="text-sm text-gray-500 mb-4">{debugInfo}</p>}

                    <div className="mt-4 flex flex-col gap-2">
                      <Button onClick={handleManualInput} className="w-full bg-[#415643]">
                        <Edit className="mr-2 h-4 w-4" />
                        Ingresar materiales manualmente
                      </Button>
                      <Button onClick={resetState} variant="outline" className="w-full">
                        <Camera className="mr-2 h-4 w-4" />
                        Tomar otra foto
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 flex flex-col gap-2">
                    <Button onClick={handleManualInput} className="w-full bg-[#415643]">
                      <Edit className="mr-2 h-4 w-4" />
                      Ingresar materiales manualmente
                    </Button>
                    <Button onClick={resetState} variant="outline" className="w-full">
                      <Camera className="mr-2 h-4 w-4" />
                      Tomar otra foto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
