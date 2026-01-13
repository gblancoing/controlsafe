export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Supervisor' | 'Technician' | 'Driver';
  avatarUrl?: string;
};

export type Vehicle = {
  id: string;
  name: string;
  type: 'Excavator' | 'Haul Truck' | 'Dozer' | 'Loader';
  status: 'Operational' | 'Maintenance' | 'Out of Service';
  mileage: number;
  operatingHours: number;
  site: string;
};

export type MaintenanceTask = {
  id: string;
  vehicleId: string;
  task: string;
  dueDate: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
  assignee?: string;
};

export type TorqueRecord = {
  id: string;
  vehicleId: string;
  component: string;
  requiredTorque: number;
  appliedTorque: number;
  technician: string;
  tool: string;
  date: string;
  status: 'OK' | 'NOK';
};

export type MaintenanceRecord = {
  recordId: string;
  vehicleId: string;
  date: string;
  description: string;
  partsReplaced: { partName: string; quantity: number }[];
  technician: string;
  operatingHours: number;
};
