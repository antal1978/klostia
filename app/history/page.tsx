"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Clock, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface HistoryItem {
  id: string
  date: string
  materials: { name: string; percentage: number }[]
  score: number
}

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    // Cargar el historial desde localStorage
    const savedHistory = localStorage.getItem("analysisHistory")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (err) {
        console.error("Error parsing history:", err)
      }
    }
  }, [])

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem("analysisHistory", JSON.stringify(updatedHistory))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("analysisHistory")
  }

  // Función para determinar el color del puntaje
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6.5) return "text-yellow-600"
    if (score >= 5) return "text-orange-500"
    return "text-red-600"
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#415643] text-white p-4 flex items-center">
        <button onClick={() => router.push("/")} className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-white mb-0">Historial de Análisis</h1>
      </header>

      <div className="flex-1 p-4">
        {history.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#415643] mb-2">No hay análisis guardados</h2>
              <p className="text-gray-500 mb-4">
                Tus análisis de prendas aparecerán aquí para que puedas consultarlos en el futuro.
              </p>
              <Link href="/analyze">
                <Button className="bg-[#415643] hover:bg-[#415643]/90">Analizar una prenda</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Tus análisis recientes</h2>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-500 hover:bg-red-50"
                onClick={clearHistory}
              >
                Borrar todo
              </Button>
            </div>

            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.id} className="relative">
                  <CardContent className="pt-6">
                    <button
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                      onClick={() => deleteHistoryItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {item.date}
                        </div>
                        <div className="font-medium">
                          {item.materials.map((material, index) => (
                            <span key={index}>
                              {material.name} {material.percentage}%{index < item.materials.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className={`text-xl font-bold ${getScoreColor(item.score)}`}>{item.score}/10</div>
                    </div>

                    <div className="mt-4 flex">
                      <Link href={`/results?id=${item.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          Ver detalles
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <Link href="/">
          <Button className="w-full bg-[#A67D88] hover:bg-[#A67D88]/90">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  )
}
