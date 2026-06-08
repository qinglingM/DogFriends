import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';

const DEFAULT_BADGES = [
  { id: 'real_owner', name: '真实狗主', icon: 'paw', color: colors.primary, description: '已完成狗狗档案创建，并发布过公开动态。' },
  { id: 'walk_7', name: '连续遛狗7天', icon: 'calendar', color: colors.secondary, description: '连续 7 天记录遛狗。' },
  { id: 'explorer', name: '地点探索家', icon: 'location', color: colors.accent, description: '贡献过宠物友好地点体验。' },
  { id: 'family', name: '金毛家长', icon: 'shield-checkmark', color: colors.primary, description: '公开展示金毛犬档案。' },
];

export default function EarnedBadgesScreen({ navigation, route }) {
  const badges = route.params?.badges || DEFAULT_BADGES;

  return (
    <View style={styles.screen}>
      <NavBar title="已获得徽章" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.summary}>已获得 {badges.length} 枚徽章</Text>
        <View style={styles.grid}>
          {badges.map(badge => (
            <View key={badge.id} style={styles.badgeCard}>
              <View style={[styles.badgeIcon, { backgroundColor: badge.color }]}>
                <Ionicons name={badge.icon} size={34} color={colors.white} />
              </View>
              <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
              <Text style={styles.badgeDescription} numberOfLines={2}>{badge.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: spacing.xxl },
  summary: { ...typography.bodyBold, color: colors.secondary, marginBottom: spacing.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '30.7%',
    minHeight: 168,
    padding: spacing.sm,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeIcon: {
    width: 72,
    height: 72,
    borderRadius: spacing.radiusLg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  badgeName: {
    ...typography.captionBold,
    color: colors.textMain,
    textAlign: 'center',
    maxWidth: '100%',
  },
  badgeDescription: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
  },
});
