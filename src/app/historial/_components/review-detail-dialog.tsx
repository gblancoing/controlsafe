'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, XCircle, FileText, Image, AlertCircle, Loader } from 'lucide-react';
import { getReviewById } from '../actions';
import type { ReviewDetail } from '../actions';
import { Button } from '@/components/ui/button';

type Props = {
  reviewId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseUrl?: string;
};

export function ReviewDetailDialog({ reviewId, open, onOpenChange, baseUrl = '' }: Props) {
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && reviewId) {
      setLoading(true);
      getReviewById(reviewId)
        .then(setReview)
        .finally(() => setLoading(false));
    } else {
      setReview(null);
    }
  }, [open, reviewId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="default" className="bg-green-500">Aprobado</Badge>;
      case 'Rejected':
        return <Badge variant="secondary">Rechazado</Badge>;
      case 'UrgentRejected':
        return <Badge variant="destructive">Rechazo Urgente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pdfUrl = reviewId && baseUrl ? `${baseUrl}/api/historial/revision/${reviewId}/pdf` : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registro de Revisión</DialogTitle>
          <DialogDescription>
            Detalle completo del control preventivo para auditoría
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && review && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(review.reviewDate), "EEEE d 'de' MMMM yyyy, HH:mm", { locale: es })}
                </p>
                <p className="font-medium">{review.vehicle.name} · {review.program.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(review.status)}
                {pdfUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download>
                      Descargar PDF
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">Datos generales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Vehículo</span>
                  <span>{review.vehicle.name} {review.vehicle.patent ? `· ${review.vehicle.patent}` : ''}</span>
                  <span className="text-muted-foreground">Empresa</span>
                  <span>{review.vehicle.companyName || '-'}</span>
                  <span className="text-muted-foreground">Programa</span>
                  <span>{review.program.name}</span>
                  <span className="text-muted-foreground">Revisor</span>
                  <span>{review.reviewer.name}</span>
                  <span className="text-muted-foreground">Chofer</span>
                  <span>{review.driver?.name || '-'}</span>
                </div>
                {review.observations && (
                  <>
                    <Separator className="my-2" />
                    <p><span className="text-muted-foreground">Observaciones:</span> {review.observations}</p>
                  </>
                )}
                {review.urgentRejectionReason && (
                  <p className="text-destructive"><span className="font-medium">Motivo rechazo urgente:</span> {review.urgentRejectionReason}</p>
                )}
                {review.requiredActions && (
                  <p><span className="text-muted-foreground">Acciones requeridas:</span> {review.requiredActions}</p>
                )}
              </CardContent>
            </Card>

            {review.checklistItems && review.checklistItems.length > 0 && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Checklist de revisión
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {review.checklistItems.map((item) => (
                      <li key={item.id} className="flex items-start gap-2 text-sm">
                        {item.checked ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <span className={item.checked ? '' : 'text-muted-foreground'}>{item.item}</span>
                        {item.notes && <span className="text-muted-foreground">· {item.notes}</span>}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {review.deviations && review.deviations.length > 0 && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Desviaciones detectadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-wrap gap-2">
                    {review.deviations.map((d) => (
                      <li key={d.id}>
                        <Badge variant="outline" className="text-amber-700 border-amber-300">{d.name}</Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {review.photos && review.photos.length > 0 && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Fotografías ({review.photos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {review.photos.map((photo) => {
                      const src = photo.url.startsWith('http') ? photo.url : `${baseUrl || ''}${photo.url}`;
                      return (
                        <a key={photo.id} href={src} target="_blank" rel="noopener noreferrer" className="block rounded border overflow-hidden">
                          <img src={src} alt={photo.caption || 'Foto revisión'} className="w-full h-24 object-cover" />
                          {photo.caption && <p className="text-xs p-1 truncate">{photo.caption}</p>}
                        </a>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!loading && !review && reviewId && (
          <p className="text-center text-muted-foreground py-8">No se encontró el registro.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
