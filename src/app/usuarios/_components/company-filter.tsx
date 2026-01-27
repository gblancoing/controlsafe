'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAllCompanies } from '../actions';

export function CompanyFilter({ initialCompanyId }: { initialCompanyId?: string }) {
  const router = useRouter();
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>(initialCompanyId || '__all__');

  useEffect(() => {
    getAllCompanies().then(setCompanies);
  }, []);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    const params = new URLSearchParams();
    // Si es "__all__", no agregar parámetro (mostrar todas)
    if (companyId && companyId !== '__all__') {
      params.set('company', companyId);
    }
    const queryString = params.toString();
    router.push(`/usuarios${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="company-filter" className="text-sm">
        Filtrar por Empresa:
      </Label>
      <Select value={selectedCompany} onValueChange={handleCompanyChange}>
        <SelectTrigger id="company-filter" className="w-[200px]">
          <SelectValue placeholder="Todas las empresas" />
        </SelectTrigger>
      <SelectContent>
        {companies.length > 0 ? (
          <>
            <SelectItem value="__all__">Todas las empresas</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </>
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No hay empresas disponibles
          </div>
        )}
      </SelectContent>
      </Select>
    </div>
  );
}
