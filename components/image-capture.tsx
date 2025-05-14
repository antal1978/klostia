"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"

interface ImageCaptureProps {
  onCapture: (imageData: string) => void
  onCancel: () => void
}

export default function ImageCapture({ onCapture, onCancel }: ImageCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        setError("No se pudo acceder a la cámara. Por favor, verifica los permisos.")
        console.error("Error accessing camera:", err)
      }
    }

    setupCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = canvas.toDataURL("image/jpeg")
        onCapture(imageData)

        // Stop the camera stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
      }
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
              <div className="absolute inset-0 border-2 border-[#415643] border-dashed m-4 pointer-events-none"></div>
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
            onClick={captureImage}
            className="bg-[#415643] hover:bg-[#415643]/90 rounded-full w-16 h-16 p-0 flex items-center justify-center"
            disabled={!!error}
          >
            <Camera className="h-8 w-8" />
          </Button>
          <div className="w-12"></div> {/* Spacer for alignment */}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
