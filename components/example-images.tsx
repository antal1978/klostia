"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileImage } from "lucide-react"

interface ExampleImagesProps {
  onSelectImage: (imageData: string, predefinedMaterials?: any) => void
}

export default function ExampleImages({ onSelectImage }: ExampleImagesProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  // Ejemplos simplificados y robustos para producción
  const examples = [
    {
      id: 1,
      src: "/examples/example1.png",
      description: "100% Algodón",
      predefinedMaterials: [{ materialId: "cotton_conv", percentage: 100 }],
    },
    {
      id: 2,
      src: "/examples/example2.png",
      description: "60% Poliéster, 40% Algodón",
      predefinedMaterials: [
        { materialId: "polyester", percentage: 60 },
        { materialId: "cotton_conv", percentage: 40 },
      ],
    },
    {
      id: 3,
      src: "/examples/example3.png",
      description: "95% Lana, 5% Elastano",
      predefinedMaterials: [
        { materialId: "wool", percentage: 95 },
        { materialId: "elastane", percentage: 5 },
      ],
    },
  ]

  const handleSelectImage = (index: number) => {
    try {
      setSelectedImage(index)
      console.log("Example selected:", examples[index].description)

      // Verificar que el ejemplo existe
      if (!examples[index] || !examples[index].predefinedMaterials) {
        console.error("Invalid example or missing predefined materials")
        onSelectImage("data:image/png;base64,example", [{ materialId: "cotton_conv", percentage: 100 }])
        return
      }

      // Crear una copia profunda de los materiales para evitar problemas de referencia
      const materials = JSON.parse(JSON.stringify(examples[index].predefinedMaterials))

      // Verificar que cada material tenga los campos requeridos
      const validMaterials = materials.map((material: any) => {
        // Asegurarse de que materialId y percentage existan y sean válidos
        return {
          materialId: material.materialId || "cotton_conv", // Valor por defecto
          percentage: typeof material.percentage === "number" ? material.percentage : 100, // Valor por defecto
        }
      })

      console.log("Processed example materials:", validMaterials)

      // Usar los materiales procesados
      onSelectImage("data:image/png;base64,example", validMaterials)
    } catch (error) {
      console.error("Error in handleSelectImage:", error)
      // Fallback a un material por defecto en caso de error
      onSelectImage("data:image/png;base64,example", [{ materialId: "cotton_conv", percentage: 100 }])
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold text-[#415643] mb-4">Ejemplos de composición</h2>
        <p className="text-sm text-gray-600 mb-4">Selecciona un ejemplo para probar el análisis de sostenibilidad:</p>

        <div className="grid grid-cols-1 gap-4">
          {examples.map((example, index) => (
            <Button
              key={example.id}
              variant="outline"
              className={`flex items-center justify-start p-4 h-auto ${
                selectedImage === index ? "border-[#415643] bg-green-50" : ""
              }`}
              onClick={() => handleSelectImage(index)}
            >
              <FileImage className="h-5 w-5 mr-3 text-[#415643]" />
              <span className="text-left">{example.description}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
