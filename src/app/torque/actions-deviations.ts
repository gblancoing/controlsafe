'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const DEFAULT_DEVIATION_TYPES = [
  'Check Point desviados',
  'Check point desviados / Tuerca o pernos sueltos',
  'Fuera de servicio',
  'Incumplimiento de fecha',
  'Neumaticos con cortes',
  'Incumplimiento de fecha revisión programada',
  'Sin Bitacora',
  'Sin brechas',
  'Sin Check Point o dañados',
  'Otros',
];

/** Obtiene todos los tipos de desviación (ordena por order). Si la tabla está vacía, inserta los predefinidos. */
export async function getDeviationTypes(): Promise<{ id: string; name: string; order: number; isPredefined: boolean; isVerificationCheck: boolean }[]> {
  try {
    const types = await prisma.deviationType.findMany({
      orderBy: { order: 'asc' },
    });
    if (types.length === 0) {
      await seedDefaultDeviationTypes();
      const after = await prisma.deviationType.findMany({
        orderBy: { order: 'asc' },
      });
      return after.map((t) => ({
        id: t.id,
        name: t.name,
        order: t.order,
        isPredefined: t.isPredefined,
        isVerificationCheck: 'isVerificationCheck' in t ? (t as any).isVerificationCheck : false,
      }));
    }
    return types.map((t) => ({
      id: t.id,
      name: t.name,
      order: t.order,
      isPredefined: t.isPredefined,
      isVerificationCheck: 'isVerificationCheck' in t ? (t as any).isVerificationCheck : false,
    }));
  } catch (error) {
    console.error('Error fetching deviation types:', error);
    return [];
  }
}

async function seedDefaultDeviationTypes() {
  const data = DEFAULT_DEVIATION_TYPES.map((name, index) => ({
    id: `dt-${index + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    order: index,
    isPredefined: true,
  }));
  await prisma.deviationType.createMany({ data });
}

/** Crear tipo de desviación (solo administrador). */
export async function createDeviationType(name: string): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: 'El nombre es obligatorio.' };
    }
    const id = `dt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const maxOrder = await prisma.deviationType.aggregate({ _max: { order: true } });
    const order = (maxOrder._max.order ?? -1) + 1;
    await prisma.deviationType.create({
      data: {
        id,
        name: trimmed,
        order,
        isPredefined: false,
      },
    });
    revalidatePath('/torque');
    revalidatePath('/configuracion');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating deviation type:', error);
    return { success: false, error: error.message || 'No se pudo crear el tipo de desviación.' };
  }
}

/** Actualizar tipo de desviación (solo administrador). Los predefinidos también se pueden editar el nombre. */
export async function updateDeviationType(
  id: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: 'El nombre es obligatorio.' };
    }
    await prisma.deviationType.update({
      where: { id },
      data: { name: trimmed },
    });
    revalidatePath('/torque');
    revalidatePath('/configuracion');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating deviation type:', error);
    return { success: false, error: error.message || 'No se pudo actualizar.' };
  }
}

/** Alternar "Check de verificación" de un tipo de desviación. Si está activo, aparece como ítem en el Check List de Revisión. */
export async function toggleDeviationTypeVerificationCheck(
  id: string,
  isVerificationCheck: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.deviationType.update({
      where: { id },
      data: { isVerificationCheck },
    });
    revalidatePath('/torque');
    revalidatePath('/configuracion');
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling verification check:', error);
    return { success: false, error: error?.message || 'No se pudo actualizar.' };
  }
}

/** Eliminar tipo de desviación (solo administrador). Solo se pueden eliminar los que no son predefinidos. */
export async function deleteDeviationType(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const type = await prisma.deviationType.findUnique({
      where: { id },
      select: { isPredefined: true },
    });
    if (!type) {
      return { success: false, error: 'Tipo de desviación no encontrado.' };
    }
    if (type.isPredefined) {
      return { success: false, error: 'No se pueden eliminar los tipos de desviación predefinidos.' };
    }
    await prisma.deviationType.delete({ where: { id } });
    revalidatePath('/torque');
    revalidatePath('/configuracion');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting deviation type:', error);
    return { success: false, error: error.message || 'No se pudo eliminar.' };
  }
}
