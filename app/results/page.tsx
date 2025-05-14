"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Leaf, Droplet, Clock, Recycle, Info, Award } from "lucide-react"
import { useRouter } from "next/navigation"

// Datos de ejemplo para simular el análisis
const exampleAnalysis = {
  materials: [
    { name: "Algodón", percentage: 60 },
    { name: "Poliéster", percentage: 40 },
  ],
  score: 6.5,
  waterUsage: "2,100 litros",
  co2Emissions: "4.2 kg",
  biodegradability: "~15 años",
  careInstructions: [
    "Lavar a máquina a 30°C máximo",
    "No usar blanqueador",
    "Secar a la sombra",
    "Planchar a temperatura media",
    "No lavar en seco",
  ],
  certifications: [
    {
      name: "GOTS (Global Organic Textile Standard)",
      description: "Certifica que los textiles contienen un mínimo de 70% de fibras orgánicas.",
    },
    {
      name: "OEKO-TEX Standard 100",
      description: "Garantiza que los textiles están libres de sustancias nocivas.",
    },
    {
      name: "BCI (Better Cotton Initiative)",
      description: "Promueve mejores estándares en el cultivo de algodón.",
    },
  ],
}

export default function ResultsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("score")

  // Función para determinar el color del puntaje
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 5) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#415643] text-white p-4 flex items-center">
        <button onClick={() => router.push("/")} className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-white mb-0">Resultados del Análisis</h1>
      </header>

      <div className="p-4 bg-[#D9BCA3]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-[#2E2E2E] mb-1">Composición detectada:</h2>
            <div className="text-sm">
              {exampleAnalysis.materials.map((material, index) => (
                <span key={index}>
                  {material.name} {material.percentage}%{index < exampleAnalysis.materials.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`text-3xl font-bold ${getScoreColor(exampleAnalysis.score)}`}>
              {exampleAnalysis.score}/10
            </div>
            <div className="text-xs text-[#2E2E2E]">Eco Score</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <Tabs defaultValue="score" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="score" className="data-[state=active]:bg-[#415643] data-[state=active]:text-white">
              Análisis
            </TabsTrigger>
            <TabsTrigger value="care" className="data-[state=active]:bg-[#415643] data-[state=active]:text-white">
              Cuidados
            </TabsTrigger>
            <TabsTrigger
              value="certifications"
              className="data-[state=active]:bg-[#415643] data-[state=active]:text-white"
            >
              Certificaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="score">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-4">Impacto Ambiental</h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <Droplet className="h-6 w-6 text-[#A67D88] mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Consumo de agua</h3>
                      <p className="text-sm mb-1">{exampleAnalysis.waterUsage}</p>
                      <p className="text-xs text-gray-600">Equivalente a 14 días de consumo de agua de una persona.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Recycle className="h-6 w-6 text-[#A67D88] mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Emisiones de CO₂</h3>
                      <p className="text-sm mb-1">{exampleAnalysis.co2Emissions}</p>
                      <p className="text-xs text-gray-600">Equivalente a conducir un coche durante 25 km.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="h-6 w-6 text-[#A67D88] mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Tiempo de biodegradación</h3>
                      <p className="text-sm mb-1">{exampleAnalysis.biodegradability}</p>
                      <p className="text-xs text-gray-600">
                        El poliéster puede tardar hasta 200 años en descomponerse.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-3">Desglose por Material</h2>

                {exampleAnalysis.materials.map((material, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold">{material.name}</h3>
                      <span>{material.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${material.name.toLowerCase() === "algodón" ? "bg-green-500" : "bg-yellow-500"}`}
                        style={{ width: `${material.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1 text-gray-600">
                      {material.name.toLowerCase() === "algodón"
                        ? "Fibra natural, biodegradable, alto consumo de agua"
                        : "Fibra sintética, derivada del petróleo, no biodegradable"}
                    </p>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-[#F5F1EC] rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-[#415643] mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm mb-0">
                      Las mezclas de materiales naturales y sintéticos suelen ser más difíciles de reciclar. Considera
                      prendas con un solo tipo de material para facilitar su reciclaje al final de su vida útil.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-4">Cuidados Recomendados</h2>

                <div className="space-y-4">
                  <p className="text-sm">
                    Siguiendo estas recomendaciones, prolongarás la vida útil de tu prenda y reducirás su impacto
                    ambiental:
                  </p>

                  <ul className="space-y-3">
                    {exampleAnalysis.careInstructions.map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <Leaf className="h-5 w-5 text-[#415643] mr-2 mt-0.5 flex-shrink-0" />
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-4">Consejos Adicionales</h2>

                <div className="space-y-4">
                  <div className="p-4 bg-[#F5F1EC] rounded-lg">
                    <h3 className="font-semibold mb-2">Para prendas con algodón:</h3>
                    <ul className="text-sm space-y-2">
                      <li>Lavar con agua fría para evitar encogimiento</li>
                      <li>Evitar secadora para reducir el desgaste de las fibras</li>
                      <li>Usar detergentes suaves y ecológicos</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#F5F1EC] rounded-lg">
                    <h3 className="font-semibold mb-2">Para prendas con poliéster:</h3>
                    <ul className="text-sm space-y-2">
                      <li>Lavar a temperaturas bajas para evitar la liberación de microplásticos</li>
                      <li>Considerar el uso de bolsas de lavado especiales para microfibras</li>
                      <li>Secar al aire libre para ahorrar energía</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#F5F1EC] rounded-lg">
                    <h3 className="font-semibold mb-2">Fin de vida útil:</h3>
                    <p className="text-sm">
                      Cuando ya no uses esta prenda, considera donarla, reciclarla o transformarla en algo nuevo en
                      lugar de desecharla.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-4">Certificaciones Relevantes</h2>

                <p className="text-sm mb-4">
                  Estas son las certificaciones que deberías buscar para prendas con los materiales analizados:
                </p>

                <div className="space-y-4">
                  {exampleAnalysis.certifications.map((cert, index) => (
                    <div key={index} className="p-4 bg-[#F5F1EC] rounded-lg">
                      <div className="flex items-start">
                        <Award className="h-5 w-5 text-[#A67D88] mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold">{cert.name}</h3>
                          <p className="text-sm mb-0">{cert.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-[#415643] mb-4">¿Por qué son importantes?</h2>

                <p className="text-sm">
                  Las certificaciones textiles garantizan que los productos cumplen con estándares específicos de
                  sostenibilidad, ética laboral y seguridad para la salud.
                </p>

                <div className="mt-4 p-4 bg-[#F5F1EC] rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-[#415643] mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm mb-0">
                      Al elegir prendas con certificaciones reconocidas, estás apoyando prácticas más sostenibles en la
                      industria textil y ejerciendo tu poder como consumidor consciente.
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link href="https://www.global-standard.org/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="text-[#415643] border-[#415643] mb-2 w-full">
                      Más sobre GOTS
                    </Button>
                  </Link>
                  <Link href="https://www.oeko-tex.com/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="text-[#415643] border-[#415643] mb-2 w-full">
                      Más sobre OEKO-TEX
                    </Button>
                  </Link>
                  <Link href="https://bettercotton.org/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="text-[#415643] border-[#415643] w-full">
                      Más sobre BCI
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 mb-4">
          <Link href="/analyze">
            <Button className="w-full bg-[#A67D88] hover:bg-[#A67D88]/90">Analizar otra prenda</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
