import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    if (!reviewId) {
      return NextResponse.json({ error: 'ID de revisión requerido' }, { status: 400 });
    }

    const review = await (prisma.preventiveControlReview.findUnique as any)({
      where: { id: reviewId },
      include: {
        vehicle: {
          include: {
            company: { select: { id: true, name: true } },
          },
        },
        vehicleMaintenanceProgram: {
          include: {
            program: { select: { id: true, name: true, description: true } },
          },
        },
        reviewer: { select: { id: true, name: true } },
        driver: { select: { id: true, name: true } },
        checklistItems: { orderBy: { order: 'asc' } },
        photos: { orderBy: { order: 'asc' } },
        deviations: {
          include: {
            deviationType: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Revisión no encontrada' }, { status: 404 });
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.getPageWidth();
    let y = 16;

    const statusLabel =
      review.status === 'Approved'
        ? 'Aprobado'
        : review.status === 'Rejected'
          ? 'Rechazado'
          : review.status === 'UrgentRejected'
            ? 'Rechazo Urgente'
            : review.status;

    // Título
    doc.setFontSize(18);
    doc.text('Reporte de Revisión - Control Preventivo', pageW / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(10);
    doc.text(
      `Fecha: ${new Date(review.reviewDate).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}  |  Estado: ${statusLabel}`,
      pageW / 2,
      y,
      { align: 'center' }
    );
    y += 12;

    // Datos generales
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Datos generales', 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const general = [
      [`Vehículo`, `${review.vehicle?.name || '-'} ${review.vehicle?.patent ? `· ${review.vehicle.patent}` : ''}`],
      [`Empresa`, review.vehicle?.company?.name || '-'],
      [`Programa`, review.vehicleMaintenanceProgram?.program?.name || '-'],
      [`Revisor`, review.reviewer?.name || '-'],
      [`Chofer`, review.driver?.name || '-'],
    ];
    general.forEach(([label, value]) => {
      doc.text(`${label}:`, 14, y);
      doc.text(String(value), 50, y);
      y += 5;
    });
    y += 4;

    if (review.observations) {
      doc.setFont('helvetica', 'bold');
      doc.text('Observaciones:', 14, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const obsLines = doc.splitTextToSize(review.observations, pageW - 28);
      doc.text(obsLines, 14, y);
      y += obsLines.length * 5 + 4;
    }

    if (review.urgentRejectionReason) {
      doc.setFont('helvetica', 'bold');
      doc.text('Motivo rechazo urgente:', 14, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(review.urgentRejectionReason, pageW - 28);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 4;
    }

    if (review.requiredActions) {
      doc.setFont('helvetica', 'bold');
      doc.text('Acciones requeridas:', 14, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(review.requiredActions, pageW - 28);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 4;
    }

    // Checklist
    if (review.checklistItems && review.checklistItems.length > 0) {
      if (y > 240) {
        doc.addPage();
        y = 16;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Checklist de revisión', 14, y);
      y += 6;

      const checklistData = review.checklistItems.map((item: any) => [
        item.checked ? 'Sí' : 'No',
        item.item || '',
        item.notes || '',
      ]);
      autoTable(doc, {
        startY: y,
        head: [['Completado', 'Ítem', 'Notas']],
        body: checklistData,
        theme: 'grid',
        headStyles: { fillColor: [41, 77, 123] },
        margin: { left: 14 },
        tableWidth: pageW - 28,
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // Desviaciones
    if (review.deviations && review.deviations.length > 0) {
      if (y > 250) {
        doc.addPage();
        y = 16;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Desviaciones detectadas', 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      const devNames = review.deviations.map((d: any) => d.deviationType?.name ?? 'Desconocido').join(', ');
      doc.text(devNames, 14, y);
      y += 10;
    }

    // Pie de página
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `ControlSafe - Reporte de revisión - Página ${i} de ${totalPages} - ${new Date().toLocaleDateString('es-CL')}`,
        pageW / 2,
        doc.getPageHeight() - 8,
        { align: 'center' }
      );
    }

    const buffer = Buffer.from(doc.output('arraybuffer'));
    const filename = `revision-${reviewId}-${new Date(review.reviewDate).toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (error) {
    console.error('Error generating revision PDF:', error);
    return NextResponse.json(
      { error: 'Error al generar el reporte PDF' },
      { status: 500 }
    );
  }
}
