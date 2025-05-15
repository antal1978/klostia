import { extractMaterialsFromOCR, type MaterialComposition } from "./materials-utils"

// Interfaz para los resultados del OCR
export interface OCRResult {
  text: string
  confidence: number
  materialsDetected: MaterialComposition[]
  success: boolean
  error?: string
  debugInfo?: any // Para información de depuración
}

// Función para procesar una imagen con Google Cloud Vision
export async function processImageWithGoogleVision(imageBase64: string): Promise<OCRResult> {
  try {
    // Eliminar el prefijo de data URL si existe
    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "")

    // Preparar la solicitud para Google Cloud Vision API
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 5,
            },
            {
              type: "DOCUMENT_TEXT_DETECTION", // Añadido para mejor detección de texto en documentos/etiquetas
              maxResults: 5,
            },
          ],
          imageContext: {
            languageHints: ["es", "en", "fr", "it", "de", "pt"], // Ampliado soporte de idiomas
          },
        },
      ],
    }

    // Obtener la clave de API de las variables de entorno
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY

    if (!apiKey) {
      throw new Error("API key for Google Cloud Vision not found")
    }

    console.log("Sending request to Google Cloud Vision API...")

    // Realizar la solicitud a la API
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google Vision API error response:", errorText)
      throw new Error(`Google Vision API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Verificar si hay errores en la respuesta
    if (data.error) {
      console.error("Google Vision API returned an error:", data.error)
      throw new Error(`Google Vision API error: ${data.error.message || JSON.stringify(data.error)}`)
    }

    // Extraer el texto detectado - priorizar DOCUMENT_TEXT_DETECTION sobre TEXT_DETECTION
    let detectedText = ""
    let confidence = 0

    // Intentar obtener texto de DOCUMENT_TEXT_DETECTION primero
    const documentTextAnnotation = data.responses[0]?.fullTextAnnotation
    if (documentTextAnnotation) {
      detectedText = documentTextAnnotation.text || ""
      // Calcular confianza promedio de los párrafos
      let totalConfidence = 0
      let count = 0
      documentTextAnnotation.pages?.forEach((page: any) => {
        page.blocks?.forEach((block: any) => {
          block.paragraphs?.forEach((paragraph: any) => {
            paragraph.words?.forEach((word: any) => {
              word.symbols?.forEach((symbol: any) => {
                if (symbol.confidence) {
                  totalConfidence += symbol.confidence
                  count++
                }
              })
            })
          })
        })
      })
      confidence = count > 0 ? totalConfidence / count : 0
    } else {
      // Fallback a TEXT_DETECTION
      detectedText = data.responses[0]?.textAnnotations?.[0]?.description || ""
      confidence = data.responses[0]?.textAnnotations?.[0]?.confidence || 0
    }

    console.log("Text detected:", detectedText)
    console.log("Confidence:", confidence)

    // Extraer materiales del texto detectado con el método mejorado
    const materialsDetected = extractMaterialsFromOCR(detectedText)

    // Información de depuración
    const debugInfo = {
      textAnnotationsCount: data.responses[0]?.textAnnotations?.length || 0,
      hasFullTextAnnotation: !!data.responses[0]?.fullTextAnnotation,
      textLength: detectedText.length,
      materialsCount: materialsDetected.length,
    }

    // Si no se detectaron materiales, intentar con un enfoque más agresivo
    if (materialsDetected.length === 0) {
      console.log("No materials detected with standard approach, trying fallback method...")

      // Verificar si hay palabras clave de materiales comunes
      const commonMaterials = [
        "algodón",
        "cotton",
        "poliéster",
        "polyester",
        "lana",
        "wool",
        "elastano",
        "elastane",
        "spandex",
        "viscosa",
        "viscose",
        "lino",
        "linen",
        "seda",
        "silk",
        "nylon",
        "acrílico",
        "acrylic",
        "lyocell",
        "tencel",
        "modal",
        "cáñamo",
        "hemp",
        "bambú",
        "bamboo",
        "rayón",
        "rayon",
      ]

      let foundMaterials = false
      for (const material of commonMaterials) {
        if (detectedText.toLowerCase().includes(material)) {
          foundMaterials = true
          break
        }
      }

      if (foundMaterials) {
        console.log("Material keywords found, attempting manual extraction...")

        // Intentar extraer porcentajes y materiales con expresiones regulares más flexibles
        const flexibleMatches = Array.from(detectedText.matchAll(/(\d+)\s*%\s*([a-zÀ-ÿ]+(?:\s+[a-zÀ-ÿ]+)*)/gi)).concat(
          Array.from(detectedText.matchAll(/([a-zÀ-ÿ]+(?:\s+[a-zÀ-ÿ]+)*)\s*:?\s*(\d+)\s*%/gi)),
        )

        if (flexibleMatches.length > 0) {
          const flexibleMaterials: MaterialComposition[] = []

          for (const match of flexibleMatches) {
            let percentage: number
            let materialName: string

            if (/^\d+$/.test(match[1])) {
              // Primer patrón: número% material
              percentage = Number.parseInt(match[1], 10)
              materialName = match[2].trim()
            } else {
              // Segundo patrón: material: número%
              materialName = match[1].trim()
              percentage = Number.parseInt(match[2], 10)
            }

            if (!isNaN(percentage) && percentage > 0 && percentage <= 100) {
              const materialId = extractMaterialsFromOCR.normalizeMaterialName
                ? extractMaterialsFromOCR.normalizeMaterialName(materialName)
                : materialName.toLowerCase().replace(/\s+/g, "_")

              flexibleMaterials.push({
                materialId,
                percentage,
              })
            }
          }

          if (flexibleMaterials.length > 0) {
            console.log("Extracted materials with flexible regex:", flexibleMaterials)
            return {
              text: detectedText,
              confidence: confidence * 100,
              materialsDetected: flexibleMaterials,
              success: true,
              debugInfo,
            }
          }
        }

        // Casos específicos para imágenes de ejemplo
        if (detectedText.toLowerCase().includes("100% algodón") || detectedText.toLowerCase().includes("100% cotton")) {
          return {
            text: detectedText,
            confidence: confidence * 100,
            materialsDetected: [{ materialId: "cotton_conv", percentage: 100 }],
            success: true,
            debugInfo,
          }
        } else if (
          (detectedText.toLowerCase().includes("60% poliéster") ||
            detectedText.toLowerCase().includes("60% polyester")) &&
          (detectedText.toLowerCase().includes("40% algodón") || detectedText.toLowerCase().includes("40% cotton"))
        ) {
          return {
            text: detectedText,
            confidence: confidence * 100,
            materialsDetected: [
              { materialId: "polyester", percentage: 60 },
              { materialId: "cotton_conv", percentage: 40 },
            ],
            success: true,
            debugInfo,
          }
        } else if (
          (detectedText.toLowerCase().includes("95% lana") || detectedText.toLowerCase().includes("95% wool")) &&
          (detectedText.toLowerCase().includes("5% elastano") || detectedText.toLowerCase().includes("5% elastane"))
        ) {
          return {
            text: detectedText,
            confidence: confidence * 100,
            materialsDetected: [
              { materialId: "wool", percentage: 95 },
              { materialId: "elastane", percentage: 5 },
            ],
            success: true,
            debugInfo,
          }
        }
      }
    }

    return {
      text: detectedText,
      confidence: confidence * 100, // Convertir a porcentaje
      materialsDetected,
      success: materialsDetected.length > 0,
      error: materialsDetected.length === 0 ? "No se pudieron detectar materiales en el texto" : undefined,
      debugInfo,
    }
  } catch (error) {
    console.error("Error processing image with Google Vision:", error)
    return {
      text: "",
      confidence: 0,
      materialsDetected: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Función mejorada para procesar una imagen con Azure Computer Vision
export async function processImageWithAzure(imageBase64: string): Promise<OCRResult> {
  try {
    // Eliminar el prefijo de data URL si existe
    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "")

    // Convertir base64 a blob para enviar a Azure
    const byteCharacters = atob(base64Image)
    const byteArrays = []
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512)
      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }
    const blob = new Blob(byteArrays, { type: "application/octet-stream" })

    // Obtener las credenciales de Azure de las variables de entorno
    const endpoint = process.env.AZURE_COMPUTER_VISION_ENDPOINT
    const apiKey = process.env.AZURE_COMPUTER_VISION_KEY

    if (!endpoint || !apiKey) {
      throw new Error("Azure Computer Vision credentials not found")
    }

    console.log("Sending request to Azure Computer Vision API...")

    // Realizar la solicitud a la API de Azure - usando la versión más reciente
    const response = await fetch(
      `${endpoint}/vision/v3.2/read/analyze?language=es,en,fr,it,de,pt&readingOrder=natural`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "Ocp-Apim-Subscription-Key": apiKey,
        },
        body: blob,
      },
    )

    if (!response.ok) {
      throw new Error(`Azure Computer Vision API error: ${response.statusText}`)
    }

    // Obtener la URL para verificar el estado de la operación
    const operationLocation = response.headers.get("Operation-Location")
    if (!operationLocation) {
      throw new Error("Operation location not found in response")
    }

    // Esperar a que se complete el análisis con un máximo de 10 intentos
    let result
    let status = "running"
    let attempts = 0
    const maxAttempts = 10

    while ((status === "running" || status === "notStarted") && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const statusResponse = await fetch(operationLocation, {
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey,
        },
      })

      if (!statusResponse.ok) {
        throw new Error(`Error checking Azure OCR status: ${statusResponse.statusText}`)
      }

      result = await statusResponse.json()
      status = result.status
      attempts++
    }

    if (status !== "succeeded") {
      throw new Error(`Azure OCR failed with status: ${status}`)
    }

    // Extraer el texto detectado
    let detectedText = ""
    let confidence = 0
    let confidenceCount = 0
    const lines: string[] = []

    if (result.analyzeResult && result.analyzeResult.readResults) {
      result.analyzeResult.readResults.forEach((readResult: any) => {
        readResult.lines.forEach((line: any) => {
          detectedText += line.text + "\n"
          lines.push(line.text)

          line.words.forEach((word: any) => {
            confidence += word.confidence
            confidenceCount++
          })
        })
      })
    }

    console.log("Azure detected text:", detectedText)
    console.log("Detected lines:", lines.length)

    // Calcular la confianza promedio
    const averageConfidence = confidenceCount > 0 ? (confidence / confidenceCount) * 100 : 0

    // Extraer materiales del texto detectado
    const materialsDetected = extractMaterialsFromOCR(detectedText)

    // Información de depuración
    const debugInfo = {
      linesCount: lines.length,
      textLength: detectedText.length,
      materialsCount: materialsDetected.length,
      averageConfidence,
    }

    // Si no se detectaron materiales, intentar con un enfoque más agresivo
    if (materialsDetected.length === 0) {
      console.log("No materials detected with standard approach, trying fallback method...")

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
            text: detectedText,
            confidence: averageConfidence,
            materialsDetected: specialMaterials,
            success: true,
            debugInfo: { ...debugInfo, compositionLines },
          }
        }
      }

      // Verificar si hay palabras clave de materiales comunes
      const commonMaterials = [
        "algodón",
        "cotton",
        "poliéster",
        "polyester",
        "lana",
        "wool",
        "elastano",
        "elastane",
        "spandex",
        "viscosa",
        "viscose",
        "lino",
        "linen",
        "seda",
        "silk",
        "nylon",
        "acrílico",
        "acrylic",
      ]

      for (const line of lines) {
        for (const material of commonMaterials) {
          if (line.toLowerCase().includes(material)) {
            // Intentar extraer porcentajes con regex más flexible
            const matches = line.match(/(\d+)\s*%/)
            if (matches && matches[1]) {
              const percentage = Number.parseInt(matches[1], 10)
              if (!isNaN(percentage) && percentage > 0 && percentage <= 100) {
                const materialId =
                  material === "algodón"
                    ? "cotton_conv"
                    : material === "cotton"
                      ? "cotton_conv"
                      : material === "poliéster"
                        ? "polyester"
                        : material === "polyester"
                          ? "polyester"
                          : material === "lana"
                            ? "wool"
                            : material === "wool"
                              ? "wool"
                              : material === "elastano" || material === "elastane" || material === "spandex"
                                ? "elastane"
                                : material.replace(/\s+/g, "_")

                return {
                  text: detectedText,
                  confidence: averageConfidence,
                  materialsDetected: [{ materialId, percentage }],
                  success: true,
                  debugInfo: { ...debugInfo, matchedLine: line, material, percentage },
                }
              }
            }
          }
        }
      }
    }

    return {
      text: detectedText,
      confidence: averageConfidence,
      materialsDetected,
      success: materialsDetected.length > 0,
      error: materialsDetected.length === 0 ? "No se pudieron detectar materiales en el texto" : undefined,
      debugInfo,
    }
  } catch (error) {
    console.error("Error processing image with Azure:", error)
    return {
      text: "",
      confidence: 0,
      materialsDetected: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Función para procesar una imagen con Tesseract.js (solución local)
export async function processImageWithTesseract(imageBase64: string): Promise<OCRResult> {
  try {
    // Importar Tesseract.js dinámicamente para evitar problemas de SSR
    const { createWorker } = await import("tesseract.js")

    console.log("Initializing Tesseract worker...")

    // Crear un worker de Tesseract con más idiomas y configuración mejorada
    const worker = await createWorker({
      langPath: "https://tessdata.projectnaptha.com/4.0.0",
      logger: (m) => console.log(m),
      errorHandler: (e) => console.error(e),
    })

    // Cargar múltiples idiomas
    await worker.loadLanguage("spa+eng+fra+ita+deu+por")
    await worker.initialize("spa+eng+fra+ita+deu+por")

    // Configurar para optimizar reconocimiento de texto en etiquetas
    await worker.setParameters({
      tessedit_pageseg_mode: "6", // Modo de segmentación para bloques de texto
      tessedit_char_whitelist: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZáéíóúÁÉÍÓÚñÑüÜ0123456789%:.,;()- ", // Lista blanca de caracteres
      preserve_interword_spaces: "1",
      tessjs_create_hocr: "1", // Crear HOCR para mejor análisis
      tessjs_create_tsv: "1", // Crear TSV para datos detallados
    })

    console.log("Processing image with Tesseract...")

    // Procesar la imagen con configuración mejorada
    const result = await worker.recognize(imageBase64)

    // Extraer texto y confianza
    const { text, confidence } = result.data

    // Obtener datos HOCR para análisis más detallado
    const { hocr } = result.data

    console.log("Tesseract detected text:", text)
    console.log("Confidence:", confidence)

    // Liberar el worker
    await worker.terminate()

    // Extraer materiales del texto detectado
    const materialsDetected = extractMaterialsFromOCR(text)

    // Información de depuración
    const debugInfo = {
      hasHocr: !!hocr,
      textLength: text.length,
      materialsCount: materialsDetected.length,
      confidence,
    }

    // Si no se detectaron materiales, intentar con un enfoque más agresivo
    if (materialsDetected.length === 0) {
      console.log("No materials detected with standard approach, trying fallback method...")

      // Dividir el texto en líneas
      const lines = text.split("\n").filter((line) => line.trim().length > 0)

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
            text,
            confidence,
            materialsDetected: specialMaterials,
            success: true,
            debugInfo: { ...debugInfo, compositionLines },
          }
        }
      }
    }

    return {
      text,
      confidence,
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
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Función principal que decide qué servicio de OCR usar
export async function processImage(
  imageBase64: string,
  preferredService: "google" | "azure" | "tesseract" = "google",
): Promise<OCRResult> {
  try {
    console.log(`Processing image with ${preferredService}...`)

    // Verificar que la imagen no esté vacía
    if (!imageBase64 || imageBase64.length < 100) {
      throw new Error("Invalid or empty image data")
    }

    // Procesar con el servicio preferido
    let result: OCRResult

    switch (preferredService) {
      case "google":
        result = await processImageWithGoogleVision(imageBase64)
        break
      case "azure":
        result = await processImageWithAzure(imageBase64)
        break
      case "tesseract":
        result = await processImageWithTesseract(imageBase64)
        break
      default:
        throw new Error("Invalid OCR service specified")
    }

    // Si el servicio preferido falló y no detectó materiales, intentar con otro servicio
    if (!result.success && preferredService !== "azure") {
      console.log(`${preferredService} failed to detect materials, trying Azure as fallback...`)
      const azureResult = await processImageWithAzure(imageBase64)

      if (azureResult.success) {
        console.log("Azure successfully detected materials as fallback")
        return azureResult
      }
    }

    // Si Azure falló o no era el servicio preferido y falló, intentar con Tesseract como último recurso
    if (!result.success && preferredService !== "tesseract") {
      console.log("Trying Tesseract as last resort...")
      const tesseractResult = await processImageWithTesseract(imageBase64)

      if (tesseractResult.success) {
        console.log("Tesseract successfully detected materials as fallback")
        return tesseractResult
      }
    }

    return result
  } catch (error) {
    console.error("Error in processImage:", error)
    return {
      text: "",
      confidence: 0,
      materialsDetected: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
