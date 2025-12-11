import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import auth from '../lib/auth';

export default function Login(){
  const router = useRouter();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [loading,setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState('');
  const [detected, setDetected] = useState<string | null>(null);
  const [probeStatus, setProbeStatus] = useState<string | null>(null);
  const [probeLoading, setProbeLoading] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<{url?:string; error?:string|null} | null>(null);

  async function proceed(){
    setError(null);
    if(!email.trim() || !password){
      setError('Ingrese correo/teléfono y contraseña');
      return;
    }
      setLoading(true);
    try{
      // if apiUrl is manually set, override detected base
      if (apiUrl && apiUrl.trim()) {
        try { await (api as any).setBase(apiUrl.trim()); } catch (e) { /* ignore */ }
      }
      const resp = await api.login(email.trim(), password);
      // save minimal user info if available
      const user = resp && typeof resp === 'object' ? {
        user_id: resp.user_id || resp.userId || null,
        name: resp.name || resp.u_name || null,
        last_name: resp.last_name || resp.lastName || null,
        u_type: resp.u_type || resp.uType || null
      } : null;
      if (user) await auth.saveUser(user);
      router.replace('/(tabs)/reports');
    }catch(e:any){
      if (e && e.status === 403) {
        setError(e.body?.error || 'Usuario no validado. Espere aprobación.');
      } else if (e && e.body && e.body.error) {
        setError(e.body.error);
      } else {
        const msg = (e && e.message) ? e.message : (String(e) || 'Error conectando al servidor. Verifique la red.');
        try{
          const la = await (api as any).getLastAttempt();
          setLastAttempt(la);
          const extra = la?.url ? ` Intentado: ${la.url}${la.error ? ' · err: ' + la.error : ''}` : '';
          setError('Error conectando al servidor. ' + msg + extra);
        }catch(_){
          setError('Error conectando al servidor. ' + msg);
        }
      }
    }finally{
      setLoading(false);
    }
  }

  // load detected base on mount
  React.useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const b = await (api as any).detectedBase();
        if(mounted) { setDetected(b); setApiUrl(b || ''); }
      }catch(e){ /* ignore */ }
    })();
    return ()=>{ mounted = false; };
  },[]);

  async function handleProbe(){
    setProbeLoading(true); setProbeStatus(null);
    try{
      if(apiUrl && apiUrl.trim()) await (api as any).setBase(apiUrl.trim());
      const res = await (api as any).probeHealth();
      // probeHealth may return boolean (old) or object {ok,url,status,error}
      if (typeof res === 'boolean') {
        setProbeStatus(res ? 'OK' : 'NO_RESPUESTA');
      } else if (res && typeof res === 'object') {
        const pretty = res.ok ? 'OK' : `NO_RESPUESTA${res.status ? ' (status ' + res.status + ')' : res.error ? ' (' + res.error + ')' : ''}`;
        setProbeStatus(pretty);
      } else {
        setProbeStatus('NO_RESPUESTA');
      }
      // update detected base shown and last attempt info
      try{
        const det = await (api as any).detectedBase();
        setDetected(det);
      }catch(e){}
      try{
        const la = await (api as any).getLastAttempt();
        setLastAttempt(la);
      }catch(e){}
    }catch(e:any){ setProbeStatus('ERROR: ' + (e?.message||String(e))); }
    finally{ setProbeLoading(false); }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={["#0d6efd","#2b6cb0","#1e3a8a"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.gradient}>
        <View style={styles.box}>
        <Text style={styles.title}>VRISA</Text>
        <Text style={styles.subtitle}>Monitoreo de Calidad del Aire</Text>
        <TextInput style={styles.input} placeholder="Correo o teléfono" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
        <Text style={{ fontSize:12, color:'#475569', marginTop:6 }}>API base (editar si usas dispositivo físico)</Text>
        <TextInput style={styles.input} placeholder="http://localhost:8000" value={apiUrl} onChangeText={setApiUrl} autoCapitalize="none" />
        <View style={{ flexDirection:'row', gap:8, marginBottom:8 }}>
          <TouchableOpacity onPress={handleProbe} style={{ padding:8, borderRadius:8, backgroundColor:'#eef2ff' }} disabled={probeLoading}><Text>{probeLoading ? 'Probando...' : 'Probar conexión'}</Text></TouchableOpacity>
          <Text style={{ alignSelf:'center', marginLeft:8 }}>{probeStatus ? `Estado: ${probeStatus}` : detected ? `Detectado: ${detected}` : ''}</Text>
        </View>
        {lastAttempt ? (
          <View style={{ marginBottom:8 }}>
            <Text style={{ fontSize:12, color:'#475569' }}>Último intento: {lastAttempt.url || '—'}</Text>
            {lastAttempt.error ? <Text style={{ fontSize:12, color:'crimson' }}>Error: {lastAttempt.error}</Text> : null}
          </View>
        ) : null}
        {error ? <Text style={{ color: 'crimson', marginBottom: 8 }}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={proceed} disabled={loading}><Text style={styles.buttonText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.outline]} onPress={()=>router.replace('/(tabs)/reports')}><Text style={[styles.buttonText, styles.outlineText]}>Entrar como invitado</Text></TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:{ flex:1 },
  gradient:{ flex:1, alignItems:'center', justifyContent:'center', padding:24 },
  box:{ width:'100%', maxWidth:420, backgroundColor:'#ffffff', padding:28, borderRadius:24, elevation:5, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:12, shadowOffset:{width:0,height:4} },
  title:{ fontSize:40, fontWeight:'700', color:'#0d6efd', marginBottom:4 },
  subtitle:{ fontSize:16, color:'#475569', marginBottom:20 },
  input:{ borderWidth:1, borderColor:'#cbd5e1', borderRadius:12, padding:14, marginBottom:14, backgroundColor:'#fff' },
  button:{ backgroundColor:'#0d6efd', padding:16, borderRadius:14, alignItems:'center', marginTop:6, shadowColor:'#000', shadowOpacity:0.15, shadowRadius:6, shadowOffset:{width:0,height:3} },
  buttonText:{ color:'#fff', fontWeight:'700', letterSpacing:0.5 },
  outline:{ backgroundColor:'#fff', borderWidth:2, borderColor:'#0d6efd' },
  outlineText:{ color:'#0d6efd', fontWeight:'700' }
});
