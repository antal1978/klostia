import { type NextRequest, NextResponse } from "next/server"
import { analyzeFabricComposition, loadMaterialsDatabase } from "@/lib/materials-utils"

export async function POST(request: NextRequest) {
  try {
    console.log("API: analyze-predefined endpoint called")

    // Obtener los datos de la solicitud
    let data
    try {
      data = await request.json()
    } catch (parseError) {
      console.error("API: Error parsing request JSON:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Error al procesar la solicitud: formato JSON inválido",
          details: String(parseError),
        },
        { status: 400 },
      )
    }

    const { materials } = data

    console.log("API: Received materials:", JSON.stringify(materials))

    // Validar los materiales
    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      console.error("API: Invalid materials provided:", materials)
      return NextResponse.json(
        {
          success: false,
          error: "No se proporcionaron materiales válidos",
          details: JSON.stringify(materials),
        },
        { status: 400 },
      )
    }

    // Validar que cada material tenga materialId y percentage
    const invalidMaterials = materials.filter((m) => !m.materialId || typeof m.percentage !== "number")
    if (invalidMaterials.length > 0) {
      console.error("API: Some materials are invalid:", invalidMaterials)
      return NextResponse.json(
        {
          success: false,
          error: "Algunos materiales no tienen ID o porcentaje válido",
          invalidMaterials: JSON.stringify(invalidMaterials),
          allMaterials: JSON.stringify(materials),
        },
        { status: 400 },
      )
    }

    // Registrar los materiales validados para depuración
    console.log(
      "API: Valid materials:",
      materials.map((m) => ({
        materialId: m.materialId,
        percentage: m.percentage,
      })),
    )

    console.log("API: Materials validated, loading database...")

    // Cargar la base de datos de materiales
    try {
      const materialsDB = await loadMaterialsDatabase()
      console.log("API: Materials database loaded successfully, found", materialsDB.materials.length, "materials")

      // Verificar que los materiales existan en la base de datos
      const unknownMaterials = materials.filter(
        (m) => !materialsDB.materials.some((dbMat) => dbMat.id === m.materialId),
      )

      if (unknownMaterials.length > 0) {
        console.warn("API: Some materials not found in database:", unknownMaterials)
        // No retornamos error, continuamos con el análisis
      }

      // Analizar la composición de materiales
      console.log("API: Analyzing materials composition...")
      const analysisResult = analyzeFabricComposition(materials, materialsDB)

      if (!analysisResult) {
        console.error("API: Analysis failed, no result returned")
        return NextResponse.json(
          {
            success: false,
            error: "Error al analizar los materiales",
            details: "La función analyzeFabricComposition no retornó resultados",
          },
          { status: 500 },
        )
      }

      console.log("API: Analysis complete, score:", analysisResult.totalScore)

      // Devolver los resultados
      return NextResponse.json({
        success: true,
        analysisResult,
      })
    } catch (dbError) {
      console.error("API: Error loading materials database:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: `Error al cargar la base de datos: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
          details: String(dbError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API: General error analyzing predefined materials:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al analizar los materiales",
        errorDetails: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
