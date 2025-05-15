import { extractMaterialsFromOCR, type MaterialComposition } from "./materials-utils"

// Interfaz para los resultados del OCR
export interface OCRResult {
  text: string
  confidence: number
  materialsDetected: MaterialComposition[]
  success: boolean
  error?: string
  debugInfo?: any
}

// Función para procesar una imagen con Tesseract.js (optimizada para móviles)
export async function processImageWithTesseract(imageBase64: string): Promise<OCRResult> {
  try {
    // Importar Tesseract.js dinámicamente
    const { createWorker } = await import("tesseract.js")

    console.log("Initializing Tesseract worker...")

    // Crear un worker de Tesseract con configuración optimizada para móviles
    const worker = await createWorker({
      langPath: "https://tessdata.projectnaptha.com/4.0.0",
      logger: (m) => console.log(m),
      errorHandler: (e) => console.error(e),
      // Configuración para dispositivos móviles
      workerBlobURL: false, // Mejor rendimiento en móviles
      cacheMethod: "none", // Evitar problemas de almacenamiento en móviles
    })

    // Cargar múltiples idiomas
    await worker.loadLanguage("spa+eng")
    await worker.initialize("spa+eng")

    // Configurar para optimizar reconocimiento de texto en etiquetas
    await worker.setParameters({
      tessedit_pageseg_mode: "6", // Modo de segmentación para bloques de texto
      tessedit_char_whitelist: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZáéíóúÁÉÍÓÚñÑüÜ0123456789%:.,;()- ", // Lista blanca de caracteres
      preserve_interword_spaces: "1",
    })

    console.log("Processing image with Tesseract...")

    // Procesar la imagen con configuración mejorada
    const result = await worker.recognize(imageBase64)

    // Extraer solo los datos necesarios para evitar problemas de serialización
    const extractedText = result.data.text || ""
    const extractedConfidence = result.data.confidence || 0

    console.log("Tesseract detected text:", extractedText)
    console.log("Confidence:", extractedConfidence)

    // Liberar el worker
    await worker.terminate()

    // Extraer materiales del texto detectado
    const materialsDetected = extractMaterialsFromOCR(extractedText)

    // Información de depuración (solo datos serializables)
    const debugInfo = {
      textLength: extractedText.length,
      materialsCount: materialsDetected.length,
      confidence: extractedConfidence,
      textSample: extractedText.substring(0, 100) + "...",
    }

    // Si no se detectaron materiales, intentar con un enfoque más agresivo
    if (materialsDetected.length === 0) {
      console.log("No materials detected with standard approach, trying fallback method...")

      // Dividir el texto en líneas
      const lines = extractedText.split("\n").filter((line) => line.trim().length > 0)

      // Buscar líneas que puedan contener información de composición
      const compositionLines = lines.filter(
        (line) =>
          line.toLowerCase().includes("compos") ||
          line.toLowerCase().includes("mater") ||
          line.toLowerCase().includes("fabric") ||
          /\d+\s*%/.test(line), // Líneas con porcentajes
      )

      if (compositionLines.length > 0) {
        console.log("Found potential composition lines:", compositionLines)

        // Intentar extraer materiales de estas líneas específicas
        const compositionText = compositionLines.join("\n")
        const specialMaterials = extractMaterialsFromOCR(compositionText)

        if (specialMaterials.length > 0) {
          return {
            text: extractedText,
            confidence: extractedConfidence,
            materialsDetected: specialMaterials,
            success: true,
            debugInfo: { ...debugInfo, compositionLines },
          }
        }
      }

      // Buscar patrones específicos de materiales comunes
      const commonMaterials = [
        { name: "algodón", id: "cotton_conv" },
        { name: "cotton", id: "cotton_conv" },
        { name: "poliéster", id: "polyester" },
        { name: "polyester", id: "polyester" },
        { name: "lana", id: "wool" },
        { name: "wool", id: "wool" },
        { name: "elastano", id: "elastane" },
        { name: "elastane", id: "elastane" },
        { name: "spandex", id: "elastane" },
      ]

      for (const line of lines) {
        for (const material of commonMaterials) {
          if (line.toLowerCase().includes(material.name)) {
            // Buscar porcentajes en la línea
            const percentMatch = line.match(/(\d+)\s*%/)
            if (percentMatch && percentMatch[1]) {
              const percentage = Number.parseInt(percentMatch[1], 10)
              if (percentage > 0 && percentage <= 100) {
                return {
                  text: extractedText,
                  confidence: extractedConfidence,
                  materialsDetected: [{ materialId: material.id, percentage }],
                  success: true,
                  debugInfo: { ...debugInfo, matchedLine: line, material: material.name, percentage },
                }
              }
            }
          }
        }
      }
    }

    return {
      text: extractedText,
      confidence: extractedConfidence,
      materialsDetected,
      success: materialsDetected.length > 0,
      error: materialsDetected.length === 0 ? "No se pudieron detectar materiales en el texto" : undefined,
      debugInfo,
    }
  } catch (error) {
    console.error("Error processing image with Tesseract:", error)
    return {
      text: "",
      confidence: 0,
      materialsDetected: [],
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      debugInfo: { error: String(error) },
    }
  }
}

// Función principal para procesar imágenes (optimizada para móviles)
export async function processImage(
  imageBase64: string,
  preferredService: "google" | "azure" | "tesseract" = "tesseract",
): Promise<OCRResult> {
  try {
    console.log(`Processing image with ${preferredService}...`)

    // Verificar que la imagen no esté vacía
    if (!imageBase64 || imageBase64.length < 100) {
      throw new Error("Invalid or empty image data")
    }

    // Verificar y corregir el formato de la imagen
    let processedImageBase64 = imageBase64

    // Asegurarse de que la imagen tenga el formato correcto para base64
    if (!imageBase64.startsWith("data:image/")) {
      // Si no tiene el prefijo correcto, intentar añadirlo
      try {
        // Intentar determinar si es una cadena base64 válida
        const base64Content = imageBase64.replace(/^data:.*?;base64,/, "")
        // Verificar si es base64 válido intentando decodificarlo
        atob(base64Content)
        // Si llegamos aquí, es base64 válido, añadir el prefijo
        processedImageBase64 = `data:image/jpeg;base64,${base64Content}`
      } catch (e) {
        console.error("Invalid base64 string:", e)
        throw new Error("Invalid image format: not a valid base64 string")
      }
    }

    // Para dispositivos móviles, preferimos Tesseract por defecto
    if (preferredService === "tesseract") {
      return await processImageWithTesseract(processedImageBase64)
    }

    // Si se solicita específicamente Google Vision
    if (preferredService === "google") {
      try {
        const result = await processImageWithGoogleVision(processedImageBase64)
        if (result.success) {
          return result
        }
        // Si falla, usar Tesseract como fallback
        console.log("Google Vision failed, falling back to Tesseract")
        return await processImageWithTesseract(processedImageBase64)
      } catch (error) {
        console.error("Error with Google Vision, falling back to Tesseract:", error)
        return await processImageWithTesseract(processedImageBase64)
      }
    }

    // Si se solicita específicamente Azure
    if (preferredService === "azure") {
      try {
        const result = await processImageWithAzure(processedImageBase64)
        if (result.success) {
          return result
        }
        // Si falla, usar Tesseract como fallback
        console.log("Azure failed, falling back to Tesseract")
        return await processImageWithTesseract(processedImageBase64)
      } catch (error) {
        console.error("Error with Azure, falling back to Tesseract:", error)
        return await processImageWithTesseract(processedImageBase64)
      }
    }

    // Si llegamos aquí, algo salió mal con la selección del servicio
    return await processImageWithTesseract(processedImageBase64)
  } catch (error) {
    console.error("Error in processImage:", error)
    return {
      text: "",
      confidence: 0,
      materialsDetected: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      debugInfo: { error: String(error) },
    }
  }
}

// Estas funciones se mantienen para compatibilidad, pero en la versión móvil
// preferimos usar Tesseract directamente
export async function processImageWithGoogleVision(imageBase64: string): Promise<OCRResult> {
  // Implementación existente
  // ...
  return {
    text: "",
    confidence: 0,
    materialsDetected: [],
    success: false,
    error: "Google Vision no implementado para versión móvil",
  }
}

export async function processImageWithAzure(imageBase64: string): Promise<OCRResult> {
  // Implementación existente
  // ...
  return {
    text: "",
    confidence: 0,
    materialsDetected: [],
    success: false,
    error: "Azure no implementado para versión móvil",
  }
}
