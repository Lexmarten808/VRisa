import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';
import api from '../../lib/api';

export default function StationDetail(){
  const { id } = useSearchParams();
  const [station, setStation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const st = await api.getStation(id as string);
        if(mounted) setStation(st);
      }catch(e:any){ if(mounted) setError(String(e)); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted = false; };
  },[id]);

  if(loading) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Cargando...</Text></View>;
  if(error) return <View style={{padding:16}}><Text style={{ color:'crimson' }}>{error}</Text></View>;
  if(!station) return <View style={{padding:16}}><Text>Estación no encontrada</Text></View>;

  return (
    <ScrollView contentContainerStyle={{ padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:'700' }}>{station.s_name || station.name || 'Estación'}</Text>
      <Text style={{ color:'#555', marginBottom:8 }}>{station.s_state || station.status || ''}</Text>
      <Text>Lat: {station.lat || station.latitude}</Text>
      <Text>Lon: {station.lon || station.longitude}</Text>
      <Text>Institution: {station.institution || station.institution_name || ''}</Text>
      <Text style={{ marginTop:12, fontWeight:'700' }}>Admin ID: {station.admin_id || station.admin}</Text>
    </ScrollView>
  );
}
