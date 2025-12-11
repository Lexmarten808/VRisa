import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../../lib/api';
import auth from '../../lib/auth';

export default function StationCreateScreen(){
  const [sName, setSName] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [calib, setCalib] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(){
    setError(null); setSuccess(null);
    if(!sName) { setError('Nombre es obligatorio'); return; }
    if(!lat || !lon) { setError('Lat/Lon son obligatorios'); return; }
    setLoading(true);
    try{
      const payload: any = { s_name: sName, lat: Number(lat), lon: Number(lon) };
      if(institutionId) payload.institution_id = Number(institutionId);
      if(calib) payload.calibration_certificate = calib;
      const resp = await api.createStation(payload);
      // api returns either object or { message, results }
      const data = resp?.data ?? resp;
      const stationId = data?.station_id ?? data?.id ?? null;
      setSuccess(stationId ? `Estación creada (ID: ${stationId})` : 'Estación creada');
      setSName(''); setLat(''); setLon(''); setInstitutionId(''); setCalib('');
    }catch(e:any){
      setError(e?.body?.error || e?.body || String(e));
    }finally{ setLoading(false); }
  }

  return (
    <ScrollView contentContainerStyle={{ padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:'700', marginBottom:12 }}>Crear Estación (Admin)</Text>
      {error ? <Text style={{ color:'crimson', marginBottom:8 }}>{error}</Text> : null}
      {success ? <Text style={{ color:'#064e3b', marginBottom:8 }}>{success}</Text> : null}
      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={sName} onChangeText={setSName} />
      <Text style={styles.label}>Latitud</Text>
      <TextInput style={styles.input} value={lat} onChangeText={setLat} keyboardType='numeric' />
      <Text style={styles.label}>Longitud</Text>
      <TextInput style={styles.input} value={lon} onChangeText={setLon} keyboardType='numeric' />
      <Text style={styles.label}>ID Institución (opcional)</Text>
      <TextInput style={styles.input} value={institutionId} onChangeText={setInstitutionId} keyboardType='numeric' />
      <Text style={styles.label}>Certificado calibración (opcional)</Text>
      <TextInput style={styles.input} value={calib} onChangeText={setCalib} />
      <TouchableOpacity style={{ backgroundColor:'#0d6efd', padding:12, borderRadius:10, alignItems:'center' }} onPress={submit} disabled={loading}><Text style={{ color:'#fff' }}>{loading ? 'Creando...' : 'Crear'}</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ input:{ borderWidth:1, borderColor:'#cbd5e1', borderRadius:8, padding:10, marginBottom:8 }, label:{ fontSize:12, marginBottom:4 } });
