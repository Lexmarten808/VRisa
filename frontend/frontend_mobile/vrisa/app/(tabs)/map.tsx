import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { stations } from '../../lib/mockData';
import { View, StyleSheet, Text } from 'react-native';

export default function MapScreen(){
  return (
    <View style={styles.container}>
      <MapView style={StyleSheet.absoluteFillObject} initialRegion={{
        latitude: stations[0].lat,
        longitude: stations[0].lng,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08
      }}>
        {stations.map(s => (
          <Marker key={s.id} coordinate={{ latitude: s.lat, longitude: s.lng }} title={s.name} description={s.status} />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1 }
});
