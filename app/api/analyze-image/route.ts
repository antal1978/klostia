import { type NextRequest, NextResponse } from "next/server"
import { processImage } from "@/lib/ocr-service"
import { analyzeFabricComposition, loadMaterialsDatabase } from "@/lib/materials-utils"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageData = formData.get("image") as File | null
    const ocrService = (formData.get("ocrService") as string) || "google"

    if (!imageData) {
      return NextResponse.json({ success: false, error: "No se proporcionó ninguna imagen" }, { status: 400 })
    }

    console.log("Image received, size:", imageData.size, "bytes, type:", imageData.type)

    // Verificar que la imagen no esté vacía
    if (imageData.size === 0) {
      return NextResponse.json({ success: false, error: "La imagen está vacía" }, { status: 400 })
    }

    // Convertir la imagen a base64
    const buffer = await imageData.arrayBuffer()
    const base64Image = `data:${imageData.type};base64,${Buffer.from(buffer).toString("base64")}`

    console.log("Image converted to base64, length:", base64Image.length)

    // Verificar la clave de API según el servicio seleccionado
    if (ocrService === "google" && !process.env.GOOGLE_CLOUD_VISION_API_KEY) {
      return NextResponse.json({ success: false, error: "Google Cloud Vision API key not configured" }, { status: 500 })
    } else if (
      ocrService === "azure" &&
      (!process.env.AZURE_COMPUTER_VISION_ENDPOINT || !process.env.AZURE_COMPUTER_VISION_KEY)
    ) {
      return NextResponse.json(
        { success: false, error: "Azure Computer Vision credentials not configured" },
        { status: 500 },
      )
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
    })
  } catch (error) {
    console.error("Error analyzing image:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al analizar la imagen",
      },
      { status: 500 },
    )
  }
}
