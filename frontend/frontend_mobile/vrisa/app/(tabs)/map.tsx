import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { stations as mockStations } from '../../lib/mockData';
import { View, StyleSheet, Text } from 'react-native';
import api from '../../lib/api';

export default function MapScreen(){
  const [stations, setStations] = useState<any[] | null>(null);

  useEffect(()=>{
    let mounted = true;
    async function load(){
      try{
        const data = await api.getStations();
        if(mounted) setStations(data as any[]);
      }catch(err){
        if(mounted) setStations(mockStations as any[]);
      }
    }
    load();
    return ()=>{ mounted = false; };
  },[]);

  const list = stations && stations.length ? stations : mockStations;
  const first = list[0];

  return (
    <View style={styles.container}>
      <MapView style={StyleSheet.absoluteFillObject} initialRegion={{
        latitude: Number(first?.lat || first?.latitude || first?.lat || 3.4516),
        longitude: Number(first?.lon || first?.lng || first?.longitude || -76.5320),
        latitudeDelta: 0.08,
        longitudeDelta: 0.08
      }}>
        {list.map((s: any, idx: number) => {
          // support different shapes from mock vs backend
          const latitude = Number(s.lat || s.latitude || s.latitud || s.latitude_deg || 0) + (idx * 0.00002);
          const longitude = Number(s.lon || s.lng || s.longitude || s.longitud || 0) + (idx * 0.00002);
          const key = s.station_id || s.id || `${s.s_name || s.name}-${idx}`;
          const title = s.s_name || s.name || 'Estación';
          const desc = s.s_state || s.status || '';
          return <Marker key={key} coordinate={{ latitude, longitude }} title={title} description={desc} />;
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1 }
});
