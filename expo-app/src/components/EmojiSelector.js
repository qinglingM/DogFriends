import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const MOODS = [
  { value: '不太舒服', emoji: '🤒', label: '不太舒服' },
  { value: '有点疲惫', emoji: '😴', label: '有点疲惫' },
  { value: '比较平静', emoji: '😐', label: '比较平静' },
  { value: '心情不错', emoji: '🙂', label: '心情不错' },
  { value: '活力满满', emoji: '😄', label: '活力满满' },
];

export default function EmojiSelector({ value, onChange }) {
  return (
    <View style={styles.row}>
      {MOODS.map((mood) => {
        const isActive = value === mood.value;
        return (
          <TouchableOpacity
            key={mood.value}
            onPress={() => onChange(mood.value)}
            activeOpacity={0.7}
            style={[styles.btn, isActive && styles.btnActive]}
          >
            <Text style={[styles.emoji, isActive && styles.emojiActive]}>
              {mood.emoji}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {mood.label}
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
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  btn: {
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: spacing.radiusMd,
    minWidth: 48,
  },
  btnActive: {
    backgroundColor: 'rgba(185, 207, 50, 0.15)',
  },
  emoji: {
    fontSize: 32,
  },
  emojiActive: {
    transform: [{ scale: 1.2 }],
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textLight,
  },
  labelActive: {
    color: colors.secondary,
    fontWeight: '800',
  },
});
