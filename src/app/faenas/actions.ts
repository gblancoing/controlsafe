'use server';

import { prisma } from '@/lib/db';
import type { Project } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema de validación
const createProjectSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  region: z.string().optional(),
  clientCompanyId: z.string().min(1, 'La empresa mandante es obligatoria'),
  subcontractorIds: z.array(z.string()).optional().default([]),
});

// Obtener todos los proyectos
export async function getProjects(): Promise<Project[] | null> {
  try {
    const projects = await prisma.project.findMany({
      include: {
        clientCompany: true,
        subcontractors: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      region: p.region || undefined,
      clientCompanyId: p.clientCompanyId,
      subcontractorIds: p.subcontractors.map((s) => s.companyId),
    }));
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return null;
  }
}

// Obtener un proyecto por ID con información adicional
export async function getProjectById(id: string): Promise<{
  id: string;
  name: string;
  region?: string;
  clientCompanyId: string;
  clientCompanyName: string;
  subcontractorIds: string[];
  subcontractorNames: string[];
} | null> {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        clientCompany: true,
        subcontractors: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    return {
      id: project.id,
      name: project.name,
      region: project.region || undefined,
      clientCompanyId: project.clientCompanyId,
      clientCompanyName: project.clientCompany.name,
      subcontractorIds: project.subcontractors.map((s) => s.companyId),
      subcontractorNames: project.subcontractors.map((s) => s.company.name),
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

// Obtener empresas mandantes (para select)
export async function getMandanteCompanies() {
  try {
    const companies = await prisma.company.findMany({
      where: { type: 'Mandante' },
      orderBy: { name: 'asc' },
    });

    return companies.map((c) => ({
      id: c.id,
      name: c.name,
    }));
  } catch (error) {
    console.error('Error fetching mandante companies:', error);
    return [];
  }
}

// Obtener empresas subcontratistas (para select)
export async function getSubcontractorCompanies() {
  try {
    const companies = await prisma.company.findMany({
      where: { type: 'Subcontratista' },
      orderBy: { name: 'asc' },
    });

    return companies.map((c) => ({
      id: c.id,
      name: c.name,
    }));
  } catch (error) {
    console.error('Error fetching subcontractor companies:', error);
    return [];
  }
}

type CreateProjectInput = {
  name: string;
  region?: string;
  clientCompanyId: string;
  subcontractorIds?: string[];
};

// Crear un nuevo proyecto
export async function createProject(input: CreateProjectInput): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = createProjectSchema.parse(input);

    // Generar ID único
    const projectId = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Verificar si ya existe un proyecto con el mismo nombre
    const existing = await prisma.project.findFirst({
      where: { name: validated.name },
    });

    if (existing) {
      return { success: false, error: `El proyecto con el nombre "${validated.name}" ya existe.` };
    }

    // Crear el proyecto con subcontratistas
    await prisma.project.create({
      data: {
        id: projectId,
        name: validated.name,
        region: validated.region || null,
        clientCompanyId: validated.clientCompanyId,
        subcontractors: {
          create: (validated.subcontractorIds || []).map((companyId) => ({
            id: `psc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${companyId}`,
            companyId,
          })),
        },
      },
    });

    revalidatePath('/faenas');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating project:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Datos inválidos' };
    }
    return { success: false, error: 'No se pudo crear el proyecto. Intente nuevamente.' };
  }
}

// Actualizar un proyecto
export async function updateProject(
  id: string,
  input: CreateProjectInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = createProjectSchema.parse(input);

    // Actualizar el proyecto y sus subcontratistas
    await prisma.$transaction(async (tx) => {
      // Eliminar subcontratistas existentes
      await tx.projectSubcontractor.deleteMany({
        where: { projectId: id },
      });

      // Actualizar proyecto
      await tx.project.update({
        where: { id },
        data: {
          name: validated.name,
          region: validated.region || null,
          clientCompanyId: validated.clientCompanyId,
          subcontractors: {
            create: (validated.subcontractorIds || []).map((companyId) => ({
              id: `psc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${companyId}`,
              companyId,
            })),
          },
        },
      });
    });

    revalidatePath('/faenas');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating project:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Datos inválidos' };
    }
    return { success: false, error: 'No se pudo actualizar el proyecto.' };
  }
}

// Eliminar un proyecto
export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath('/faenas');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return { success: false, error: 'No se pudo eliminar el proyecto.' };
  }
}
