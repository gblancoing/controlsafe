/**
 * Utilidades para vehículos
 */

export function getVehicleTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    'Excavator': 'Excavadora',
    'Haul Truck': 'Camión Minero',
    'Dozer': 'Topadora',
    'Loader': 'Cargador',
  };
  return typeMap[type] || type;
}

export function getVehicleStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'Operational': 'Operativo',
    'Maintenance': 'En Mantenimiento',
    'Out of Service': 'Fuera de Servicio',
  };
  return statusMap[status] || status;
}

export function getVehicleStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Operational':
      return 'default';
    case 'Maintenance':
      return 'secondary';
    case 'Out of Service':
      return 'destructive';
    default:
      return 'outline';
  }
}
