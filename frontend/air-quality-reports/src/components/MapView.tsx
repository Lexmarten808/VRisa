import { MapPin } from 'lucide-react';
import { Station } from '../lib/mockData';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface MapViewProps {
  stations: Station[];
  onStationSelect?: (station: Station) => void;
  selectedStation?: Station | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'good':
      return 'bg-green-500';
    case 'moderate':
      return 'bg-yellow-500';
    case 'unhealthy':
      return 'bg-orange-500';
    case 'critical':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'good':
      return 'Bueno';
    case 'moderate':
      return 'Moderado';
    case 'unhealthy':
      return 'No Saludable';
    case 'critical':
      return 'Crítico';
    default:
      return 'Desconocido';
  }
};

export function MapView({ stations, onStationSelect, selectedStation }: MapViewProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden border-2 border-gray-200">
          {/* Mapa de Cali - visualización simplificada */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <MapPin className="h-16 w-16 mx-auto mb-2" />
              <p>Mapa de Cali, Colombia</p>
            </div>
          </div>

          {/* Estaciones en el mapa */}
          {stations.map((station) => {
            // Convertir coordenadas reales a posición en el contenedor (simplificado)
            const left = ((station.lng + 76.56) * 8000) % 100;
            const top = ((3.48 - station.lat) * 8000) % 100;

            return (
              <div
                key={station.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
                onClick={() => onStationSelect?.(station)}
              >
                <div className="relative group">
                  <div
                    className={`w-8 h-8 rounded-full ${getStatusColor(
                      station.status
                    )} opacity-30 animate-pulse absolute inset-0 transform scale-150`}
                  ></div>
                  <div
                    className={`w-8 h-8 rounded-full ${getStatusColor(
                      station.status
                    )} border-4 border-white shadow-lg flex items-center justify-center relative z-10`}
                  >
                    <MapPin className="h-4 w-4 text-white" />
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                    <div className="bg-white rounded-lg shadow-xl p-3 whitespace-nowrap border-2 border-gray-200">
                      <div className="font-semibold">{station.name}</div>
                      <div className="text-sm text-gray-600">{station.institution}</div>
                      <Badge
                        className={`mt-1 ${
                          station.status === 'good'
                            ? 'bg-green-500'
                            : station.status === 'moderate'
                            ? 'bg-yellow-500'
                            : station.status === 'unhealthy'
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                      >
                        {getStatusText(station.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Estación seleccionada */}
        {selectedStation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold">Estación: {selectedStation.name}</div>
                <div className="text-sm text-gray-600">{selectedStation.institution}</div>
              </div>
              <Badge
                className={`${
                  selectedStation.status === 'good'
                    ? 'bg-green-500'
                    : selectedStation.status === 'moderate'
                    ? 'bg-yellow-500'
                    : selectedStation.status === 'unhealthy'
                    ? 'bg-orange-500'
                    : 'bg-red-500'
                }`}
              >
                {getStatusText(selectedStation.status)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {selectedStation.pollutants.map((pollutant) => (
                <div key={pollutant.pollutant} className="bg-white p-2 rounded border">
                  <div className="text-xs text-gray-600">{pollutant.pollutant}</div>
                  <div className="font-semibold">
                    {pollutant.value} {pollutant.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leyenda */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm">Bueno</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm">Moderado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-sm">No Saludable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm">Crítico</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
