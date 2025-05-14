import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <Link href="/" className="flex items-center gap-2 mb-8 font-bold text-xl">
          <Leaf className="h-6 w-6 text-green-600" />
          <span>EcoFashion</span>
        </Link>
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
            <p className="text-gray-500">Ingresa tus credenciales para acceder a tu cuenta</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" placeholder="tu@ejemplo.com" required type="email" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="/forgot-password" className="text-sm text-green-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input id="password" required type="password" />
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700">Iniciar Sesión</Button>
          </div>
          <div className="text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/signup" className="text-green-600 hover:underline">
              Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
