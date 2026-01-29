'use client';

import { useEffect, useState } from 'react';

export function VehicleFichaQR({ vehicleId }: { vehicleId: string }) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    // URL pública: sin login, solo la ficha
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/ficha/${vehicleId}`;
    
    // Usar API pública para generar QR code
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
    setQrUrl(qrApiUrl);
  }, [vehicleId]);

  if (!qrUrl) {
    return (
      <div className="w-[150px] h-[150px] border rounded-lg flex items-center justify-center bg-muted">
        <p className="text-xs text-muted-foreground">Cargando QR...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <img 
        src={qrUrl} 
        alt="Código QR de la ficha del vehículo" 
        className="w-[150px] h-[150px] border rounded-lg"
      />
      <p className="text-xs text-muted-foreground text-center max-w-[150px]">
        Escanea para acceder a esta ficha
      </p>
    </div>
  );
}
