import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const TONE_MAP = {
  blue: { bg: colors.tipBlue, iconBg: 'rgba(52, 112, 72, 0.15)', iconColor: colors.secondary, titleColor: colors.secondary },
  orange: { bg: colors.tipOrange, iconBg: 'rgba(230, 160, 60, 0.2)', iconColor: '#B8860B', titleColor: '#B8860B' },
  red: { bg: colors.tipRed, iconBg: 'rgba(231, 76, 60, 0.15)', iconColor: '#C0392B', titleColor: '#C0392B' },
  purple: { bg: colors.tipPurple, iconBg: 'rgba(146, 102, 153, 0.15)', iconColor: colors.accent, titleColor: colors.accent },
};

export default function TipCard({ icon, title, description, tone = 'blue', style }) {
  const t = TONE_MAP[tone] || TONE_MAP.blue;

  return (
    <View style={[styles.card, { backgroundColor: t.bg }, style]}>
      <View style={[styles.iconBox, { backgroundColor: t.iconBg }]}>
        <Ionicons name={icon} size={20} color={t.iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: t.titleColor }]}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 16,
    padding: spacing.md,
    borderRadius: spacing.radiusMd,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.bodyBold,
    marginBottom: 4,
  },
  desc: {
    ...typography.caption,
    color: colors.textMain,
    lineHeight: 18,
  },
});
