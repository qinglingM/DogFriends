import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const OPTIONS = [
  { value: 0, label: '没有' },
  { value: 1, label: '1次' },
  { value: 2, label: '2次' },
  { value: '3+', label: '好几次' },
];

export default function NumberSelector({ value, onChange, labels }) {
  const opts = labels || OPTIONS;

  return (
    <View style={styles.row}>
      {opts.map((opt) => {
        const isActive = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.7}
            style={[styles.btn, isActive && styles.btnActive]}
          >
            <Text style={[styles.num, isActive && styles.numActive]}>
              {opt.value}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  btnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
  },
  num: {
    ...typography.statValue,
    color: colors.secondary,
  },
  numActive: {
    color: colors.secondary,
  },
  label: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 4,
  },
  labelActive: {
    color: colors.secondary,
  },
});
