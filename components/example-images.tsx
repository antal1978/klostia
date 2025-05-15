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
    setSelectedImage(index)

    // Asegurarnos de que los materiales predefinidos tengan la estructura correcta
    const materials = examples[index].predefinedMaterials.map((material) => {
      // Si ya tiene materialId pero no name, añadir un name basado en el materialId
      if (material.materialId && !material.name) {
        // Convertir materialId a un nombre legible (ej: "cotton_conv" -> "Algodón convencional")
        let name = material.materialId
          .replace(/_/g, " ")
          .replace(/conv/g, "convencional")
          .replace(/org/g, "orgánico")
          .replace(/recycled/g, "reciclado")

        // Capitalizar primera letra
        name = name.charAt(0).toUpperCase() + name.slice(1)

        return {
          ...material,
          name,
        }
      }
      return material
    })

    // Usar los materiales procesados
    onSelectImage("data:image/png;base64,example", materials)
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
