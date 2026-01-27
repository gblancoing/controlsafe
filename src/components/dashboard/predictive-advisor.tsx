import { getVehicles, getMaintenanceRecordsByVehicle } from '@/lib/db-queries';
import { PredictiveAdvisorClient } from './predictive-advisor-client';

export async function PredictiveAdvisor() {
  const vehicles = await getVehicles();
  const targetVehicle = vehicles[0];
  
  if (!targetVehicle) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No hay vehículos disponibles
      </div>
    );
  }

  const maintenanceHistory = await getMaintenanceRecordsByVehicle(targetVehicle.id);

  return (
    <PredictiveAdvisorClient 
      vehicle={targetVehicle} 
      maintenanceHistory={maintenanceHistory}
    />
  );
}
