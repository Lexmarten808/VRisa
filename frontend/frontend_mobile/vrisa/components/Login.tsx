import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function Login(){
  const router = useRouter();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  function proceed(){
    router.replace('/(tabs)/dashboard');
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={["#0d6efd","#2b6cb0","#1e3a8a"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.gradient}>
        <View style={styles.box}>
        <Text style={styles.title}>VRISA</Text>
        <Text style={styles.subtitle}>Monitoreo de Calidad del Aire</Text>
        <TextInput style={styles.input} placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.button} onPress={proceed}><Text style={styles.buttonText}>Ingresar</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.outline]} onPress={proceed}><Text style={[styles.buttonText, styles.outlineText]}>Entrar como invitado</Text></TouchableOpacity>
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
