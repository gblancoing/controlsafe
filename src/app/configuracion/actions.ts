'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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
  sentBy: z.string().min(1, 'El remitente es requerido'),
});

// Obtener usuarios para mensajes masivos
export async function getUsersForBulkMessage() {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return { success: true, data: users };
  } catch (error: any) {
    console.error('Error getting users:', error);
    return { success: false, error: 'Error al obtener usuarios' };
  }
}

// Obtener empresas para mensajes masivos
export async function getCompaniesForBulkMessage() {
  try {
    const companies = await prisma.company.findMany({
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
    return { success: false, error: 'Error al obtener empresas' };
  }
}

// Enviar mensaje masivo
export async function sendBulkMessage(data: z.infer<typeof bulkMessageSchema>) {
  try {
    const validated = bulkMessageSchema.parse(data);
    let recipients: Array<{ email: string; name: string }> = [];
    let totalRecipients = 0;

    // Determinar destinatarios según el tipo
    if (validated.recipientType === 'all') {
      // Todos los usuarios activos
      const users = await prisma.user.findMany({
        where: { isActive: true, email: { not: null } },
        select: { email: true, name: true },
      });
      recipients = users.map(u => ({ email: u.email, name: u.name }));
    } else if (validated.recipientType === 'companies') {
      // Usuarios de empresas específicas
      if (validated.recipientIds && validated.recipientIds.length > 0) {
        const users = await prisma.user.findMany({
          where: {
            isActive: true,
            companyId: { in: validated.recipientIds },
            email: { not: null },
          },
          select: { email: true, name: true },
        });
        recipients = users.map(u => ({ email: u.email, name: u.name }));
      }
    } else if (validated.recipientType === 'users') {
      // Usuarios específicos
      if (validated.recipientIds && validated.recipientIds.length > 0) {
        const users = await prisma.user.findMany({
          where: {
            id: { in: validated.recipientIds },
            isActive: true,
            email: { not: null },
          },
          select: { email: true, name: true },
        });
        recipients = users.map(u => ({ email: u.email, name: u.name }));
      }
    } else if (validated.recipientType === 'specific') {
      // IDs específicos (pueden ser usuarios o empresas)
      if (validated.recipientIds && validated.recipientIds.length > 0) {
        // Intentar como usuarios primero
        const users = await prisma.user.findMany({
          where: {
            id: { in: validated.recipientIds },
            isActive: true,
            email: { not: null },
          },
          select: { email: true, name: true },
        });
        recipients = users.map(u => ({ email: u.email, name: u.name }));

        // Si no hay usuarios, buscar empresas
        if (recipients.length === 0) {
          const companies = await prisma.company.findMany({
            where: {
              id: { in: validated.recipientIds },
              email: { not: null },
            },
            select: { email: true, name: true },
          });
          recipients = companies.map(c => ({ 
            email: c.email!, 
            name: c.name 
          }));
        }
      }
    }

    totalRecipients = recipients.length;

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
    return { success: false, error: 'Error al enviar el mensaje masivo' };
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
