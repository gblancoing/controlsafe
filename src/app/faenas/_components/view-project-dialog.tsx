'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/lib/types';
import { FolderKanban, MapPin, Building2, Users } from 'lucide-react';
import { getProjectById } from '../actions';
import { useEffect, useState } from 'react';

export function ViewProjectDialog({
  project,
  open,
  onOpenChange,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [projectDetails, setProjectDetails] = useState<Awaited<ReturnType<typeof getProjectById>>>(null);

  useEffect(() => {
    if (open) {
      getProjectById(project.id).then(setProjectDetails);
    }
  }, [open, project.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Detalles del Proyecto
          </DialogTitle>
          <DialogDescription>
            Información completa del proyecto
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {projectDetails ? (
            <>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{projectDetails.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {projectDetails.region && (
                      <Badge variant="outline">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {projectDetails.region}
                      </Badge>
                    )}
                  </div>
                </div>
                <Separator />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Empresa Mandante</p>
                    <p className="text-sm text-muted-foreground">
                      {projectDetails.clientCompanyName}
                    </p>
                  </div>
                </div>

                {projectDetails.region && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Región</p>
                      <p className="text-sm text-muted-foreground">{projectDetails.region}</p>
                    </div>
                  </div>
                )}
              </div>

              {projectDetails.subcontractorNames && projectDetails.subcontractorNames.length > 0 && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2">Subcontratistas</p>
                      <div className="flex flex-wrap gap-2">
                        {projectDetails.subcontractorNames.map((name, index) => (
                          <Badge key={index} variant="secondary">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!projectDetails.region && 
               (!projectDetails.subcontractorNames || projectDetails.subcontractorNames.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No hay información adicional disponible.</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Cargando detalles...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
