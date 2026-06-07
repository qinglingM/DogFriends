import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export default function MapPlaceholder({ height = 200, label, sublabel, style }) {
  return (
    <View style={[styles.container, { height }, style]}>
      <Ionicons name="map-outline" size={48} color={colors.secondary} style={{ opacity: 0.3 }} />
      <Text style={styles.label}>{label || '高德地图加载区域'}</Text>
      {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#E8EDE4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    borderRadius: 16,
  },
  label: {
    ...typography.bodyBold,
    color: colors.textLight,
  },
  sublabel: {
    ...typography.caption,
    color: colors.textLight,
  },
});
