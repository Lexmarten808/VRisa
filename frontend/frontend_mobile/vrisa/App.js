import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import Dashboard from './Dashboard';
import api from './lib/api';
import auth from './lib/auth';

export default function App(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(false);
  // automatic API base detection; user no longer needs to input API base

  const onLogin = async ()=>{
    if(!email?.trim() || !password){
      Alert.alert('Error', 'Debe ingresar correo y contraseña');
      return;
    }
    setLoading(true);
    try{
      // rely on automatic API base detection in `lib/api` (no manual `apiBase` variable)
      const resp = await api.login(email.trim(), password);
      // try to extract name and user type from response
      const name = resp?.name || resp?.u_name || resp?.first_name || (email.includes('@') ? email.split('@')[0] : email) || 'Usuario';
      const u_type = resp?.u_type || resp?.role || resp?.type || (email.toLowerCase().includes('admin') ? 'Administrador' : 'Usuario');
      const savedUser = { name: String(name), u_type: String(u_type) };
      try { await auth.saveUser(savedUser); } catch(e) { /* ignore */ }
      setUser(savedUser);
      setLoggedIn(true);
    }catch(e){
      // try to include last attempt URL/error to help debug network failures
      let extra = '';
      try{
        const la = await api.getLastAttempt();
        if(la){
          extra = `\n\nÚltimo intento:\nURL: ${la.url || '–'}\nError: ${la.error || '–'}`;
        }
      }catch(_){ /* ignore */ }
      const msg = e?.body?.error || e?.message || String(e) || 'Error conectando al servidor';
      Alert.alert('Error', msg + extra);
    }finally{
      setLoading(false);
    }
  };

  async function handleProbe(){
    // simplified probe: uses automatic detection from api.probeHealth()
    try{
      const res = await api.probeHealth();
      const text = res && typeof res === 'object' ? (res.ok ? 'OK' : `NO_RESPUESTA ${res.error||res.status||''}`) : String(res);
      alert('Probe: ' + text + (res?.url ? '\nURL: ' + res.url : ''));
    }catch(e){
      alert('Probe error: ' + (e?.message||String(e)));
    }
  }

  // load persisted user on mount
  useEffect(() => {
    (async () => {
      try{
        const u = await auth.getUser();
        if(u) setUser(u);
      }catch(_){ }
    })();
  }, []);

  if(loggedIn){
    // prefer persisted/logged-in user info; fallback to email-derived name
    const displayUser = user || ((): any => {
      const name = email && email.includes('@') ? email.split('@')[0].replace(/\.|_/g,' ') : (email || 'Invitado');
      const u_type = email && email.toLowerCase().includes('admin') ? 'Administrador' : 'Usuario';
      return { name: name.charAt(0).toUpperCase() + name.slice(1), u_type };
    })();
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Dashboard user={displayUser} onLogout={async () => { await auth.clearUser(); setUser(null); setLoggedIn(false); }} />
      </SafeAreaProvider>
    );
  }

  

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <View style={styles.card}>
        <Text style={styles.title}>VRISA</Text>
        <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Correo" 
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          secureTextEntry
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={{ fontSize:12, color:'#64748b', marginTop:6 }}>Detección automática de backend activada</Text>

        <Pressable onPress={onLogin} style={styles.button} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </Pressable>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {flex:1, backgroundColor:'#f6f8fb', alignItems:'center', justifyContent:'center'},
  card: {width:'90%', maxWidth:420, backgroundColor:'#fff', padding:24, borderRadius:12, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:8, elevation:3},
  title: {fontSize:28, fontWeight:'700', color:'#0b54a6', marginBottom:6},
  subtitle: {fontSize:14, color:'#334155', marginBottom:18},
  input: {height:48, borderColor:'#e6eef8', borderWidth:1, borderRadius:8, paddingHorizontal:12, marginBottom:12, backgroundColor:'#fbfdff'},
  button: {height:48, backgroundColor:'#0b54a6', borderRadius:8, alignItems:'center', justifyContent:'center', marginTop:6},
  buttonText: {color:'#fff', fontWeight:'600'}
});
