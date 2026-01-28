import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, ShieldCheck, Wrench, Bot, CheckCircle2, Target, Zap, Building2, AlertTriangle, FileCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground">
                <Truck className="size-6" />
            </div>
            <span className="text-xl font-semibold">ControlSafe</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Button variant="ghost" asChild>
              <Link href="#caracteristicas">Características</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#beneficios">Beneficios</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Acceder</Link>
            </Button>
          </nav>
          <div className="md:hidden">
             <Button asChild>
              <Link href="/login">Acceder</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative h-[60vh] flex items-center justify-center text-white">
            <Image 
                src="/flota.jpg"
                alt="Flota de vehículos mineros"
                fill
                priority
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative container mx-auto flex flex-col items-center justify-center gap-6 px-4 text-center md:px-6">
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    La Nueva Era en la Gestión de Mantenimiento Minero
                </h2>
                <p className="max-w-[700px] text-lg text-gray-200 md:text-xl">
                    ControlSafe integra la gestión de flotas, el control de torque y el mantenimiento predictivo con IA para maximizar la seguridad y eficiencia de sus operaciones.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" asChild>
                        <Link href="/login">Empezar ahora</Link>
                    </Button>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold shadow-lg border-0" asChild>
                        <Link href="#caracteristicas">Conocer Más</Link>
                    </Button>
                </div>
            </div>
        </section>

        <section id="caracteristicas" className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Características Clave
                </div>
                <h3 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Todo lo que necesita para una operación segura
                </h3>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Desde la supervisión del estado de la flota hasta el análisis predictivo avanzado, ControlSafe le brinda un control total.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 pt-12">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Wrench className="size-8 text-primary" />
                  <CardTitle>Gestión de Mantenimiento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Planifique, registre y supervise todas las tareas de mantenimiento, asegurando que su flota esté siempre en óptimas condiciones.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <ShieldCheck className="size-8 text-primary" />
                  <CardTitle>Control de Torque Preciso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                   <p className="text-muted-foreground">
                    Lleve un registro digital de cada apriete de componentes críticos. Garantice la seguridad y cumpla con los estándares más exigentes.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Truck className="size-8 text-primary" />
                   <CardTitle>Visibilidad Completa de la Flota</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                   <p className="text-muted-foreground">
                    Obtenga una vista en tiempo real del estado operativo de cada vehículo, desde excavadoras hasta camiones mineros.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Bot className="size-8 text-primary" />
                  <CardTitle>Asesor Predictivo con IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Nuestra IA analiza el historial de mantenimiento para predecir fallas potenciales, recomendando acciones antes de que ocurran problemas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="beneficios" className="w-full bg-background py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Beneficios Clave
                </div>
                <h3 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Seguridad, Exactitud y Control Certero para sus Operaciones
                </h3>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  ControlSafe es la herramienta más potente y confiable para el control y gestión de proyectos mineros y constructivos, garantizando la máxima seguridad y precisión en cada operación.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 pt-12">
              <Card className="border-2 border-primary/20">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="flex items-center justify-center size-12 rounded-lg bg-red-100 dark:bg-red-900/20">
                    <ShieldCheck className="size-6 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle>Seguridad Máxima</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Reduzca significativamente los riesgos operacionales con controles preventivos automatizados y alertas tempranas que previenen accidentes y garantizan el cumplimiento de normativas de seguridad minera y construcción.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="flex items-center justify-center size-12 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Target className="size-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Exactitud y Precisión</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Control certero de torque con registros digitales precisos que eliminan errores humanos. Cada apriete queda documentado con fecha, hora y valores exactos, cumpliendo con los más altos estándares de calidad.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="flex items-center justify-center size-12 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <FileCheck className="size-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Trazabilidad Completa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Historial completo y auditable de cada vehículo, mantenimiento y control preventivo. Documentación digital que facilita auditorías y cumple con requisitos regulatorios de la industria minera y construcción.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="flex items-center justify-center size-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                    <Zap className="size-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <CardTitle>Eficiencia Operacional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Optimice tiempos de mantenimiento y reduzca costos operacionales con programación inteligente y mantenimiento predictivo. Maximice la disponibilidad de su flota y minimice tiempos de inactividad.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="flex items-center justify-center size-12 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Building2 className="size-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Especializado en Minería y Construcción</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Diseñado específicamente para las necesidades críticas de proyectos mineros y constructivos. Gestione múltiples sitios, empresas y flotas con una herramienta que entiende los desafíos únicos de su industria.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="flex items-center justify-center size-12 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <AlertTriangle className="size-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle>Prevención de Fallas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    IA predictiva que identifica problemas potenciales antes de que ocurran. Evite fallas costosas, paradas no programadas y situaciones de riesgo con análisis inteligente de patrones y tendencias.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-16 text-center">
              <div className="inline-block rounded-lg bg-primary/10 px-6 py-3">
                <p className="text-lg font-semibold text-primary">
                  La herramienta más potente y confiable para el control de proyectos mineros y constructivos
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} ControlSafe. Todos los derechos reservados.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm hover:underline">Términos de Servicio</Link>
            <Link href="#" className="text-sm hover:underline">Política de Privacidad</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

