import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Droplet, Factory, Recycle, History, FileImage } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#415643] text-white p-4 text-center">
        <h1 className="text-2xl font-bold text-white mb-0">KLOSTIA</h1>
        <p className="text-sm opacity-90 mt-1">Análisis de sostenibilidad textil</p>
      </header>

      <section className="p-4 bg-[#D9BCA3] text-center">
        <h2 className="text-xl font-semibold text-[#2E2E2E]">Descubre el impacto ambiental de tu ropa</h2>
      </section>

      <div className="flex-1 p-4">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <Leaf className="h-16 w-16 text-[#415643]" />
            </div>
            <h2 className="text-center text-xl font-semibold text-[#415643] mb-3">¿Por qué es importante?</h2>
            <p className="text-[#2E2E2E]">
              La industria textil es la segunda más contaminante del planeta. Cada prenda que compramos tiene un impacto
              en nuestro medio ambiente.
            </p>
            <p className="text-[#2E2E2E]">
              Con KLOSTIA podrás conocer el impacto real de tus prendas y tomar decisiones más conscientes.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 flex flex-col items-center text-center">
            <Droplet className="h-10 w-10 text-[#A67D88] mb-2" />
            <p className="text-sm">
              <span className="font-bold block text-lg">2,700L</span>
              de agua para producir una camiseta de algodón
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 flex flex-col items-center text-center">
            <Factory className="h-10 w-10 text-[#A67D88] mb-2" />
            <p className="text-sm">
              <span className="font-bold block text-lg">10%</span>
              de las emisiones globales de CO₂
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-center text-xl font-semibold text-[#415643] mb-3">¿Cómo funciona?</h2>
            <ol className="list-decimal pl-5 space-y-2 mb-4">
              <li>Toma una foto de la etiqueta de tu prenda</li>
              <li>Nuestro sistema analizará los materiales</li>
              <li>Recibe un puntaje de sostenibilidad</li>
              <li>Aprende a cuidar mejor tu ropa</li>
            </ol>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 mb-8">
          <Link href="/analyze" className="w-full">
            <Button className="w-full bg-[#415643] hover:bg-[#415643]/90 text-lg py-6">Analizar mi prenda</Button>
          </Link>
          <Link href="/analyze?mode=example" className="w-full">
            <Button className="w-full bg-[#415643] hover:bg-[#415643]/90 text-lg py-6">
              <FileImage className="mr-2 h-5 w-5" />
              Probar con ejemplos
            </Button>
          </Link>
          <Link href="/history" className="w-full">
            <Button className="w-full bg-[#A67D88] hover:bg-[#A67D88]/90 text-lg py-6">
              <History className="mr-2 h-5 w-5" />
              Ver mi historial
            </Button>
          </Link>
          <Link href="/materials" className="w-full">
            <Button className="w-full bg-[#A67D88] hover:bg-[#A67D88]/90 text-lg py-6">
              <Leaf className="mr-2 h-5 w-5" />
              Explorar materiales
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="flex items-center mb-2">
            <Recycle className="h-5 w-5 text-[#415643] mr-2" />
            <h3 className="font-semibold">¿Sabías que?</h3>
          </div>
          <p className="text-sm mb-0">
            Una prenda de poliéster puede tardar hasta 200 años en degradarse, mientras que las fibras naturales como el
            algodón orgánico tardan solo 5 meses.
          </p>
        </div>
      </div>

      <footer className="bg-[#415643] text-white p-4 text-center text-sm">
        <p className="mb-0">© 2025 KLOSTIA - Moda Sostenible</p>
      </footer>
    </div>
  )
}
