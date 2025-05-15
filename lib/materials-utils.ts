export interface Material {
  id: string
  name: string
  category: string
  description: string
  environmentalImpact: {
    waterUsage: {
      value: string | number
      unit: string
    }
    co2Emissions: {
      value: number
      unit: string
    }
    chemicalUse: string
    biodegradationTime: string
    renewability: string
  }
  sustainabilityScore: {
    total: number
    water: number
    co2: number
    chemicals: number
    biodegradation: number
    renewability: number
  }
  careInstructions: string[]
  certifications: string[]
}

export interface MaterialsDatabase {
  materials: Material[]
  certifications: {
    id: string
    name: string
    fullName: string
    description: string
    website: string
  }[]
  materialCategories: {
    id: string
    name: string
    description: string
  }[]
  sustainabilityFactors: {
    id: string
    name: string
    description: string
    importance: string
    unit: string
  }[]
}

export interface MaterialComposition {
  materialId: string
  percentage: number
}

export interface AnalysisResult {
  totalScore: number
  materialBreakdown: {
    id: string
    name: string
    percentage: number
    category: string
    score: number
  }[]
  environmentalImpact: {
    waterUsage: {
      value: number
      unit: string
    }
    co2Emissions: {
      value: number
      unit: string
    }
    chemicalUse: string
    biodegradationTime: string
  }
  careInstructions: string[]
  recommendedCertifications: {
    id: string
    name: string
    fullName: string
    description: string
    website: string
  }[]
}

export async function loadMaterialsDatabase(): Promise<MaterialsDatabase> {
  try {
    console.log("Attempting to load materials database from /data/materials-database.json")

    // Intentar cargar la base de datos
    const response = await fetch("/data/materials-database.json", {
      // Añadir cache: 'no-store' para evitar problemas de caché en producción
      cache: "no-store",
      // Añadir un timestamp para evitar caché agresivo
      headers: {
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`)
    }

    // Intentar parsear la respuesta
    try {
      const data = await response.json()

      // Verificar que la estructura de datos sea correcta
      if (!data || !Array.isArray(data.materials) || !Array.isArray(data.certifications)) {
        throw new Error("Estructura de datos inválida en la base de datos de materiales")
      }

      console.log(
        `Database loaded successfully with ${data.materials.length} materials and ${data.certifications.length} certifications`,
      )
      return data as MaterialsDatabase
    } catch (parseError) {
      console.error("Error parsing materials database JSON:", parseError)
      throw new Error(
        `Error al parsear la base de datos: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      )
    }
  } catch (error) {
    console.error("Could not load or parse materials database:", error)

    // Proporcionar una base de datos mínima de respaldo para evitar errores fatales
    console.warn("Using fallback minimal database")
    return {
      materials: [
        {
          id: "cotton_conv",
          name: "Algodón convencional",
          category: "Natural",
          description: "Fibra natural de algodón.",
          environmentalImpact: {
            waterUsage: { value: 10000, unit: "litros/kg" },
            co2Emissions: { value: 5.5, unit: "kg CO₂e/kg" },
            chemicalUse: "Alto",
            biodegradationTime: "1-5 años",
            renewability: "Renovable con impacto moderado",
          },
          sustainabilityScore: {
            total: 4.5,
            water: 0,
            co2: 1,
            chemicals: 0.5,
            biodegradation: 2,
            renewability: 1,
          },
          careInstructions: ["Lavar en frío", "Secar al aire"],
          certifications: ["bci", "oeko"],
        },
        {
          id: "polyester",
          name: "Poliéster",
          category: "Sintético",
          description: "Fibra sintética derivada del petróleo.",
          environmentalImpact: {
            waterUsage: { value: 10, unit: "litros/kg" },
            co2Emissions: { value: 9.5, unit: "kg CO₂e/kg" },
            chemicalUse: "Alto",
            biodegradationTime: "20-200 años",
            renewability: "No renovable",
          },
          sustainabilityScore: {
            total: 3.5,
            water: 2,
            co2: 0.5,
            chemicals: 0.5,
            biodegradation: 0.5,
            renewability: 0,
          },
          careInstructions: ["Lavar en frío", "Evitar secadora"],
          certifications: ["oeko"],
        },
      ],
      certifications: [
        {
          id: "oeko",
          name: "OEKO-TEX",
          fullName: "OEKO-TEX Standard 100",
          description: "Certifica que los textiles están libres de sustancias nocivas.",
          website: "https://www.oeko-tex.com/",
        },
        {
          id: "bci",
          name: "BCI",
          fullName: "Better Cotton Initiative",
          description: "Promueve mejores estándares en el cultivo de algodón.",
          website: "https://bettercotton.org/",
        },
      ],
      materialCategories: [
        {
          id: "natural",
          name: "Natural",
          description: "Fibras obtenidas directamente de plantas o animales.",
        },
        {
          id: "synthetic",
          name: "Sintético",
          description: "Fibras creadas artificialmente a partir de polímeros.",
        },
      ],
      sustainabilityFactors: [
        {
          id: "water",
          name: "Uso de agua",
          description: "Cantidad de agua necesaria para producir la fibra.",
          importance: "Alto",
          unit: "litros/kg",
        },
        {
          id: "co2",
          name: "Emisiones de CO₂",
          description: "Cantidad de gases de efecto invernadero emitidos.",
          importance: "Alto",
          unit: "kg CO₂e/kg",
        },
      ],
    }
  }
}

export function analyzeFabricComposition(
  materials: MaterialComposition[],
  database: MaterialsDatabase,
): AnalysisResult {
  let totalScore = 0
  const materialBreakdown = []
  let totalWaterUsage = 0
  let totalCo2Emissions = 0
  const careInstructions = new Set<string>()
  const recommendedCertifications = new Set<string>()

  for (const materialComposition of materials) {
    const material = database.materials.find((m) => m.id === materialComposition.materialId)
    if (material) {
      const materialScore = material.sustainabilityScore.total
      totalScore += materialScore * (materialComposition.percentage / 100)

      materialBreakdown.push({
        id: material.id,
        name: material.name,
        percentage: materialComposition.percentage,
        category: material.category,
        score: materialScore,
      })

      // Sumar impacto ambiental ponderado
      if (typeof material.environmentalImpact.waterUsage.value === "number") {
        totalWaterUsage += material.environmentalImpact.waterUsage.value * (materialComposition.percentage / 100)
      }
      totalCo2Emissions += material.environmentalImpact.co2Emissions.value * (materialComposition.percentage / 100)

      // Agregar instrucciones de cuidado y certificaciones
      material.careInstructions.forEach((instruction) => careInstructions.add(instruction))
      material.certifications.forEach((certId) => recommendedCertifications.add(certId))
    }
  }

  const waterUsageUnit =
    materials.length > 0
      ? database.materials.find((m) => m.id === materials[0].materialId)?.environmentalImpact.waterUsage.unit ||
        "litros/kg"
      : "litros/kg"

  return {
    totalScore: Number.parseFloat(totalScore.toFixed(1)),
    materialBreakdown: materialBreakdown.sort((a, b) => b.percentage - a.percentage),
    environmentalImpact: {
      waterUsage: {
        value: Number.parseFloat(totalWaterUsage.toFixed(0)),
        unit: waterUsageUnit,
      },
      co2Emissions: {
        value: Number.parseFloat(totalCo2Emissions.toFixed(1)),
        unit: "kg CO₂e/kg",
      },
      chemicalUse: "Varies",
      biodegradationTime: "Varies",
    },
    careInstructions: Array.from(careInstructions),
    recommendedCertifications: Array.from(recommendedCertifications).map((certId) => {
      const certification = database.certifications.find((c) => c.id === certId)
      return certification
        ? certification
        : { id: certId, name: "Unknown", fullName: "Unknown", description: "", website: "" }
    }),
  }
}

export function getSustainabilityRating(score: number): { label: string; description: string; color: string } {
  if (score >= 8) {
    return {
      label: "Excelente",
      description: "Este producto está hecho con materiales altamente sostenibles y tiene un bajo impacto ambiental.",
      color: "green",
    }
  } else if (score >= 6.5) {
    return {
      label: "Bueno",
      description: "Este producto está hecho con materiales sostenibles y tiene un impacto ambiental moderado.",
      color: "lime",
    }
  } else if (score >= 5) {
    return {
      label: "Aceptable",
      description:
        "Este producto tiene un impacto ambiental aceptable, pero hay margen de mejora en la selección de materiales.",
      color: "yellow",
    }
  } else if (score >= 3) {
    return {
      label: "Regular",
      description:
        "Este producto tiene un impacto ambiental significativo y se recomienda buscar alternativas más sostenibles.",
      color: "orange",
    }
  } else {
    return {
      label: "Deficiente",
      description: "Este producto está hecho con materiales poco sostenibles y tiene un alto impacto ambiental.",
      color: "red",
    }
  }
}

// Función para extraer materiales del texto OCR
export function extractMaterialsFromOCR(text: string): MaterialComposition[] {
  if (!text) return []

  const materials: MaterialComposition[] = []
  const normalizedText = text
    .toLowerCase()
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos

  // Patrones para detectar materiales y porcentajes
  const patterns = [
    // Patrón 1: Porcentaje seguido de material - ej: "60% algodón"
    /(\d+)\s*%\s*([a-z]+(?:\s+[a-z]+)*)/g,

    // Patrón 2: Material seguido de porcentaje - ej: "algodón 60%"
    /([a-z]+(?:\s+[a-z]+)*)\s*:?\s*(\d+)\s*%/g,

    // Patrón 3: Material: porcentaje - ej: "algodón: 60%"
    /([a-z]+(?:\s+[a-z]+)*)\s*:\s*(\d+)\s*%/g,
  ]

  // Procesar cada patrón
  for (const pattern of patterns) {
    const matches = Array.from(normalizedText.matchAll(pattern))

    for (const match of matches) {
      let percentage: number
      let materialName: string

      if (pattern.toString().startsWith("/(\\d+)")) {
        // Primer patrón: número% material
        percentage = Number.parseInt(match[1], 10)
        materialName = match[2].trim()
      } else {
        // Segundo o tercer patrón: material número%
        materialName = match[1].trim()
        percentage = Number.parseInt(match[2], 10)
      }

      // Validar porcentaje
      if (!isNaN(percentage) && percentage > 0 && percentage <= 100) {
        const materialId = normalizeMaterialName(materialName)

        // Evitar duplicados
        if (!materials.some((m) => m.materialId === materialId)) {
          materials.push({
            materialId,
            percentage,
          })
        }
      }
    }
  }

  // Verificar si los porcentajes suman 100%
  const totalPercentage = materials.reduce((sum, material) => sum + material.percentage, 0)

  // Si los porcentajes no suman 100% pero están cerca, ajustar
  if (
    materials.length > 0 &&
    totalPercentage > 0 &&
    totalPercentage !== 100 &&
    totalPercentage < 110 &&
    totalPercentage > 90
  ) {
    // Ajustar el porcentaje del material con mayor proporción
    const sortedMaterials = [...materials].sort((a, b) => b.percentage - a.percentage)
    const mainMaterial = sortedMaterials[0]
    const diff = 100 - totalPercentage

    // Encontrar el índice del material principal en el array original
    const mainIndex = materials.findIndex((m) => m.materialId === mainMaterial.materialId)
    if (mainIndex !== -1) {
      materials[mainIndex].percentage += diff
    }
  }

  return materials
}

// Función auxiliar para normalizar nombres de materiales
function normalizeMaterialName(name: string): string {
  if (!name) return "unknown"

  const normalizedName = name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos

  // Mapeo de nombres comunes a IDs de materiales
  const materialMappings: Record<string, string> = {
    // Algodón
    algodon: "cotton_conv",
    cotton: "cotton_conv",
    algodón: "cotton_conv",
    "algodón orgánico": "cotton_org",
    "algodon organico": "cotton_org",
    "organic cotton": "cotton_org",

    // Poliéster
    poliester: "polyester",
    polyester: "polyester",
    poliéster: "polyester",
    "poliéster reciclado": "recycled_polyester",
    "poliester reciclado": "recycled_polyester",
    "recycled polyester": "recycled_polyester",

    // Nylon
    nylon: "nylon",
    "nylon reciclado": "recycled_nylon",
    "recycled nylon": "recycled_nylon",

    // Acrílico
    acrilico: "acrylic",
    acrílico: "acrylic",
    acrylic: "acrylic",

    // Lana
    lana: "wool",
    wool: "wool",

    // Lino
    lino: "linen",
    linen: "linen",

    // Cáñamo
    cañamo: "hemp",
    cáñamo: "hemp",
    hemp: "hemp",

    // Seda
    seda: "silk",
    silk: "silk",

    // Viscosa
    viscosa: "viscose",
    viscose: "viscose",
    rayon: "viscose",

    // Lyocell
    lyocell: "lyocell",
    tencel: "lyocell",

    // Modal
    modal: "modal",

    // Elastano
    elastano: "elastane",
    elastane: "elastane",
    spandex: "elastane",
    lycra: "elastane",

    // Bambú
    bambu: "bamboo_viscose",
    bambú: "bamboo_viscose",
    bamboo: "bamboo_viscose",
  }

  // Buscar coincidencias exactas
  if (materialMappings[normalizedName]) {
    return materialMappings[normalizedName]
  }

  // Buscar coincidencias parciales
  for (const [key, value] of Object.entries(materialMappings)) {
    if (normalizedName.includes(key)) {
      return value
    }
  }

  // Si no hay coincidencias, usar el nombre normalizado como ID
  return normalizedName.replace(/\s+/g, "_")
}

// Asignar la función normalizeMaterialName como propiedad de extractMaterialsFromOCR
// para que pueda ser accedida desde otras partes del código
extractMaterialsFromOCR.normalizeMaterialName = normalizeMaterialName
