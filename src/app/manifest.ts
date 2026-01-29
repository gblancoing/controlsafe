import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ControlSafe',
    short_name: 'ControlSafe',
    description: 'Control Avanzado para la Seguridad Minera',
    start_url: '/',
    display: 'standalone',
    background_color: '#f1f5f9',
    theme_color: '#1e4d7b',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['business', 'productivity'],
  };
}
