import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { getRecentReviews } from '@/app/dashboard/actions';

export async function RecentActivity() {
  const recentReviews = await getRecentReviews();

  if (recentReviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas revisiones realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay actividad reciente
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-yellow-500" />;
      case 'UrgentRejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="default" className="bg-green-500">Aprobado</Badge>;
      case 'Rejected':
        return <Badge variant="secondary">Rechazado</Badge>;
      case 'UrgentRejected':
        return <Badge variant="destructive">Urgente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas revisiones realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentReviews.map((review) => (
            <div
              key={review.id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="mt-0.5">{getStatusIcon(review.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{review.vehicleName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {review.programName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(review.reviewDate), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  {getStatusBadge(review.status)}
                </div>
                {review.reviewerName && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Revisado por: {review.reviewerName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
