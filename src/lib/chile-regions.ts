/**
 * Regiones de Chile
 * Datos estáticos de las 16 regiones de Chile con sus códigos oficiales
 */

export type ChileRegion = {
  id: string;
  name: string;
  code: string;
  country: string;
};

export const CHILE_REGIONS: ChileRegion[] = [
  { id: 'reg-01', name: 'Región de Arica y Parinacota', code: 'XV', country: 'Chile' },
  { id: 'reg-02', name: 'Región de Tarapacá', code: 'I', country: 'Chile' },
  { id: 'reg-03', name: 'Región de Antofagasta', code: 'II', country: 'Chile' },
  { id: 'reg-04', name: 'Región de Atacama', code: 'III', country: 'Chile' },
  { id: 'reg-05', name: 'Región de Coquimbo', code: 'IV', country: 'Chile' },
  { id: 'reg-06', name: 'Región de Valparaíso', code: 'V', country: 'Chile' },
  { id: 'reg-07', name: 'Región Metropolitana de Santiago', code: 'RM', country: 'Chile' },
  { id: 'reg-08', name: "Región del Libertador General Bernardo O'Higgins", code: 'VI', country: 'Chile' },
  { id: 'reg-09', name: 'Región del Maule', code: 'VII', country: 'Chile' },
  { id: 'reg-10', name: 'Región de Ñuble', code: 'XVI', country: 'Chile' },
  { id: 'reg-11', name: 'Región del Biobío', code: 'VIII', country: 'Chile' },
  { id: 'reg-12', name: 'Región de La Araucanía', code: 'IX', country: 'Chile' },
  { id: 'reg-13', name: 'Región de Los Ríos', code: 'XIV', country: 'Chile' },
  { id: 'reg-14', name: 'Región de Los Lagos', code: 'X', country: 'Chile' },
  { id: 'reg-15', name: 'Región de Aysén del General Carlos Ibáñez del Campo', code: 'XI', country: 'Chile' },
  { id: 'reg-16', name: 'Región de Magallanes y de la Antártica Chilena', code: 'XII', country: 'Chile' },
];

/**
 * Obtener una región por su ID
 */
export function getRegionById(id: string): ChileRegion | undefined {
  return CHILE_REGIONS.find((region) => region.id === id);
}

/**
 * Obtener una región por su código
 */
export function getRegionByCode(code: string): ChileRegion | undefined {
  return CHILE_REGIONS.find((region) => region.code === code);
}

/**
 * Obtener todas las regiones como opciones para un select
 */
export function getRegionsAsOptions() {
  return CHILE_REGIONS.map((region) => ({
    value: region.id,
    label: region.name,
  }));
}
