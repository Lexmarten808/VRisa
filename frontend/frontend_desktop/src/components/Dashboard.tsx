import { useState } from 'react';
import {
  Wind,
  Droplets,
  Thermometer,
  TrendingUp,
  AlertCircle,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { airQualityData, weatherData, stations, historicalData } from '../lib/mockData';
import { MapView } from './MapView';

export function Dashboard() {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedStation, setSelectedStation] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500 text-white';
      case 'moderate':
        return 'bg-yellow-500 text-white';
      case 'unhealthy':
        return 'bg-orange-500 text-white';
      case 'critical':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
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

  const chartData =
    timeRange === '24h'
      ? historicalData['24h']
      : timeRange === '7d'
      ? historicalData['7d']
      : historicalData['30d'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard de Calidad del Aire</h1>
          <p className="text-gray-600">Monitoreo en tiempo real - Cali, Colombia</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Indicadores Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {airQualityData.map((data) => (
          <Card key={data.pollutant}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">{data.pollutant}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl">{data.value}</div>
                <div className="text-xs text-gray-500">{data.unit}</div>
                <Progress value={(data.value / data.limit) * 100} className="h-2" />
                <Badge className={getStatusColor(data.status)}>{getStatusText(data.status)}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Datos Meteorológicos */}
      <Card>
        <CardHeader>
          <CardTitle>Condiciones Meteorológicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Thermometer className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Temperatura</div>
                <div className="text-xl">{weatherData.temperature}°C</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Humedad</div>
                <div className="text-xl">{weatherData.humidity}%</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Wind className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Velocidad del Viento</div>
                <div className="text-xl">{weatherData.windSpeed} km/h</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Dirección</div>
                <div className="text-xl">{weatherData.windDirection}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mapa Interactivo */}
        <MapView
          stations={stations}
          onStationSelect={setSelectedStation}
          selectedStation={selectedStation}
        />

        {/* Alertas y Reportes Rápidos */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas y Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-orange-900">
                    Alerta: Nivel de O3 elevado
                  </div>
                  <div className="text-sm text-orange-700 mt-1">
                    Se detectaron niveles de ozono por encima del límite recomendado en la zona
                    Centro. Se recomienda limitar actividades al aire libre.
                  </div>
                  <div className="text-xs text-orange-600 mt-2">Hace 2 horas</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Reportes Disponibles</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Reporte de Calidad del Aire
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Reporte de Tendencias
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Alertas Críticas
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Estaciones Activas</h3>
              <div className="grid grid-cols-2 gap-2">
                {stations.slice(0, 4).map((station) => (
                  <div
                    key={station.id}
                    className="p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedStation(station)}
                  >
                    <div className="text-sm font-semibold">{station.name}</div>
                    <Badge
                      className={`mt-1 text-xs ${getStatusColor(station.status)}`}
                      size="sm"
                    >
                      {getStatusText(station.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Tendencias */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tendencias Temporales</CardTitle>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar rango" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Últimas 24 horas</SelectItem>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={timeRange === '24h' ? 'time' : timeRange === '7d' ? 'day' : 'week'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="PM25" stroke="#8b5cf6" strokeWidth={2} name="PM2.5" />
              <Line type="monotone" dataKey="PM10" stroke="#3b82f6" strokeWidth={2} name="PM10" />
              <Line type="monotone" dataKey="O3" stroke="#f59e0b" strokeWidth={2} name="O3" />
              <Line type="monotone" dataKey="NO2" stroke="#10b981" strokeWidth={2} name="NO2" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
