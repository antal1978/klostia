"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import ImageCapture from "@/components/image-capture"

export default function AnalyzePage() {
  const router = useRouter()
  const [captureMode, setCaptureMode] = useState<boolean>(false)
  const [uploadMode, setUploadMode] = useState<boolean>(false)
  const [imageData, setImageData] = useState<string | null>(null)

  const handleImageCaptured = (data: string) => {
    setImageData(data)
    // En un caso real, aquí enviaríamos la imagen para OCR
    // Por ahora, simularemos que procesamos la imagen
    setTimeout(() => {
      router.push("/results")
    }, 1500)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageData(reader.result as string)
        // En un caso real, aquí enviaríamos la imagen para OCR
        // Por ahora, simularemos que procesamos la imagen
        setTimeout(() => {
          router.push("/results")
        }, 1500)
      }
      reader.readAsDataURL(file)
    }
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
        {!captureMode && !uploadMode && !imageData && (
          <>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-center text-xl font-semibold text-[#415643] mb-3">
                  Captura la etiqueta de tu prenda
                </h2>
                <p className="text-[#2E2E2E] text-center">
                  Necesitamos una foto clara de la etiqueta donde se muestren los materiales (algodón, poliéster, etc.)
                </p>
                <div className="flex flex-col gap-4 mt-6">
                  <Button onClick={() => setCaptureMode(true)} className="bg-[#415643] hover:bg-[#415643]/90 py-6">
                    <Camera className="mr-2 h-5 w-5" />
                    Tomar foto
                  </Button>
                  <Button
                    onClick={() => setUploadMode(true)}
                    variant="outline"
                    className="border-[#A67D88] text-[#A67D88] hover:bg-[#A67D88]/10 py-6"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Subir imagen
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

        {imageData && (
          <div className="mt-4 text-center">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-3">Procesando imagen...</h2>
                <div className="relative w-full h-64 mb-4">
                  <img
                    src={imageData || "/placeholder.svg"}
                    alt="Etiqueta capturada"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-[#415643] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-[#2E2E2E]">Estamos analizando los materiales de tu prenda...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
