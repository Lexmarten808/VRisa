import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { theme } from '../../lib/theme';

const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  good: { bg: '#dcfce7', text: theme.colors.success, border: theme.colors.success },
  moderate: { bg: '#fef3c7', text: theme.colors.warning, border: theme.colors.warning },
  unhealthy: { bg: '#fee2e2', text: theme.colors.danger, border: theme.colors.danger },
  critical: { bg: '#fca5a5', text: theme.colors.critical, border: theme.colors.critical },
  pending: { bg: '#e2e8f0', text: '#334155', border: '#94a3b8' },
  approved: { bg: '#dcfce7', text: theme.colors.success, border: theme.colors.success },
  rejected: { bg: '#fee2e2', text: theme.colors.danger, border: theme.colors.danger },
  scheduled: { bg: '#e0f2fe', text: '#075985', border: '#0284c7' },
  done: { bg: '#e2e8f0', text: '#334155', border: '#94a3b8' }
};

export function StatusBadge({ value }: { value: string }) {
  const c = COLORS[value] ?? { bg: '#e2e8f0', text: '#334155', border: '#94a3b8' };
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}> 
      <Text style={[styles.text, { color: c.text }]}>{value.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
    borderWidth: 1
  },
  text: { fontSize: 11, fontWeight: '600' }
});
