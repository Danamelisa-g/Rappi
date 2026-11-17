'use client';
import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { LatLng } from '@/lib/types';


export interface MapMarker {
  position: LatLng;
  kind: 'delivery' | 'destination';
  label: string;
}
export interface LeafletMapProps {
  center: LatLng;
  markers: MapMarker[];
  onMapClick?: (point: LatLng) => void;
  follow?: LatLng | null;
  height?: number;
  zoom?: number;
}



const makeIcon = (emoji: string) => L.divIcon({ html: `<div style="font-size:28px;line-height:28px;">${emoji}</div>`,className: 'emoji-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
const ICONS = {
  delivery: makeIcon('🛵'),
  destination: makeIcon('📍'),
};

const ClickHandler = ({ onMapClick }: { onMapClick: (point: LatLng) => void }) => {
  useMapEvents({
    click: (e) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
};


const Follow = ({ point }: { point: LatLng }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo([point.lat, point.lng], { animate: true });
  }, [map, point.lat, point.lng]);
  return null;
};


export default function LeafletMap({ center, markers, onMapClick, follow, height = 320, zoom = 17 }: LeafletMapProps) {
  return (
    <MapContainer center={[center.lat, center.lng]}zoom={zoom}style={{ height, width: '100%', borderRadius: 12 }}keyboard={false} 
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => (
        <Marker key={m.kind} position={[m.position.lat, m.position.lng]} icon={ICONS[m.kind]}>
          <Popup>{m.label}</Popup>
        </Marker>
      ))}
      {onMapClick && <ClickHandler onMapClick={onMapClick} />}
      {follow && <Follow point={follow} />}
    </MapContainer>
  );
}


