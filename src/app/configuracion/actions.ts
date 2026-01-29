'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUserScope, getSessionUserId } from '@/lib/auth';
import { getAllowedCompanyIds } from '@/lib/scope';

// Schema para política de notificación
const notificationPolicySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  metricType: z.string().min(1, 'El tipo de métrica es requerido'),
  daysBefore: z.number().int().min(1).max(365).default(7),
  emailTemplate: z.string().optional(),
});

// Obtener todas las políticas de notificación
export async function getNotificationPolicies() {
  try {
    const policies = await (prisma as any).notificationPolicy.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: policies };
  } catch (error: any) {
    console.error('Error getting notification policies:', error);
    return { success: false, error: 'Error al obtener las políticas de notificación' };
  }
}

// Crear o actualizar política de notificación
export async function saveNotificationPolicy(data: z.infer<typeof notificationPolicySchema>) {
  try {
    const validated = notificationPolicySchema.parse(data);

    if (validated.id) {
      // Actualizar
      const policy = await (prisma as any).notificationPolicy.update({
        where: { id: validated.id },
        data: {
          name: validated.name,
          description: validated.description,
          enabled: validated.enabled,
          metricType: validated.metricType,
          daysBefore: validated.daysBefore,
          emailTemplate: validated.emailTemplate,
        },
      });
      revalidatePath('/configuracion');
      return { success: true, data: policy };
    } else {
      // Crear
      const policy = await (prisma as any).notificationPolicy.create({
        data: {
          name: validated.name,
          description: validated.description,
          enabled: validated.enabled,
          metricType: validated.metricType,
          daysBefore: validated.daysBefore,
          emailTemplate: validated.emailTemplate,
        },
      });
      revalidatePath('/configuracion');
      return { success: true, data: policy };
    }
  } catch (error: any) {
    console.error('Error saving notification policy:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Error al guardar la política de notificación' };
  }
}

// Eliminar política de notificación
export async function deleteNotificationPolicy(id: string) {
  try {
    await (prisma as any).notificationPolicy.delete({
      where: { id },
    });
    revalidatePath('/configuracion');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting notification policy:', error);
    return { success: false, error: 'Error al eliminar la política de notificación' };
  }
}

// Schema para mensaje masivo
const bulkMessageSchema = z.object({
  subject: z.string().min(1, 'El asunto es requerido'),
  message: z.string().min(1, 'El mensaje es requerido'),
  recipientType: z.enum(['all', 'companies', 'users', 'specific']),
  recipientIds: z.array(z.string()).optional(),
  recipientEmails: z.array(z.string().min(1)).optional(),
  sentBy: z.string().min(1, 'El remitente es requerido'),
});

// Solo Super Admin y Administrador pueden usar mensajes masivos
const BULK_MESSAGE_ALLOWED_ROLES = ['SuperAdmin', 'Administrator'];

/** Usuario actual para mensajes masivos (solo si es Super Admin o Administrador). */
export async function getCurrentUserForBulkMessage(): Promise<{ success: true; data: { id: string; name: string; role: string } } | { success: false; error: string }> {
  try {
    const userId = await getSessionUserId();
    if (!userId) return { success: false, error: 'Debe iniciar sesión' };
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true },
    });
    if (!user) return { success: false, error: 'Usuario no encontrado' };
    if (!BULK_MESSAGE_ALLOWED_ROLES.includes(user.role)) {
      return { success: false, error: 'Solo Super Admin y Administrador pueden enviar mensajes masivos' };
    }
    return { success: true, data: { id: user.id, name: user.name, role: user.role } };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Error al obtener usuario' };
  }
}

// Obtener usuarios para mensajes masivos (según alcance: SuperAdmin todos; Admin solo su proyecto)
export async function getUsersForBulkMessage() {
  try {
    const scope = await getCurrentUserScope();
    if (!scope) return { success: false, error: 'Debe iniciar sesión', data: [] };
    if (!BULK_MESSAGE_ALLOWED_ROLES.includes(scope.role)) {
      return { success: false, error: 'No autorizado', data: [] };
    }
    const allowedCompanyIds = await getAllowedCompanyIds();
    if (allowedCompanyIds && allowedCompanyIds.length === 0) {
      return { success: true, data: [] };
    }
    const where: any = { isActive: true };
    if (allowedCompanyIds !== null) {
      where.companyId = { in: allowedCompanyIds };
    }
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        companyId: true,
        company: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return { success: true, data: users };
  } catch (error: any) {
    console.error('Error getting users:', error);
    return { success: false, error: 'Error al obtener usuarios', data: [] };
  }
}

// Obtener empresas para mensajes masivos (según alcance: SuperAdmin todas; Admin solo las de su proyecto)
export async function getCompaniesForBulkMessage() {
  try {
    const scope = await getCurrentUserScope();
    if (!scope) return { success: false, error: 'Debe iniciar sesión', data: [] };
    if (!BULK_MESSAGE_ALLOWED_ROLES.includes(scope.role)) {
      return { success: false, error: 'No autorizado', data: [] };
    }
    const allowedCompanyIds = await getAllowedCompanyIds();
    if (allowedCompanyIds && allowedCompanyIds.length === 0) {
      return { success: true, data: [] };
    }
    const where: any = {};
    if (allowedCompanyIds !== null) {
      where.id = { in: allowedCompanyIds };
    }
    const companies = await prisma.company.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        contactPerson: true,
      },
      orderBy: { name: 'asc' },
    });
    return { success: true, data: companies };
  } catch (error: any) {
    console.error('Error getting companies:', error);
    return { success: false, error: 'Error al obtener empresas', data: [] };
  }
}

// Enviar mensaje masivo (solo Super Admin y Administrador; alcance por rol)
export async function sendBulkMessage(data: z.infer<typeof bulkMessageSchema>) {
  try {
    const scope = await getCurrentUserScope();
    if (!scope) return { success: false, error: 'Debe iniciar sesión' };
    if (!BULK_MESSAGE_ALLOWED_ROLES.includes(scope.role)) {
      return { success: false, error: 'Solo Super Admin y Administrador pueden enviar mensajes masivos' };
    }
    const allowedCompanyIds = await getAllowedCompanyIds();

    const validated = bulkMessageSchema.parse(data);
    let recipients: Array<{ email: string; name: string }> = [];

    // Construir filtro de alcance para usuarios: SuperAdmin sin filtro; Admin solo su proyecto
    const userScopeWhere: any = { isActive: true };
    if (allowedCompanyIds !== null && allowedCompanyIds.length > 0) {
      userScopeWhere.companyId = { in: allowedCompanyIds };
    }

    if (validated.recipientType === 'all') {
      // Todos los usuarios activos dentro del alcance del remitente (con email para enviar)
      const users = await prisma.user.findMany({
        where: userScopeWhere,
        select: { email: true, name: true },
      });
      recipients = users.filter(u => u.email).map(u => ({ email: u.email!, name: u.name }));
    } else if (validated.recipientType === 'companies') {
      // Usuarios de empresas específicas (solo IDs dentro del alcance)
      if (validated.recipientIds && validated.recipientIds.length > 0) {
        const companyIds = allowedCompanyIds === null
          ? validated.recipientIds
          : validated.recipientIds.filter(id => allowedCompanyIds.includes(id));
        if (companyIds.length > 0) {
          const users = await prisma.user.findMany({
            where: {
              isActive: true,
              companyId: { in: companyIds },
            },
            select: { email: true, name: true },
          });
          recipients = users.filter(u => u.email).map(u => ({ email: u.email!, name: u.name }));
        }
      }
    } else if (validated.recipientType === 'users') {
      // Usuarios específicos: por IDs (dentro del alcance) y/o por correos escritos
      if (validated.recipientIds && validated.recipientIds.length > 0) {
        const users = await prisma.user.findMany({
          where: {
            id: { in: validated.recipientIds },
            ...userScopeWhere,
          },
          select: { email: true, name: true },
        });
        recipients = users.filter(u => u.email).map(u => ({ email: u.email!, name: u.name }));
      }
      if (validated.recipientEmails && validated.recipientEmails.length > 0) {
        const emailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const extra = validated.recipientEmails
          .filter((e) => emailLike.test(e.trim()))
          .map((email) => ({
            email: email.trim().toLowerCase(),
            name: email.split('@')[0] || 'Usuario',
          }));
        recipients = [...recipients, ...extra];
      }
    } else if (validated.recipientType === 'specific') {
      // IDs específicos (usuarios o empresas); solo los que están en alcance
      if (validated.recipientIds && validated.recipientIds.length > 0) {
        const ids = validated.recipientIds;
        const userWhere: any = {
          id: { in: ids },
          isActive: true,
        };
        if (allowedCompanyIds !== null && allowedCompanyIds.length > 0) {
          userWhere.companyId = { in: allowedCompanyIds };
        }
        const users = await prisma.user.findMany({
          where: userWhere,
          select: { email: true, name: true },
        });
        recipients = users.filter(u => u.email).map(u => ({ email: u.email!, name: u.name }));
        const usedEmails = new Set(recipients.map(r => r.email));
        const companyWhere: any = { id: { in: ids } };
        if (allowedCompanyIds !== null && allowedCompanyIds.length > 0) {
          companyWhere.id = { in: ids.filter(id => allowedCompanyIds.includes(id)) };
        }
        const companies = await prisma.company.findMany({
          where: companyWhere,
          select: { email: true, name: true },
        });
        for (const c of companies) {
          if (c.email && !usedEmails.has(c.email)) {
            recipients.push({ email: c.email, name: c.name });
            usedEmails.add(c.email);
          }
        }
      }
    }

    // Eliminar duplicados por email
    const uniqueRecipients = Array.from(
      new Map(recipients.map(r => [r.email, r])).values()
    );

    // Guardar registro del mensaje masivo
    const bulkMessage = await (prisma as any).bulkMessage.create({
      data: {
        subject: validated.subject,
        message: validated.message,
        recipientType: validated.recipientType,
        recipientIds: validated.recipientIds ? JSON.stringify(validated.recipientIds) : null,
        sentBy: validated.sentBy,
        totalRecipients: uniqueRecipients.length,
        successCount: 0,
        errorCount: 0,
      },
    });

    // Enviar emails (simulado por ahora)
    let successCount = 0;
    let errorCount = 0;

    for (const recipient of uniqueRecipients) {
      try {
        await sendEmail(recipient.email, validated.subject, validated.message, recipient.name);
        successCount++;
      } catch (error) {
        console.error(`Error sending email to ${recipient.email}:`, error);
        errorCount++;
      }
    }

    // Actualizar conteos
    await (prisma as any).bulkMessage.update({
      where: { id: bulkMessage.id },
      data: {
        successCount,
        errorCount,
      },
    });

    revalidatePath('/configuracion');
    return { 
      success: true, 
      data: {
        totalRecipients: uniqueRecipients.length,
        successCount,
        errorCount,
      }
    };
  } catch (error: any) {
    console.error('Error sending bulk message:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    const message = error?.message || error?.toString?.() || 'Error al enviar el mensaje masivo';
    return { success: false, error: message };
  }
}

// Obtener historial de mensajes masivos
export async function getBulkMessageHistory(limit: number = 50) {
  try {
    const messages = await (prisma as any).bulkMessage.findMany({
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
      take: limit,
    });
    return { success: true, data: messages };
  } catch (error: any) {
    console.error('Error getting bulk message history:', error);
    return { success: false, error: 'Error al obtener el historial de mensajes' };
  }
}

// Función auxiliar para enviar emails
async function sendEmail(to: string, subject: string, message: string, recipientName?: string): Promise<void> {
  try {
    const { sendBulkMessageEmail } = await import('@/lib/email');
    await sendBulkMessageEmail(to, recipientName || 'Usuario', subject, message);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
