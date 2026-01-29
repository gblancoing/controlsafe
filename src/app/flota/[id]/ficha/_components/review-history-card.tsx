'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { getVehicleReviewHistory } from '@/app/torque/actions-reviews';
import { useEffect, useState } from 'react';

type ReviewHistoryItem = {
  id: string;
  reviewDate: Date;
  status: 'Approved' | 'Rejected' | 'UrgentRejected';
  observations?: string;
  urgentRejectionReason?: string;
  requiredActions?: string;
  reviewer: {
    id: string;
    name: string;
    email: string;
  };
  driver?: {
    id: string;
    name: string;
    email: string;
  };
  checklistItems: Array<{
    id: string;
    item: string;
    checked: boolean;
    notes?: string;
  }>;
  photos: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
  deviations?: Array<{ id: string; name: string }>;
};

export function ReviewHistoryCard({ vehicleId }: { vehicleId: string }) {
  const [reviews, setReviews] = useState<ReviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener todas las revisiones de todos los controles preventivos del vehículo
    // Por ahora, necesitamos obtener los controles preventivos del vehículo primero
    // Esto se puede mejorar con una query más eficiente
    loadReviewHistory();
  }, [vehicleId]);

  const loadReviewHistory = async () => {
    try {
      setLoading(true);
      const history = await getVehicleReviewHistory(vehicleId);
      setReviews(history);
      setLoading(false);
    } catch (error) {
      console.error('Error loading review history:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ReviewHistoryItem['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Aprobado
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rechazado
          </Badge>
        );
      case 'UrgentRejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Rechazo Urgente
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Revisiones</CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Revisiones</CardTitle>
          <CardDescription>No hay revisiones registradas para este vehículo.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Revisiones</CardTitle>
        <CardDescription>
          Registro completo de todas las revisiones de controles preventivos realizadas a este vehículo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusBadge(review.status)}
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.reviewDate), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Revisado por: {review.reviewer.name}
                </p>
                {review.driver && (
                  <p className="text-xs text-muted-foreground">
                    Chofer: {review.driver.name}
                  </p>
                )}
              </div>
            </div>

            {review.observations && (
              <div>
                <p className="text-sm font-medium mb-1">Observaciones:</p>
                <p className="text-sm text-muted-foreground">{review.observations}</p>
              </div>
            )}

            {review.status === 'UrgentRejected' && (
              <div className="space-y-2 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm font-medium text-red-800">Motivo del Rechazo Urgente:</p>
                <p className="text-sm text-red-700">{review.urgentRejectionReason}</p>
                {review.requiredActions && (
                  <>
                    <p className="text-sm font-medium text-red-800 mt-2">Acciones Requeridas:</p>
                    <p className="text-sm text-red-700">{review.requiredActions}</p>
                  </>
                )}
              </div>
            )}

            {review.checklistItems.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Checklist:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {review.checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      {item.checked ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`text-xs ${item.checked ? 'text-green-700' : 'text-muted-foreground'}`}>
                        {item.item}
                      </span>
                    </div>
                  ))}
                </div>
                {review.checklistItems.some((item) => item.notes) && (
                  <div className="mt-2 space-y-1">
                    {review.checklistItems
                      .filter((item) => item.notes)
                      .map((item) => (
                        <div key={item.id} className="text-xs">
                          <span className="font-medium">{item.item}:</span>{' '}
                          <span className="text-muted-foreground">{item.notes}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {review.deviations && review.deviations.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Desviaciones detectadas:</p>
                <div className="flex flex-wrap gap-2">
                  {review.deviations.map((d) => (
                    <Badge key={d.id} variant="outline" className="text-xs">
                      {d.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {review.photos.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Fotografías:</p>
                <div className="grid grid-cols-4 gap-2">
                  {review.photos.map((photo) => (
                    <div key={photo.id} className="relative">
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Foto de revisión'}
                        className="w-full h-20 object-cover rounded border"
                      />
                      {photo.caption && (
                        <p className="text-xs text-muted-foreground mt-1">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
