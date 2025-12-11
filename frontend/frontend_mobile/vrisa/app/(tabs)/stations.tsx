import React, { useEffect, useState } from 'react';
import { stations as mockStations, Station as StationType } from '../../lib/mockData';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import api from '../../lib/api';
import { useRouter } from 'expo-router';
import auth from '../../lib/auth';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function StationsScreen(){
  const [stations, setStations] = useState<StationType[] | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(()=>{
    let mounted = true;
    async function load(){
      setLoading(true);
      try{
        const data = await api.getStations();
        if(mounted && data) setStations(data as any);
      }catch(err){
        // fallback to mock data when API unavailable
        if(mounted) setStations(mockStations as any);
      }finally{ if(mounted) setLoading(false); }
    }
    load();
    return ()=>{ mounted = false; };
  },[]);

  useEffect(()=>{ let mounted = true; (async ()=>{ const u = await auth.getUser(); if(mounted) setUser(u); })(); return ()=>{ mounted=false; }; },[]);

  const list = stations || mockStations;

  return (
    <ScrollView contentContainerStyle={styles.inner}>
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <Text style={styles.title}>Estaciones</Text>
        {user && user.u_type === 'admin' ? (
          <TouchableOpacity onPress={()=>router.push('/(tabs)/station_create')} style={{ padding:8 }}><Text style={{ color:'#0d6efd' }}>Crear estación</Text></TouchableOpacity>
        ) : null}
      </View>
      {list.map((s: any) => (
        <TouchableOpacity key={s.station_id || s.id || s.name} style={{ marginBottom:12 }} onPress={()=>router.push(`/station/${s.station_id || s.id || s.name}`)}>
          <Card>
            <View style={styles.rowHeader}>
              <Text style={styles.name}>{s.s_name || s.name}</Text>
              <StatusBadge value={(s.status || s.s_state || 'good') as any} />
            </View>
            <Text style={styles.meta}>{s.institution || s.institution_name || s.institution}</Text>
            {(s.pollutants || []).map((p: any) => (
              <Text key={p.pollutant} style={styles.pollutant}>{p.pollutant}: {p.value}{p.unit} ({p.status})</Text>
            ))}
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inner:{ padding:16 },
  title:{ fontSize:24, fontWeight:'700', marginBottom:12 },
  rowHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 },
  name:{ fontSize:18, fontWeight:'600' },
  meta:{ fontSize:12, color:'#555', marginBottom:4 },
  pollutant:{ fontSize:12 }
});
