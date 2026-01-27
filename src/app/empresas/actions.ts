'use server';

import { prisma } from '@/lib/db';
import type { Company, CompanyType } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema de validación
const createCompanySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  type: z.enum(['Mandante', 'Subcontratista']),
  country: z.string().default('Chile'),
});

// Obtener una empresa por ID
export async function getCompanyById(id: string): Promise<Company | null> {
  try {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return null;
    }

    return {
      id: company.id,
      name: company.name,
      type: company.type as CompanyType,
      country: company.country,
      rut: company.rut || undefined,
      address: company.address || undefined,
      phone: company.phone || undefined,
      email: company.email || undefined,
      contactPerson: company.contactPerson || undefined,
    };
  } catch (error) {
    console.error('Error fetching company:', error);
    return null;
  }
}

// Obtener todas las empresas
export async function getCompanies(): Promise<Company[] | null> {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
    });

    return companies.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type as CompanyType,
      country: c.country,
      rut: c.rut || undefined,
      address: c.address || undefined,
      phone: c.phone || undefined,
      email: c.email || undefined,
      contactPerson: c.contactPerson || undefined,
    }));
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    // Log detallado del error para debugging
    if (error.code === 'P2021') {
      console.error('La tabla companies no existe. Ejecuta el script SQL: database/create-companies-table.sql');
    } else if (error.code === 'P2001') {
      console.error('Error de conexión a la base de datos. Verifica DATABASE_URL en .env.local');
    }
    return null;
  }
}

type CreateCompanyInput = {
  name: string;
  country: string;
  type: CompanyType;
};

// Crear una nueva empresa
export async function createCompany(input: CreateCompanyInput): Promise<{ success: boolean; error?: string }> {
  try {
    // Validar input
    const validated = createCompanySchema.parse(input);

    // Generar ID único
    const companyId = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Verificar si ya existe una empresa con el mismo nombre
    const existing = await prisma.company.findFirst({
      where: { name: validated.name },
    });

    if (existing) {
      return { success: false, error: `La empresa con el nombre "${validated.name}" ya existe.` };
    }

    // Crear la empresa
    await prisma.company.create({
      data: {
        id: companyId,
        name: validated.name,
        type: validated.type,
        country: validated.country || 'Chile',
      },
    });

    revalidatePath('/empresas');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating company:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Datos inválidos' };
    }
    return { success: false, error: 'No se pudo crear la empresa. Intente nuevamente.' };
  }
}

// Actualizar una empresa
export async function updateCompany(
  id: string,
  input: CreateCompanyInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = createCompanySchema.parse(input);

    await prisma.company.update({
      where: { id },
      data: {
        name: validated.name,
        type: validated.type,
        country: validated.country || 'Chile',
      },
    });

    revalidatePath('/empresas');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating company:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Datos inválidos' };
    }
    return { success: false, error: 'No se pudo actualizar la empresa.' };
  }
}

// Eliminar una empresa
export async function deleteCompany(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar si la empresa tiene sitios asociados
    const sitesCount = await prisma.site.count({
      where: { companyId: id },
    });

    if (sitesCount > 0) {
      return {
        success: false,
        error: `No se puede eliminar la empresa porque tiene ${sitesCount} faena(s) asociada(s).`,
      };
    }

    await prisma.company.delete({
      where: { id },
    });

    revalidatePath('/empresas');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting company:', error);
    return { success: false, error: 'No se pudo eliminar la empresa.' };
  }
}
