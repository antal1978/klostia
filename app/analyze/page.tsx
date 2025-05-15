"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, ArrowLeft, AlertTriangle, RefreshCw, FileImage } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import ImageCapture from "@/components/image-capture"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMobile } from "@/hooks/use-mobile"
import ExampleImages from "@/components/example-images"

export default function AnalyzePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useMobile()
  const [captureMode, setCaptureMode] = useState<boolean>(false)
  const [uploadMode, setUploadMode] = useState<boolean>(false)
  const [exampleMode, setExampleMode] = useState<boolean>(false)
  const [imageData, setImageData] = useState<string | null>(null)
  const [predefinedMaterials, setPredefinedMaterials] = useState<any[] | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [ocrText, setOcrText] = useState<string | null>(null)
  const [ocrService, setOcrService] = useState<"google" | "azure" | "tesseract">("google")

  // Verificar si se debe abrir directamente el modo de ejemplos
  useEffect(() => {
    const mode = searchParams.get("mode")
    if (mode === "example" && !imageData && !captureMode && !uploadMode && !exampleMode) {
      setExampleMode(true)
    }
  }, [searchParams, imageData, captureMode, uploadMode, exampleMode])

  // Iniciar directamente en modo captura en dispositivos móviles si no hay otro modo activo
  useEffect(() => {
    if (isMobile && !imageData && !captureMode && !uploadMode && !exampleMode) {
      // Pequeño retraso para asegurar que la UI se ha renderizado
      const timer = setTimeout(() => setCaptureMode(true), 500)
      return () => clearTimeout(timer)
    }
  }, [isMobile, imageData, captureMode, uploadMode, exampleMode])

  const handleImageCaptured = async (data: string, materials?: any[]) => {
    setImageData(data)
    setCaptureMode(false)
    setExampleMode(false)

    if (materials) {
      setPredefinedMaterials(materials)
    } else {
      setPredefinedMaterials(null)
    }

    await processImage(data, ocrService, materials)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const imageDataUrl = reader.result as string
        setImageData(imageDataUrl)
        setUploadMode(false)
        setPredefinedMaterials(null)
        await processImage(imageDataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  // Función para abrir directamente el selector de archivos
  const openFilePicker = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => handleFileUpload(e as any)
    input.click()
  }

  const processImage = async (imageDataUrl: string, currentService = ocrService, materials?: any[]) => {
    try {
      setIsProcessing(true)
      setError(null)
      setOcrText(null)

      // Si tenemos materiales predefinidos, usamos esos directamente
      if (materials && materials.length > 0) {
        console.log("Using predefined materials:", materials)

        // Cargar la base de datos de materiales
        const materialsDBResponse = await fetch("/data/materials-database.json")
        const materialsDB = await materialsDBResponse.json()

        // Analizar la composición con los materiales predefinidos
        const analysisResult = await fetch("/api/analyze-predefined", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ materials }),
        })

        const result = await analysisResult.json()

        if (!result.success) {
          throw new Error(result.error || "Error al analizar los materiales predefinidos")
        }

        // Guardar los resultados en sessionStorage para acceder desde la página de resultados
        sessionStorage.setItem(
          "analysisData",
          JSON.stringify({
            ocrText:
              "Imagen de ejemplo: " +
              materials
                .map((m) => {
                  const material = materialsDB.materials.find((dbm: any) => dbm.id === m.materialId)
                  return `${m.percentage}% ${material ? material.name : m.materialId}`
                })
                .join(", "),
            confidence: 100,
            materialsDetected: materials,
            analysisResult: result.analysisResult,
          }),
        )

        // Guardar en el historial
        const historyItem = {
          id: Date.now().toString(),
          date: new Date().toLocaleString(),
          materials: materials.map((m) => ({
            name: materialsDB.materials.find((dbm: any) => dbm.id === m.materialId)?.name || m.materialId,
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

        // Redirigir a la página de resultados
        router.push("/results")
        return
      }

      // Convertir la imagen base64 a un blob para enviarla
      const response = await fetch(imageDataUrl)
      const blob = await response.blob()

      // Crear un FormData para enviar la imagen
      const formData = new FormData()
      formData.append("image", blob, "image.jpg")
      formData.append("ocrService", currentService)

      console.log("Sending image to API with service:", currentService)

      // Enviar la imagen a la API para análisis
      const apiResponse = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      })

      const result = await apiResponse.json()

      if (!result.success) {
        // Si hay un error con Google Cloud Vision, intentar con Tesseract como fallback
        if (currentService === "google" && result.error?.includes("Google Cloud Vision")) {
          setError("Error con Google Cloud Vision. Intentando con Tesseract...")
          return processImage(imageDataUrl, "tesseract")
        }

        // Si hay texto OCR pero no se detectaron materiales, mostramos el texto
        if (result.ocrText) {
          setOcrText(result.ocrText)
          setError("No se pudieron detectar materiales en el texto. Por favor, intenta con otra imagen o servicio OCR.")
        } else {
          throw new Error(result.error || "No se pudo analizar la imagen")
        }
        setIsProcessing(false)
        return
      }

      // Limpiar cualquier análisis anterior
      sessionStorage.removeItem("analysisData")

      // Guardar los resultados en sessionStorage para acceder desde la página de resultados
      sessionStorage.setItem("analysisData", JSON.stringify(result))

      // Guardar en el historial
      const historyItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        materials: result.materialsDetected.map((m: any) => ({
          name: result.analysisResult.materialBreakdown.find((mb: any) => mb.id === m.materialId)?.name || m.materialId,
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

      // Redirigir a la página de resultados
      router.push("/results")
    } catch (err) {
      console.error("Error processing image:", err)
      setError("Error al procesar la imagen. Por favor, inténtalo de nuevo.")
      setIsProcessing(false)
    }
  }

  // Función para reintentar con otro servicio OCR
  const retryWithService = (service: "google" | "azure" | "tesseract") => {
    if (imageData) {
      setOcrService(service)
      processImage(imageData, service, predefinedMaterials || undefined)
    }
  }

  // Función para resetear el estado
  const resetState = () => {
    setImageData(null)
    setCaptureMode(false)
    setUploadMode(false)
    setExampleMode(false)
    setPredefinedMaterials(null)
    setError(null)
    setOcrText(null)
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
        {!captureMode && !uploadMode && !exampleMode && !imageData && (
          <>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-center text-xl font-semibold text-[#415643] mb-3">
                  Captura la etiqueta de tu prenda
                </h2>
                <p className="text-[#2E2E2E] text-center">
                  Necesitamos una foto clara de la etiqueta donde se muestren los materiales (algodón, poliéster, etc.)
                </p>

                <div className="mt-4 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servicio OCR</label>
                  <Select value={ocrService} onValueChange={(value) => setOcrService(value as any)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un servicio OCR" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Cloud Vision</SelectItem>
                      <SelectItem value="azure">Azure Computer Vision</SelectItem>
                      <SelectItem value="tesseract">Tesseract.js (Local)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Selecciona el servicio que quieres usar para reconocer el texto de la etiqueta.
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-6">
                  <Button onClick={() => setCaptureMode(true)} className="bg-[#415643] hover:bg-[#415643]/90 py-6">
                    <Camera className="mr-2 h-5 w-5" />
                    Tomar foto de la etiqueta
                  </Button>

                  <Button
                    onClick={openFilePicker}
                    variant="outline"
                    className="border-[#A67D88] text-[#A67D88] hover:bg-[#A67D88]/10 py-6"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Subir imagen desde el dispositivo
                  </Button>

                  <Button
                    onClick={() => setExampleMode(true)}
                    variant="outline"
                    className="border-[#415643] text-[#415643] hover:bg-[#415643]/10 py-6"
                  >
                    <FileImage className="mr-2 h-5 w-5" />
                    Usar imagen de ejemplo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-[#415643] mb-2">Consejos para una buena captura:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Asegúrate de que haya buena iluminación</li>
                  <li>Enfoca bien la etiqueta para que el texto sea legible</li>
                  <li>Incluye toda la información de composición (100% algodón, 60% poliéster, etc.)</li>
                  <li>Evita sombras y reflejos en la etiqueta</li>
                  <li>Mantén la cámara estable para evitar imágenes borrosas</li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}

        {captureMode && !imageData && (
          <div className="mt-4">
            <ImageCapture onCapture={handleImageCaptured} onCancel={() => setCaptureMode(false)} />
          </div>
        )}

        {uploadMode && !imageData && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <h2 className="text-center text-xl font-semibold text-[#415643] mb-3">Sube una imagen de la etiqueta</h2>
              <div className="border-2 border-dashed border-[#A67D88] rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-[#A67D88] mb-4" />
                <p className="mb-4">Haz clic para seleccionar una imagen</p>
                <input type="file" accept="image/*" className="hidden" id="image-upload" onChange={handleFileUpload} />
                <label htmlFor="image-upload">
                  <Button className="bg-[#A67D88] hover:bg-[#A67D88]/90">Seleccionar archivo</Button>
                </label>
              </div>
              <Button onClick={() => setUploadMode(false)} variant="outline" className="w-full mt-4">
                Cancelar
              </Button>
            </CardContent>
          </Card>
        )}

        {exampleMode && !imageData && (
          <div className="mt-4">
            <ExampleImages onSelectImage={handleImageCaptured} />
            <Button onClick={() => setExampleMode(false)} variant="outline" className="w-full mt-4">
              Cancelar
            </Button>
          </div>
        )}

        {imageData && (
          <div className="mt-4 text-center">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-3">
                  {isProcessing ? "Procesando imagen..." : error ? "Error en el procesamiento" : "Texto detectado"}
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

                    {ocrText && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                        <h3 className="font-medium mb-2">Texto detectado:</h3>
                        <p className="text-sm whitespace-pre-line">{ocrText}</p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-col gap-2">
                      <p className="text-sm text-gray-600">Prueba con otro servicio OCR:</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => retryWithService("google")}
                          variant="outline"
                          className="flex-1"
                          disabled={ocrService === "google"}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Google
                        </Button>
                        <Button
                          onClick={() => retryWithService("tesseract")}
                          variant="outline"
                          className="flex-1"
                          disabled={ocrService === "tesseract"}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Tesseract
                        </Button>
                        <Button
                          onClick={() => retryWithService("azure")}
                          variant="outline"
                          className="flex-1"
                          disabled={ocrService === "azure"}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Azure
                        </Button>
                      </div>

                      <Button onClick={resetState} className="mt-2">
                        Tomar otra foto
                      </Button>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
