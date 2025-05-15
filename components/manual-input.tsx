"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Minus, Check } from "lucide-react"

interface MaterialInput {
  name: string
  percentage: number
}

interface ManualInputProps {
  onSubmit: (materials: MaterialInput[]) => void
  onCancel: () => void
}

export default function ManualInput({ onSubmit, onCancel }: ManualInputProps) {
  const [materials, setMaterials] = useState<MaterialInput[]>([{ name: "", percentage: 100 }])

  const addMaterial = () => {
    if (materials.length < 5) {
      // Ajustar los porcentajes para que sumen 100%
      const newPercentage = Math.floor(100 / (materials.length + 1))
      const updatedMaterials = materials.map((m) => ({
        ...m,
        percentage: newPercentage,
      }))

      setMaterials([...updatedMaterials, { name: "", percentage: newPercentage }])
    }
  }

  const removeMaterial = (index: number) => {
    if (materials.length > 1) {
      const newMaterials = materials.filter((_, i) => i !== index)

      // Redistribuir el porcentaje del material eliminado
      const removedPercentage = materials[index].percentage
      const percentagePerMaterial = Math.floor(removedPercentage / newMaterials.length)

      const updatedMaterials = newMaterials.map((m, i) => ({
        ...m,
        percentage:
          m.percentage +
          (i < newMaterials.length - 1
            ? percentagePerMaterial
            : removedPercentage - percentagePerMaterial * (newMaterials.length - 1)),
      }))

      setMaterials(updatedMaterials)
    }
  }

  const updateMaterial = (index: number, field: "name" | "percentage", value: string | number) => {
    const updatedMaterials = [...materials]
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      [field]: value,
    }
    setMaterials(updatedMaterials)
  }

  const handleSubmit = () => {
    // Validar que todos los campos estén completos
    const isValid = materials.every((m) => m.name.trim() !== "" && m.percentage > 0)

    if (isValid) {
      // Normalizar los porcentajes para asegurar que sumen 100%
      const totalPercentage = materials.reduce((sum, m) => sum + m.percentage, 0)

      let normalizedMaterials
      if (totalPercentage !== 100) {
        const factor = 100 / totalPercentage
        normalizedMaterials = materials.map((m) => ({
          ...m,
          percentage: Math.round(m.percentage * factor),
        }))

        // Ajustar el último material para asegurar que sumen exactamente 100%
        const newTotal = normalizedMaterials.reduce((sum, m) => sum + m.percentage, 0)
        if (newTotal !== 100) {
          normalizedMaterials[normalizedMaterials.length - 1].percentage += 100 - newTotal
        }
      } else {
        normalizedMaterials = materials
      }

      onSubmit(normalizedMaterials)
    } else {
      alert("Por favor completa todos los campos correctamente")
    }
  }

  // Lista de materiales comunes para sugerencias
  const commonMaterials = [
    "Algodón",
    "Poliéster",
    "Lana",
    "Seda",
    "Lino",
    "Viscosa",
    "Elastano",
    "Acrílico",
    "Nylon",
    "Lyocell",
  ]

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-[#415643] mb-4">Ingresa los materiales manualmente</h2>

      <div className="space-y-4 mb-6">
        {materials.map((material, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Nombre del material"
                value={material.name}
                onChange={(e) => updateMaterial(index, "name", e.target.value)}
                list={`materials-list-${index}`}
              />
              <datalist id={`materials-list-${index}`}>
                {commonMaterials.map((m, i) => (
                  <option key={i} value={m} />
                ))}
              </datalist>
            </div>
            <div className="w-20">
              <Input
                type="number"
                min="1"
                max="100"
                value={material.percentage}
                onChange={(e) => updateMaterial(index, "percentage", Number.parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="w-8 flex justify-center">
              <button
                onClick={() => removeMaterial(index)}
                disabled={materials.length === 1}
                className="text-red-500 disabled:text-gray-300"
              >
                <Minus size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mb-6">
        <Button variant="outline" size="sm" onClick={addMaterial} disabled={materials.length >= 5}>
          <Plus size={16} className="mr-1" /> Añadir material
        </Button>

        <div className="text-sm text-gray-500">Total: {materials.reduce((sum, m) => sum + m.percentage, 0)}%</div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button className="flex-1 bg-[#415643]" onClick={handleSubmit}>
          <Check size={16} className="mr-1" /> Confirmar
        </Button>
      </div>
    </div>
  )
}
