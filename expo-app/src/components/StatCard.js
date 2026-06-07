import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function StatCard({ icon, value, unit, label, iconColor }) {
  return (
    <View style={styles.card}>
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={iconColor || colors.primary}
          style={styles.icon}
        />
      )}
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    ...typography.statValue,
    color: colors.secondary,
  },
  unit: {
    ...typography.captionBold,
    color: colors.secondary,
  },
  label: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 4,
  },
});
