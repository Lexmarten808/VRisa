import React from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { airQualityData } from '../../lib/mockData';
import { theme, statusPalette } from '../../lib/theme';
import { LineChart } from 'react-native-chart-kit';

export default function DashboardScreen(){
  const chartData = {
    labels: airQualityData.map(d=>d.pollutant),
    datasets: [
      {
        data: airQualityData.map(d=>d.value),
        color: (opacity=1)=> theme.colors.primary,
        strokeWidth: 3
      }
    ],
    legend: ['Concentración']
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Resumen de Calidad del Aire</Text>
      <View style={styles.cardsRow}>
        {airQualityData.map(item => (
          <Card key={item.pollutant} style={{ width: '46%', borderColor: statusColors[item.status] }}>
            <Text style={styles.cardTitle}>{item.pollutant}</Text>
            <Text style={styles.value}>{item.value} {item.unit}</Text>
            <StatusBadge value={item.status} />
          </Card>
        ))}
      </View>
      <Text style={styles.subtitle}>Valores actuales</Text>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          color: (o)=>`rgba(30,41,59,${o})`,
          labelColor: (o)=>`rgba(100,116,139,${o})`,
          decimalPlaces: 1,
          propsForDots:{ r:'5', strokeWidth:'2', stroke: theme.colors.primary },
          propsForBackgroundLines:{ stroke: theme.colors.border }
        }}
        bezier
        style={styles.chart}
      />
    </ScrollView>
  );
}

const statusColors: Record<string,string> = {
  good: theme.colors.success,
  moderate: theme.colors.warning,
  unhealthy: theme.colors.danger,
  critical: theme.colors.critical
};

const styles = StyleSheet.create({
  container:{ flex:1 },
  inner:{ padding:16 },
  title:{ fontSize:24, fontWeight:'700', marginBottom:12 },
  subtitle:{ fontSize:18, fontWeight:'600', marginTop:24, marginBottom:8 },
  cardsRow:{ flexDirection:'row', flexWrap:'wrap', gap:12 },
  cardTitle:{ fontSize:16, fontWeight:'600' },
  value:{ fontSize:14, marginTop:4 },
  chart:{ marginVertical:8, borderRadius:16 }
});
