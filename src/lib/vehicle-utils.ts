/**
 * Utilidades para vehículos
 */

export function getVehicleTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    'Excavator': 'Excavadora',
    'Haul Truck': 'Camión Minero',
    'Dozer': 'Topadora',
    'Loader': 'Cargador',
    'Camioneta': 'Camioneta',
  };
  return typeMap[type] || type;
}

export function getVehicleStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'Operational': 'Operativo',
    'Maintenance': 'En Mantenimiento',
    'OutOfService': 'Fuera de Servicio',
    'NotAllowedToOperate': 'Inoperativo',
    // Compatibilidad con valores antiguos
    'Out of Service': 'Fuera de Servicio',
    'Not Allowed to Operate': 'Inoperativo',
  };
  return statusMap[status] || status;
}

export function getVehicleStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Operational':
      return 'default';
    case 'Maintenance':
      return 'secondary';
    case 'OutOfService':
    case 'Out of Service':
      return 'destructive';
    case 'NotAllowedToOperate':
    case 'Not Allowed to Operate':
      return 'destructive';
    default:
      return 'outline';
  }
}
