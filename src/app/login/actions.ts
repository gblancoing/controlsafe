'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

// Acción para cerrar sesión
export async function logout() {
  // Aquí se implementaría la lógica de logout real
  // Por ejemplo, eliminar cookies, invalidar sesiones de Firebase, etc.
  
  // Por ahora, simplemente redirigir al login
  redirect('/login');
}

// Solicitar recuperación de contraseña
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Por favor, ingrese un correo electrónico válido.' };
    }

    // Verificar que el usuario existe en la base de datos
    const user = await (prisma.user as any).findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        isActive: true 
      },
    });

    // Por seguridad, no revelamos si el email existe o no
    // Pero solo enviamos el email si el usuario existe y está activo
    if (!user) {
      // Simulamos éxito para no revelar información
      return { success: true };
    }

    if (!(user as any).isActive) {
      // Simulamos éxito para no revelar información
      return { success: true };
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token válido por 1 hora

    // Invalidar tokens anteriores del usuario
    await (prisma as any).passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Crear nuevo token
    await (prisma as any).passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        email: user.email,
        expiresAt,
        used: false,
      },
    });

    // Generar URL de recuperación
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/login/reset/${token}`;

    // Enviar email con el enlace
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    return { success: true };
  } catch (error: any) {
    console.error('Error requesting password reset:', error);
    // Por seguridad, no revelamos el error específico
    return { success: true };
  }
}

// Validar token de recuperación (sin resetear aún)
export async function validateResetToken(token: string): Promise<{ success: boolean; error?: string; email?: string }> {
  try {
    if (!token || token.length < 10) {
      return { success: false, error: 'Token de recuperación no válido.' };
    }

    const resetToken = await (prisma as any).passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!resetToken) {
      return { success: false, error: 'Token de recuperación no válido o expirado.' };
    }

    if (resetToken.used) {
      return { success: false, error: 'Este token ya ha sido utilizado.' };
    }

    if (new Date() > resetToken.expiresAt) {
      return { success: false, error: 'El token de recuperación ha expirado. Solicite uno nuevo.' };
    }

    if (!resetToken.user.isActive) {
      return { success: false, error: 'No se puede restablecer la contraseña de un usuario inactivo.' };
    }

    return { success: true, email: resetToken.user.email };
  } catch (error: any) {
    console.error('Error validating reset token:', error);
    return { success: false, error: 'Error al validar el token.' };
  }
}

// Restablecer contraseña con token
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!token || token.length < 10) {
      return { success: false, error: 'Token de recuperación no válido.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    // Buscar el token
    const resetToken = await (prisma as any).passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!resetToken) {
      return { success: false, error: 'Token de recuperación no válido o expirado.' };
    }

    if (resetToken.used) {
      return { success: false, error: 'Este token ya ha sido utilizado.' };
    }

    if (new Date() > resetToken.expiresAt) {
      return { success: false, error: 'El token de recuperación ha expirado. Solicite uno nuevo.' };
    }

    if (!resetToken.user.isActive) {
      return { success: false, error: 'No se puede restablecer la contraseña de un usuario inactivo.' };
    }

    // Actualizar contraseña en Firebase
    // Nota: Para resetear contraseña desde el servidor, se necesita Firebase Admin SDK
    // Alternativamente, se puede usar sendPasswordResetEmail de Firebase Auth
    // Por ahora, el token se marca como usado y el usuario puede usar el enlace
    // TODO: Implementar Firebase Admin SDK para resetear contraseña automáticamente
    console.log('Password reset token validated for:', resetToken.user.email);
    
    // Si tienes Firebase Admin SDK configurado, descomenta esto:
    /*
    const admin = require('firebase-admin');
    if (admin.apps.length === 0) {
      admin.initializeApp();
    }
    await admin.auth().updateUser(resetToken.user.email, { password: newPassword });
    */

    // Marcar el token como usado
    await (prisma as any).passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return { success: false, error: 'Error al restablecer la contraseña. Por favor, inténtelo de nuevo.' };
  }
}

// Función para enviar email de recuperación de contraseña
async function sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<void> {
  try {
    const { sendPasswordResetEmail: sendEmail } = await import('@/lib/email');
    await sendEmail(email, name, resetUrl);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // No lanzamos error para no revelar información
  }
}
