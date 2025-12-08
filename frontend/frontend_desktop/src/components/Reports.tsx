import { useEffect, useState } from 'react';
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
import axios from 'axios';
import { MapView } from './MapView';
import { stations as mockStations, historicalData as mockHistorical, airQualityData as mockAirQuality } from '../lib/mockData';

export function Reports() {
  const formatNumber = (v: any, decimals = 1) => {
    if (v === null || v === undefined) return '';
    const n = Number(v);
    if (Number.isNaN(n)) return '';
    // remove trailing .0 if decimals=1 and integer
    const s = n.toFixed(decimals);
    return s.replace(/\.0+$/, '');
  };

  // Default realistic limits per pollutant/variable (used when backend doesn't provide a limit)
  // Values chosen as common 24h/short-term reference (EPA/WHO style) or comfortable thresholds
  const DEFAULT_LIMITS: Record<string, { limit: number; unit?: string }> = {
    PM25: { limit: 35, unit: 'µg/m3' },
    PM10: { limit: 150, unit: 'µg/m3' },
    O3: { limit: 0.070, unit: 'ppm' },
    NO2: { limit: 0.053, unit: 'ppm' },
    SO2: { limit: 0.075, unit: 'ppm' },
    CO: { limit: 9, unit: 'ppm' },
    // temperature / humidity comfortable thresholds
    TEMPERATURE: { limit: 35, unit: '°C' },
    TEMPERATURA: { limit: 35, unit: '°C' },
    HUMIDITY: { limit: 70, unit: '%' },
    HUMEDAD: { limit: 70, unit: '%' },
    WINDSPEED: { limit: 15, unit: 'm/s' },
    VELOCIDADVIENTO: { limit: 15, unit: 'm/s' },
  };

  const normalizeCode = (name: string) => {
    if (!name) return '';
    return name.toString().replace(/\s+/g, '').replace(/\./g, '').replace(/,/g, '').toUpperCase();
  };

  const getDecimalsForUnitOrCode = (unit?: string, code?: string) => {
    const u = (unit || (code && DEFAULT_LIMITS[code]?.unit) || '').toString().toLowerCase();
    if (!u) return 1;
    if (u.includes('ppm')) return 3;
    if (u.includes('µg') || u.includes('ug')) return 1;
    if (u.includes('%')) return 0;
    if (u.includes('°') || u.includes('c')) return 1;
    if (u.includes('m/s')) return 1;
    return 2;
  };

  const resolveStationName = (m: any, sensorsList?: any[], stationsList?: any[]) => {
    // Prefer explicit station name fields
    if (!m) return '—';
    if (m.station_name) return m.station_name;
    if (m.station && typeof m.station === 'string') return m.station;
    // If sensor object has station info
    if (m.sensor && typeof m.sensor === 'object') {
      if (m.sensor.station_name) return m.sensor.station_name;
      if (m.sensor.station) return m.sensor.station;
      if (m.sensor.station_id) return String(m.sensor.station_id);
    }

    const sensorsArr = sensorsList ?? sensors;
    const stationsArr = stationsList ?? stations;

    // Try to resolve via sensor id
    let sensorId = '';
    if (m.sensor && typeof m.sensor === 'object') sensorId = String(m.sensor.sensor_id ?? m.sensor.id ?? '');
    else sensorId = String(m.sensor ?? m.sensor_id ?? '');
    if (sensorId && Array.isArray(sensorsArr)) {
      const s = sensorsArr.find((x: any) => String(x.sensor_id ?? x.id ?? '') === sensorId);
      if (s) {
        if (s.station_name) return s.station_name;
        // try to lookup station by id on sensor record
        const stId = String(s.station ?? s.station_id ?? '');
        if (stId && Array.isArray(stationsArr)) {
          const st = stationsArr.find((x: any) => String(x.station_id ?? x.id ?? '') === stId);
          if (st) return st.s_name || st.name || stId;
        }
      }
    }

    // Try to resolve via station id on measurement
    const stIdFromM = String(m.station ?? m.station_id ?? '');
    if (stIdFromM && Array.isArray(stationsArr)) {
      const st = stationsArr.find((x: any) => String(x.station_id ?? x.id ?? x.s_name ?? x.name ?? '') === stIdFromM);
      if (st) return st.s_name || st.name || stIdFromM;
    }

    // Fallback to sensorId or station id or placeholder
    if (sensorId) return sensorId;
    if (stIdFromM) return stIdFromM;
    return '—';
  };

  const [selectedPollutant, setSelectedPollutant] = useState('PM25');
  const [selectedStation, setSelectedStation] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [stations, setStations] = useState<any[]>(mockStations);
  const [sensors, setSensors] = useState<any[]>([]);
  const [variables, setVariables] = useState<any[]>([]);
  const [vmapState, setVmapState] = useState<Record<string,string>>({});
  const [vunitState, setVunitState] = useState<Record<string,string>>({});
  const [vcodeState, setVcodeState] = useState<Record<string,string>>({});
  const [historicalData, setHistoricalData] = useState<any>(mockHistorical);
  const [airQualityData, setAirQualityData] = useState<any[]>(mockAirQuality);
  const [rawDataTable, setRawDataTable] = useState<any[]>([]);
  const [alertsData, setAlertsData] = useState<any[]>([]);
  const [airQualityLoading, setAirQualityLoading] = useState<boolean>(false);
  const [trendsLoading, setTrendsLoading] = useState<boolean>(false);
  const [alertsLoading, setAlertsLoading] = useState<boolean>(false);
  const [infrastructureData, setInfrastructureData] = useState<any[]>([]);
  const [infraExpanded, setInfraExpanded] = useState<boolean>(false);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [projectionData, setProjectionData] = useState<any[]>([]);
  const [projectionError, setProjectionError] = useState<string | null>(null);
  const [trendsPoints, setTrendsPoints] = useState<number>(0);
  
  // summary stats to show in the small cards (average / max / min / compliance)
  const [summaryAvg, setSummaryAvg] = useState<number | null>(null);
  const [summaryMax, setSummaryMax] = useState<number | null>(null);
  const [summaryMaxDate, setSummaryMaxDate] = useState<string | null>(null);
  const [summaryMaxSeries, setSummaryMaxSeries] = useState<number | null>(null);
  const [summaryMaxSeriesDate, setSummaryMaxSeriesDate] = useState<string | null>(null);
  const [summaryMaxMeasurements, setSummaryMaxMeasurements] = useState<number | null>(null);
  const [summaryMaxMeasurementsDate, setSummaryMaxMeasurementsDate] = useState<string | null>(null);
  const [summaryMin, setSummaryMin] = useState<number | null>(null);
  const [summaryMinDate, setSummaryMinDate] = useState<string | null>(null);
  const [summaryCompliance, setSummaryCompliance] = useState<number | null>(null);

  const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000';
  const api = axios.create({ baseURL: API_BASE });

  // Known contaminant codes we care about
  const CONTAMINANT_CODES = ['PM25', 'PM10', 'O3', 'NO2', 'SO2', 'CO'];

  

  useEffect(() => {
    (async () => {
      try {
        // Fetch stations, sensors, variables and measurements in a defined order
        const [sresp, sresp2, vresp, mresp] = await Promise.all([
          api.get('/api/stations/'),
          api.get('/api/sensors/'),
          api.get('/api/variables/'),
          api.get('/api/measurements/'),
        ]);

        const stationsList = Array.isArray(sresp.data) ? sresp.data : (sresp.data?.results ?? []);
        const sensorsList = Array.isArray(sresp2.data) ? sresp2.data : (sresp2.data?.results ?? []);
        const vars = Array.isArray(vresp.data) ? vresp.data : (vresp.data?.results ?? []);
        const measurements = Array.isArray(mresp.data) ? mresp.data : (mresp.data?.results ?? []);

        if (stationsList.length) setStations(stationsList);
        if (sensorsList.length) setSensors(sensorsList);
        if (vars.length) setVariables(vars);

        // build maps for stations and sensors
        const stationMap: Record<string,string> = {};
        for (const st of stationsList) {
          const sid = String(st.station_id ?? st.id ?? '');
          stationMap[sid] = st.s_name || st.name || sid;
        }

        const sensorToStationName: Record<string,string> = {};
        for (const se of sensorsList) {
          const sensorId = String(se.sensor_id ?? se.id ?? se.sensor ?? '');
          const stId = String(se.station ?? se.station_id ?? se.station ?? '');
          sensorToStationName[sensorId] = stationMap[stId] || se.station_name || stId;
        }

        // build variable maps
        const vmap: Record<string,string> = {};
        const vunit: Record<string,string> = {};
        const vcode: Record<string,string> = {};
        for (const vv of vars) {
          const id = String(vv.v_id ?? vv.id ?? '');
          vmap[id] = vv.v_name;
          vunit[id] = vv.v_unit || '';
          const name = (vv.v_name || '').toString();
          const norm = name.replace(/\s+/g, '').replace(/\./g, '').toUpperCase();
          vcode[id] = norm.replace('PM2,5','PM25').replace('PM2.5','PM25');
        }
        setVmapState(vmap);
        setVunitState(vunit);
        setVcodeState(vcode);

        // build raw rows with resolved station and variable names
        const raw = measurements.slice(-200).map((m: any) => {
          let sensorId = '';
          if (m.sensor && typeof m.sensor === 'object') sensorId = String(m.sensor.sensor_id ?? m.sensor.id ?? '');
          else sensorId = String(m.sensor ?? m.sensor_id ?? '');
          const stationName = sensorToStationName[sensorId] || stationMap[String(m.station ?? m.station_id ?? '')] || sensorId || '—';

          let varId = '';
          if (m.variable && typeof m.variable === 'object') varId = String(m.variable.v_id ?? m.variable.id ?? m.variable.variable_id ?? '');
          else varId = String(m.variable ?? m.variable_id ?? '');
          const varName = (m.variable && (m.variable.v_name || m.variable.name)) || vmap[varId] || varId;
          const unit = vunit[varId] || '';
          const code = vcode[varId] || (varName || '').toString().replace(/\s+/g, '').replace(/\./g, '').toUpperCase();
          const value = Number(m.m_value);
          return {
            datetime: m.m_date,
            station_id: sensorId || String(m.station ?? m.station_id ?? ''),
            station_display: stationName,
            station: stationName,
            variable: varName,
            variable_id: varId,
            unit,
            PM25: code === 'PM25' ? value : null,
            PM10: code === 'PM10' ? value : null,
            O3: code === 'O3' ? value : null,
            NO2: code === 'NO2' ? value : null,
            SO2: code === 'SO2' ? value : null,
            CO: code === 'CO' ? value : null,
          };
        });

        setRawDataTable(raw);
        // quick historical summary
        setHistoricalData({ '7d': measurements.slice(-168).map((m: any) => ({ day: new Date(m.m_date).toLocaleDateString(), PM25: Number(m.m_value) })) });
      } catch (e) {
        console.warn('No se pudieron cargar datos para reports', e);
      }
      // fetch infrastructure summary separately
      try {
        const infra = await api.get('/api/reports/infrastructure/');
        const sts = infra.data?.stations ?? [];
        setInfrastructureData(sts);
      } catch (ie) {
        console.warn('No se pudo cargar infraestructura', ie);
      }
    })();
  }, []);

  // compute which contaminant codes exist in loaded `variables` and ensure the pollutant selector
  // only shows contaminants that exist in the backend. Also adjust the selected pollutant
  // if the current default is not available.
  useEffect(() => {
    try {
      const present = new Set<string>();
      for (const vv of variables) {
        const id = String(vv.v_id ?? vv.id ?? '');
        const name = (vv.v_name || vv.name || '').toString();
        if (!name) continue;
        const derived = (vcodeState[id] || name.replace(/\s+/g, '').replace(/\./g, '').toUpperCase()).replace('PM2,5','PM25').replace('PM2.5','PM25');
        present.add(derived);
      }
      const availableContaminants = CONTAMINANT_CODES.filter((c) => present.has(c));
      // if our currently selected pollutant isn't available, pick the first available contaminant
      if (availableContaminants.length && !availableContaminants.includes(selectedPollutant)) {
        setSelectedPollutant(availableContaminants[0]);
      }
    } catch (err) {
      // silent - defensive
      console.warn('Error computing available contaminants', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variables, vcodeState]);

  const generateAirQualityReport = async () => {
    setAirQualityLoading(true);
    try {
      let computedFromSeries = false;
      // If trends data for the selected range exists, prefer computing summary from that series
      try {
        // Use only the series that matches the selected time range — do not fallback to 'all'
        const series = (historicalData && (historicalData[selectedTimeRange])) || [];
        if (Array.isArray(series) && series.length) {
          const valsFromSeries: Array<{v:number;d?:string}> = [];
          for (const p of series) {
            const v = Number(p[selectedPollutant]);
            if (!Number.isNaN(v)) valsFromSeries.push({ v, d: p.time ?? p.day ?? p.datetime ?? undefined });
          }
          if (valsFromSeries.length) {
            const sum = valsFromSeries.reduce((s, x) => s + x.v, 0);
            const avg = sum / valsFromSeries.length;
            const maxRec = valsFromSeries.reduce((a, b) => (b.v > a.v ? b : a), valsFromSeries[0]);
            const minRec = valsFromSeries.reduce((a, b) => (b.v < a.v ? b : a), valsFromSeries[0]);
            setSummaryAvg(avg);
            setSummaryMaxSeries(maxRec.v);
            setSummaryMaxSeriesDate(maxRec.d || null);
            setSummaryMin(minRec.v);
            setSummaryMinDate(minRec.d || null);
            computedFromSeries = true;
            const code = selectedPollutant;
            const mappedDefault = DEFAULT_LIMITS[code];
            const limit = mappedDefault ? mappedDefault.limit : undefined;
            if (limit) {
              const under = valsFromSeries.filter((x) => x.v <= limit).length;
              setSummaryCompliance(Math.round((under / valsFromSeries.length) * 100));
            } else {
              setSummaryCompliance(null);
            }
            // We used trends series to compute summary; continue to still fetch details below but avoid overwriting
          }
        }
      } catch (se) {
        // ignore trends-series summary computation errors
      }
      const params: any = {};
      if (selectedStation !== 'all') params.station_id = selectedStation;
      // quick map time range to start/end
      const now = new Date();
      // Only set start_date when a finite recent window is requested; if 'all' is selected omit it
      if (selectedTimeRange === '24h') params.start_date = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
      if (selectedTimeRange === '7d') params.start_date = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
      if (selectedTimeRange === '30d') params.start_date = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
      // if selectedTimeRange === 'all' -> do not set start_date so backend may return all data

      const resp = await api.get('/api/reports/air_quality/', { params });
      const summary = resp.data?.summary ?? [];
      const hotspots = resp.data?.hotspots ?? [];
      const heat = resp.data?.heatmap ?? [];

      // Ensure variable maps are available (may have been loaded on mount)
      if (!Object.keys(vmapState).length) {
        try {
          const vresp = await api.get('/api/variables/');
          const vars = Array.isArray(vresp.data) ? vresp.data : (vresp.data?.results ?? []);
          const vmap: Record<string,string> = {};
          const vunit: Record<string,string> = {};
          const vcode: Record<string,string> = {};
          for (const vv of vars) {
            const id = String(vv.v_id ?? vv.id ?? '');
            vmap[id] = vv.v_name;
            vunit[id] = vv.v_unit || '';
            const name = (vv.v_name || '').toString();
            const norm = name.replace(/\s+/g, '').replace(/\./g, '').toUpperCase();
            vcode[id] = norm.replace('PM2,5','PM25').replace('PM2.5','PM25');
          }
          setVmapState(vmap);
          setVunitState(vunit);
          setVcodeState(vcode);
        } catch (ve) {
          console.warn('No se pudieron cargar variables dentro de air quality', ve);
        }
      }

      const previousAirQuality = airQualityData && airQualityData.length ? airQualityData : [];

      const mappedSummary = summary.map((s: any) => {
        const vid = String(s.variable__v_id ?? s.variable_id ?? s.variable ?? '');
        const name = s.variable__v_name || vmapState[vid] || (s.variable_name || vid) || vid;
        let unit = s.variable__v_unit || vunitState[vid] || '';
        const value = Number(s.avg ?? s.value ?? s.v_value ?? 0);
        // determine a standardized code for the variable
        const code = vcodeState[vid] || normalizeCode(name);
        // prefer backend-provided limit, else map a default realistic limit
        const mappedDefault = DEFAULT_LIMITS[code];
        const limit = Number(s.limit ?? s.threshold ?? (mappedDefault ? mappedDefault.limit : (value ? value * 2 : 100)));
        if (!unit && mappedDefault?.unit) unit = mappedDefault.unit;
        let status: 'good' | 'moderate' | 'unhealthy' | 'very-unhealthy' = 'good';
        if (value > limit) status = 'very-unhealthy';
        else if (value > limit * 0.8) status = 'unhealthy';
        else if (value > limit * 0.5) status = 'moderate';
        else status = 'good';
        return { pollutant: name, pollutant_id: vid, value, unit, limit, status };
      });

      // If the backend returned no summary, try to compute it from raw measurements
      if (!mappedSummary.length) {
        try {
          const mresp = await api.get('/api/measurements/', { params });
          const measurements = Array.isArray(mresp.data) ? mresp.data : (mresp.data?.results ?? []);
          // ensure variable maps exist
          if (!Object.keys(vmapState).length) {
            const vresp2 = await api.get('/api/variables/');
            const vars2 = Array.isArray(vresp2.data) ? vresp2.data : (vresp2.data?.results ?? []);
            const vmap2: Record<string,string> = {};
            const vunit2: Record<string,string> = {};
            for (const vv of vars2) {
              const id = String(vv.v_id ?? vv.id ?? '');
              vmap2[id] = vv.v_name;
              vunit2[id] = vv.v_unit || '';
            }
            setVmapState((prev) => ({ ...prev, ...vmap2 }));
            setVunitState((prev) => ({ ...prev, ...vunit2 }));
          }

          // Instead of averaging, compute the most recent measurement per variable
          // (Dashboard shows latest values; align Reports with that behavior)
          const latestByVar: Record<string, { m_date: string; value: number; rawVar: any }> = {};
          for (const m of measurements) {
            let vid = '';
            if (m.variable && typeof m.variable === 'object') vid = String(m.variable.v_id ?? m.variable.id ?? '');
            else vid = String(m.variable ?? m.variable_id ?? '');
            if (!vid) continue;
            const val = Number(m.m_value ?? m.value ?? 0);
            const md = m.m_date || m.date || m.datetime;
            if (!md) continue;
            if (!latestByVar[vid] || new Date(md) > new Date(latestByVar[vid].m_date)) {
              latestByVar[vid] = { m_date: md, value: val, rawVar: m.variable };
            }
          }

          const fallbackLatest = Object.keys(latestByVar).map((vid) => {
            const rec = latestByVar[vid];
            const name = vmapState[vid] || (rec.rawVar && (rec.rawVar.v_name || rec.rawVar.name)) || vid;
            let unit = vunitState[vid] || (rec.rawVar && rec.rawVar.v_unit) || '';
            const value = Number(rec.value ?? 0);
            const code = vcodeState[vid] || normalizeCode(name);
            const mappedDefault = DEFAULT_LIMITS[code];
            const limit = mappedDefault ? mappedDefault.limit : (value ? value * 2 : 100);
            if (!unit && mappedDefault?.unit) unit = mappedDefault.unit;
            let status: 'good' | 'moderate' | 'unhealthy' | 'very-unhealthy' = 'good';
            if (value > limit) status = 'very-unhealthy';
            else if (value > limit * 0.8) status = 'unhealthy';
            else if (value > limit * 0.5) status = 'moderate';
            return { pollutant: name, pollutant_id: vid, value, unit, limit, status };
          });

          if (fallbackLatest.length) setAirQualityData(fallbackLatest);
          else {
            console.warn('Air quality: backend summary empty and fallback produced no data, restoring previous');
            setAirQualityData(previousAirQuality);
          }
        } catch (me) {
          console.warn('Error computing fallback air quality from measurements', me);
          setAirQualityData(previousAirQuality);
        }
      } else {
        setAirQualityData(mappedSummary);
      }
      setHotspots(hotspots);
      setHeatmap(heat);

      // attach hotspots to stations state for visualization
      if (hotspots.length) {
        const mapped = hotspots.map((h: any) => ({ name: h.sensor__station__s_name, value: h.avg_value }));
        setStations((prev) => prev.map((st) => {
          const name = st.s_name || st.name || st.station_id;
          const found = mapped.find((m: any) => m.name === name);
          return { ...st, pollutants: found ? [found] : st.pollutants };
        }));
      }
      // Refresh infrastructure with the same params so it reflects filters
      try {
        const infraParams: any = {};
        if (selectedStation !== 'all') infraParams.station_id = selectedStation;
        if (selectedTimeRange !== 'all') {
          const now = new Date();
          if (selectedTimeRange === '24h') infraParams.start_date = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
          if (selectedTimeRange === '7d') infraParams.start_date = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
          if (selectedTimeRange === '30d') infraParams.start_date = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
        }
        const infraResp = await api.get('/api/reports/infrastructure/', { params: infraParams });
        const sts = infraResp.data?.stations ?? infraResp.data ?? [];
        setInfrastructureData(Array.isArray(sts) ? sts : (sts.results ?? []));
      } catch (ie) {
        console.warn('No se pudo cargar infraestructura con filtros', ie);
      }

      // Compute summary statistics (avg / max / min / compliance) for the selected pollutant using measurements
      try {
        const mparams: any = {};
        if (selectedStation !== 'all') mparams.station_id = selectedStation;
        if (selectedTimeRange !== 'all') {
          const now = new Date();
          if (selectedTimeRange === '24h') mparams.start_date = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
          if (selectedTimeRange === '7d') mparams.start_date = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
          if (selectedTimeRange === '30d') mparams.start_date = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
        }
        // resolve pollutant code -> variable id when possible
        const codeToId: Record<string,string> = {};
        for (const [id, code] of Object.entries(vcodeState)) codeToId[code] = id;
        // If we can resolve selectedPollutant to a variable id, ask backend to filter by that id.
        // Otherwise do NOT send the raw selectedPollutant string as `variable` (backend may ignore it or return unrelated data).
        if (codeToId[selectedPollutant]) mparams.variable = codeToId[selectedPollutant];

        const mresp2 = await api.get('/api/measurements/', { params: mparams });
        const measurementsForStats = Array.isArray(mresp2.data) ? mresp2.data : (mresp2.data?.results ?? []);

        // Ensure we only compute stats for the selected pollutant code. If backend didn't filter (because we couldn't
        // resolve to an id), filter client-side by resolving each measurement's variable code using vcodeState or name normalization.
        const filteredMeasurements: any[] = [];
        for (const m of measurementsForStats) {
          let varId = '';
          if (m.variable && typeof m.variable === 'object') varId = String(m.variable.v_id ?? m.variable.id ?? m.variable.variable_id ?? '');
          else varId = String(m.variable ?? m.variable_id ?? '');
          const varName = (m.variable && (m.variable.v_name || m.variable.name)) || vmapState[varId] || '';
          const code = (vcodeState[varId] || normalizeCode(varName)).replace('PM2,5','PM25').replace('PM2.5','PM25');
          if (code === selectedPollutant) filteredMeasurements.push(m);
        }

        const vals: Array<{v:number;d:string}> = [];
        for (const m of filteredMeasurements) {
          const val = Number(m.m_value ?? m.value ?? m.v_value ?? 0);
          const md = m.m_date || m.date || m.datetime || null;
          if (!Number.isNaN(val) && md) vals.push({ v: val, d: md });
        }
        // filteredMeasurements ready
        if (vals.length) {
          const sum = vals.reduce((s, x) => s + x.v, 0);
          const avg = sum / vals.length;
          const maxRec = vals.reduce((a, b) => (b.v > a.v ? b : a), vals[0]);
          const minRec = vals.reduce((a, b) => (b.v < a.v ? b : a), vals[0]);
          const code = selectedPollutant;
          const mappedDefault = DEFAULT_LIMITS[code];
          const limit = mappedDefault ? mappedDefault.limit : undefined;
          const complianceVal = limit ? Math.round((vals.filter((x) => x.v <= limit).length / vals.length) * 100) : null;
          // also update rawDataTable to reflect filtered measurements
          const rawRows = filteredMeasurements.slice(-200).map((m: any) => {
            let sensorId = '';
            if (m.sensor && typeof m.sensor === 'object') sensorId = String(m.sensor.sensor_id ?? m.sensor.id ?? '');
            else sensorId = String(m.sensor ?? m.sensor_id ?? '');
            const stationName = resolveStationName(m, sensors, stations);
            let varId = '';
            if (m.variable && typeof m.variable === 'object') varId = String(m.variable.v_id ?? m.variable.id ?? m.variable.variable_id ?? '');
            else varId = String(m.variable ?? m.variable_id ?? '');
            const varName = (m.variable && (m.variable.v_name || m.variable.name)) || vmapState[varId] || varId;
            const unit = vunitState[varId] || '';
            const code = vcodeState[varId] || (varName || '').toString().replace(/\s+/g, '').replace(/\./g, '').toUpperCase();
            const value = Number(m.m_value ?? m.value ?? 0);
            return {
              datetime: m.m_date || m.date || m.datetime,
              station_id: sensorId || String(m.station ?? m.station_id ?? ''),
              station_display: stationName,
              station: stationName,
              variable: varName,
              variable_id: varId,
              unit,
              PM25: code === 'PM25' ? value : null,
              PM10: code === 'PM10' ? value : null,
              O3: code === 'O3' ? value : null,
              NO2: code === 'NO2' ? value : null,
              SO2: code === 'SO2' ? value : null,
              CO: code === 'CO' ? value : null,
            };
          });
          setRawDataTable(rawRows);
          // Only overwrite the summary cards if we did NOT compute them from the trends series
          if (!computedFromSeries) {
            setSummaryAvg(avg);
            setSummaryMaxMeasurements(maxRec.v);
            setSummaryMaxMeasurementsDate(maxRec.d);
            setSummaryMin(minRec.v);
            setSummaryMinDate(minRec.d);
            setSummaryCompliance(complianceVal);
          }
        } else {
          setSummaryAvg(null);
          setSummaryMaxSeries(null);
          setSummaryMaxSeriesDate(null);
          setSummaryMaxMeasurements(null);
          setSummaryMaxMeasurementsDate(null);
          setSummaryMin(null);
          setSummaryMinDate(null);
          setSummaryCompliance(null);
        }
      } catch (se) {
        console.warn('Error computing summary stats', se);
      }

      
    } catch (e) {
      console.warn('Error generando reporte de calidad del aire', e);
    } finally {
      setAirQualityLoading(false);
    }
  };

  const generateTrendsReport = async () => {
    setTrendsLoading(true);
    try {
      // Ensure variable maps exist to resolve codes -> ids
      if (!Object.keys(vcodeState).length) {
        try {
          const vresp = await api.get('/api/variables/');
          const vars = Array.isArray(vresp.data) ? vresp.data : (vresp.data?.results ?? []);
          const vmap: Record<string,string> = {};
          const vunit: Record<string,string> = {};
          const vcode: Record<string,string> = {};
          for (const vv of vars) {
            const id = String(vv.v_id ?? vv.id ?? '');
            vmap[id] = vv.v_name;
            vunit[id] = vv.v_unit || '';
            const name = (vv.v_name || '').toString();
            const norm = name.replace(/\s+/g, '').replace(/\./g, '').toUpperCase();
            vcode[id] = norm.replace('PM2,5','PM25').replace('PM2.5','PM25');
          }
          setVmapState(vmap);
          setVunitState(vunit);
          setVcodeState(vcode);
        } catch (ve) {
          console.warn('No se pudieron cargar variables para trends', ve);
        }
      }

      // Try to resolve selectedPollutant (code like PM25) to a variable id
      let variableParam: any = selectedPollutant;
      // build reverse map code -> id
      const codeToId: Record<string,string> = {};
      for (const [id, code] of Object.entries(vcodeState)) codeToId[code] = id;
      if (codeToId[selectedPollutant]) variableParam = codeToId[selectedPollutant];

      // For 'all' don't pass a `days` filter so backend may return full history
      const params: any = {};
      if (selectedTimeRange !== 'all') params.days = selectedTimeRange === '24h' ? 1 : selectedTimeRange === '7d' ? 7 : 30;
      params.variable = variableParam;
      if (selectedStation !== 'all') params.station_id = selectedStation;

      const resp = await api.get('/api/reports/trends/', { params });
      const series = resp.data?.series ?? [];
      // normalize into historicalData expected shape using selectedPollutant as key (so charts keep same key)
      let seriesData = series.map((s: any) => {
        // s may include time/day fields — keep `time` and `day` if provided
        const timeKey = s.time ?? s.datetime ?? s.date ?? s.day ?? s.t ?? null;
        const displayKey = selectedTimeRange === '24h' ? 'time' : (selectedTimeRange === '7d' || selectedTimeRange === 'all') ? 'day' : 'week';
        const point: any = {};
        point[displayKey] = timeKey ?? (s.time || s.day || new Date().toISOString());
        point[selectedPollutant] = Number(s.value ?? s.avg ?? s.v_value ?? NaN);
        return point;
      });

      // sanitize and strictly filter seriesData to the requested time window (avoid showing stale data)
      try {
        const now = new Date();
        const days = selectedTimeRange === '24h' ? 1 : selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 0;
        const start = days ? new Date(now.getTime() - days * 24 * 3600 * 1000) : null;
        seriesData = seriesData
          .map((p: any) => {
            const displayKey = selectedTimeRange === '24h' ? 'time' : (selectedTimeRange === '7d' || selectedTimeRange === 'all') ? 'day' : 'week';
            const raw = p[displayKey];
            let parsed: Date | null = null;
            if (raw) {
              const s = raw.toString();
              // possible formats: ISO, YYYY-MM-DD, or custom
              const d = new Date(s);
              if (!isNaN(d.getTime())) parsed = d;
            }
            return { point: p, time: parsed };
          })
          .filter((x: any) => {
            // value must be finite and non-NaN
            const val = Number(x.point[selectedPollutant]);
            if (!Number.isFinite(val) || Number.isNaN(val)) return false;
            // if a bounded window is requested, ensure time exists and is within window
            if (start) {
              if (!x.time) return false;
              return x.time >= start && x.time <= now;
            }
            return true;
          })
          .map((x: any) => x.point);
      } catch (pf) {
        // if anything goes wrong parsing dates, fall back to existing seriesData but filter NaN
        seriesData = seriesData.filter((p: any) => Number.isFinite(Number(p[selectedPollutant])) && !Number.isNaN(Number(p[selectedPollutant])));
      }

      // If backend returned empty series, attempt a fallback aggregation from /api/measurements/
      if (!seriesData.length) {
        try {
          // backend returned empty series; attempting fallback aggregation from /api/measurements/
          const mresp = await api.get('/api/measurements/');
          const measurements = Array.isArray(mresp.data) ? mresp.data : (mresp.data?.results ?? []);
          const now = new Date();
          const days = selectedTimeRange === '24h' ? 1 : selectedTimeRange === '7d' ? 7 : 30;
          const start = new Date(now.getTime() - days * 24 * 3600 * 1000);

          // build reverse map code -> id once
          const codeToId: Record<string,string> = {};
          if (vcodeState && Object.keys(vcodeState).length) {
            for (const [id, code] of Object.entries(vcodeState)) codeToId[code] = id;
          }

          const filtered = measurements.filter((m: any) => {
            const md = new Date(m.m_date || m.date || m.datetime);
            if (isNaN(md.getTime())) return false;
              // If selectedTimeRange is 'all', we don't filter by start date
              if (selectedTimeRange !== 'all' && md < start) return false;
            // variable match
            let vid = '';
            if (m.variable && typeof m.variable === 'object') vid = String(m.variable.v_id ?? m.variable.id ?? '');
            else vid = String(m.variable ?? m.variable_id ?? '');
            if (codeToId[selectedPollutant] && vid !== codeToId[selectedPollutant]) return false;
            if (selectedStation !== 'all') {
              const sensorStation = m.sensor && typeof m.sensor === 'object' ? String(m.sensor.station ?? m.sensor.station_id ?? '') : String(m.sensor_station ?? m.station ?? m.station_id ?? '');
              if (sensorStation && sensorStation !== selectedStation) return false;
            }
            return true;
          });

          const buckets: Record<string,{ sum:number; count:number }> = {};
          for (const m of filtered) {
            const md = new Date(m.m_date || m.date || m.datetime);
            const key = selectedTimeRange === '24h' ? md.toISOString().substring(0,13) + ':00' : md.toISOString().substring(0,10);
            if (!buckets[key]) buckets[key] = { sum: 0, count: 0 };
            const val = Number(m.m_value ?? m.value ?? 0);
            if (!Number.isNaN(val)) { buckets[key].sum += val; buckets[key].count += 1; }
          }
          seriesData = Object.entries(buckets).sort((a,b) => a[0].localeCompare(b[0])).map(([k,v]) => {
            const displayKey = selectedTimeRange === '24h' ? 'time' : 'day';
            const point: any = {};
            point[displayKey] = k;
            point[selectedPollutant] = v.count ? v.sum / v.count : 0;
            return point;
          });
        } catch (fe) {
          console.warn('Error computing fallback trends from measurements', fe);
        }
      }

      setHistoricalData({ [selectedTimeRange]: seriesData });
      setTrendsPoints(seriesData.length);

      // also request a simple projection (use variableParam id if available)
      try {
        setProjectionError(null);
        // Only request projection if we have enough points (backend requires >=3)
        const availablePoints = series.length || (seriesData && seriesData.length) || 0;
        if (availablePoints < 3) {
          setProjectionData([]);
          setProjectionError('No hay suficientes puntos históricos para generar la proyección (mínimo 3).');
        } else {
          // For projection, if 'all' selected use a reasonable hours window (e.g. 720h ~= 30d)
          const hours = selectedTimeRange === '24h' ? 24 : selectedTimeRange === '7d' ? 168 : selectedTimeRange === '30d' ? 720 : 720;
          const presp = await api.get('/api/reports/projection/', { params: { variable: variableParam, station_id: selectedStation !== 'all' ? selectedStation : undefined, hours, points: 24 } });
          setProjectionData(presp.data?.projection ?? []);
        }
      } catch (pe: any) {
        // If backend responds 400 Not enough data, show a friendly message and keep projections empty
        if (pe?.response?.status === 400) {
          const msg = pe.response?.data?.error || JSON.stringify(pe.response?.data) || 'Proyección no disponible';
          console.warn('Projection not available (backend):', msg);
          setProjectionError(String(msg));
        } else {
          console.warn('No se pudo obtener proyección', pe);
          setProjectionError('Error al obtener la proyección');
        }
        setProjectionData([]);
      }
    } catch (e) {
      console.warn('Error generando reporte de tendencias', e);
    } finally {
      setTrendsLoading(false);
    }
  };

  const generateAlertsReport = async () => {
    setAlertsLoading(true);
    try {
      // Fetch backend alerts
      const params: any = {};
      if (selectedTimeRange !== 'all') params.days = selectedTimeRange === '24h' ? 1 : selectedTimeRange === '7d' ? 7 : 30;
      if (selectedStation !== 'all') params.station_id = selectedStation;
      // Ask backend for alerts for the selected pollutant when possible
      params.variable = selectedPollutant;
      const resp = await api.get('/api/reports/alerts/', { params });
      const backendAlerts = resp.data?.alerts ?? [];

      // Additionally compute alerts client-side from recent measurements that exceed limits
      try {
        const mparams: any = {};
        if (selectedStation !== 'all') mparams.station_id = selectedStation;
        if (selectedTimeRange !== 'all') {
          const now = new Date();
          if (selectedTimeRange === '24h') mparams.start_date = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
          if (selectedTimeRange === '7d') mparams.start_date = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
          if (selectedTimeRange === '30d') mparams.start_date = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
        }

        // Try to resolve pollutant code -> variable id for backend filtering
        const codeToId: Record<string,string> = {};
        for (const [id, code] of Object.entries(vcodeState)) codeToId[code] = id;
        if (codeToId[selectedPollutant]) mparams.variable = codeToId[selectedPollutant];

        const mresp = await api.get('/api/measurements/', { params: mparams });
        const measurements = Array.isArray(mresp.data) ? mresp.data : (mresp.data?.results ?? []);

        // Build set of existing alert keys to dedupe (station|datetime|variable|value)
        const existingKeys = new Set<string>();
        for (const a of backendAlerts) {
          try {
            const key = `${a.station || ''}|${a.datetime || a.date || a.time || ''}|${a.variable || a.variable_name || ''}|${a.value || ''}`;
            existingKeys.add(key);
          } catch (e) {
            // ignore
          }
        }

        const computedAlerts: any[] = [];
        for (const m of measurements) {
          // resolve variable id/name/code
          let vid = '';
          if (m.variable && typeof m.variable === 'object') vid = String(m.variable.v_id ?? m.variable.id ?? '');
          else vid = String(m.variable ?? m.variable_id ?? '');
          const varName = (m.variable && (m.variable.v_name || m.variable.name)) || vmapState[vid] || '';
          const code = (vcodeState[vid] || normalizeCode(varName)).replace('PM2,5','PM25').replace('PM2.5','PM25');

          // Only consider measurements matching selected pollutant (if set)
          if (selectedPollutant && code !== selectedPollutant) continue;

          const val = Number(m.m_value ?? m.value ?? m.v_value ?? NaN);
          if (!Number.isFinite(val) || Number.isNaN(val)) continue;

          const mappedDefault = DEFAULT_LIMITS[code];
          const limit = Number(m.limit ?? m.threshold ?? (mappedDefault ? mappedDefault.limit : NaN));
          if (!Number.isFinite(limit) || Number.isNaN(limit)) continue;
          // Include measurements that are equal to the limit as alerts (>=)
          if (val < limit) continue;

          const md = m.m_date || m.date || m.datetime || null;
          const stationName = m.station_name || m.station || (m.sensor && m.sensor.station_name) || '';
          const key = `${stationName}|${md || ''}|${code}|${val}`;
          if (existingKeys.has(key)) continue;

          computedAlerts.push({ station: stationName || '—', datetime: md, value: formatNumber(val, getDecimalsForUnitOrCode(vunitState[vid], code)), variable: code, limit });
          existingKeys.add(key);
        }

        setAlertsData([...backendAlerts, ...computedAlerts]);
      } catch (me) {
        // if measurements fetch fails, fall back to backend alerts only
        setAlertsData(backendAlerts);
      }
    } catch (e) {
      console.warn('Error generando alertas', e);
      setAlertsData([]);
    } finally {
      setAlertsLoading(false);
    }
  };

  // Auto-apply filters: when pollutant/station/timeRange change, refresh reports (debounced)
  // Wait until `variables` (and thus `vcodeState`) are loaded to avoid running reports
  // before variable maps exist (this caused the initial PM2.5 filter to show no data).
  useEffect(() => {
    if (!variables || variables.length === 0) {
      // variables not loaded yet — skip auto-apply until initial data is available
      return;
    }

    const id = setTimeout(() => {
      (async () => {
        try {
          await generateTrendsReport();
        } catch (e) {
          console.warn('generateTrendsReport failed during auto-apply', e);
        }
        try {
          await generateAirQualityReport();
        } catch (e) {
          console.warn('generateAirQualityReport failed during auto-apply', e);
        }
        try {
          await generateAlertsReport();
        } catch (e) {
          console.warn('generateAlertsReport failed during auto-apply', e);
        }
      })();
    }, 450);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPollutant, selectedStation, selectedTimeRange, variables]);

  // rawDataTable is stored in state (populated from measurements)

  const chartData = (() => {
    const key = selectedTimeRange === '24h' ? '24h' : selectedTimeRange === '7d' ? '7d' : selectedTimeRange === '30d' ? '30d' : 'all';
    const data = historicalData && historicalData[key];
    return Array.isArray(data) ? data : [];
  })();

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="py-12 text-center text-sm text-gray-500">No hay datos de tendencias para el periodo seleccionado.</div>
      );
    }

    const ChartComponent = chartType === 'line' ? LineChart : chartType === 'bar' ? BarChart : AreaChart;
    // pick the appropriate element component
    const DataComponent: any = chartType === 'line' ? Line : chartType === 'bar' ? Bar : Area;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={selectedTimeRange === '24h' ? 'time' : (selectedTimeRange === '7d' || selectedTimeRange === 'all') ? 'day' : 'week'} />
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

  // compute which contaminant codes are present (use variables state)
  const _presentCodes = new Set<string>();
  for (const vv of variables) {
    const id = String(vv.v_id ?? vv.id ?? '');
    const name = (vv.v_name || vv.name || '').toString();
    if (!name) continue;
    const derived = (vcodeState[id] || name.replace(/\s+/g, '').replace(/\./g, '').toUpperCase()).replace('PM2,5','PM25').replace('PM2.5','PM25');
    _presentCodes.add(derived);
  }
  const availableContaminants = CONTAMINANT_CODES.filter((c) => _presentCodes.has(c));
  const contaminantLabels: Record<string,string> = { PM25: 'PM2.5', PM10: 'PM10', O3: 'O3 (Ozono)', NO2: 'NO2', SO2: 'SO2', CO: 'CO' };
  const pollutantUnit: string = (() => {
    const id = Object.keys(vcodeState).find((k) => vcodeState[k] === selectedPollutant);
    return (id && vunitState[id]) || (DEFAULT_LIMITS[selectedPollutant] && DEFAULT_LIMITS[selectedPollutant].unit) || '';
  })();

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
            <Button variant="outline" className="w-full" onClick={() => generateAirQualityReport()}>
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
            <Button variant="outline" className="w-full" onClick={() => generateTrendsReport()}>
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
            <Button variant="outline" className="w-full" onClick={() => generateAlertsReport()}>
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
                    {availableContaminants.length ? (
                      availableContaminants.map((c) => (
                        <SelectItem key={c} value={c}>{contaminantLabels[c] || c}</SelectItem>
                      ))
                    ) : (
                      // fallback: show all known contaminants if none detected in variables
                      CONTAMINANT_CODES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))
                    )}
                    {/* Dynamic variables (e.g., Temperature/Humidity) - only show variables that have recent measurements */}
                    {(() => {
                      const recentVarIds = new Set<string>(rawDataTable.map((r: any) => String(r.variable_id ?? '')));
                      return variables.map((vv: any) => {
                        const id = String(vv.v_id ?? vv.id ?? '');
                        if (!id) return null;
                        // only include if present in recent measurements to avoid showing unsupported variables
                        if (!recentVarIds.has(id)) return null;
                        const name = vv.v_name || vv.name || id;
                        const unit = vv.v_unit ? ` (${vv.v_unit})` : '';
                        // derive a code similar to vcodeState if not present
                        const derived = (vcodeState[id] || name.replace(/\s+/g, '').replace(/\./g, '').toUpperCase()).replace('PM2,5','PM25').replace('PM2.5','PM25');
                        // Avoid duplicating items already listed above
                        if (CONTAMINANT_CODES.includes(derived)) return null;
                        return (
                          <SelectItem key={id} value={derived}>
                            {name}{unit}
                          </SelectItem>
                        );
                      });
                    })()}
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
                  {stations.map((station: any) => (
                    <SelectItem key={station.station_id ?? station.id ?? station.s_name ?? station.name} value={station.station_id ?? station.id ?? station.s_name ?? station.name}>
                      {station.s_name || station.name || station.station_id}
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
                  <SelectItem value="all">Todos los datos</SelectItem>
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
                <div className="text-2xl">{summaryAvg != null ? `${formatNumber(summaryAvg, getDecimalsForUnitOrCode(pollutantUnit, selectedPollutant))} ${pollutantUnit}` : '—'}</div>
                <p className="text-xs text-gray-500 mt-1">En el periodo seleccionado</p>
              </CardContent>
            </Card>

      {/* Alertas Encontradas */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Detectadas</CardTitle>
        </CardHeader>
        <CardContent>
          {alertsData.length === 0 ? (
            <p className="text-sm text-gray-500">No se detectaron alertas en el periodo seleccionado.</p>
          ) : (
            <div className="space-y-2">
              {alertsData.map((a: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.station || '—'}</div>
                    <div className="text-sm text-gray-500">{new Date(a.datetime).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{a.value}</div>
                    <div className="text-sm text-red-600">Umbral excedido</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Máximo</CardTitle>
          </CardHeader>
          <CardContent>
            {/** Primary: show series max if available, otherwise measurements, otherwise generic summaryMax */}
            {((summaryMaxSeries != null) || (summaryMaxMeasurements != null) || (summaryMax != null)) ? (
              <> 
                <div className="text-2xl text-orange-600">
                  {summaryMaxSeries != null ? `${formatNumber(summaryMaxSeries, getDecimalsForUnitOrCode(pollutantUnit, selectedPollutant))} ${pollutantUnit}` : (summaryMaxMeasurements != null ? `${formatNumber(summaryMaxMeasurements, getDecimalsForUnitOrCode(pollutantUnit, selectedPollutant))} ${pollutantUnit}` : `${formatNumber(summaryMax, getDecimalsForUnitOrCode(pollutantUnit, selectedPollutant))} ${pollutantUnit}`)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {summaryMaxSeries != null ? (summaryMaxSeriesDate ? new Date(summaryMaxSeriesDate).toLocaleString() : 'Serie') : (summaryMaxMeasurementsDate ? new Date(summaryMaxMeasurementsDate).toLocaleString() : 'Mediciones')}
                </p>
                {summaryMaxSeries != null && summaryMaxMeasurements != null && Math.abs((summaryMaxSeries || 0) - (summaryMaxMeasurements || 0)) > 1e-6 && (
                  <p className="text-xs text-gray-400 mt-1">Mediciones: {`${formatNumber(summaryMaxMeasurements, getDecimalsForUnitOrCode(pollutantUnit, selectedPollutant))} ${pollutantUnit}`}</p>
                )}
              </>
            ) : (
              <>
                <div className="text-2xl text-orange-600">—</div>
                <p className="text-xs text-gray-500 mt-1">—</p>
              </>
            )}
          </CardContent>
        </Card>

      {/* Infraestructura y Mantenimiento */}
      <Card>
        <CardHeader>
          <CardTitle>Infraestructura y Mantenimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto pr-2">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Estación</TableHead>
                  <TableHead>Última Medición</TableHead>
                  <TableHead>Mantenimiento</TableHead>
                  <TableHead>Certificado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(infraExpanded ? infrastructureData : infrastructureData.slice(0, 8)).map((s: any, i: number) => (
                  <TableRow key={s.station_id ?? i}>
                    <TableCell className="whitespace-nowrap">{s.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{s.last_measurement ? new Date(s.last_measurement).toLocaleString() : '—'}</TableCell>
                    <TableCell className="whitespace-nowrap">{s.maintenance_date ? new Date(s.maintenance_date).toLocaleDateString() : '—'}</TableCell>
                    <TableCell className="whitespace-nowrap">{s.calibration_certificate || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {infrastructureData.length > 8 && (
            <div className="mt-2 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setInfraExpanded((v) => !v)}>
                {infraExpanded ? 'Ver menos' : `Ver más (${infrastructureData.length})`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Mínimo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{summaryMin != null ? `${formatNumber(summaryMin, getDecimalsForUnitOrCode(pollutantUnit, selectedPollutant))} ${pollutantUnit}` : '—'}</div>
            <p className="text-xs text-gray-500 mt-1">{summaryMinDate ? new Date(summaryMinDate).toLocaleString() : '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{summaryCompliance != null ? `${summaryCompliance}%` : '—'}</div>
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
        {projectionData.length > 0 && (
          <CardContent>
            <CardTitle>Proyección (próximas horas)</CardTitle>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#ff7300" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        )}
      </Card>

      {/* Mapa de Estaciones (Cali) y Estado por Contaminante */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Estaciones — Cali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[600px]">
              <MapView stations={stations} hotspots={heatmap} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado por Contaminante</CardTitle>
          </CardHeader>
          <CardContent>
            {airQualityLoading ? (
              <div className="py-8 text-center text-sm text-gray-500">Cargando estado por contaminante...</div>
            ) : airQualityData.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">No hay datos disponibles para el periodo seleccionado.</div>
            ) : (
              <div className="space-y-3">
                {airQualityData.map((data) => {
                  const pctRaw = (Number(data.value) / (Number(data.limit) || 1));
                  const percentage = Math.min(Math.max(pctRaw * 100, 0), 100);
                  // color thresholds: >=100% -> red, >=80% -> orange, >=50% -> yellow, else green
                  let colorClass = 'bg-green-500';
                  let statusText = 'Bueno';
                  if (pctRaw >= 1) {
                    colorClass = 'bg-red-500';
                    statusText = 'Excedido';
                  } else if (pctRaw >= 0.8) {
                    colorClass = 'bg-orange-500';
                    statusText = 'Malo';
                  } else if (pctRaw >= 0.5) {
                    colorClass = 'bg-yellow-500';
                    statusText = 'Advertencia';
                  }

                  return (
                    <div key={String(data.pollutant) + data.pollutant_id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">{data.pollutant}</span>
                        <span className="text-sm text-gray-600">
                          {formatNumber(data.value, getDecimalsForUnitOrCode(data.unit, data.pollutant_id || data.pollutant))} / {formatNumber(data.limit, getDecimalsForUnitOrCode(data.unit, data.pollutant_id || data.pollutant))} {data.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${colorClass}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-end mt-1">
                        <Badge className={`text-xs ${colorClass}`}>{statusText}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                  <TableCell>{new Date(row.datetime).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.station_display ?? row.station}</Badge>
                  </TableCell>
                  <TableCell>{row.PM25 != null ? `${formatNumber(row.PM25, getDecimalsForUnitOrCode(row.unit, 'PM25'))} ${row.unit || ''}` : ''}</TableCell>
                  <TableCell>{row.PM10 != null ? `${formatNumber(row.PM10, getDecimalsForUnitOrCode(row.unit, 'PM10'))} ${row.unit || ''}` : ''}</TableCell>
                  <TableCell>{row.O3 != null ? `${formatNumber(row.O3, getDecimalsForUnitOrCode(row.unit, 'O3'))} ${row.unit || ''}` : ''}</TableCell>
                  <TableCell>{row.NO2 != null ? `${formatNumber(row.NO2, getDecimalsForUnitOrCode(row.unit, 'NO2'))} ${row.unit || ''}` : ''}</TableCell>
                  <TableCell>{row.SO2 != null ? `${formatNumber(row.SO2, getDecimalsForUnitOrCode(row.unit, 'SO2'))} ${row.unit || ''}` : ''}</TableCell>
                  <TableCell>{row.CO != null ? `${formatNumber(row.CO, getDecimalsForUnitOrCode(row.unit, 'CO'))} ${row.unit || ''}` : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
