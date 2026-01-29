import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string; filename: string }> }
) {
  try {
    const { vehicleId, filename } = await params;
    if (!vehicleId || !filename) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }
    if (vehicleId.includes('..') || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ error: 'Ruta no permitida' }, { status: 400 });
    }

    const baseDir = path.join(process.cwd(), 'public', 'uploads', 'vehicles', vehicleId);
    const filePath = path.join(baseDir, filename);

    if (!filePath.startsWith(baseDir)) {
      return NextResponse.json({ error: 'Ruta no permitida' }, { status: 400 });
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    const buffer = fs.readFileSync(filePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Error al obtener el archivo' }, { status: 500 });
  }
}
