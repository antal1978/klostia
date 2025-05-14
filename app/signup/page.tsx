import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Leaf } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <Link href="/" className="flex items-center gap-2 mb-8 font-bold text-xl">
          <Leaf className="h-6 w-6 text-green-600" />
          <span>EcoFashion</span>
        </Link>
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Crear Cuenta</h1>
            <p className="text-gray-500">Regístrate para acceder a productos sostenibles</p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">Nombre</Label>
                <Input id="first-name" placeholder="Juan" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Apellido</Label>
                <Input id="last-name" placeholder="Pérez" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" placeholder="tu@ejemplo.com" required type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" required type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <Input id="confirm-password" required type="password" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Acepto los{" "}
                <Link href="/terms" className="text-green-600 hover:underline">
                  términos y condiciones
                </Link>
              </label>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700">Registrarse</Button>
          </div>
          <div className="text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-green-600 hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
