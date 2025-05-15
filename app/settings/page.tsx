"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Moon, Sun, Wifi, WifiOff, Camera } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [ocrService, setOcrService] = useState<string>("google")
  const [offlineMode, setOfflineMode] = useState(false)

  useEffect(() => {
    // Cargar preferencias guardadas
    const savedSettings = localStorage.getItem("appSettings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setDarkMode(settings.darkMode || false)
        setOcrService(settings.ocrService || "google")
        setOfflineMode(settings.offlineMode || false)
      } catch (err) {
        console.error("Error parsing settings:", err)
      }
    }
  }, [])

  // Guardar configuración
  const saveSettings = () => {
    const settings = {
      darkMode,
      ocrService,
      offlineMode,
    }
    localStorage.setItem("appSettings", JSON.stringify(settings))

    // Mostrar notificación de guardado exitoso
    alert("Configuración guardada correctamente")
  }

  // Cambiar tema oscuro/claro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    // Aquí se implementaría la lógica para cambiar el tema
  }

  // Cambiar modo offline
  const toggleOfflineMode = () => {
    setOfflineMode(!offlineMode)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#415643] text-white p-4 flex items-center">
        <button onClick={() => router.push("/")} className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-white mb-0">Configuración</h1>
      </header>

      <div className="flex-1 p-4">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-[#415643] mb-4">Apariencia</h2>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-[#A67D88] mr-3" />
                ) : (
                  <Sun className="h-5 w-5 text-[#A67D88] mr-3" />
                )}
                <div>
                  <h3 className="font-medium">Modo oscuro</h3>
                  <p className="text-sm text-gray-500">Cambiar entre tema claro y oscuro</p>
                </div>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
                className="data-[state=checked]:bg-[#415643]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-[#415643] mb-4">Reconocimiento de texto</h2>

            <div className="mb-6">
              <div className="flex items-center mb-2">
                <Camera className="h-5 w-5 text-[#A67D88] mr-3" />
                <h3 className="font-medium">Servicio OCR</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">Selecciona el servicio para reconocimiento de texto</p>

              <Select value={ocrService} onValueChange={setOcrService}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio OCR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Cloud Vision</SelectItem>
                  <SelectItem value="azure">Azure Computer Vision</SelectItem>
                  <SelectItem value="tesseract">Tesseract.js (Local)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-[#415643] mb-4">Conectividad</h2>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {offlineMode ? (
                  <WifiOff className="h-5 w-5 text-[#A67D88] mr-3" />
                ) : (
                  <Wifi className="h-5 w-5 text-[#A67D88] mr-3" />
                )}
                <div>
                  <h3 className="font-medium">Modo sin conexión</h3>
                  <p className="text-sm text-gray-500">Usar la aplicación sin conexión a internet</p>
                </div>
              </div>
              <Switch
                checked={offlineMode}
                onCheckedChange={toggleOfflineMode}
                className="data-[state=checked]:bg-[#415643]"
              />
            </div>

            {offlineMode && (
              <div className="p-3 bg-yellow-50 rounded-md text-sm text-yellow-800">
                En modo sin conexión, solo se utilizará Tesseract.js para el reconocimiento de texto, lo que puede
                reducir la precisión.
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={saveSettings} className="w-full bg-[#415643] hover:bg-[#415643]/90">
          Guardar configuración
        </Button>
      </div>
    </div>
  )
}
