
'use server';

import { getPredictiveMaintenanceAdvice } from '@/ai/flows/predictive-maintenance-advisor';
import type { PredictiveMaintenanceAdviceInput } from '@/ai/flows/predictive-maintenance-advisor';

export async function getPrediction(input: PredictiveMaintenanceAdviceInput): Promise<{ advice: string | null; error: string | null; }> {
  try {
    if (!input.vehicleId || !input.maintenanceRecords) {
      throw new Error("Vehicle ID and maintenance records are required.");
    }
    
    // Ensure maintenanceRecords is a valid JSON string of an array
    try {
        const records = JSON.parse(input.maintenanceRecords);
        if (!Array.isArray(records)) {
            throw new Error("Maintenance records must be a JSON array string.");
        }
    } catch (e) {
        throw new Error("Invalid JSON format for maintenance records.");
    }

    const result = await getPredictiveMaintenanceAdvice(input);
    if (!result || !result.advice) {
        throw new Error("Failed to get a valid response from the AI advisor.");
    }
    return { advice: result.advice, error: null };
  } catch (error) {
    console.error("Error in getPrediction server action:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { advice: null, error: `Prediction failed: ${errorMessage}` };
  }
}
