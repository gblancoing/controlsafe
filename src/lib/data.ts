import type { User, Vehicle, MaintenanceTask, TorqueRecord, MaintenanceRecord } from './types';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@scontrolsafe.com', role: 'Administrator', avatarUrl: 'https://picsum.photos/seed/admin/100/100' },
  { id: 'user-2', name: 'John Supervisor', email: 'john.s@scontrolsafe.com', role: 'Supervisor', avatarUrl: 'https://picsum.photos/seed/supervisor/100/100' },
  { id: 'user-3', name: 'Maria Technician', email: 'maria.t@scontrolsafe.com', role: 'Technician', avatarUrl: 'https://picsum.photos/seed/technician/100/100' },
];

export const mockVehicles: Vehicle[] = [
  { id: 'vec-001', name: 'Excavator EX-250', type: 'Excavator', status: 'Operational', mileage: 12530, operatingHours: 4500, site: 'Alpha Quarry' },
  { id: 'vec-002', name: 'Haul Truck HT-80', type: 'Haul Truck', status: 'Maintenance', mileage: 45890, operatingHours: 9800, site: 'Alpha Quarry' },
  { id: 'vec-003', name: 'Dozer DZ-110', type: 'Dozer', status: 'Operational', mileage: 8345, operatingHours: 3200, site: 'Bravo Mine' },
  { id: 'vec-004', name: 'Loader LD-500', type: 'Loader', status: 'Out of Service', mileage: 21760, operatingHours: 7100, site: 'Charlie Pit' },
  { id: 'vec-005', name: 'Haul Truck HT-85', type: 'Haul Truck', status: 'Operational', mileage: 33200, operatingHours: 8500, site: 'Bravo Mine' },
];

export const mockMaintenanceTasks: MaintenanceTask[] = [
  { id: 'task-1', vehicleId: 'vec-002', task: 'Engine Oil Change', dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), status: 'Scheduled', priority: 'Medium', assignee: 'Maria Technician' },
  { id: 'task-2', vehicleId: 'vec-004', task: 'Hydraulic System Check', dueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), status: 'Overdue', priority: 'High', assignee: 'Unassigned' },
  { id: 'task-3', vehicleId: 'vec-001', task: 'Track Tension Adjustment', dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), status: 'Scheduled', priority: 'Medium', assignee: 'Maria Technician' },
  { id: 'task-4', vehicleId: 'vec-005', task: 'Brake System Inspection', dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), status: 'Scheduled', priority: 'High', assignee: 'John Supervisor' },
  { id: 'task-5', vehicleId: 'vec-003', task: 'Transmission Fluid Replacement', dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), status: 'Overdue', priority: 'High', assignee: 'Maria Technician' },
];

export const mockTorqueRecords: TorqueRecord[] = [
  { id: 'trq-1', vehicleId: 'vec-001', component: 'Front-Left Wheel Nuts', requiredTorque: 650, appliedTorque: 655, technician: 'Maria Technician', tool: 'Torque Wrench TW-5000', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), status: 'OK' },
  { id: 'trq-2', vehicleId: 'vec-002', component: 'Suspension Bolt B-42', requiredTorque: 800, appliedTorque: 750, technician: 'Carlos Ray', tool: 'Torque Wrench TW-5000', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), status: 'NOK' },
  { id: 'trq-3', vehicleId: 'vec-001', component: 'Rear-Right Wheel Nuts', requiredTorque: 650, appliedTorque: 648, technician: 'Maria Technician', tool: 'Torque Wrench TW-5000', date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(), status: 'OK' },
  { id: 'trq-4', vehicleId: 'vec-003', component: 'Blade Mounting Bolt', requiredTorque: 1200, appliedTorque: 1210, technician: 'Frank Stone', tool: 'Hydraulic Wrench HW-10', date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(), status: 'OK' },
];

// Rich maintenance history for vec-001 (Excavator EX-250) for the AI Advisor
export const vec001MaintenanceHistory: MaintenanceRecord[] = [
    {
      recordId: 'hist-001',
      vehicleId: 'vec-001',
      date: '2023-11-15T00:00:00.000Z',
      description: 'Scheduled 1000-hour service. Replaced engine oil and filters. General inspection.',
      partsReplaced: [
        { partName: 'Engine Oil Filter', quantity: 1 },
        { partName: 'Fuel Filter', quantity: 1 },
      ],
      technician: 'Maria Technician',
      operatingHours: 3500,
    },
    {
      recordId: 'hist-002',
      vehicleId: 'vec-001',
      date: '2023-12-20T00:00:00.000Z',
      description: 'Replaced worn bucket tooth. Operator reported reduced digging efficiency.',
      partsReplaced: [{ partName: 'Bucket Tooth, Center', quantity: 1 }],
      technician: 'John Supervisor',
      operatingHours: 3750,
    },
    {
      recordId: 'hist-003',
      vehicleId: 'vec-001',
      date: '2024-01-18T00:00:00.000Z',
      description: 'Replaced another worn bucket tooth. This is the second replacement in a month.',
      partsReplaced: [{ partName: 'Bucket Tooth, Left Corner', quantity: 1 }],
      technician: 'Maria Technician',
      operatingHours: 3950,
    },
    {
      recordId: 'hist-004',
      vehicleId: 'vec-001',
      date: '2024-02-05T00:00:00.000Z',
      description: 'Torque check on all wheel nuts after operator reported unusual vibration. All values within spec.',
      partsReplaced: [],
      technician: 'Maria Technician',
      operatingHours: 4100,
    },
    {
      recordId: 'hist-005',
      vehicleId: 'vec-001',
      date: '2024-02-25T00:00:00.000Z',
      description: 'Scheduled 1500-hour service. Replaced hydraulic fluid and filter. Track tension adjusted.',
      partsReplaced: [{ partName: 'Hydraulic Filter', quantity: 1 }],
      technician: 'Maria Technician',
      operatingHours: 4250,
    },
     {
      recordId: 'hist-006',
      vehicleId: 'vec-001',
      date: '2024-03-10T00:00:00.000Z',
      description: 'Emergency repair: replaced leaking hydraulic hose on main arm.',
      partsReplaced: [{ partName: 'Hydraulic Hose Assy H-123', quantity: 1 }],
      technician: 'John Supervisor',
      operatingHours: 4380,
    },
     {
      recordId: 'hist-007',
      vehicleId: 'vec-001',
      date: '2024-03-12T00:00:00.000Z',
      description: 'Follow-up torque check on hydraulic hose fittings from previous repair. All secure.',
      partsReplaced: [],
      technician: 'John Supervisor',
      operatingHours: 4390,
    }
  ];
