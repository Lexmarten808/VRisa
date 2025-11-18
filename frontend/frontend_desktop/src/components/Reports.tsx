import { useState } from 'react';
import {
  Download,
  Calendar,
  MapPin,
  FileText,
  TrendingUp,
  BarChart3,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { stations, historicalData, airQualityData } from '../lib/mockData';

export function Reports() {
  const [selectedPollutant, setSelectedPollutant] = useState('PM25');
  const [selectedStation, setSelectedStation] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');

  // Datos para la tabla de valores crudos
  const rawDataTable = [
    {
      datetime: '2024-11-10 14:00',
      station: 'Centro',
      PM25: 18.3,
      PM10: 45.7,
      O3: 62.4,
      NO2: 38.2,
      SO2: 8.5,
      CO: 1.2,
    },
    {
      datetime: '2024-11-10 13:00',
      station: 'Norte',
      PM25: 12.1,
      PM10: 28.4,
      O3: 55.8,
      NO2: 32.1,
      SO2: 6.2,
      CO: 0.9,
    },
    {
      datetime: '2024-11-10 12:00',
      station: 'Sur',
      PM25: 32.8,
      PM10: 72.3,
      O3: 68.9,
      NO2: 48.7,
      SO2: 12.4,
      CO: 2.1,
    },
    {
      datetime: '2024-11-10 11:00',
      station: 'Oeste',
      PM25: 21.5,
      PM10: 48.9,
      O3: 58.3,
      NO2: 40.6,
      SO2: 9.1,
      CO: 1.5,
    },
    {
      datetime: '2024-11-10 10:00',
      station: 'Este',
      PM25: 14.2,
      PM10: 31.6,
      O3: 51.2,
      NO2: 35.4,
      SO2: 7.3,
      CO: 1.0,
    },
  ];

  const chartData =
    selectedTimeRange === '24h'
      ? historicalData['24h']
      : selectedTimeRange === '7d'
      ? historicalData['7d']
      : historicalData['30d'];

  const renderChart = () => {
    const ChartComponent =
      chartType === 'line' ? LineChart : chartType === 'bar' ? BarChart : AreaChart;
    const DataComponent = chartType === 'line' ? Line : chartType === 'bar' ? Bar : Area;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={selectedTimeRange === '24h' ? 'time' : selectedTimeRange === '7d' ? 'day' : 'week'} />
          <YAxis />
          <Tooltip />
          <Legend />
          <DataComponent
            type="monotone"
            dataKey={selectedPollutant}
            stroke="#8b5cf6"
            fill="#8b5cf6"
            strokeWidth={2}
            name={selectedPollutant}
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Reportes y Análisis Detallado</h1>
          <p className="text-gray-600">
            Genera reportes personalizados y analiza tendencias de calidad del aire
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Reportes Predefinidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Reporte de Calidad del Aire</CardTitle>
                <p className="text-sm text-gray-600">Estado actual y promedio</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Generar Reporte
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">Reporte de Tendencias</CardTitle>
                <p className="text-sm text-gray-600">Análisis histórico</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Generar Reporte
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-base">Alertas Críticas</CardTitle>
                <p className="text-sm text-gray-600">Eventos importantes</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Generar Reporte
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de Análisis */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Análisis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pollutant-filter">Contaminante</Label>
              <Select value={selectedPollutant} onValueChange={setSelectedPollutant}>
                <SelectTrigger id="pollutant-filter">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PM25">PM2.5</SelectItem>
                  <SelectItem value="PM10">PM10</SelectItem>
                  <SelectItem value="O3">O3 (Ozono)</SelectItem>
                  <SelectItem value="NO2">NO2</SelectItem>
                  <SelectItem value="SO2">SO2</SelectItem>
                  <SelectItem value="CO">CO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="station-filter">Estación</Label>
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger id="station-filter">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las estaciones</SelectItem>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-filter">Rango de Tiempo</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger id="time-filter">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Últimas 24 horas</SelectItem>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chart-type">Tipo de Gráfico</Label>
              <Select value={chartType} onValueChange={(v) => setChartType(v as any)}>
                <SelectTrigger id="chart-type">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Líneas</SelectItem>
                  <SelectItem value="bar">Barras</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Estadístico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">18.7 µg/m³</div>
            <p className="text-xs text-gray-500 mt-1">En el periodo seleccionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Máximo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">32.8 µg/m³</div>
            <p className="text-xs text-gray-500 mt-1">10 Nov 2024, 12:00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Mínimo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">10.2 µg/m³</div>
            <p className="text-xs text-gray-500 mt-1">08 Nov 2024, 06:00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">87%</div>
            <p className="text-xs text-gray-500 mt-1">Dentro de límites</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tendencias */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gráfico de Tendencias - {selectedPollutant}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                {selectedTimeRange === '24h'
                  ? 'Últimas 24 horas'
                  : selectedTimeRange === '7d'
                  ? 'Últimos 7 días'
                  : 'Últimos 30 días'}
              </Badge>
              {selectedStation !== 'all' && (
                <Badge variant="outline">
                  {stations.find((s) => s.id === selectedStation)?.name || 'Todas'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderChart()}</CardContent>
      </Card>

      {/* Mapa de Calor por Zona */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estación</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stations.map((station) => ({
                  name: station.name,
                  value: station.pollutants[0]?.value || 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado por Contaminante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {airQualityData.map((data) => {
                const percentage = (data.value / data.limit) * 100;
                const color =
                  data.status === 'good'
                    ? 'bg-green-500'
                    : data.status === 'moderate'
                    ? 'bg-yellow-500'
                    : data.status === 'unhealthy'
                    ? 'bg-orange-500'
                    : 'bg-red-500';

                return (
                  <div key={data.pollutant}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">{data.pollutant}</span>
                      <span className="text-sm text-gray-600">
                        {data.value} / {data.limit} {data.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Datos Crudos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Datos Crudos</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Tabla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Estación</TableHead>
                <TableHead>PM2.5</TableHead>
                <TableHead>PM10</TableHead>
                <TableHead>O3</TableHead>
                <TableHead>NO2</TableHead>
                <TableHead>SO2</TableHead>
                <TableHead>CO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawDataTable.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.datetime}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.station}</Badge>
                  </TableCell>
                  <TableCell>{row.PM25}</TableCell>
                  <TableCell>{row.PM10}</TableCell>
                  <TableCell>{row.O3}</TableCell>
                  <TableCell>{row.NO2}</TableCell>
                  <TableCell>{row.SO2}</TableCell>
                  <TableCell>{row.CO}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
