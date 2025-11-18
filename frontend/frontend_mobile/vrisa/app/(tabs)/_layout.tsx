import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const iconColor = (focused:boolean)=> focused ? '#0d6efd' : '#64748b';
const iconSize = 22;

export default function TabsLayout(){
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0d6efd',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle:{ backgroundColor:'#ffffff', borderTopColor:'#e2e8f0' }
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({focused}) => <Ionicons name="speedometer-outline" size={iconSize} color={iconColor(focused)} /> }} />
      <Tabs.Screen name="map" options={{ title: 'Mapa', tabBarIcon: ({focused}) => <Ionicons name="map-outline" size={iconSize} color={iconColor(focused)} /> }} />
      <Tabs.Screen name="stations" options={{ title: 'Estaciones', tabBarIcon: ({focused}) => <MaterialCommunityIcons name="factory" size={iconSize} color={iconColor(focused)} /> }} />
      <Tabs.Screen name="reports" options={{ title: 'Reportes', tabBarIcon: ({focused}) => <Ionicons name="document-text-outline" size={iconSize} color={iconColor(focused)} /> }} />
      <Tabs.Screen name="institutions" options={{ title: 'Instituciones', tabBarIcon: ({focused}) => <Ionicons name="business-outline" size={iconSize} color={iconColor(focused)} /> }} />
    </Tabs>
  );
}
