import React from 'react';
import { stations } from '../../lib/mockData';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function StationsScreen(){
  return (
    <ScrollView contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Estaciones</Text>
      {stations.map(s => (
        <Card key={s.id} style={{ marginBottom:12 }}>
          <View style={styles.rowHeader}>
            <Text style={styles.name}>{s.name}</Text>
            <StatusBadge value={s.status} />
          </View>
          <Text style={styles.meta}>{s.institution}</Text>
          {s.pollutants.map(p => (
            <Text key={p.pollutant} style={styles.pollutant}>{p.pollutant}: {p.value}{p.unit} ({p.status})</Text>
          ))}
        </Card>
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
