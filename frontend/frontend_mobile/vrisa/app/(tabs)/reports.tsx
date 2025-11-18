import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { historicalData, trendReports, criticalAlerts, maintenanceReports } from '../../lib/mockData';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { theme } from '../../lib/theme';

export default function ReportsScreen(){
  const [tab, setTab] = useState<'Historico'|'Tendencias'|'Alertas'|'Infraestructura'>('Historico');
  const tabs: Array<typeof tab> = ['Historico','Tendencias','Alertas','Infraestructura'];

  return (
    <ScrollView contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Reportes de Calidad del Aire y Estado Ambiental</Text>

      <View style={styles.tabRow}>
        {tabs.map(t => (
          <TouchableOpacity key={t} onPress={()=>setTab(t)} style={[styles.tab, tab===t && styles.tabActive]}>
            <Text style={[styles.tabText, tab===t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'Historico' && (
        Object.entries(historicalData).map(([range, rows]) => (
          <View key={range} style={styles.section}>
            <Text style={styles.subtitle}>{range}</Text>
            <View style={styles.rowsWrap}>
              {rows.map((r, idx) => {
                const labelKey = Object.keys(r).find(k => ['time','day','week'].includes(k));
                const labelValue = labelKey ? (r as any)[labelKey] : `#${idx+1}`;
                const pollutants = Object.entries(r).filter(([k])=> !['time','day','week'].includes(k));
                return (
                  <Card key={idx} style={styles.rowCard}>
                    <Text style={styles.rowHeader}>{labelValue}</Text>
                    <View style={styles.pollutantsLine}>
                      {pollutants.map(([k,v]) => (
                        <Text key={k} style={styles.pollutant}>{k}: {v}</Text>
                      ))}
                    </View>
                  </Card>
                );
              })}
            </View>
          </View>
        ))
      )}

      {tab === 'Tendencias' && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Reportes de Tendencias</Text>
          {trendReports.map((tr, i) => (
            <Card key={i} style={{ marginBottom:12 }}>
              <Text style={styles.rowHeader}>{tr.pollutant} · {tr.period}</Text>
              <Text style={styles.meta}>Dirección: {tr.direction.toUpperCase()} · Cambio: {tr.changePct}%</Text>
            </Card>
          ))}
        </View>
      )}

      {tab === 'Alertas' && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Reportes de Alertas Crítica</Text>
          {criticalAlerts.map(a => (
            <Card key={a.id} style={{ marginBottom:12, borderColor: theme.colors.critical }}>
              <View style={styles.headerRow}>
                <Text style={styles.rowHeader}>{a.id} · {a.time}</Text>
                <StatusBadge value={'critical'} />
              </View>
              <Text style={styles.meta}>{a.station} · {a.pollutant}: {a.value}{a.unit} (umbral {a.threshold}{a.unit})</Text>
            </Card>
          ))}
        </View>
      )}

      {tab === 'Infraestructura' && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Reportes de Infraestructura y Mantenimiento</Text>
          {maintenanceReports.map(m => (
            <Card key={m.id} style={{ marginBottom:12 }}>
              <View style={styles.headerRow}>
                <Text style={styles.rowHeader}>{m.id} · {m.station}</Text>
                <StatusBadge value={m.status} />
              </View>
              <Text style={styles.meta}>{m.issue}{m.scheduledDate ? ` · Programado: ${m.scheduledDate}` : ''}</Text>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inner:{ padding:16 },
  title:{ fontSize:24, fontWeight:'700', marginBottom:12 },
  tabRow:{ flexDirection:'row', gap:8, marginBottom:12 },
  tab:{ paddingVertical:8, paddingHorizontal:12, borderRadius:999, borderWidth:1, borderColor:'#cbd5e1', backgroundColor:'#fff' },
  tabActive:{ backgroundColor:'#eff6ff', borderColor: theme.colors.primary },
  tabText:{ color:'#334155' },
  tabTextActive:{ color: theme.colors.primary, fontWeight:'700' },
  section:{ marginBottom:20 },
  subtitle:{ fontSize:18, fontWeight:'600', marginBottom:8 },
  rowsWrap:{ flexDirection:'row', flexWrap:'wrap', gap:12 },
  rowCard:{ width:'48%', padding:12 },
  rowHeader:{ fontSize:14, fontWeight:'700', marginBottom:4 },
  headerRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 },
  meta:{ fontSize:12, color:'#555' },
  pollutantsLine:{ flexWrap:'wrap' },
  pollutant:{ fontSize:12, marginRight:8, marginBottom:2 }
});
