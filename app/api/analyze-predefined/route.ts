import { type NextRequest, NextResponse } from "next/server"
import { analyzeFabricComposition, loadMaterialsDatabase } from "@/lib/materials-utils"

export async function POST(request: NextRequest) {
  try {
    console.log("API: analyze-predefined endpoint called")

    // Obtener los datos de la solicitud
    const data = await request.json()
    const { materials } = data

    console.log("API: Received materials:", materials)

    // Validar los materiales
    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      console.error("API: Invalid materials provided:", materials)
      return NextResponse.json(
        {
          success: false,
          error: "No se proporcionaron materiales válidos",
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
          invalidMaterials,
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
      console.log("API: Materials database loaded successfully")

      // Analizar la composición de materiales
      console.log("API: Analyzing materials composition...")
      const analysisResult = analyzeFabricComposition(materials, materialsDB)

      if (!analysisResult) {
        console.error("API: Analysis failed, no result returned")
        return NextResponse.json(
          {
            success: false,
            error: "Error al analizar los materiales",
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
      },
      { status: 500 },
    )
  }
}
