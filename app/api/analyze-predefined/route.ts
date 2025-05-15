import { type NextRequest, NextResponse } from "next/server"
import { analyzeFabricComposition, loadMaterialsDatabase } from "@/lib/materials-utils"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { materials } = data

    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return NextResponse.json({ success: false, error: "No se proporcionaron materiales válidos" }, { status: 400 })
    }

    console.log("Analyzing predefined materials:", materials)

    // Cargar la base de datos de materiales
    const materialsDB = await loadMaterialsDatabase()

    // Analizar la composición de materiales
    const analysisResult = analyzeFabricComposition(materials, materialsDB)

    if (!analysisResult) {
      return NextResponse.json({ success: false, error: "Error al analizar los materiales" }, { status: 500 })
    }

    console.log("Analysis complete, score:", analysisResult.totalScore)

    // Devolver los resultados
    return NextResponse.json({
      success: true,
      analysisResult,
    })
  } catch (error) {
    console.error("Error analyzing predefined materials:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al analizar los materiales",
      },
      { status: 500 },
    )
  }
}
