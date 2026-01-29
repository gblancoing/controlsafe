'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const DEFAULT_REVIEW_CHECKLIST_ITEMS = [
  'Torque',
  'Visual',
  'Luces',
  'Alarmas',
  'Antenas',
  'Equipamiento',
  'Mecánico',
  'Otros',
];

/** Obtiene todos los ítems del Check List de Revisión. Si la tabla está vacía, inserta los predefinidos. */
export async function getReviewChecklistTypes(): Promise<
  { id: string; name: string; order: number; isActive: boolean }[]
> {
  try {
    const types = await (prisma as any).reviewChecklistType.findMany({
      orderBy: { order: 'asc' },
    });
    if (types.length === 0) {
      await seedDefaultReviewChecklistTypes();
      const after = await (prisma as any).reviewChecklistType.findMany({
        orderBy: { order: 'asc' },
      });
      return after.map((t: any) => ({
        id: t.id,
        name: t.name,
        order: t.order,
        isActive: t.isActive ?? true,
      }));
    }
    return types.map((t: any) => ({
      id: t.id,
      name: t.name,
      order: t.order,
      isActive: t.isActive ?? true,
    }));
  } catch (error) {
    console.error('Error fetching review checklist types:', error);
    return [];
  }
}

/** Solo ítems activos (para el formulario Revisar Control Preventivo). */
export async function getActiveReviewChecklistTypes(): Promise<{ id: string; name: string; order: number }[]> {
  const all = await getReviewChecklistTypes();
  return all.filter((t) => t.isActive).map(({ id, name, order }) => ({ id, name, order }));
}

async function seedDefaultReviewChecklistTypes() {
  const data = DEFAULT_REVIEW_CHECKLIST_ITEMS.map((name, index) => ({
    id: `rct-${index + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    order: index,
    isActive: true,
  }));
  await (prisma as any).reviewChecklistType.createMany({ data });
}

export async function createReviewChecklistType(name: string): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmed = name.trim();
    if (!trimmed) return { success: false, error: 'El nombre es obligatorio.' };
    const id = `rct-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const maxOrder = await (prisma as any).reviewChecklistType.aggregate({ _max: { order: true } });
    const order = (maxOrder._max?.order ?? -1) + 1;
    await (prisma as any).reviewChecklistType.create({
      data: { id, name: trimmed, order, isActive: true },
    });
    revalidatePath('/configuracion');
    revalidatePath('/torque');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating review checklist type:', error);
    return { success: false, error: error?.message || 'No se pudo crear.' };
  }
}

export async function updateReviewChecklistType(
  id: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmed = name.trim();
    if (!trimmed) return { success: false, error: 'El nombre es obligatorio.' };
    await (prisma as any).reviewChecklistType.update({
      where: { id },
      data: { name: trimmed },
    });
    revalidatePath('/configuracion');
    revalidatePath('/torque');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating review checklist type:', error);
    return { success: false, error: error?.message || 'No se pudo actualizar.' };
  }
}

export async function toggleReviewChecklistTypeActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await (prisma as any).reviewChecklistType.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath('/configuracion');
    revalidatePath('/torque');
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling review checklist type:', error);
    return { success: false, error: error?.message || 'No se pudo actualizar.' };
  }
}

export async function deleteReviewChecklistType(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await (prisma as any).reviewChecklistType.delete({ where: { id } });
    revalidatePath('/configuracion');
    revalidatePath('/torque');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting review checklist type:', error);
    return { success: false, error: error?.message || 'No se pudo eliminar.' };
  }
}
