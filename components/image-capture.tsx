"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X, FlipHorizontal, Lightbulb, Info } from "lucide-react"

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
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [hasFlashlight, setHasFlashlight] = useState(false)
  const [showTips, setShowTips] = useState(true)

  useEffect(() => {
    async function setupCamera() {
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        })
        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }

        // Verificar si el dispositivo tiene linterna
        const tracks = mediaStream.getVideoTracks()
        if (tracks.length > 0) {
          const capabilities = tracks[0].getCapabilities()
          setHasFlashlight("torch" in capabilities)
        }
      } catch (err) {
        setError("No se pudo acceder a la cámara. Por favor, verifica los permisos.")
        console.error("Error accessing camera:", err)
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

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = canvas.toDataURL("image/jpeg", 0.9)
        onCapture(imageData)

        // Stop the camera stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    }
  }

  const toggleCamera = () => {
    setFacingMode(facingMode === "environment" ? "user" : "environment")
  }

  const toggleFlashlight = async () => {
    if (!stream) return

    try {
      const tracks = stream.getVideoTracks()
      if (tracks.length > 0) {
        const track = tracks[0]
        const newFlashlightState = !flashlightOn

        await track.applyConstraints({
          advanced: [{ torch: newFlashlightState }],
        })

        setFlashlightOn(newFlashlightState)
      }
    } catch (err) {
      console.error("Error toggling flashlight:", err)
    }
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
              <video ref={videoRef} autoPlay playsInline className="w-full h-[70vh] object-cover" />

              {/* Marco guía mejorado */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4/5 h-1/3 border-2 border-green-500 rounded-md relative">
                  {/* Esquinas del marco */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500"></div>
                </div>
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

          <div className="flex gap-2">
            <Button
              onClick={toggleCamera}
              variant="outline"
              className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
            >
              <FlipHorizontal className="h-6 w-6" />
            </Button>

            {hasFlashlight && (
              <Button
                onClick={toggleFlashlight}
                variant="outline"
                className={`rounded-full w-12 h-12 p-0 flex items-center justify-center ${flashlightOn ? "bg-yellow-100" : ""}`}
              >
                <Lightbulb className={`h-6 w-6 ${flashlightOn ? "text-yellow-500" : ""}`} />
              </Button>
            )}
          </div>

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
