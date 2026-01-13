'use server';

/**
 * @fileOverview An AI agent for predictive maintenance advice based on vehicle maintenance records.
 *
 * - getPredictiveMaintenanceAdvice - A function that retrieves predictive maintenance advice for a vehicle.
 * - PredictiveMaintenanceAdviceInput - The input type for the getPredictiveMaintenanceAdvice function.
 * - PredictiveMaintenanceAdviceOutput - The return type for the getPredictiveMaintenanceAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveMaintenanceAdviceInputSchema = z.object({
  vehicleId: z.string().describe('El identificador único del vehículo.'),
  maintenanceRecords: z.string().describe('Cadena JSON que contiene un arreglo de registros de mantenimiento para el vehículo.'),
});
export type PredictiveMaintenanceAdviceInput = z.infer<typeof PredictiveMaintenanceAdviceInputSchema>;

const PredictiveMaintenanceAdviceOutputSchema = z.object({
  advice: z.string().describe('El consejo de mantenimiento predictivo generado por la IA.'),
});
export type PredictiveMaintenanceAdviceOutput = z.infer<typeof PredictiveMaintenanceAdviceOutputSchema>;

export async function getPredictiveMaintenanceAdvice(
  input: PredictiveMaintenanceAdviceInput
): Promise<PredictiveMaintenanceAdviceOutput> {
  return predictiveMaintenanceAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveMaintenanceAdvisorPrompt',
  input: {schema: PredictiveMaintenanceAdviceInputSchema},
  output: {schema: PredictiveMaintenanceAdviceOutputSchema},
  prompt: `Eres un asistente de IA que analiza los registros de mantenimiento de vehículos para proporcionar consejos de mantenimiento predictivo.

  Tu objetivo es identificar problemas potenciales como problemas recurrentes, piezas que necesitan monitoreo o reemplazo más frecuente de lo esperado, y si las revisiones de torque se realizan según lo programado.
  Basado en el historial de mantenimiento, proporciona un resumen conciso de los problemas potenciales y las acciones recomendadas.

  ID del Vehículo: {{{vehicleId}}}
  Registros de Mantenimiento: {{{maintenanceRecords}}}
  
  Proporcione sus consejos de mantenimiento predictivo a continuación:
  `,
});

const predictiveMaintenanceAdvisorFlow = ai.defineFlow(
  {
    name: 'predictiveMaintenanceAdvisorFlow',
    inputSchema: PredictiveMaintenanceAdviceInputSchema,
    outputSchema: PredictiveMaintenanceAdviceOutputSchema,
  },
  async input => {
    try {
      // Parse the maintenance records string into a JSON object
      JSON.parse(input.maintenanceRecords);
    } catch (e) {
      throw new Error(
        'Formato JSON inválido para los registros de mantenimiento: ' + input.maintenanceRecords
      );
    }

    const {output} = await prompt(input);
    return output!;
  }
);
