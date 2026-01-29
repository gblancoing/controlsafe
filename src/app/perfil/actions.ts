'use server';

import path from 'path';
import fs from 'fs';
import { revalidatePath } from 'next/cache';
import { getSessionUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';

export type ProfileUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  canDrive: boolean;
  avatarUrl?: string;
  companyName?: string;
  projectName?: string;
};

/** Obtiene el usuario actual con datos para la ficha (empresa, proyecto, avatar). */
export async function getCurrentUserProfile(): Promise<ProfileUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: { select: { name: true } },
      project: { select: { name: true } },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? undefined,
    role: user.role,
    canDrive: user.canDrive,
    avatarUrl: user.avatarUrl ?? undefined,
    companyName: user.company?.name ?? undefined,
    projectName: user.project?.name ?? undefined,
  };
}

/** Sube la foto de perfil del usuario y actualiza avatar_url. */
export async function updateUserAvatar(formData: FormData): Promise<{ success: boolean; error?: string; avatarUrl?: string }> {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return { success: false, error: 'No hay sesión activa.' };
    }

    const file = formData.get('avatar') as File | null;
    if (!file?.name || file.size === 0) {
      return { success: false, error: 'Seleccione una imagen.' };
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Formato no permitido. Use JPG, PNG, WebP o GIF.' };
    }

    const maxSize = 3 * 1024 * 1024; // 3 MB
    if (file.size > maxSize) {
      return { success: false, error: 'La imagen no debe superar 3 MB.' };
    }

    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const ext = mimeToExt[file.type] || 'jpg';
    const fileName = `avatar-${Date.now()}.${ext}`;
    const baseDir = path.join(process.cwd(), 'public', 'uploads', 'avatars', userId);
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    const filePath = path.join(baseDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const avatarUrl = `/uploads/avatars/${userId}/${fileName}`;
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    revalidatePath('/perfil');
    revalidatePath('/dashboard');
    return { success: true, avatarUrl };
  } catch (error: any) {
    console.error('Error updating avatar:', error);
    return { success: false, error: error.message || 'No se pudo actualizar la foto.' };
  }
}
