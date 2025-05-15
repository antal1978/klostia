"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Leaf, Droplet, Factory, Recycle, Clock, Info, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { loadMaterialsDatabase, type Material, type MaterialsDatabase } from "@/lib/materials-utils"

export default function MaterialsPage() {
  const router = useRouter()
  const [materialsDB, setMaterialsDB] = useState<MaterialsDatabase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedMaterial1, setSelectedMaterial1] = useState<string | null>(null)
  const [selectedMaterial2, setSelectedMaterial2] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("browse")

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const database = await loadMaterialsDatabase()
        setMaterialsDB(database)

        // Seleccionar materiales por defecto para comparación
        if (database.materials.length > 0) {
          // Buscar algodón convencional y orgánico para comparación inicial
          const cottonConv = database.materials.find((m) => m.id === "cotton_conv")
          const cottonOrg = database.materials.find((m) => m.id === "cotton_org")

          if (cottonConv && cottonOrg) {
            setSelectedMaterial1(cottonConv.id)
            setSelectedMaterial2(cottonOrg.id)
          } else {
            // Si no se encuentran, usar los dos primeros materiales
            setSelectedMaterial1(database.materials[0].id)
            setSelectedMaterial2(database.materials.length > 1 ? database.materials[1].id : database.materials[0].id)
          }
        }
      } catch (err) {
        console.error("Error loading materials database:", err)
        setError("Error al cargar la base de datos de materiales")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filtrar materiales por categoría
  const filteredMaterials =
    materialsDB?.materials.filter(
      (material) =>
        selectedCategory === "all" || material.category.toLowerCase().includes(selectedCategory.toLowerCase()),
    ) || []

  // Obtener material seleccionado 1
  const material1 = materialsDB?.materials.find((m) => m.id === selectedMaterial1) || null

  // Obtener material seleccionado 2
  const material2 = materialsDB?.materials.find((m) => m.id === selectedMaterial2) || null

  // Función para obtener el color de la puntuación
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6.5) return "text-yellow-600"
    if (score >= 5) return "text-orange-500"
    return "text-red-600"
  }

  // Función para obtener el color de la barra de progreso
  const getProgressColor = (score: number) => {
    if (score >= 8) return "bg-green-500"
    if (score >= 6.5) return "bg-lime-500"
    if (score >= 5) return "bg-yellow-500"
    if (score >= 3) return "bg-orange-500"
    return "bg-red-500"
  }

  // Renderizar tarjeta de material
  const renderMaterialCard = (material: Material) => (
    <Card key={material.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">{material.name}</h3>
          <div className={`text-2xl font-bold ${getScoreColor(material.sustainabilityScore.total)}`}>
            {material.sustainabilityScore.total}/10
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <span className="inline-block px-2 py-0.5 bg-gray-100 rounded-full mr-2">{material.category}</span>
        </div>

        <p className="text-sm mb-4">{material.description}</p>

        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Uso de agua</span>
              <span>
                {typeof material.environmentalImpact.waterUsage.value === "string"
                  ? material.environmentalImpact.waterUsage.value
                  : `${material.environmentalImpact.waterUsage.value}`}{" "}
                {material.environmentalImpact.waterUsage.unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-blue-500"
                style={{ width: `${material.sustainabilityScore.water * 20}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Emisiones CO₂</span>
              <span>
                {material.environmentalImpact.co2Emissions.value} {material.environmentalImpact.co2Emissions.unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-green-500"
                style={{ width: `${material.sustainabilityScore.co2 * 20}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Uso de químicos</span>
              <span>{material.environmentalImpact.chemicalUse}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-purple-500"
                style={{ width: `${material.sustainabilityScore.chemicals * 20}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Biodegradación</span>
              <span>{material.environmentalImpact.biodegradationTime}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-amber-500"
                style={{ width: `${material.sustainabilityScore.biodegradation * 20}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="text-sm">
          <h4 className="font-medium mb-2">Certificaciones recomendadas:</h4>
          <div className="flex flex-wrap gap-1">
            {material.certifications.map((certId) => {
              const cert = materialsDB?.certifications.find((c) => c.id === certId)
              return cert ? (
                <span
                  key={certId}
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700"
                  title={cert.fullName}
                >
                  {cert.name}
                </span>
              ) : null
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Renderizar comparación de materiales
  const renderComparison = () => {
    if (!material1 || !material2) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-4">{material1.name}</h3>
          <div className={`text-2xl font-bold ${getScoreColor(material1.sustainabilityScore.total)} mb-4`}>
            {material1.sustainabilityScore.total}/10
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <Droplet className="h-5 w-5 text-[#A67D88] mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Uso de agua</h4>
                <p className="text-sm">
                  {typeof material1.environmentalImpact.waterUsage.value === "string"
                    ? material1.environmentalImpact.waterUsage.value
                    : `${material1.environmentalImpact.waterUsage.value}`}{" "}
                  {material1.environmentalImpact.waterUsage.unit}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Factory className="h-5 w-5 text-[#A67D88] mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Emisiones CO₂</h4>
                <p className="text-sm">
                  {material1.environmentalImpact.co2Emissions.value} {material1.environmentalImpact.co2Emissions.unit}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Recycle className="h-5 w-5 text-[#A67D88] mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Uso de químicos</h4>
                <p className="text-sm">{material1.environmentalImpact.chemicalUse}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="h-5 w-5 text-[#A67D88] mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Biodegradación</h4>
                <p className="text-sm">{material1.environmentalImpact.biodegradationTime}</p>
              </div>
            </div>
          </div>

          <div className="text-sm">
            <h4 className="font-medium mb-2">Certificaciones:</h4>
            <div className="flex flex-wrap gap-1">
              {material1.certifications.map((certId) => {
                const cert = materialsDB?.certifications.find((c) => c.id === certId)
                return cert ? (
                  <span
                    key={certId}
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700"
                    title={cert.fullName}
                  >
                    {cert.name}
                  </span>
                ) : null
              })}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">{material2.name}</h3>
          <div className={`text-2xl font-bold ${getScoreColor(material2.sustainabilityScore.total)} mb-4`}>
            {material2.sustainabilityScore.total}/10
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <Droplet className="h-5 w-5 text-[#A67D88] mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Uso de agua</h4>
                <p className="text-sm">
                  {typeof material2.environmentalImpact.waterUsage.value === "string"
                    ? material2.environmentalImpact.waterUsage.value
                    : `${material2.environmentalImpact.waterUsage.value}`}{" "}
                  {material2.environmentalImpact.waterUsage.unit}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Factory className="h-5 w-5 text-[#A67D88] mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Emisiones CO₂</h4>
                <p className="text-sm">
                  {material2.environmentalImpact.co2Emissions.value} {material2.environmentalImpact.co2Emissions.unit}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Recycle className="h-5 w-5 text-[#A67D88] mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Uso de químicos</h4>
                <p className="text-sm">{material2.environmentalImpact.chemicalUse}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="h-5 w-5 text-[#A67D88] mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Biodegradación</h4>
                <p className="text-sm">{material2.environmentalImpact.biodegradationTime}</p>
              </div>
            </div>
          </div>

          <div className="text-sm">
            <h4 className="font-medium mb-2">Certificaciones:</h4>
            <div className="flex flex-wrap gap-1">
              {material2.certifications.map((certId) => {
                const cert = materialsDB?.certifications.find((c) => c.id === certId)
                return cert ? (
                  <span
                    key={certId}
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700"
                    title={cert.fullName}
                  >
                    {cert.name}
                  </span>
                ) : null
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-[#415643] text-white p-4 flex items-center">
          <button onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-white mb-0">Materiales Textiles</h1>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#415643] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#2E2E2E]">Cargando materiales...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !materialsDB) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-[#415643] text-white p-4 flex items-center">
          <button onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-white mb-0">Materiales Textiles</h1>
        </header>
        <div className="flex-1 p-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p>{error || "No se pudo cargar la base de datos de materiales"}</p>
              <div className="mt-6">
                <Button onClick={() => router.push("/")} className="bg-[#415643] hover:bg-[#415643]/90">
                  Volver al inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#415643] text-white p-4 flex items-center">
        <button onClick={() => router.push("/")} className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-white mb-0">Materiales Textiles</h1>
      </header>

      <div className="p-4 bg-[#D9BCA3]">
        <div className="flex items-center">
          <Leaf className="h-5 w-5 text-[#415643] mr-2" />
          <h2 className="text-lg font-semibold text-[#2E2E2E]">Explora y compara materiales textiles</h2>
        </div>
      </div>

      <div className="flex-1 p-4">
        <Tabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="browse" className="data-[state=active]:bg-[#415643] data-[state=active]:text-white">
              Explorar
            </TabsTrigger>
            <TabsTrigger value="compare" className="data-[state=active]:bg-[#415643] data-[state=active]:text-white">
              Comparar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-[#415643]" />
                <h3 className="font-medium">Filtrar por categoría:</h3>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="natural animal">Natural animal</SelectItem>
                  <SelectItem value="sintético">Sintético</SelectItem>
                  <SelectItem value="sintético reciclado">Sintético reciclado</SelectItem>
                  <SelectItem value="semi-sintético">Semi-sintético</SelectItem>
                  <SelectItem value="alternativo">Alternativo</SelectItem>
                  <SelectItem value="biotecnológico">Biotecnológico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredMaterials.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Info className="h-8 w-8 text-[#415643] mx-auto mb-2" />
                    <p>No se encontraron materiales en esta categoría</p>
                  </CardContent>
                </Card>
              ) : (
                filteredMaterials.map((material) => renderMaterialCard(material))
              )}
            </div>
          </TabsContent>

          <TabsContent value="compare">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Material 1:</label>
                <Select value={selectedMaterial1 || undefined} onValueChange={setSelectedMaterial1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialsDB.materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Material 2:</label>
                <Select value={selectedMaterial2 || undefined} onValueChange={setSelectedMaterial2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialsDB.materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4 text-center">Comparación de Materiales</h3>
                {renderComparison()}

                <div className="mt-6 p-4 bg-[#F5F1EC] rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-[#415643] mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm mb-0">
                      La elección de materiales sostenibles puede reducir significativamente el impacto ambiental de tus
                      prendas. Considera materiales naturales o reciclados con certificaciones reconocidas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Link href="/">
            <Button className="w-full bg-[#A67D88] hover:bg-[#A67D88]/90">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
