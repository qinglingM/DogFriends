import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';

export default function SquareScreen() {
  return (
    <View style={styles.screen}>
      <NavBar title="广场" />

      <View style={styles.content}>
        <View style={styles.illustration}>
          <Ionicons name="people" size={72} color={colors.secondary} />
          <Ionicons name="sparkles" size={24} color={colors.accent} style={styles.sparkle1} />
          <Ionicons name="sparkles" size={20} color={colors.white} style={styles.sparkle2} />
        </View>
        <Text style={styles.title}>社区广场</Text>
        <Text style={styles.desc}>
          这里将会是狗友们分享遛狗日常、{'\n'}交流养狗经验的社区空间。
        </Text>
        <View style={styles.chip}>
          <Ionicons name="rocket" size={16} color={colors.accent} />
          <Text style={styles.chipText}>即将上线</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 32, gap: 16,
  },
  illustration: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', marginBottom: 8,
  },
  sparkle1: { position: 'absolute', top: 8, right: 16 },
  sparkle2: { position: 'absolute', bottom: 16, left: 8 },
  title: { ...typography.h2, color: colors.secondary },
  desc: { ...typography.body, color: colors.textLight, textAlign: 'center', lineHeight: 22 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(146, 102, 153, 0.1)',
    borderRadius: spacing.radiusPill,
    paddingVertical: 8, paddingHorizontal: 24,
    marginTop: 8,
  },
  chipText: { ...typography.bodyBold, color: colors.accent },
});
