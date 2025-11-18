import React, { PropsWithChildren } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../lib/theme';

type CardProps = PropsWithChildren<{ style?: ViewStyle | ViewStyle[] }>; 

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(4),
    ...theme.shadow.card,
    borderWidth: 1,
    borderColor: theme.colors.border
  }
});
