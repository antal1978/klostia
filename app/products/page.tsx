import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Leaf, Search, Filter, ArrowUpDown } from "lucide-react"

export default function ProductsPage() {
  // Datos de ejemplo para productos
  const products = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    name: `Prenda Sostenible ${i + 1}`,
    price: Math.floor(Math.random() * 100) + 50,
    category: ["Camisetas", "Pantalones", "Vestidos", "Accesorios"][Math.floor(Math.random() * 4)],
    ecoScore: Math.floor(Math.random() * 5) + 1,
  }))

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
        <div className="container px-4 py-6 md:px-6 md:py-12">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filtros para móvil */}
            <Button variant="outline" className="md:hidden flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>

            {/* Filtros para escritorio */}
            <div className="hidden md:flex md:w-64 lg:w-72 flex-col gap-6">
              <div>
                <h3 className="font-semibold mb-4">Categorías</h3>
                <div className="space-y-2">
                  {["Todos", "Camisetas", "Pantalones", "Vestidos", "Accesorios"].map((category) => (
                    <div key={category} className="flex items-center gap-2">
                      <Checkbox id={`category-${category}`} />
                      <label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Precio</h3>
                <div className="space-y-4">
                  <Slider defaultValue={[150]} max={300} step={1} />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">$0</span>
                    <span className="text-sm">$300</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Eco Score</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((score) => (
                    <div key={score} className="flex items-center gap-2">
                      <Checkbox id={`score-${score}`} />
                      <label htmlFor={`score-${score}`} className="text-sm flex items-center">
                        {Array.from({ length: score }).map((_, i) => (
                          <Leaf key={i} className="h-4 w-4 text-green-600" />
                        ))}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="flex-1">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <h1 className="text-2xl font-bold">Productos Sostenibles</h1>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input placeholder="Buscar productos..." className="w-full sm:w-[250px] pl-8" />
                    </div>
                    <Select defaultValue="featured">
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Destacados</SelectItem>
                        <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                        <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                        <SelectItem value="eco-score">Eco Score</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md"
                    >
                      <Link href={`/products/${product.id}`}>
                        <div className="aspect-square overflow-hidden">
                          <img
                            alt={product.name}
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            height="400"
                            src={`/placeholder.svg?key=8zxb5&height=400&width=400&query=sustainable%20${product.category.toLowerCase()}%20item`}
                            width="400"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{product.name}</h3>
                            <span className="font-medium">${product.price}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm text-gray-500">{product.category}</span>
                            <div className="flex">
                              {Array.from({ length: product.ecoScore }).map((_, i) => (
                                <Leaf key={i} className="h-4 w-4 text-green-600" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" disabled>
                      <ArrowUpDown className="h-4 w-4 rotate-90" />
                      <span className="sr-only">Página anterior</span>
                    </Button>
                    <Button variant="outline" size="sm" className="min-w-[2.5rem]">
                      1
                    </Button>
                    <Button variant="outline" size="sm" className="min-w-[2.5rem]">
                      2
                    </Button>
                    <Button variant="outline" size="sm" className="min-w-[2.5rem]">
                      3
                    </Button>
                    <Button variant="outline" size="icon">
                      <ArrowUpDown className="h-4 w-4 -rotate-90" />
                      <span className="sr-only">Página siguiente</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
