import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function Card({ children, style, noPadding }) {
  return (
    <View style={[styles.card, noPadding && styles.noPadding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: spacing.cardGap,
  },
  noPadding: {
    padding: 0,
  },
});
