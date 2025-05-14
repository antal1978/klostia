import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Leaf, Recycle, Droplets, Factory, Truck, Users, BarChart4 } from "lucide-react"

export default function SustainabilityPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Leaf className="h-6 w-6 text-green-600" />
            <span>EcoFashion</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/products" className="text-sm font-medium hover:underline underline-offset-4">
              Productos
            </Link>
            <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
              Nosotros
            </Link>
            <Link href="/sustainability" className="text-sm font-medium hover:underline underline-offset-4">
              Sostenibilidad
            </Link>
            <Link href="/blog" className="text-sm font-medium hover:underline underline-offset-4">
              Blog
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/signup" className="hidden md:block">
              <Button size="sm">Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-green-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Nuestro Compromiso con la Sostenibilidad
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  En EcoFashion, la sostenibilidad no es solo una tendencia, es nuestro núcleo. Trabajamos para
                  transformar la industria de la moda y reducir su impacto ambiental.
                </p>
              </div>
              <div className="mx-auto lg:ml-auto">
                <img
                  alt="Sostenibilidad en la moda"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                  height="550"
                  src="/sustainable-fashion-production.png"
                  width="800"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Nuestros Pilares de Sostenibilidad
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Cada decisión que tomamos está guiada por estos principios fundamentales
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <Leaf className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Materiales Sostenibles</h3>
                <p className="text-gray-500">
                  Seleccionamos cuidadosamente materiales orgánicos, reciclados y de bajo impacto ambiental. Priorizamos
                  fibras naturales cultivadas sin pesticidas y materiales innovadores que reducen el consumo de
                  recursos.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <Recycle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Economía Circular</h3>
                <p className="text-gray-500">
                  Promovemos un modelo de negocio que minimiza los residuos y maximiza el valor de los recursos.
                  Nuestros productos están diseñados para durar y ser reciclados al final de su vida útil, cerrando el
                  ciclo de producción.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <Users className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Producción Ética</h3>
                <p className="text-gray-500">
                  Trabajamos exclusivamente con fabricantes que garantizan condiciones laborales justas y seguras.
                  Creemos que la sostenibilidad debe incluir el bienestar de las personas que hacen posible nuestra
                  moda.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nuestro Impacto</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Medimos y compartimos transparentemente el impacto positivo de nuestras acciones
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col items-center p-6 border rounded-lg bg-white shadow-sm">
                <Droplets className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Agua Ahorrada</h3>
                <p className="text-4xl font-bold text-green-600 mb-2">5.2M</p>
                <p className="text-sm text-gray-500 text-center">
                  Litros de agua ahorrados en comparación con la producción convencional
                </p>
              </div>
              <div className="flex flex-col items-center p-6 border rounded-lg bg-white shadow-sm">
                <Factory className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">CO2 Reducido</h3>
                <p className="text-4xl font-bold text-green-600 mb-2">320T</p>
                <p className="text-sm text-gray-500 text-center">Toneladas de emisiones de CO2 evitadas</p>
              </div>
              <div className="flex flex-col items-center p-6 border rounded-lg bg-white shadow-sm">
                <Truck className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Plástico Evitado</h3>
                <p className="text-4xl font-bold text-green-600 mb-2">15T</p>
                <p className="text-sm text-gray-500 text-center">Toneladas de plástico que no llegaron a los océanos</p>
              </div>
              <div className="flex flex-col items-center p-6 border rounded-lg bg-white shadow-sm">
                <BarChart4 className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Energía Renovable</h3>
                <p className="text-4xl font-bold text-green-600 mb-2">85%</p>
                <p className="text-sm text-gray-500 text-center">De nuestra producción utiliza energías renovables</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/impact-report">
                <Button size="lg" variant="outline">
                  Ver nuestro informe de impacto completo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Nuestras Certificaciones</h2>
                <p className="text-gray-500">
                  Trabajamos con los estándares más exigentes de la industria para garantizar que nuestros productos
                  cumplen con los más altos criterios de sostenibilidad y ética.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {[
                    { name: "GOTS", desc: "Global Organic Textile Standard" },
                    { name: "Fair Trade", desc: "Comercio Justo Certificado" },
                    { name: "OEKO-TEX", desc: "Libre de sustancias nocivas" },
                    { name: "B Corp", desc: "Empresa certificada B Corporation" },
                  ].map((cert) => (
                    <div key={cert.name} className="flex flex-col p-4 border rounded-lg">
                      <h3 className="font-bold">{cert.name}</h3>
                      <p className="text-sm text-gray-500">{cert.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mx-auto lg:ml-auto">
                <img
                  alt="Certificaciones de sostenibilidad"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                  height="550"
                  src="/placeholder.svg?key=4j9yy"
                  width="800"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Objetivos de Desarrollo Sostenible
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Contribuimos activamente a los Objetivos de Desarrollo Sostenible de la ONU
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 py-12 md:grid-cols-4 lg:gap-8">
              {[
                { num: "12", name: "Producción y Consumo Responsables" },
                { num: "13", name: "Acción por el Clima" },
                { num: "6", name: "Agua Limpia y Saneamiento" },
                { num: "8", name: "Trabajo Decente y Crecimiento Económico" },
              ].map((goal) => (
                <div key={goal.num} className="flex flex-col items-center p-4 border rounded-lg bg-white shadow-sm">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white font-bold text-xl mb-4">
                    {goal.num}
                  </div>
                  <h3 className="text-center font-semibold">{goal.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Únete al Movimiento</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Juntos podemos transformar la industria de la moda
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                <Link href="/products">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Comprar Sostenible
                  </Button>
                </Link>
                <Link href="/blog">
                  <Button size="lg" variant="outline">
                    Leer Nuestro Blog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-gray-50">
        <div className="container flex flex-col gap-6 py-8 md:py-12 px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 justify-between">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Leaf className="h-6 w-6 text-green-600" />
              <span>EcoFashion</span>
            </div>
            <nav className="flex gap-4 md:gap-6 flex-wrap">
              <Link href="/products" className="text-sm hover:underline underline-offset-4">
                Productos
              </Link>
              <Link href="/about" className="text-sm hover:underline underline-offset-4">
                Nosotros
              </Link>
              <Link href="/sustainability" className="text-sm hover:underline underline-offset-4">
                Sostenibilidad
              </Link>
              <Link href="/blog" className="text-sm hover:underline underline-offset-4">
                Blog
              </Link>
              <Link href="/contact" className="text-sm hover:underline underline-offset-4">
                Contacto
              </Link>
            </nav>
          </div>
          <div className="text-sm text-gray-500 text-center md:text-left">
            © 2025 EcoFashion. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
