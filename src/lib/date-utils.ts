/**
 * Utilidades para cálculo de fechas
 */

/**
 * Verifica si una fecha es un día hábil (Lunes a Viernes)
 */
export function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  // 0 = Domingo, 6 = Sábado
  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

/**
 * Calcula la próxima fecha sumando días hábiles
 * @param startDate Fecha de inicio
 * @param businessDays Número de días hábiles a sumar
 * @returns Nueva fecha después de sumar los días hábiles
 */
export function addBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate);
  let daysAdded = 0;
  let daysToAdd = businessDays;

  while (daysToAdd > 0) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result)) {
      daysToAdd--;
    }
    daysAdded++;
    
    // Prevenir loops infinitos (máximo 1000 días)
    if (daysAdded > 1000) {
      break;
    }
  }

  return result;
}

/**
 * Calcula la próxima fecha según la frecuencia del programa
 * Considera días hábiles si el programa está configurado para usarlos
 */
export function calculateNextDueDate(
  baseDate: Date,
  frequencyValue: number,
  frequencyUnit: string,
  useBusinessDays: boolean = false
): Date {
  const nextDate = new Date(baseDate);

  switch (frequencyUnit) {
    case 'Días':
      if (useBusinessDays) {
        return addBusinessDays(baseDate, frequencyValue);
      } else {
        nextDate.setDate(nextDate.getDate() + frequencyValue);
        return nextDate;
      }
    case 'Semanas':
      if (useBusinessDays) {
        // Para semanas con días hábiles: 5 días hábiles por semana
        return addBusinessDays(baseDate, frequencyValue * 5);
      } else {
        nextDate.setDate(nextDate.getDate() + frequencyValue * 7);
        return nextDate;
      }
    case 'Meses':
      // Para meses, siempre usamos días corridos (meses calendario)
      nextDate.setMonth(nextDate.getMonth() + frequencyValue);
      return nextDate;
    case 'Años':
      // Para años, siempre usamos días corridos (años calendario)
      nextDate.setFullYear(nextDate.getFullYear() + frequencyValue);
      return nextDate;
    case 'Horas de Operación':
    case 'Kilómetros':
      // Para horas y kilómetros, usamos días como aproximación
      if (useBusinessDays) {
        return addBusinessDays(baseDate, 30); // Aproximación: 30 días hábiles
      } else {
        nextDate.setDate(nextDate.getDate() + 30);
        return nextDate;
      }
    default:
      if (useBusinessDays) {
        return addBusinessDays(baseDate, frequencyValue);
      } else {
        nextDate.setDate(nextDate.getDate() + frequencyValue);
        return nextDate;
      }
  }
}
