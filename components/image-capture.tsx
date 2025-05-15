"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X, FlipHorizontal, Info } from "lucide-react"

interface ImageCaptureProps {
  onCapture: (imageData: string) => void
  onCancel: () => void
}

export default function ImageCapture({ onCapture, onCancel }: ImageCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const [showTips, setShowTips] = useState(true)

  useEffect(() => {
    async function setupCamera() {
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }

        // Configuración básica para móviles
        const constraints = {
          video: {
            facingMode,
            width: { ideal: 640 }, // Reducido para mejor rendimiento
            height: { ideal: 480 }, // Reducido para mejor rendimiento
          },
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
        setError("No se pudo acceder a la cámara. Por favor, verifica los permisos.")
      }
    }

    setupCamera()

    // Ocultar los consejos después de 5 segundos
    const timer = setTimeout(() => setShowTips(false), 5000)

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      clearTimeout(timer)
    }
  }, [facingMode])

  // Función simplificada para capturar imágenes
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        if (!context) {
          throw new Error("No se pudo obtener el contexto del canvas")
        }

        // Usar dimensiones pequeñas para móviles
        const width = 640
        const height = 480

        // Establecer dimensiones del canvas
        canvas.width = width
        canvas.height = height

        // Dibujar el frame actual del video en el canvas
        context.drawImage(video, 0, 0, width, height)

        // Obtener la imagen como JPEG con calidad reducida
        const imageData = canvas.toDataURL("image/jpeg", 0.7)

        // Detener la transmisión de la cámara
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }

        // Pasar la imagen capturada al componente padre
        onCapture(imageData)
      } catch (error) {
        console.error("Error capturing image:", error)
        alert("Error al capturar la imagen. Por favor, intenta de nuevo.")
      }
    }
  }

  const toggleCamera = () => {
    setFacingMode(facingMode === "environment" ? "user" : "environment")
  }

  return (
    <div className="relative">
      <div className="bg-white rounded-xl overflow-hidden shadow-md">
        <div className="relative">
          {error ? (
            <div className="bg-red-50 p-4 text-red-600 text-center">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-full h-[60vh] object-cover" />

              {/* Marco guía simplificado */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4/5 h-1/3 border-2 border-green-500 rounded-md"></div>
              </div>

              {/* Consejos de captura */}
              {showTips && (
                <div className="absolute top-4 left-0 right-0 flex justify-center">
                  <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Centra la etiqueta en el marco verde
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 flex justify-between">
          <Button
            onClick={onCancel}
            variant="outline"
            className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            onClick={toggleCamera}
            variant="outline"
            className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
          >
            <FlipHorizontal className="h-6 w-6" />
          </Button>

          <Button
            onClick={captureImage}
            className="bg-[#415643] hover:bg-[#415643]/90 rounded-full w-16 h-16 p-0 flex items-center justify-center"
            disabled={!!error}
          >
            <Camera className="h-8 w-8" />
          </Button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
