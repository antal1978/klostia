import { type NextRequest, NextResponse } from "next/server"
import { processImage } from "@/lib/ocr-service"
import { analyzeFabricComposition, loadMaterialsDatabase } from "@/lib/materials-utils"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageData = formData.get("image") as File | null
    let ocrService = (formData.get("ocrService") as string) || "tesseract" // Default a Tesseract para móviles

    if (!imageData) {
      return NextResponse.json({ success: false, error: "No se proporcionó ninguna imagen" }, { status: 400 })
    }

    console.log("Image received, size:", imageData.size, "bytes, type:", imageData.type)

    // Verificar que la imagen no esté vacía
    if (imageData.size === 0) {
      return NextResponse.json({ success: false, error: "La imagen está vacía" }, { status: 400 })
    }

    // Convertir la imagen a base64 de manera optimizada para móviles
    try {
      const buffer = await imageData.arrayBuffer()
      const mimeType = imageData.type || "image/jpeg" // Usar tipo MIME proporcionado o default a JPEG
      const base64Image = `data:${mimeType};base64,${Buffer.from(buffer).toString("base64")}`

      // Verificar que la imagen base64 tenga un formato válido
      if (!base64Image.startsWith("data:image/")) {
        console.error("Invalid image format, starts with:", base64Image.substring(0, 30))
        return NextResponse.json(
          {
            success: false,
            error: "Formato de imagen no válido",
            debugInfo: {
              mimeType,
              bufferLength: buffer.byteLength,
              startsWith: base64Image.substring(0, 30) + "...",
            },
          },
          { status: 400 },
        )
      }

      console.log("Image converted to base64, length:", base64Image.length)

      // Verificar la clave de API según el servicio seleccionado
      if (ocrService === "google" && !process.env.GOOGLE_CLOUD_VISION_API_KEY) {
        console.warn("Google Cloud Vision API key not configured, falling back to Tesseract")
        ocrService = "tesseract"
      } else if (
        ocrService === "azure" &&
        (!process.env.AZURE_COMPUTER_VISION_ENDPOINT || !process.env.AZURE_COMPUTER_VISION_KEY)
      ) {
        console.warn("Azure Computer Vision credentials not found, falling back to Tesseract")
        ocrService = "tesseract"
      }

      // Procesar la imagen con OCR
      console.log("Processing image with", ocrService)
      const ocrResult = await processImage(base64Image, ocrService as "google" | "azure" | "tesseract")

      if (!ocrResult.success) {
        console.error("OCR processing failed:", ocrResult.error)
        return NextResponse.json(
          {
            success: false,
            error: ocrResult.error || "Error en el procesamiento OCR",
            ocrText: ocrResult.text,
            confidence: ocrResult.confidence,
            debugInfo: ocrResult.debugInfo || { service: ocrService },
          },
          { status: 422 },
        )
      }

      console.log("OCR successful, detected text length:", ocrResult.text.length)
      console.log("Materials detected:", ocrResult.materialsDetected.length)

      // Si no se detectaron materiales pero hay texto, devolver el texto para revisión manual
      if (ocrResult.materialsDetected.length === 0 && ocrResult.text) {
        return NextResponse.json(
          {
            success: false,
            error: "No se pudieron detectar materiales en el texto",
            ocrText: ocrResult.text,
            confidence: ocrResult.confidence,
            materialsDetected: [],
            debugInfo: ocrResult.debugInfo,
          },
          { status: 422 },
        )
      }

      // Cargar la base de datos de materiales
      const materialsDB = await loadMaterialsDatabase()

      // Analizar la composición de materiales
      const analysisResult = analyzeFabricComposition(ocrResult.materialsDetected, materialsDB)

      if (!analysisResult) {
        return NextResponse.json(
          {
            success: false,
            error: "Error al analizar los materiales detectados",
            ocrText: ocrResult.text,
            materialsDetected: ocrResult.materialsDetected,
            debugInfo: { materialsDetected: ocrResult.materialsDetected },
          },
          { status: 500 },
        )
      }

      console.log("Analysis complete, score:", analysisResult.totalScore)

      // Devolver los resultados
      return NextResponse.json({
        success: true,
        ocrText: ocrResult.text,
        confidence: ocrResult.confidence,
        materialsDetected: ocrResult.materialsDetected,
        analysisResult,
        debugInfo: ocrResult.debugInfo,
      })
    } catch (conversionError) {
      console.error("Error converting image to base64:", conversionError)
      return NextResponse.json(
        {
          success: false,
          error:
            "Error al convertir la imagen: " +
            (conversionError instanceof Error ? conversionError.message : "Formato no válido"),
          debugInfo: { error: String(conversionError) },
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error analyzing image:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al analizar la imagen",
        debugInfo: { error: String(error) },
      },
      { status: 500 },
    )
  }
}
