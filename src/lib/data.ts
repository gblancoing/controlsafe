import type { User, Vehicle, MaintenanceTask, TorqueRecord, MaintenanceRecord } from './types';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Usuario Admin', email: 'admin@scontrolsafe.com', role: 'Administrator', avatarUrl: 'https://picsum.photos/seed/admin/100/100' },
  { id: 'user-2', name: 'Juan Supervisor', email: 'juan.s@scontrolsafe.com', role: 'Supervisor', avatarUrl: 'https://picsum.photos/seed/supervisor/100/100' },
  { id: 'user-3', name: 'María Técnica', email: 'maria.t@scontrolsafe.com', role: 'Technician', avatarUrl: 'https://picsum.photos/seed/technician/100/100' },
];

export const mockVehicles: Vehicle[] = [
  { id: 'vec-001', name: 'Excavadora EX-250', type: 'Excavator', status: 'Operational', mileage: 12530, operatingHours: 4500, site: 'Cantera Alfa' },
  { id: 'vec-002', name: 'Camión Minero HT-80', type: 'Haul Truck', status: 'Maintenance', mileage: 45890, operatingHours: 9800, site: 'Cantera Alfa' },
  { id: 'vec-003', name: 'Topadora DZ-110', type: 'Dozer', status: 'Operational', mileage: 8345, operatingHours: 3200, site: 'Mina Bravo' },
  { id: 'vec-004', name: 'Cargador LD-500', type: 'Loader', status: 'Out of Service', mileage: 21760, operatingHours: 7100, site: 'Foso Charlie' },
  { id: 'vec-005', name: 'Camión Minero HT-85', type: 'Haul Truck', status: 'Operational', mileage: 33200, operatingHours: 8500, site: 'Mina Bravo' },
];

export const mockMaintenanceTasks: MaintenanceTask[] = [
  { id: 'task-1', vehicleId: 'vec-002', task: 'Cambio de aceite de motor', dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), status: 'Scheduled', priority: 'Medium', assignee: 'María Técnica' },
  { id: 'task-2', vehicleId: 'vec-004', task: 'Revisión sistema hidráulico', dueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), status: 'Overdue', priority: 'High', assignee: 'Sin asignar' },
  { id: 'task-3', vehicleId: 'vec-001', task: 'Ajuste de tensión de orugas', dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), status: 'Scheduled', priority: 'Medium', assignee: 'María Técnica' },
  { id: 'task-4', vehicleId: 'vec-005', task: 'Inspección sistema de frenos', dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), status: 'Scheduled', priority: 'High', assignee: 'Juan Supervisor' },
  { id: 'task-5', vehicleId: 'vec-003', task: 'Cambio fluido de transmisión', dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), status: 'Overdue', priority: 'High', assignee: 'María Técnica' },
];

export const mockTorqueRecords: TorqueRecord[] = [
  { id: 'trq-1', vehicleId: 'vec-001', component: 'Tuercas rueda delantera izq.', requiredTorque: 650, appliedTorque: 655, technician: 'María Técnica', tool: 'Llave de torque TW-5000', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), status: 'OK' },
  { id: 'trq-2', vehicleId: 'vec-002', component: 'Perno suspensión B-42', requiredTorque: 800, appliedTorque: 750, technician: 'Carlos Ray', tool: 'Llave de torque TW-5000', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), status: 'NOK' },
  { id: 'trq-3', vehicleId: 'vec-001', component: 'Tuercas rueda trasera der.', requiredTorque: 650, appliedTorque: 648, technician: 'María Técnica', tool: 'Llave de torque TW-5000', date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(), status: 'OK' },
  { id: 'trq-4', vehicleId: 'vec-003', component: 'Perno montaje de hoja', requiredTorque: 1200, appliedTorque: 1210, technician: 'Frank Stone', tool: 'Llave hidráulica HW-10', date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(), status: 'OK' },
];

// Rich maintenance history for vec-001 (Excavator EX-250) for the AI Advisor
export const vec001MaintenanceHistory: MaintenanceRecord[] = [
    {
      recordId: 'hist-001',
      vehicleId: 'vec-001',
      date: '2023-11-15T00:00:00.000Z',
      description: 'Servicio programado de 1000 horas. Reemplazo de aceite de motor y filtros. Inspección general.',
      partsReplaced: [
        { partName: 'Filtro de aceite de motor', quantity: 1 },
        { partName: 'Filtro de combustible', quantity: 1 },
      ],
      technician: 'María Técnica',
      operatingHours: 3500,
    },
    {
      recordId: 'hist-002',
      vehicleId: 'vec-001',
      date: '2023-12-20T00:00:00.000Z',
      description: 'Reemplazo de diente de cucharón gastado. Operador reportó eficiencia de excavación reducida.',
      partsReplaced: [{ partName: 'Diente de cucharón, central', quantity: 1 }],
      technician: 'Juan Supervisor',
      operatingHours: 3750,
    },
    {
      recordId: 'hist-003',
      vehicleId: 'vec-001',
      date: '2024-01-18T00:00:00.000Z',
      description: 'Reemplazo de otro diente de cucharón gastado. Este es el segundo reemplazo en un mes.',
      partsReplaced: [{ partName: 'Diente de cucharón, esquina izq.', quantity: 1 }],
      technician: 'María Técnica',
      operatingHours: 3950,
    },
    {
      recordId: 'hist-004',
      vehicleId: 'vec-001',
      date: '2024-02-05T00:00:00.000Z',
      description: 'Revisión de torque en todas las tuercas de las ruedas después de que el operador reportara vibración inusual. Todos los valores dentro de especificación.',
      partsReplaced: [],
      technician: 'María Técnica',
      operatingHours: 4100,
    },
    {
      recordId: 'hist-005',
      vehicleId: 'vec-001',
      date: '2024-02-25T00:00:00.000Z',
      description: 'Servicio programado de 1500 horas. Reemplazo de fluido hidráulico y filtro. Tensión de orugas ajustada.',
      partsReplaced: [{ partName: 'Filtro hidráulico', quantity: 1 }],
      technician: 'María Técnica',
      operatingHours: 4250,
    },
     {
      recordId: 'hist-006',
      vehicleId: 'vec-001',
      date: '2024-03-10T00:00:00.000Z',
      description: 'Reparación de emergencia: reemplazo de manguera hidráulica con fuga en el brazo principal.',
      partsReplaced: [{ partName: 'Ensamblaje manguera hidráulica H-123', quantity: 1 }],
      technician: 'Juan Supervisor',
      operatingHours: 4380,
    },
     {
      recordId: 'hist-007',
      vehicleId: 'vec-001',
      date: '2024-03-12T00:00:00.000Z',
      description: 'Revisión de torque de seguimiento en los acoples de la manguera hidráulica de la reparación anterior. Todo seguro.',
      partsReplaced: [],
      technician: 'Juan Supervisor',
      operatingHours: 4390,
    }
  ];
