import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { institutions as seedInstitutions, stationRequests } from '../../lib/mockData';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

export default function InstitutionsScreen(){
  const [data, setData] = useState(seedInstitutions);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'pending'|'approved'|'rejected'>('pending');

  const canSubmit = useMemo(()=> name.trim().length>2 && address.trim().length>4, [name,address]);

  const addInstitution = () => {
    const id = `INST-${Date.now()}`;
    const newInst = { id, name: name.trim(), address: address.trim(), status, registeredDate: new Date().toISOString().slice(0,10), stationsCount: 0 };
    setData([newInst, ...data]);
    setOpen(false);
    setName(''); setAddress(''); setStatus('pending');
    // TODO: integrate with backend POST /institutions
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Instituciones</Text>
        {data.map(i => (
          <Card key={i.id} style={{ marginBottom:12 }}>
            <View style={styles.headerRow}>
              <Text style={styles.name}>{i.name}</Text>
              <StatusBadge value={i.status} />
            </View>
            <Text style={styles.meta}>{i.address}</Text>
            <Text style={styles.status}>Estaciones: {i.stationsCount}</Text>
          </Card>
        ))}
        <Text style={styles.title}>Solicitudes de Estación</Text>
        {stationRequests.map(r => (
          <Card key={r.id} style={{ marginBottom:12 }}>
            <View style={styles.headerRow}>
              <Text style={styles.name}>{r.id} - {r.location}</Text>
              <StatusBadge value={r.status} />
            </View>
            <Text style={styles.meta}>{r.institution}</Text>
            <Text style={styles.meta}>Variables: {r.variables.join(', ')}</Text>
          </Card>
        ))}
      </ScrollView>

      <TouchableOpacity accessibilityRole="button" onPress={()=>setOpen(true)} style={styles.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={()=>setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Agregar Institución</Text>
            <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={styles.input} />
            <TextInput placeholder="Dirección" value={address} onChangeText={setAddress} style={styles.input} />
            <View style={styles.statusRow}>
              {(['pending','approved','rejected'] as const).map(s => (
                <TouchableOpacity key={s} style={[styles.statusPill, status===s && styles.statusPillActive]} onPress={()=>setStatus(s)}>
                  <Text style={[styles.statusPillText, status===s && styles.statusPillTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={()=>setOpen(false)}><Text style={[styles.btnText, styles.btnGhostText]}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity disabled={!canSubmit} style={[styles.btn, !canSubmit && { opacity:0.5 }]} onPress={addInstitution}><Text style={styles.btnText}>Guardar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  inner:{ padding:16 },
  title:{ fontSize:24, fontWeight:'700', marginVertical:12 },
  headerRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 },
  name:{ fontSize:16, fontWeight:'600' },
  meta:{ fontSize:12, color:'#555' },
  status:{ fontSize:12, fontWeight:'600' },
  fab:{ position:'absolute', right:16, bottom:24, backgroundColor: theme.colors.primary, width:56, height:56, borderRadius:28, alignItems:'center', justifyContent:'center', elevation:4 },
  modalBackdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.35)', alignItems:'center', justifyContent:'center', padding:16 },
  modalCard:{ width:'100%', maxWidth:420, backgroundColor:'#fff', borderRadius:16, padding:16 },
  modalTitle:{ fontSize:18, fontWeight:'700', marginBottom:8 },
  input:{ borderWidth:1, borderColor:'#cbd5e1', borderRadius:10, padding:12, marginBottom:10, backgroundColor:'#fff' },
  statusRow:{ flexDirection:'row', gap:8, marginBottom:12 },
  statusPill:{ paddingVertical:6, paddingHorizontal:10, borderRadius:999, borderWidth:1, borderColor:'#cbd5e1' },
  statusPillActive:{ backgroundColor:'#eff6ff', borderColor: theme.colors.primary },
  statusPillText:{ color:'#334155', textTransform:'capitalize' },
  statusPillTextActive:{ color: theme.colors.primary, fontWeight:'700' },
  modalActions:{ flexDirection:'row', justifyContent:'flex-end', gap:8 },
  btn:{ backgroundColor: theme.colors.primary, paddingVertical:12, paddingHorizontal:16, borderRadius:10 },
  btnText:{ color:'#fff', fontWeight:'700' },
  btnGhost:{ backgroundColor:'#fff', borderWidth:1, borderColor: theme.colors.primary },
  btnGhostText:{ color: theme.colors.primary, fontWeight:'700' }
});
