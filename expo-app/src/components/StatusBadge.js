import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStatusMeta } from '../data/exploreData';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export default function StatusBadge({ status, size = 'md', style, showIcon = true }) {
  const meta = getStatusMeta(status);
  const isLg = size === 'lg';

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: meta.bg,
          paddingVertical: isLg ? 6 : 4,
          paddingHorizontal: isLg ? 12 : 10,
        },
        style,
      ]}
    >
      {showIcon && (
        <Ionicons name={meta.icon} size={isLg ? 16 : 12} color={meta.fg} style={{ marginRight: 6 }} />
      )}
      <Text style={[styles.text, { color: meta.fg, fontSize: isLg ? 14 : 12 }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: spacing.radiusPill,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.captionBold,
  },
});
