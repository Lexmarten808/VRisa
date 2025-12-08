import { MapPin } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  stations: any[];
  onStationSelect?: (station: any) => void;
  selectedStation?: any | null;
  hotspots?: { lat: number; lon: number; intensity: number }[];
}

const getMarkerColor = (status: string) => {
  switch ((status || '').toString().toLowerCase()) {
    case 'good':
      return '#16a34a'; // green
    case 'moderate':
      return '#eab308'; // yellow
    case 'unhealthy':
      return '#f97316'; // orange
    case 'critical':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};

function FitBounds({ stations }: { stations: any[] }) {
  const map = useMap();
  if (!stations || stations.length === 0) return null;
  const points: [number, number][] = [];
  for (const s of stations) {
    const lat = Number(s.lat ?? s.latitude ?? s.latitude_deg);
    const lon = Number(s.lon ?? s.longitude ?? s.longitude_deg ?? s.lng ?? s.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    points.push([lat, lon]);
  }
  if (points.length === 0) return null;
  try {
    map.fitBounds(points, { padding: [40, 40] });
  } catch (e) {
    // ignore
  }
  return null;
}

export function MapView({ stations, onStationSelect, selectedStation, hotspots }: MapViewProps) {
  // Default center on Cali, Valle del Cauca
  const defaultCenter: [number, number] = [3.43722, -76.5225];
  const defaultZoom = 12;

  return (
    <Card className="h-full">
      <CardContent className="p-0">
        <div className="w-full h-[100%] min-h-[400px]">
          {/* cast MapContainer props to any to avoid TypeScript incompatibilities between react-leaflet versions */}
          <MapContainer {...({ center: defaultCenter, zoom: defaultZoom, style: { width: '100%', height: '100%' } } as any)}>
            {/* cast props to any to satisfy differing TileLayer prop types across react-leaflet versions */}
            <TileLayer {...({ attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' } as any)} />

            <FitBounds stations={stations} />

            {/* Station markers */}
            {stations.map((station, idx) => {
              const lat = Number(station.lat ?? station.latitude ?? station.latitude_deg);
              const lon = Number(station.lon ?? station.longitude ?? station.longitude_deg ?? station.lng ?? station.longitude);
              if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
              const key = station.station_id ?? station.id ?? station.s_name ?? station.name ?? idx;
              const status = (station.status || station.s_state || 'unknown').toString();
              const color = getMarkerColor(status);
              const radius = selectedStation && (selectedStation.station_id ?? selectedStation.id) === (station.station_id ?? station.id) ? 10 : 6;
              const markerProps = {
                center: [lat, lon],
                pathOptions: { color, fillColor: color, fillOpacity: 0.9, weight: 1 },
                radius,
                eventHandlers: { click: () => onStationSelect?.(station) }
              };
              return (
                <CircleMarker key={String(key)} {...(markerProps as any)}>
                  <Popup>
                    <div className="space-y-1">
                      <div className="font-semibold">{station.s_name || station.name || String(key)}</div>
                      <div className="text-sm text-gray-600">{station.institution?.i_name || station.institution || ''}</div>
                      <div className="text-xs">{`Ubicación: ${lat.toFixed(5)}, ${lon.toFixed(5)}`}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* Hotspots as semi-transparent circles */}
            {(hotspots || []).map((h, i) => {
              const lat = Number(h.lat);
              const lon = Number(h.lon);
              if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
              const intensity = Number(h.intensity ?? 0);
              const color = intensity > 100 ? '#ef4444' : intensity > 50 ? '#f97316' : '#facc15';
              // approximate radius in meters (visual only)
              const radius = Math.min(2000, Math.max(200, intensity * 30));
              const circleProps = { center: [lat, lon], radius, pathOptions: { color, fillColor: color, fillOpacity: 0.18, weight: 0 } };
              return <Circle key={`hot-${i}`} {...(circleProps as any)} />;
            })}
          </MapContainer>
        </div>

        {/* Leyenda */}
        <div className="p-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: '#16a34a' }}></div>
              <span className="text-sm">Bueno</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: '#eab308' }}></div>
              <span className="text-sm">Moderado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: '#f97316' }}></div>
              <span className="text-sm">No Saludable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: '#ef4444' }}></div>
              <span className="text-sm">Crítico</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
