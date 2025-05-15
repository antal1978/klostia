"use client"

import { useState } from "react"
import Image from "next/image"
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

  const handleSelectImage = async (index: number) => {
    setSelectedImage(index)

    try {
      // Cargar la imagen como blob
      const response = await fetch(examples[index].src)
      const blob = await response.blob()

      // Convertir a base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64data = reader.result as string
        // Pasar también los materiales predefinidos
        onSelectImage(base64data, examples[index].predefinedMaterials)
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error("Error loading example image:", error)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold text-[#415643] mb-4">Imágenes de ejemplo</h2>
        <p className="text-sm text-gray-600 mb-4">
          Selecciona una imagen de ejemplo para probar el funcionamiento del análisis:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examples.map((example, index) => (
            <div
              key={example.id}
              className={`border rounded-lg p-2 cursor-pointer transition-all ${
                selectedImage === index ? "border-[#415643] bg-green-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleSelectImage(index)}
            >
              <div className="aspect-square relative overflow-hidden rounded-md mb-2">
                <Image
                  src={example.src || "/placeholder.svg"}
                  alt={`Ejemplo ${example.id}`}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-center font-medium">{example.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Button
            onClick={() => selectedImage !== null && handleSelectImage(selectedImage)}
            disabled={selectedImage === null}
            className="bg-[#415643] hover:bg-[#415643]/90"
          >
            <FileImage className="mr-2 h-4 w-4" />
            Usar imagen seleccionada
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
