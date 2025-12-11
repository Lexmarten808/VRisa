import { useEffect, useState, useMemo } from 'react';
import { AlertCircle, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
// charts removed: keep file minimal (tendencias temporales removed)
import axios from 'axios';
// prefer live backend data; remove mocks to avoid showing stale/example values
import { MapView } from './MapView';

export function Dashboard() {
  
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [airQualityData, setAirQualityData] = useState<any[]>([]);
  const [variablesMap, setVariablesMap] = useState<Record<string,string>>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertsLoading, setAlertsLoading] = useState<boolean>(false);

  const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000';
  const api = axios.create({ baseURL: API_BASE });

  const normalizeCode = (name: string) => {
    if (!name) return '';
    return name.toString().replace(/\s+/g, '').replace(/\./g, '').replace(/,/g, '').toUpperCase();
  };

  // Default limits to display status when backend doesn't provide limits
  const DEFAULT_LIMITS: Record<string, { limit: number; unit?: string }> = {
    PM25: { limit: 35, unit: 'µg/m3' },
    PM10: { limit: 150, unit: 'µg/m3' },
    O3: { limit: 0.070, unit: 'ppm' },
    NO2: { limit: 0.053, unit: 'ppm' },
    SO2: { limit: 0.075, unit: 'ppm' },
    CO: { limit: 9, unit: 'ppm' },
  };

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

  // charts removed

  useEffect(() => {
    // Load stations and measurements from backend; fall back to mock data on error
    (async () => {
      try {
        const resp = await api.get('/api/stations/');
        const items = Array.isArray(resp.data) ? resp.data : (resp.data?.results ?? []);
        if (items.length) setStations(items);
      } catch (e) {
        // keep mock stations
        console.warn('No se pudieron cargar estaciones desde backend, usando mocks', e);
      }

      // Try to load an aggregated air quality report from backend (preferred)
      try {
        const aqresp = await api.get('/api/reports/air_quality/');
        const summary = aqresp.data?.summary ?? (Array.isArray(aqresp.data) ? aqresp.data : (aqresp.data?.results ?? []));
        if (Array.isArray(summary) && summary.length) {
          const mapped = summary.map((s: any) => {
            const vid = String(s.variable__v_id ?? s.variable_id ?? s.variable ?? '');
            const name = s.variable__v_name || s.variable_name || s.variable || vid;
            const unit = s.variable__v_unit || '';
            const value = Number(s.avg ?? s.value ?? s.v_value ?? 0);
            const code = normalizeCode(name).replace('PM2,5','PM25').replace('PM2.5','PM25');
            const mappedDefault = DEFAULT_LIMITS[code];
            const limit = Number(s.limit ?? s.threshold ?? (mappedDefault ? mappedDefault.limit : (value ? value * 2 : 100)));
            let status: 'good' | 'moderate' | 'unhealthy' | 'critical' = 'good';
            if (value >= limit) status = 'critical';
            else if (value > limit * 0.8) status = 'unhealthy';
            else if (value > limit * 0.5) status = 'moderate';
            return { pollutant: name, pollutant_id: vid, value, unit, limit, status };
          });
          setAirQualityData(mapped);
        }
      } catch (ae) {
        // ignore - we'll fallback to measurements aggregation below
      }

      try {
        const mresp = await api.get('/api/measurements/');
        const measurements = Array.isArray(mresp.data) ? mresp.data : (mresp.data?.results ?? []);
        if (measurements.length) {
          // Load variables map to translate ids -> names
          try {
            const vresp = await api.get('/api/variables/');
            const vars = Array.isArray(vresp.data) ? vresp.data : (vresp.data?.results ?? []);
            const vmap: Record<string,string> = {};
            for (const vv of vars) vmap[String(vv.v_id)] = vv.v_name;
            setVariablesMap(vmap);
            // Quick aggregation: build simple airQualityData from latest measurements grouped by variable
          } catch (ve) {
            console.warn('No se pudieron cargar variables para traducción', ve);
          }

          // Build a local variables map (id -> name/unit) for aggregation
          const vmap: Record<string,string> = {};
          const vmapUnit: Record<string,string> = {};
          try {
            const vresp = await api.get('/api/variables/');
            const vars = Array.isArray(vresp.data) ? vresp.data : (vresp.data?.results ?? []);
            for (const vv of vars) {
              vmap[String(vv.v_id ?? vv.id ?? '')] = vv.v_name || '';
              vmapUnit[String(vv.v_id ?? vv.id ?? '')] = vv.v_unit || '';
            }
            setVariablesMap(vmap);
          } catch (ve) {
            console.warn('No se pudieron cargar variables para traducción', ve);
          }

          // Aggregate measurements by variable id to compute averages (promedio general)
          const sums: Record<string, { sum: number; count: number; name?: string; unit?: string; latestDate?: string }> = {};
          for (const m of measurements) {
            const rawVar = m.variable || m.variable_id;
            let varId = '';
            let varName = '';
            if (m.variable && typeof m.variable === 'object') {
              varId = String(m.variable.v_id ?? m.variable.id ?? '');
              varName = String(m.variable.v_name ?? m.variable.name ?? varId);
            } else {
              varId = String(m.variable ?? m.variable_id ?? '');
              varName = vmap[varId] || String(rawVar);
            }
            const val = Number(m.m_value ?? m.value ?? NaN);
            const md = m.m_date || m.date || m.datetime || null;
            if (!md || !Number.isFinite(val)) continue;

            if (!sums[varId]) sums[varId] = { sum: 0, count: 0, name: varName, unit: vmapUnit[varId] || '', latestDate: md };
            sums[varId].sum += val;
            sums[varId].count += 1;
            if (!sums[varId].latestDate || new Date(md) > new Date(sums[varId].latestDate || 0)) sums[varId].latestDate = md;

            const code = normalizeCode(varName).replace('PM2,5','PM25').replace('PM2.5','PM25');
          }

          const aq = Object.keys(sums).map((id) => {
            const s = sums[id];
            const avg = s.count ? s.sum / s.count : 0;
            const name = s.name || vmap[id] || id;
            const code = normalizeCode(name).replace('PM2,5','PM25').replace('PM2.5','PM25');
            const mappedDefault = DEFAULT_LIMITS[code];
            const limit = Number(mappedDefault ? mappedDefault.limit : Math.max(1, avg * 2));
            let status: 'good' | 'moderate' | 'unhealthy' | 'critical' = 'good';
            if (avg >= limit) status = 'critical';
            else if (avg > limit * 0.8) status = 'unhealthy';
            else if (avg > limit * 0.5) status = 'moderate';
            return { pollutant: name, pollutant_id: id, value: Number(avg.toFixed(2)), unit: s.unit || '', limit, status };
          });
          setAirQualityData(aq);
          // Condiciones meteorológicas: eliminado por solicitud del usuario
          // For historical, attempt to group by day/time for PM25 as example
          const hist24: any[] = measurements.slice(-24).map((m: any) => ({ time: new Date(m.m_date).toLocaleTimeString(), PM25: Number(m.m_value) }));
          // historical data / charts removed - no-op
        }
      } catch (e) {
        console.warn('No se pudieron cargar mediciones desde backend, usando mocks', e);
      }
    })();
  }, []);

  // fetch alerts on mount so Dashboard shows them by default
  useEffect(() => {
    (async () => {
      setAlertsLoading(true);
      try {
        const resp = await api.get('/api/reports/alerts/');
        const raw = resp.data?.alerts ?? (Array.isArray(resp.data) ? resp.data : (resp.data?.results ?? []));
        const mapped = (Array.isArray(raw) ? raw : []).map((a: any) => ({
          title: a.title ?? a.variable ?? a.variable_name ?? (a.severity ? `Alerta (${a.severity})` : 'Alerta'),
          message: a.message ?? a.description ?? (a.variable ? `${a.variable} ${a.value ?? ''}` : ''),
          datetime: a.datetime ?? a.date ?? a.time ?? null,
          station: a.station ?? a.station_name ?? null,
          value: a.value ?? null,
          variable: a.variable ?? a.variable_name ?? null,
        }));
        if (mapped && mapped.length) {
          setAlerts(mapped);
        } else {
          // fallback: compute simple alerts from recent measurements when backend returns none
          try {
            // load recent measurements (last 7 days)
            const mresp = await api.get('/api/measurements/', { params: { days: 7 } });
            const measurements = Array.isArray(mresp.data) ? mresp.data : (mresp.data?.results ?? []);
            // load variables to map ids->codes
            const vresp = await api.get('/api/variables/');
            const vars = Array.isArray(vresp.data) ? vresp.data : (vresp.data?.results ?? []);
            const vcode: Record<string,string> = {};
            for (const vv of vars) {
              const id = String(vv.v_id ?? vv.id ?? '');
              const name = (vv.v_name || vv.name || '').toString();
              const norm = name.replace(/\s+/g, '').replace(/\./g, '').replace(/,/g, '').toUpperCase();
              vcode[id] = norm.replace('PM2,5','PM25').replace('PM2.5','PM25');
            }
            const DEFAULT_LIMITS: Record<string, { limit: number; unit?: string }> = {
              PM25: { limit: 35, unit: 'µg/m3' },
              PM10: { limit: 150, unit: 'µg/m3' },
              O3: { limit: 0.070, unit: 'ppm' },
              NO2: { limit: 0.053, unit: 'ppm' },
              SO2: { limit: 0.075, unit: 'ppm' },
              CO: { limit: 9, unit: 'ppm' },
            };
            const computed: any[] = [];
            for (const m of measurements) {
              let vid = '';
              if (m.variable && typeof m.variable === 'object') vid = String(m.variable.v_id ?? m.variable.id ?? '');
              else vid = String(m.variable ?? m.variable_id ?? '');
              const varName = (m.variable && (m.variable.v_name || m.variable.name)) || '';
              const code = (vcode[vid] || (varName || '').toString().replace(/\s+/g, '').replace(/\./g, '').toUpperCase()).replace('PM2,5','PM25').replace('PM2.5','PM25');
              const val = Number(m.m_value ?? m.value ?? NaN);
              if (!Number.isFinite(val) || Number.isNaN(val)) continue;
              const mappedDefault = DEFAULT_LIMITS[code];
              const limit = Number(m.limit ?? m.threshold ?? (mappedDefault ? mappedDefault.limit : NaN));
              if (!Number.isFinite(limit) || Number.isNaN(limit)) continue;
              if (val < limit) continue;
              const md = m.m_date || m.date || m.datetime || null;
              const stationName = m.station_name || m.station || (m.sensor && m.sensor.station_name) || null;
              computed.push({ title: `Alerta ${code}`, message: `${code} excedió el límite (${val} >= ${limit})`, datetime: md, station: stationName, value: val, variable: code });
            }
            if (computed.length) setAlerts(computed);
            else setAlerts(mapped);
          } catch (me) {
            // if anything fails, set mapped (empty)
            console.warn('Fallback alert computation failed', me);
            setAlerts(mapped);
          }
        }
      } catch (e) {
        console.warn('Error cargando alertas en dashboard', e);
        setAlerts([]);
      } finally {
        setAlertsLoading(false);
      }
    })();
  }, []);

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
        {airQualityData.map((data, idx) => (
          <Card key={`${data.pollutant}-${idx}`}>
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

      {/* Condiciones meteorológicas eliminadas */}

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
                {alertsLoading ? (
                  <div className="p-4 bg-gray-50 rounded-lg">Cargando alertas...</div>
                ) : (
                  <div className="space-y-2">
                    {alerts && alerts.length ? (
                      alerts.map((a: any, i: number) => (
                        <div key={i} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div>
                              <div className="font-semibold text-orange-900">{a.title}</div>
                              <div className="text-sm text-orange-700 mt-1">{a.message}</div>
                              <div className="text-xs text-orange-600 mt-2">{a.datetime ? new Date(a.datetime).toLocaleString() : ''}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg">No hay alertas en este momento.</div>
                    )}
                  </div>
                )}

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

            {/* Estaciones Activas removed per request */}
          </CardContent>
        </Card>
      </div>

      {/* Tendencias temporales removed per request */}
    </div>
  );
}
