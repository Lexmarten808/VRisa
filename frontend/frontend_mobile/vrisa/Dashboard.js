import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from './lib/api';

// Embedded mock data (averages computed from stations' pollutant values)
const stations = [
  { id: 'EST-001', pollutants: [{ pollutant: 'PM2.5', value: 18.3 }, { pollutant: 'PM10', value: 45.7 }] },
  { id: 'EST-002', pollutants: [{ pollutant: 'PM2.5', value: 12.1 }, { pollutant: 'PM10', value: 28.4 }] },
  { id: 'EST-003', pollutants: [{ pollutant: 'PM2.5', value: 32.8 }, { pollutant: 'PM10', value: 72.3 }] },
  { id: 'EST-004', pollutants: [{ pollutant: 'PM2.5', value: 21.5 }, { pollutant: 'PM10', value: 48.9 }] },
  { id: 'EST-005', pollutants: [{ pollutant: 'PM2.5', value: 14.2 }, { pollutant: 'PM10', value: 31.6 }] }
];

const alerts = [
  { id: 'AL-001', time: '2025-11-10 14:35', pollutant: 'O3', value: 92, unit: 'µg/m³', station: 'Sur' },
  { id: 'AL-002', time: '2025-11-12 09:10', pollutant: 'PM10', value: 88, unit: 'µg/m³', station: 'Centro' }
];

function computeAverages(){
  const sums = {};
  const counts = {};
  stations.forEach(s => {
    s.pollutants.forEach(p => {
      sums[p.pollutant] = (sums[p.pollutant] || 0) + p.value;
      counts[p.pollutant] = (counts[p.pollutant] || 0) + 1;
    });
  });
  const averages = Object.keys(sums).map(k => ({ variable: k, average: +(sums[k] / counts[k]).toFixed(1) }));
  return averages;
}

export default function Dashboard({ onLogout, user }){
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState([]);
  const [averages, setAverages] = useState([]);
  const [alertsList, setAlertsList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  

  async function load(){
    setLoading(true);
    let fetchedVars = [];
    try{
      // fetch variables separately so one failing endpoint doesn't block others
      try{
        const vars = await api.getVariables();
        fetchedVars = Array.isArray(vars) ? vars : [];
        setVariables(fetchedVars);
      }catch(e){
        console.warn('Error fetching variables', e);
        fetchedVars = [];
        setVariables([]);
      }

      // fetch air quality summary
      try{
        // request air quality for full history (start at 1970) so we include all measurements
        const aq = await api.getAirQualityReport({ start_date: '1970-01-01T00:00:00' });
        const normalized = (aq && aq.summary) ? aq.summary.map((s, idx) => {
          const name = s['variable__v_name'] || s.variable || s.variable_name || s['variable__v_id'] || String(s.variable_id || idx);
          const rawAvg = Number(s.avg ?? s.average ?? s.avg_value ?? s.value ?? 0);
          const unit = s['variable__v_unit'] || s.unit || '';
          const code = normalizeCode(name).replace('PM2,5','PM25').replace('PM2.5','PM25');
          const decimals = getDecimalsForCode(code, unit);
          const avg = Number.isFinite(rawAvg) ? Number(rawAvg.toFixed(decimals)) : 0;
          return { variable: name, average: avg, unit };
        }) : [];
        setAverages(normalized);
      }catch(e){
        console.warn('Error fetching air quality report', e);
        setAverages([]);
      }

      // fetch alerts from backend (all history)
      let backendAlerts = [];
      try{
        const alertsResp = await api.getAlertsReport({ days: 36500 });
        backendAlerts = (alertsResp && alertsResp.alerts) ? alertsResp.alerts : [];
      }catch(e){
        console.warn('Error fetching alerts', e);
        backendAlerts = [];
      }

      // Additionally compute alerts client-side from measurements (copying desktop logic)
      try{
        // helper defaults and utilities (copied from desktop)
        // Use pollutant-only defaults for alert generation (match desktop behavior)
        const DEFAULT_LIMITS = {
          PM25: { limit: 35 },
          PM10: { limit: 150 },
          O3: { limit: 0.070 },
          NO2: { limit: 0.053 },
          SO2: { limit: 0.075 },
          CO: { limit: 9 },
        };
        const normalizeCode = (name) => {
          if (!name) return '';
          return name.toString().replace(/\s+/g, '').replace(/\./g, '').replace(/,/g, '').toUpperCase();
        };

        // build maps from variables list
        const vmap = {};
        const vcode = {};
        const vunit = {};
        (fetchedVars || variables || []).forEach(v => {
          const id = String(v.v_id ?? v.id ?? v.v_id);
          const name = v.v_name || v.name || '';
          vmap[id] = name;
          vunit[id] = v.v_unit || v.unit || '';
          const code = normalizeCode(name).replace('PM2,5','PM25').replace('PM2.5','PM25');
          vcode[id] = code;
        });

        // fetch recent measurements (large window to include history)
        const measurements = await api.getMeasurements({ days: 36500 });

        const existingKeys = new Set();
        for (const a of backendAlerts) {
          try{ existingKeys.add(`${a.station||''}|${a.datetime||a.date||a.time||''}|${a.variable||a.variable_name||''}|${a.value||''}`); }catch(_){ }
        }

        const computedAlerts = [];
        for (const m of measurements) {
          // resolve variable id
          let vid = '';
          if (m.variable && typeof m.variable === 'object') vid = String(m.variable.v_id ?? m.variable.id ?? '');
          else vid = String(m.variable ?? m.variable_id ?? '');
          const varName = (m.variable && (m.variable.v_name || m.variable.name)) || vmap[vid] || '';
          const code = (vcode[vid] || normalizeCode(varName)).replace('PM2,5','PM25').replace('PM2.5','PM25');

          // don't filter by variable — include all
          const val = Number(m.m_value ?? m.value ?? m.v_value ?? NaN);
          if (!Number.isFinite(val) || Number.isNaN(val)) continue;

          const mappedDefault = DEFAULT_LIMITS[code];
          const limit = Number(m.limit ?? m.threshold ?? (mappedDefault ? mappedDefault.limit : NaN));
          if (!Number.isFinite(limit) || Number.isNaN(limit)) continue;
          if (val < limit) continue; // only alerts when >= limit

          const md = m.m_date || m.date || m.datetime || null;
          const stationName = m.station_name || m.station || (m.sensor && (m.sensor.station_name || m.sensor.station)) || '';
          const key = `${stationName}|${md||''}|${code}|${val}`;
          if (existingKeys.has(key)) continue;

          const formattedVal = Number.isFinite(val) ? Number(val.toFixed(1)) : val;
          computedAlerts.push({ station: stationName || '—', datetime: md, value: formattedVal, variable: code, limit });
          existingKeys.add(key);
        }

        // merge backend + computed alerts, dedupe and sort by datetime desc
        const all = [...(backendAlerts || []), ...computedAlerts];
        const seen = new Set();
        const normalized = [];
        const normalizeDatetime = (ts) => {
          if (!ts) return null;
          if (ts instanceof Date) return ts;
          try {
            // try ISO parse first
            let s = String(ts);
            // common Django format 'YYYY-MM-DD HH:MM:SS[.micro]'
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) s = s.replace(' ', 'T');
            const d = new Date(s);
            if (!isNaN(d.getTime())) return d;
          } catch (_){ }
          return null;
        };

        for (const a of all) {
          try {
            const station = a.station || a.station_name || '';
            const variable = a.variable || a.variable_name || a['variable__v_name'] || a.pollutant || '';
            const value = Number(a.value ?? a.avg ?? a.measure ?? a.level ?? NaN);
            const dtRaw = a.datetime || a.time || a.date || a.created || null;
            const dt = normalizeDatetime(dtRaw);
            const key = `${station}|${dt ? dt.toISOString() : String(dtRaw)}|${variable}|${String(value)}`;
            if (seen.has(key)) continue;
            seen.add(key);
            normalized.push({ ...a, _datetime: dt, _datetimeRaw: dtRaw, _valueNum: value, _variableName: variable });
          } catch (_){ }
        }
        // exclude humidity/temperature-like variables (embedded humidity alerts)
        const EXCLUDE_RE = /HUM|HUMEDAD|RH|RELATIVE|TEMP|TEMPERATURA/i;
        const filtered = normalized.filter(x => {
          const varName = x._variableName || x.variable || x.variable_name || x['variable__v_name'] || x.pollutant || '';
          if (!varName) return true;
          if (EXCLUDE_RE.test(varName)) return false;
          const code = normalizeCode(varName);
          if (EXCLUDE_RE.test(code)) return false;
          return true;
        });
        // sort by datetime descending (unknown dates go to the end)
        filtered.sort((x,y)=> {
          const tx = x._datetime ? x._datetime.getTime() : -1;
          const ty = y._datetime ? y._datetime.getTime() : -1;
          return ty - tx;
        });
        // limit to a reasonable number
        const finalList = filtered.slice(0, 50).map(x => {
          // remove internal helper fields before setting state
          const copy = { ...x };
          delete copy._datetime;
          delete copy._datetimeRaw;
          delete copy._valueNum;
          delete copy._variableName;
          return copy;
        });
        setAlertsList(finalList);
      }catch(e){
        console.warn('Error computing client-side alerts', e);
        setAlertsList(backendAlerts);
      }
    }catch(e){
      console.warn('Unexpected error in dashboard load', e);
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); }, []);

  const normalizeCode = (name) => {
    if (!name) return '';
    return name.toString().replace(/\s+/g, '').replace(/\./g, '').replace(/,/g, '').toUpperCase();
  };

  const getDecimalsForCode = (code, unit) => {
    const u = (unit || '').toString().toLowerCase();
    if (u.includes('ppm')) return 3;
    if (u.includes('µg') || u.includes('ug')) return 1;
    if (u.includes('%')) return 0;
    if (u.includes('°') || u.includes('c')) return 1;
    if (u.includes('m/s')) return 1;
    // fallback by code
    if (!code) return 1;
    if (code.includes('PM') || code.includes('PM25') || code.includes('PM10')) return 1;
    if (code === 'O3' || code === 'NO2' || code === 'SO2' || code === 'CO') return 3;
    return 1;
  };

  const formatNumber = (v, decimals = 1) => {
    if (v === null || v === undefined) return '';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    const s = n.toFixed(decimals);
    return s.replace(/\.0+$/, '');
  };

  async function onRefresh(){
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function loadDebug(){
    setDebugLoading(true);
    const out = { variables: null, variablesAttempt: null, airQuality: null, airQualityAttempt: null, alerts: null, alertsAttempt: null };
    try{
      try{
        const v = await api.getVariables();
        out.variables = v;
        out.variablesAttempt = api.getLastAttempt ? api.getLastAttempt() : null;
      }catch(e){
        out.variables = { error: String(e) };
        out.variablesAttempt = api.getLastAttempt ? api.getLastAttempt() : null;
      }

      try{
        const aq = await api.getAirQualityReport();
        out.airQuality = aq;
        out.airQualityAttempt = api.getLastAttempt ? api.getLastAttempt() : null;
      }catch(e){
        out.airQuality = { error: String(e) };
        out.airQualityAttempt = api.getLastAttempt ? api.getLastAttempt() : null;
      }

      try{
        const al = await api.getAlertsReport({ days: 36500 });
        out.alerts = al;
        out.alertsAttempt = api.getLastAttempt ? api.getLastAttempt() : null;
      }catch(e){
        out.alerts = { error: String(e) };
        out.alertsAttempt = api.getLastAttempt ? api.getLastAttempt() : null;
      }
      // fetch measurements too so we can inspect raw data that generates alerts
      try{
        const ms = await (api.getMeasurements ? api.getMeasurements({ days: 36500 }) : []);
        out.measurements = ms;
        out.measurementsAttempt = api.getLastAttempt ? api.getLastAttempt() : null;
      }catch(e){
        out.measurements = { error: String(e) };
        out.measurementsAttempt = api.getLastAttempt ? api.getLastAttempt() : null;
      }
    }finally{
      setDebugData(out);
      setDebugLoading(false);
      setDebugOpen(true);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          {user ? (
            <Text style={styles.userMeta}>{user.name} · {user.u_type}</Text>
          ) : null}
        </View>
        <Pressable onPress={onLogout} style={styles.logout}><Text style={styles.logoutText}>Cerrar</Text></Pressable>
      </View>

      {loading ? <ActivityIndicator style={{marginTop:20}} /> : (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View style={{marginBottom:8, flexDirection:'row', justifyContent:'flex-end'}} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Variables (promedio)</Text>
                {averages.length === 0 ? (
              <>
                <Text style={{color:'#64748b'}}>Sin datos</Text>
              </>
            ) : (
              <View>
                {averages.map((item, idx) => (
                  <View key={String((item.variable || '') + '_' + idx)} style={styles.row}>
                    <Text style={styles.varName}>{item.variable}{item.unit ? ' · ' + item.unit : ''}</Text>
                    <Text style={styles.varValue}>{item.average}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alertas críticas</Text>
            {alertsList.length === 0 ? (
              <>
                <Text style={{color:'#64748b'}}>Sin alertas</Text>
              </>
            ) : (
              <View>
                {alertsList.map((item, idx) => {
                  // if the item is a raw string (from non-JSON response), render it plainly
                  if (typeof item === 'string') {
                    return (
                      <View key={String(idx)} style={styles.alert}>
                        <Text style={styles.alertTitle}>Respuesta cruda</Text>
                        <Text style={styles.alertMeta}>{item}</Text>
                      </View>
                    );
                  }
                  const rawVarName = item.variable || item.variable_name || item['variable__v_name'] || item.pollutant || item.name || '';
                  const code = normalizeCode(rawVarName) || normalizeCode(item.variable || item.pollutant || '');
                  const value = (item.value ?? item.avg ?? item.measure ?? item.level ?? '—');
                  const station = item.station_name || item.station || item.station_id || item['station__s_name'] || '—';
                  let when = '';
                  try{
                    const ts = item.datetime || item.time || item.created || item.ts || null;
                    when = ts ? new Date(ts).toLocaleString() : '';
                  }catch(_){ when = String(item.datetime || item.time || '') }
                  const sev = item.severity ? String(item.severity).toUpperCase() : null;
                  const limit = (item.limit ?? item.threshold ?? item.limit_value ?? null) || null;
                  const decimals = getDecimalsForCode(code, item.unit || item['variable__v_unit']);
                  const valueStr = formatNumber(value, decimals);
                  const limitStr = limit != null ? formatNumber(limit, decimals) : null;
                  const titleText = `Alerta ${code || rawVarName || '—'}`;
                  const subtitle = code ? `${code} excedió el límite (${valueStr}${limitStr ? ' >= ' + limitStr : ''})` : `${rawVarName} — ${valueStr}`;
                  return (
                    <View key={String(item.id || item.datetime || item.time || idx)} style={styles.alert}>
                      <Text style={styles.alertTitle}>{titleText}</Text>
                      <Text style={[styles.alertMeta, { color:'#dc6b2e', marginTop:6 }]}>{subtitle}</Text>
                      <Text style={styles.alertMeta}>{station}{when ? ' · ' + when : ''}{sev ? ' · ' + sev : ''}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#f6f8fb', padding:16 },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  headerTitle: { fontSize:22, fontWeight:'700', color:'#0b54a6' },
  logout: { paddingVertical:6, paddingHorizontal:10, backgroundColor:'#e2e8f0', borderRadius:8 },
  logoutText: { color:'#0b54a6', fontWeight:'600' },
  userMeta: { color:'#475569', fontSize:13, marginTop:4 },
  section: { backgroundColor:'#fff', padding:12, borderRadius:10, marginBottom:12, shadowColor:'#000', shadowOpacity:0.03, shadowRadius:6, elevation:1 },
  sectionTitle: { fontSize:16, fontWeight:'600', color:'#334155', marginBottom:8 },
  row: { flexDirection:'row', justifyContent:'space-between', paddingVertical:8, borderBottomColor:'#eef2f7', borderBottomWidth:1 },
  varName: { color:'#0f172a' },
  varValue: { color:'#0b54a6', fontWeight:'600' },
  alert: { paddingVertical:8, borderBottomColor:'#fff3f2', borderBottomWidth:1 },
  alertTitle: { color:'#dc2626', fontWeight:'700' },
  alertMeta: { color:'#475569', fontSize:12 }
});
