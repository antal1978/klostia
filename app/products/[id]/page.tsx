import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, ShoppingCart, Heart, Share2, Recycle, Droplets, Factory, Truck } from "lucide-react"

export default function ProductPage({ params }: { params: { id: string } }) {
  const productId = Number.parseInt(params.id)

  // Datos de ejemplo para el producto
  const product = {
    id: productId,
    name: `Prenda Sostenible ${productId}`,
    description:
      "Esta prenda está fabricada con materiales orgánicos y reciclados, utilizando procesos de producción de bajo impacto ambiental. Diseñada para durar y ser reciclada al final de su vida útil.",
    price: 99.99,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro", "Blanco", "Verde", "Azul"],
    materials: ["85% Algodón orgánico", "15% Poliéster reciclado"],
    ecoScore: 4,
    sustainabilityMetrics: {
      waterSaved: "2,700 litros",
      co2Reduced: "5.2 kg",
      energySaved: "60%",
      recycledMaterials: "15%",
    },
    certifications: ["GOTS", "Fair Trade", "OEKO-TEX"],
  }

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
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-lg">
                <img
                  alt={product.name}
                  className="aspect-square object-cover w-full"
                  height="600"
                  src={`/placeholder.svg?key=iy0oh&height=600&width=600&query=sustainable%20clothing%20item%20${productId}`}
                  width="600"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="overflow-hidden rounded-lg border">
                    <img
                      alt={`${product.name} - Vista ${i}`}
                      className="aspect-square object-cover"
                      height="150"
                      src={`/placeholder.svg?key=o6428&height=150&width=150&query=sustainable%20clothing%20detail%20${i}`}
                      width="150"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: product.ecoScore }).map((_, i) => (
                      <Leaf key={i} className="h-5 w-5 text-green-600" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">Eco Score: {product.ecoScore}/5</span>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold">${product.price}</span>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-gray-500">{product.description}</p>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-medium">Color</h3>
                  <div className="mt-2 flex gap-2">
                    {product.colors.map((color) => (
                      <Button key={color} variant="outline" size="sm">
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Talla</h3>
                  <div className="mt-2 flex gap-2">
                    {product.sizes.map((size) => (
                      <Button key={size} variant="outline" size="sm">
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Materiales</h3>
                  <ul className="mt-2 list-disc pl-5 text-gray-500">
                    {product.materials.map((material, i) => (
                      <li key={i}>{material}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <Button className="bg-green-600 hover:bg-green-700">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Añadir al carrito
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Heart className="mr-2 h-4 w-4" />
                    Guardar
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartir
                  </Button>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-medium">Certificaciones</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <Tabs defaultValue="sustainability">
              <TabsList className="w-full justify-start border-b">
                <TabsTrigger value="sustainability">Sostenibilidad</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="care">Cuidados</TabsTrigger>
                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
              </TabsList>
              <TabsContent value="sustainability" className="pt-6">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Impacto Ambiental</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center p-4 border rounded-lg bg-green-50">
                      <Droplets className="h-8 w-8 text-green-600 mb-2" />
                      <h3 className="font-semibold">Agua Ahorrada</h3>
                      <p className="text-2xl font-bold text-green-600">{product.sustainabilityMetrics.waterSaved}</p>
                      <p className="text-sm text-gray-500 text-center">Comparado con prendas convencionales</p>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-lg bg-green-50">
                      <Factory className="h-8 w-8 text-green-600 mb-2" />
                      <h3 className="font-semibold">CO2 Reducido</h3>
                      <p className="text-2xl font-bold text-green-600">{product.sustainabilityMetrics.co2Reduced}</p>
                      <p className="text-sm text-gray-500 text-center">Menos emisiones de carbono</p>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-lg bg-green-50">
                      <Truck className="h-8 w-8 text-green-600 mb-2" />
                      <h3 className="font-semibold">Energía Ahorrada</h3>
                      <p className="text-2xl font-bold text-green-600">{product.sustainabilityMetrics.energySaved}</p>
                      <p className="text-sm text-gray-500 text-center">En el proceso de producción</p>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-lg bg-green-50">
                      <Recycle className="h-8 w-8 text-green-600 mb-2" />
                      <h3 className="font-semibold">Material Reciclado</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {product.sustainabilityMetrics.recycledMaterials}
                      </p>
                      <p className="text-sm text-gray-500 text-center">Contenido reciclado total</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">Proceso de Producción Sostenible</h3>
                    <p className="text-gray-500">
                      Esta prenda ha sido fabricada siguiendo estrictos estándares de sostenibilidad en cada etapa del
                      proceso:
                    </p>
                    <ul className="mt-4 space-y-2 text-gray-500">
                      <li className="flex items-start">
                        <Leaf className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <span>Cultivo de algodón orgánico sin pesticidas ni fertilizantes químicos</span>
                      </li>
                      <li className="flex items-start">
                        <Leaf className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <span>Teñido con tintes naturales y de bajo impacto que reducen el consumo de agua</span>
                      </li>
                      <li className="flex items-start">
                        <Leaf className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <span>Fabricación en instalaciones con energía renovable</span>
                      </li>
                      <li className="flex items-start">
                        <Leaf className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <span>Embalaje 100% reciclable y biodegradable</span>
                      </li>
                      <li className="flex items-start">
                        <Leaf className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <span>Transporte optimizado para reducir la huella de carbono</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="details" className="pt-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Detalles del Producto</h2>
                  <p className="text-gray-500">
                    Información detallada sobre el producto, sus características y especificaciones.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-medium">Especificaciones</h3>
                      <ul className="mt-2 list-disc pl-5 text-gray-500">
                        <li>Tejido de punto de algodón orgánico</li>
                        <li>Gramaje medio: 180g/m²</li>
                        <li>Corte regular</li>
                        <li>Cuello redondo reforzado</li>
                        <li>Costuras dobles para mayor durabilidad</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium">País de Origen</h3>
                      <p className="mt-2 text-gray-500">Fabricado en España</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Código del Producto</h3>
                      <p className="mt-2 text-gray-500">ECO-{productId.toString().padStart(6, "0")}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="care" className="pt-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Instrucciones de Cuidado</h2>
                  <p className="text-gray-500">
                    Sigue estas recomendaciones para mantener tu prenda en óptimas condiciones y prolongar su vida útil.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-medium">Lavado</h3>
                      <ul className="mt-2 list-disc pl-5 text-gray-500">
                        <li>Lavar a máquina a 30°C máximo</li>
                        <li>Usar detergentes ecológicos</li>
                        <li>No usar blanqueadores</li>
                        <li>Lavar del revés para proteger los colores</li>
                        <li>Lavar con prendas de colores similares</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium">Secado y Planchado</h3>
                      <ul className="mt-2 list-disc pl-5 text-gray-500">
                        <li>Secar a la sombra</li>
                        <li>No usar secadora</li>
                        <li>Planchar a temperatura media</li>
                        <li>No planchar estampados directamente</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium">Consejos de Sostenibilidad</h3>
                      <ul className="mt-2 list-disc pl-5 text-gray-500">
                        <li>Lavar solo cuando sea necesario para ahorrar agua y energía</li>
                        <li>Reparar en lugar de desechar si aparecen pequeños daños</li>
                        <li>Al final de su vida útil, reciclar o donar la prenda</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="pt-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Reseñas de Clientes</h2>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold">4.8</div>
                    <div className="flex flex-col">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Leaf key={i} className={`h-5 w-5 ${i < 5 ? "text-green-600" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">Basado en 24 reseñas</span>
                    </div>
                  </div>
                  <div className="mt-6 space-y-6">
                    {[
                      {
                        name: "María G.",
                        rating: 5,
                        date: "15/04/2025",
                        comment:
                          "Excelente calidad y me encanta saber que estoy contribuyendo a reducir mi impacto ambiental. La talla es perfecta y el material muy cómodo.",
                      },
                      {
                        name: "Carlos R.",
                        rating: 4,
                        date: "02/04/2025",
                        comment:
                          "Muy buena prenda, materiales de calidad y se nota que está bien hecha. Le doy 4 estrellas porque el color es ligeramente diferente al de la foto.",
                      },
                      {
                        name: "Laura M.",
                        rating: 5,
                        date: "28/03/2025",
                        comment:
                          "¡Me encanta! Es la tercera prenda que compro de esta marca y nunca me decepciona. Sostenible, duradera y con estilo.",
                      },
                    ].map((review, i) => (
                      <div key={i} className="border-t pt-6">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold">{review.name}</h3>
                            <div className="flex mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Leaf
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? "text-green-600" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="mt-2 text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Button variant="outline">Ver todas las reseñas</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Productos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <Link href={`/products/${productId + i}`}>
                    <div className="aspect-square overflow-hidden">
                      <img
                        alt={`Producto relacionado ${i}`}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                        height="300"
                        src={`/placeholder.svg?key=l1n28&height=300&width=300&query=sustainable%20clothing%20related%20${i}`}
                        width="300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">Prenda Sostenible {productId + i}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-900 font-medium">${Math.floor(Math.random() * 50) + 70}.99</span>
                        <div className="flex">
                          {Array.from({ length: Math.floor(Math.random() * 2) + 3 }).map((_, i) => (
                            <Leaf key={i} className="h-4 w-4 text-green-600" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
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
