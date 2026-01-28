'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, XCircle, Clock, FileX, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import type { CriticalAlert } from '@/app/dashboard/actions';

export function CriticalAlerts({ alerts }: { alerts: CriticalAlert[] }) {
  const getAlertIcon = (type: CriticalAlert['type']) => {
    switch (type) {
      case 'overdue_control':
        return <Clock className="h-5 w-5 text-red-500" />;
      case 'inoperational_vehicle':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'urgent_rejection':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'expired_review':
        return <FileX className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSeverityBadge = (severity: CriticalAlert['severity']) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">Alta</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-500">Media</Badge>;
      case 'low':
        return <Badge variant="outline">Baja</Badge>;
    }
  };

  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-900">Alertas Críticas</CardTitle>
          </div>
          <Badge variant="destructive">{alerts.length}</Badge>
        </div>
        <CardDescription>
          Requieren atención inmediata
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>No hay alertas críticas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    </div>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  {alert.link && (
                    <Link href={alert.link}>
                      <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">
                        Ver detalles →
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
