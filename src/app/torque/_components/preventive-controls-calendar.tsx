'use client';

import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { type PreventiveControl } from '../actions';
import { AlertTriangle, Clock, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';
import { DayControlsDialog } from './day-controls-dialog';

export function PreventiveControlsCalendar({ controls }: { controls: PreventiveControl[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getControlsForDate = (date: Date) => {
    return controls.filter((control) => {
      if (!control.nextDueDate) return false;
      const dueDate = new Date(control.nextDueDate);
      return isSameDay(dueDate, date);
    });
  };

  const getStatusColor = (status: PreventiveControl['status']) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'due':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();

  if (controls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center space-y-4">
        <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-sm font-medium">No hay controles preventivos registrados</p>
          <p className="text-xs text-muted-foreground max-w-md">
            Para ver controles preventivos en el calendario, primero debes asignar programas de mantenimiento a los vehículos desde la página de administración de cada vehículo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header del Calendario */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="px-3 py-1 border rounded hover:bg-accent"
          >
            ← Anterior
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 border rounded hover:bg-accent"
          >
            Hoy
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-1 border rounded hover:bg-accent"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, index) => {
          const dayControls = getControlsForDate(day);
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const hasControls = dayControls.length > 0;

          const handleDayClick = () => {
            setSelectedDate(day);
            setDialogOpen(true);
          };

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] border rounded p-2 cursor-pointer transition-colors ${
                !isCurrentMonth ? 'opacity-50' : ''
              } ${isToday ? 'ring-2 ring-primary' : ''} ${
                hasControls ? 'hover:bg-accent hover:border-primary' : ''
              }`}
              onClick={handleDayClick}
            >
              <div className="text-sm font-medium mb-1 flex items-center justify-between">
                <span>{format(day, 'd')}</span>
                {hasControls && (
                  <Badge variant="secondary" className="text-xs h-5 px-1.5">
                    {dayControls.length}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                {dayControls.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    Sin controles
                  </div>
                ) : (
                  <>
                    {/* Mostrar máximo 2 controles completos en el calendario para mejor legibilidad */}
                    {dayControls.slice(0, 2).map((control) => (
                      <div
                        key={control.id}
                        className={`text-xs p-1.5 rounded border ${getStatusColor(control.status)} cursor-pointer hover:opacity-80`}
                        title={`${control.scheduledTime || 'Sin hora'} - ${control.vehicleName} - ${control.programName}`}
                      >
                        {control.scheduledTime && (
                          <div className="text-[10px] font-bold mb-0.5 text-center bg-white/50 rounded px-1">
                            {control.scheduledTime}
                          </div>
                        )}
                        <div className="truncate font-medium text-[11px]">
                          {control.vehicleName}
                        </div>
                        <div className="truncate text-[10px] opacity-75">
                          {control.programName}
                        </div>
                      </div>
                    ))}
                    {dayControls.length > 2 && (
                      <div className="text-[10px] text-muted-foreground font-semibold text-center py-1.5 bg-secondary rounded border cursor-pointer hover:bg-secondary/80">
                        +{dayControls.length - 2} más
                        <div className="text-[9px] opacity-75 mt-0.5">
                          (Click para ver todos)
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Diálogo de controles del día */}
      {selectedDate && (
        <DayControlsDialog
          date={selectedDate}
          controls={getControlsForDate(selectedDate)}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}

      {/* Leyenda */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Vencido
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="gap-1 bg-orange-500">
            <Clock className="h-3 w-3" />
            Por Vencer
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Pendiente
          </Badge>
        </div>
      </div>
    </div>
  );
}
