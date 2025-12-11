import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';

export default function RegisterScreen(){
  const router = useRouter();
  const [name,setName] = useState('');
  const [lastName,setLastName] = useState('');
  const [password,setPassword] = useState('');
  const [email,setEmail] = useState('');
  const [phone,setPhone] = useState('');
  const [uType,setUType] = useState<'regular'|'station_admin'>('regular');
  const [stationId,setStationId] = useState('');
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string | null>(null);
  const [success,setSuccess] = useState<any | null>(null);

  async function submit(){
    setError(null); setSuccess(null);
    if(!name || !lastName || !password) { setError('Complete nombre, apellido y contraseña'); return; }
    setLoading(true);
    try{
      const payload: any = { u_name: name, last_name: lastName, u_password: password, u_type: uType, email: email || null, phone: phone || null };
      if(uType === 'station_admin' && stationId) payload.station_id = stationId;
      const resp = await api.register(payload);
      setSuccess(resp);
    }catch(e:any){
      setError(e?.body?.error || e?.body || String(e));
    }finally{ setLoading(false); }
  }

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding:16 }}>
        <Text style={{ fontSize:22, fontWeight:'700', marginBottom:12 }}>Registro de Usuario</Text>
        {error ? <Text style={{ color:'crimson', marginBottom:8 }}>{error}</Text> : null}
        {success ? <View style={{ backgroundColor:'#ecfeff', padding:12, borderRadius:8, marginBottom:12 }}>
          <Text style={{ fontWeight:'700' }}>Registro enviado</Text>
          <Text>{JSON.stringify(success)}</Text>
        </View> : null}
        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
        <Text style={styles.label}>Apellido</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
        <Text style={styles.label}>Correo</Text>
        <TextInput style={styles.input} keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Text style={styles.label}>Teléfono</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
        <Text style={styles.label}>Tipo de usuario</Text>
        <View style={{ flexDirection:'row', gap:8, marginBottom:8 }}>
          <TouchableOpacity onPress={() => setUType('regular')} style={{ padding:8, borderRadius:8, backgroundColor: uType==='regular' ? '#e6f3ff' : '#fff', borderWidth:1, borderColor:'#cbd5e1' }}><Text>Regular</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setUType('station_admin')} style={{ padding:8, borderRadius:8, backgroundColor: uType==='station_admin' ? '#e6f3ff' : '#fff', borderWidth:1, borderColor:'#cbd5e1' }}><Text>Admin Estación</Text></TouchableOpacity>
        </View>
        {uType === 'station_admin' && (
          <>
            <Text style={styles.label}>ID Estación (opcional)</Text>
            <TextInput style={styles.input} value={stationId} onChangeText={setStationId} placeholder="ID numérico de la estación" />
            <Text style={{ fontSize:12, color:'#666', marginBottom:8 }}>Si indica una estación válida será asociado automáticamente si está libre.</Text>
          </>
        )}
        <TouchableOpacity style={{ backgroundColor:'#0d6efd', padding:14, borderRadius:12, alignItems:'center' }} onPress={submit} disabled={loading}><Text style={{ color:'#fff', fontWeight:'700' }}>{loading ? 'Enviando...' : 'Registrar'}</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input:{ borderWidth:1, borderColor:'#cbd5e1', borderRadius:8, padding:10, marginBottom:8 },
  label:{ fontSize:12, marginBottom:4 }
});
