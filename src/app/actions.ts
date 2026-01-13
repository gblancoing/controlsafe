
'use server';

import { getPredictiveMaintenanceAdvice } from '@/ai/flows/predictive-maintenance-advisor';
import type { PredictiveMaintenanceAdviceInput } from '@/ai/flows/predictive-maintenance-advisor';

export async function getPrediction(input: PredictiveMaintenanceAdviceInput): Promise<{ advice: string | null; error: string | null; }> {
  try {
    if (!input.vehicleId || !input.maintenanceRecords) {
      throw new Error("Se requieren el ID del vehículo y los registros de mantenimiento.");
    }
    
    // Ensure maintenanceRecords is a valid JSON string of an array
    try {
        const records = JSON.parse(input.maintenanceRecords);
        if (!Array.isArray(records)) {
            throw new Error("Los registros de mantenimiento deben ser una cadena de arreglo JSON.");
        }
    } catch (e) {
        throw new Error("Formato JSON inválido para los registros de mantenimiento.");
    }

    const result = await getPredictiveMaintenanceAdvice(input);
    if (!result || !result.advice) {
        throw new Error("No se pudo obtener una respuesta válida del asesor de IA.");
    }
    return { advice: result.advice, error: null };
  } catch (error) {
    console.error("Error en la acción del servidor getPrediction:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
    return { advice: null, error: `La predicción falló: ${errorMessage}` };
  }
}
