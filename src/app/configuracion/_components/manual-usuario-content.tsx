'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/** Contenido del manual de usuario para vista e impresión */
export function ManualUsuarioContent() {
  return (
    <div className="space-y-8 print:space-y-6">
      {/* Portada */}
      <section className="text-center py-8 print:py-4">
        <h1 className="text-3xl font-bold tracking-tight print:text-2xl">
          Manual de Usuario
        </h1>
        <p className="text-xl text-muted-foreground mt-2 print:text-lg">
          ControlSafe — Control Avanzado para la Seguridad Minera
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Versión documento · {new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </section>

      <Separator className="print:my-4" />

      {/* Índice */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Índice</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Introducción</li>
          <li>Roles y permisos</li>
          <li>Flujo de trabajo por rol</li>
          <li>Módulos de la aplicación</li>
          <li>Alertas y notificaciones</li>
          <li>Ficha de vehículo por QR</li>
          <li>Historial y reportes PDF</li>
          <li>Configuración</li>
        </ol>
      </section>

      <Separator />

      {/* 1. Introducción */}
      <section>
        <h2 className="text-xl font-semibold mb-3">1. Introducción</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          ControlSafe es una plataforma web para la gestión de flotas, controles preventivos de mantenimiento
          y cumplimiento normativo. Permite registrar empresas, proyectos, vehículos, programas de mantenimiento
          y realizar revisiones de control preventivo con checklist, fotografías y desviaciones. El acceso a la
          información se restringe según el rol y la asignación (empresa/proyecto) del usuario.
        </p>
      </section>

      <Separator />

      {/* 2. Roles y permisos */}
      <section>
        <h2 className="text-xl font-semibold mb-3">2. Roles y permisos</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Cada usuario tiene un rol y una asignación obligatoria a una empresa y un proyecto. La visibilidad
          de datos depende del rol según la siguiente tabla.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-2 text-left font-medium">Rol</th>
                <th className="border border-border p-2 text-left font-medium">Alcance de datos</th>
                <th className="border border-border p-2 text-left font-medium">Módulos visibles</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-2 font-medium">Super Admin</td>
                <td className="border border-border p-2">Todos los proyectos y empresas. Libertad total.</td>
                <td className="border border-border p-2">Todos (Dashboard, Empresas, Proyectos, Flota, Mantenimiento, Control Preventivo, Historial, Reportes, Usuarios, Configuración).</td>
              </tr>
              <tr>
                <td className="border border-border p-2 font-medium">Administrador</td>
                <td className="border border-border p-2">Solo el proyecto asignado y las empresas de ese proyecto (mandante + subcontratistas).</td>
                <td className="border border-border p-2">Todos los módulos; datos filtrados por su proyecto.</td>
              </tr>
              <tr>
                <td className="border border-border p-2 font-medium">Supervisor / Técnico / Chofer</td>
                <td className="border border-border p-2">Solo la empresa asignada. Flota y reportabilidad de su empresa.</td>
                <td className="border border-border p-2">Panel de Control, Proyectos, Flota, Mantenimiento, Control Preventivo, Historial, Reportes (datos de su empresa).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      {/* 3. Flujo de trabajo por rol */}
      <section>
        <h2 className="text-xl font-semibold mb-3">3. Flujo de trabajo por rol</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Diagrama de alcance de datos y acciones según el rol del usuario tras el inicio de sesión.
        </p>
        <div className="space-y-6 border-l-2 border-muted pl-4">
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" /> Super Admin
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground">Login</span>
                <span aria-hidden>→</span>
                <span>Acceso a todos los proyectos y empresas</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground">Módulos</span>
                <span aria-hidden>→</span>
                <span>Dashboard, Empresas, Proyectos, Flota, Mantenimiento, Control Preventivo, Historial, Reportes, Usuarios, Configuración (sin filtro)</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary/70" /> Administrador
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground">Login</span>
                <span aria-hidden>→</span>
                <span>Solo el proyecto asignado y sus empresas (mandante + subcontratistas)</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground">Módulos</span>
                <span aria-hidden>→</span>
                <span>Mismos módulos; datos filtrados por proyecto · Gestión de usuarios del proyecto</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <span className="size-2 rounded-full bg-muted-foreground" /> Supervisor / Técnico / Chofer
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground">Login</span>
                <span aria-hidden>→</span>
                <span>Solo la empresa asignada</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground">Módulos</span>
                <span aria-hidden>→</span>
                <span>Panel de Control, Proyectos, Flota, Mantenimiento, Control Preventivo, Historial, Reportes (datos de su empresa)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* 4. Módulos */}
      <section>
        <h2 className="text-xl font-semibold mb-3">4. Módulos de la aplicación</h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Panel de Control:</strong> Métricas de flota, controles preventivos, revisiones, programas, empresas y proyectos; tendencias; resumen de desviaciones; alertas críticas.</li>
          <li><strong className="text-foreground">Empresas:</strong> Alta y gestión de empresas (mandantes y subcontratistas).</li>
          <li><strong className="text-foreground">Proyectos (Faenas):</strong> Creación de proyectos y vinculación de empresas (mandante y subcontratistas).</li>
          <li><strong className="text-foreground">Flota:</strong> Registro de vehículos, documentación, revisión técnica, asignación de programas de mantenimiento y choferes.</li>
          <li><strong className="text-foreground">Mantenimiento:</strong> Programas de mantenimiento (tareas, frecuencia) y asignación a vehículos.</li>
          <li><strong className="text-foreground">Control Preventivo (Torque):</strong> Calendario y listado de controles; realización de revisiones con checklist, fotos y desviaciones; aprobación/rechazo.</li>
          <li><strong className="text-foreground">Historial:</strong> Historial de revisiones y programación pendiente; filtros por empresa/proyecto; acciones Ver registro y Descargar PDF por revisión.</li>
          <li><strong className="text-foreground">Reportes:</strong> Cumplimiento, estado de flota, utilización de programas, revisiones y desviaciones (por causa, empresa, tipo de vehículo y mes).</li>
          <li><strong className="text-foreground">Usuarios:</strong> Alta y edición de usuarios; asignación de rol, empresa y proyecto (obligatorios).</li>
          <li><strong className="text-foreground">Configuración:</strong> Políticas de notificación, tipos de desviación, mensajes masivos e información de la app (este manual).</li>
        </ul>
      </section>

      <Separator />

      {/* 5. Alertas y notificaciones */}
      <section>
        <h2 className="text-xl font-semibold mb-3">5. Alertas y notificaciones</h2>
        <p className="text-sm text-muted-foreground mb-3">
          En el <strong className="text-foreground">Panel de Control</strong> se muestra la tarjeta &quot;Alertas Críticas&quot; con las situaciones que requieren atención. En la cabecera de la aplicación, el icono de <strong className="text-foreground">campana</strong> representa el acceso a notificaciones.
        </p>
        <p className="text-sm font-medium mb-2">Tipos de alertas críticas:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Control Preventivo Vencido:</strong> Un control programado ha superado la fecha de vencimiento.</li>
          <li><strong className="text-foreground">Vehículo Inoperativo:</strong> Vehículo marcado como inoperativo o con estado &quot;No permitido operar&quot;.</li>
          <li><strong className="text-foreground">Rechazo Urgente Reciente:</strong> Revisión de control preventivo rechazada con carácter urgente en los últimos 7 días.</li>
          <li><strong className="text-foreground">Revisión Técnica Vencida:</strong> La revisión técnica del vehículo está vencida (fecha de vencimiento ya pasada).</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-3">
          Cada alerta muestra título, descripción y un enlace &quot;Ver detalles&quot; hacia el módulo correspondiente (Control Preventivo, Ficha del vehículo, Historial, etc.).
        </p>
      </section>

      <Separator />

      {/* 6. Ficha por QR */}
      <section>
        <h2 className="text-xl font-semibold mb-3">6. Ficha de vehículo por QR</h2>
        <p className="text-sm text-muted-foreground">
          Desde la ficha de un vehículo (Flota → vehículo → Ficha) se genera un <strong className="text-foreground">código QR</strong>. Al escanearlo se abre una <strong className="text-foreground">vista pública</strong> de la ficha (sin requerir inicio de sesión): datos del vehículo, programas de mantenimiento, historial de revisiones y enlaces a documentación. Útil para acceso rápido en terreno o auditorías.
        </p>
      </section>

      <Separator />

      {/* 7. Historial y reportes PDF */}
      <section>
        <h2 className="text-xl font-semibold mb-3">7. Historial y reportes PDF</h2>
        <p className="text-sm text-muted-foreground mb-3">
          En <strong className="text-foreground">Historial → Historial de Revisiones</strong> se listan todas las revisiones de control preventivo con filtros por empresa y proyecto. En cada fila, la columna <strong className="text-foreground">Acciones</strong> permite:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-3">
          <li><strong className="text-foreground">Ver registro:</strong> Abre un diálogo con el detalle completo de la revisión (datos generales, checklist, desviaciones, fotos).</li>
          <li><strong className="text-foreground">PDF:</strong> Descarga un reporte en PDF de esa revisión para archivo o auditoría.</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          El PDF incluye fecha, estado, vehículo, empresa, programa, revisor, chofer, observaciones, checklist completado, desviaciones detectadas y pie de página con ControlSafe.
        </p>
      </section>

      <Separator />

      {/* 8. Configuración */}
      <section>
        <h2 className="text-xl font-semibold mb-3">8. Configuración</h2>
        <p className="text-sm text-muted-foreground mb-2">
          En <strong className="text-foreground">Configuración</strong> se encuentran las pestañas:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Políticas de Notificación:</strong> Definición de cuándo y cómo se envían notificaciones (por ejemplo, controles próximos a vencer).</li>
          <li><strong className="text-foreground">Tipos de desviación:</strong> Gestión de las causas de desviación que pueden marcarse en una revisión de control preventivo (agregar, editar, eliminar; los predefinidos no se eliminan).</li>
          <li><strong className="text-foreground">Mensajes Masivos:</strong> Envío de mensajes a usuarios y/o empresas.</li>
          <li><strong className="text-foreground">Información App:</strong> Acceso a este manual y descarga en PDF.</li>
        </ul>
      </section>

      <Separator />

      {/* Cierre */}
      <section className="text-center py-6 print:py-4">
        <p className="text-sm text-muted-foreground">
          Documento generado por ControlSafe · Para más soporte, contacte al administrador del sistema.
        </p>
      </section>
    </div>
  );
}
