"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Minus, Check } from "lucide-react"
import { loadMaterialsDatabase } from "@/lib/materials-utils"

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [databaseMaterials, setDatabaseMaterials] = useState<string[]>([])
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true)

  // Cargar materiales de la base de datos
  useEffect(() => {
    async function fetchMaterials() {
      try {
        setIsLoadingMaterials(true)
        const database = await loadMaterialsDatabase()
        const materialNames = database.materials.map((material) => material.name)
        setDatabaseMaterials(materialNames)
      } catch (error) {
        console.error("Error cargando materiales:", error)
        // Fallback a la lista estática en caso de error
        setDatabaseMaterials([
          "Algodón",
          "Algodón orgánico",
          "Poliéster",
          "Poliéster reciclado",
          "Lana",
          "Seda",
          "Lino",
          "Viscosa",
          "Elastano",
          "Acrílico",
          "Nylon",
          "Nylon reciclado",
          "Lyocell (Tencel)",
          "Modal",
          "Bambú",
          "Cáñamo",
          "Rayón",
          "Spandex",
          "Lycra",
        ])
      } finally {
        setIsLoadingMaterials(false)
      }
    }

    fetchMaterials()
  }, [])

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
    // Limpiar el error de validación cuando el usuario hace cambios
    setValidationError(null)
  }

  const handleSubmit = () => {
    try {
      // Prevenir múltiples envíos
      if (isSubmitting) return
      setIsSubmitting(true)
      setValidationError(null)

      console.log("Validating materials before submission:", materials)

      // Validar que todos los campos estén completos
      const emptyNames = materials.some((m) => m.name.trim() === "")
      if (emptyNames) {
        setValidationError("Por favor, ingresa un nombre para cada material")
        setIsSubmitting(false)
        return
      }

      const invalidPercentages = materials.some((m) => m.percentage <= 0 || m.percentage > 100)
      if (invalidPercentages) {
        setValidationError("Los porcentajes deben estar entre 1 y 100")
        setIsSubmitting(false)
        return
      }

      // Validar que los porcentajes sumen exactamente 100%
      const totalPercentage = materials.reduce((sum, m) => sum + m.percentage, 0)
      if (totalPercentage !== 100) {
        setValidationError(`Los porcentajes deben sumar exactamente 100%. Actualmente suman ${totalPercentage}%`)
        setIsSubmitting(false)
        return
      }

      console.log("Submitting materials:", materials)

      // Llamar a la función onSubmit con los materiales
      onSubmit(materials)

      // Nota: No reseteamos isSubmitting aquí porque esperamos que la navegación
      // a la página de resultados ocurra después de un procesamiento exitoso
    } catch (error) {
      console.error("Error al enviar materiales:", error)
      setValidationError(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-[#415643] mb-4">Ingresa los materiales manualmente</h2>

      <div className="space-y-4 mb-6">
        {materials.map((material, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder={isLoadingMaterials ? "Cargando materiales..." : "Nombre del material"}
                value={material.name}
                onChange={(e) => updateMaterial(index, "name", e.target.value)}
                list={`materials-list-${index}`}
                className={material.name.trim() === "" ? "border-red-300" : ""}
                disabled={isLoadingMaterials}
              />
              <datalist id={`materials-list-${index}`}>
                {databaseMaterials.map((m, i) => (
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
                className={material.percentage <= 0 || material.percentage > 100 ? "border-red-300" : ""}
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
        <Button variant="outline" size="sm" onClick={addMaterial} disabled={materials.length >= 5 || isSubmitting}>
          <Plus size={16} className="mr-1" /> Añadir material
        </Button>

        <div
          className={`text-sm font-medium ${
            materials.reduce((sum, m) => sum + m.percentage, 0) !== 100 ? "text-red-500" : "text-green-600"
          }`}
        >
          Total: {materials.reduce((sum, m) => sum + m.percentage, 0)}%
          {materials.reduce((sum, m) => sum + m.percentage, 0) !== 100 && " (debe ser 100%)"}
        </div>
      </div>

      {validationError && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">{validationError}</div>
      )}

      <Button
        className="flex-1 bg-[#415643]"
        onClick={handleSubmit}
        disabled={
          isSubmitting ||
          materials.some((m) => m.name.trim() === "") ||
          materials.some((m) => m.percentage <= 0 || m.percentage > 100) ||
          materials.reduce((sum, m) => sum + m.percentage, 0) !== 100
        }
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Procesando...
          </>
        ) : (
          <>
            <Check size={16} className="mr-1" /> Confirmar
          </>
        )}
      </Button>
    </div>
  )
}
