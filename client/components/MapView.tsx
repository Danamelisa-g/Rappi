'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <p>Cargando mapa...</p>,
});


export default MapView;
export type { MapMarker } from './LeafletMap'
