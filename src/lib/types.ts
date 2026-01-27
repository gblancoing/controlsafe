export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Supervisor' | 'Technician' | 'Driver';
  avatarUrl?: string;
};

export type Vehicle = {
  id: string;
  patent?: string;
  name: string;
  type: 'Excavator' | 'Haul Truck' | 'Dozer' | 'Loader' | 'Camioneta';
  brand?: string;
  model?: string;
  year?: number;
  status: 'Operational' | 'Maintenance' | 'Out of Service';
  mileage: number;
  operatingHours: number;
  site: string;
  companyId?: string;
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

export type CompanyType = 'Mandante' | 'Subcontratista';

export type Company = {
  id: string;
  name: string;
  type: CompanyType;
  country: string;
  rut?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
};

export type Project = {
  id: string;
  name: string;
  region?: string;
  clientCompanyId: string;
  subcontractorIds?: string[];
};

export type MaintenanceProgram = {
  id: string;
  name: string;
  description?: string;
  applicableVehicleType?: 'Todos los tipos' | 'Camioneta' | 'Vehículo Liviano' | 'Camión' | 'Maquinaria Pesada';
  frequencyValue: number;
  frequencyUnit: string; // 'Horas de Operación', 'Kilómetros', 'Días', 'Semanas', 'Meses', 'Años'
  tasks: MaintenanceProgramTask[];
};

export type MaintenanceProgramTask = {
  id: string;
  programId: string;
  task: string;
  order: number;
};

export type Intervention = {
  id: string;
  vehicleId: string;
  task: string;
  date: string;
  technician: string;
  notes?: string;
};
