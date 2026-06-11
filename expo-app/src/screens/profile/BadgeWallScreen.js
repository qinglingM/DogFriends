import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';
import { IDENTITY_BADGES, BREED_BADGES, getBadgeProgress, getBadgeProgressLabel } from '../../data/profileData';
import { useBadges } from '../../contexts/BadgeContext';

function IdentityBadgeItem({ badge, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.75} style={styles.badgeItem} onPress={onPress}>
      <View style={[styles.badgeIconWrap, badge.earned && styles.badgeIconEarned]}>
        {badge.icon.length === 1 || badge.icon.length > 2 ? (
          <Ionicons name={badge.icon} size={24} color={badge.earned ? colors.white : colors.textLight} />
        ) : (
          <Text style={styles.emojiBadge}>{badge.icon}</Text>
        )}
      </View>
      <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]} numberOfLines={1}>
        {badge.name}
      </Text>
      <Text style={[styles.badgeStatus, !badge.earned && styles.badgeStatusLocked]}>
        {badge.earned ? '已获得' : '未获得'}
      </Text>
    </TouchableOpacity>
  );
}

function ProgressBadgeItem({ badge, onPress }) {
  const progress = getBadgeProgress(badge);
  return (
    <TouchableOpacity activeOpacity={0.75} style={styles.badgeItem} onPress={onPress}>
      <View style={[styles.badgeIconWrap, !badge.earned && styles.badgeIconLocked]}>
        {badge.icon.length <= 2 ? (
          <Text style={styles.emojiBadgeSmall}>{badge.icon}</Text>
        ) : (
          <Ionicons name={badge.icon} size={24} color={badge.earned ? colors.secondary : colors.textLight} />
        )}
      </View>
      <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]} numberOfLines={1}>
        {badge.name}
      </Text>
      <Text style={[styles.badgeStatus, !badge.earned && styles.badgeStatusLocked]}>
        {badge.earned ? '已获得' : getBadgeProgressLabel(badge)}
      </Text>
      <View style={styles.badgeProgressTrack}>
        <View
          style={[
            styles.badgeProgressFill,
            { width: `${progress * 100}%` },
            !badge.earned && styles.badgeProgressFillLocked,
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function BadgeWallScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const badgeGridWidth = Math.max(280, width - spacing.screenMargin * 2);
  const { identityBadges, contributionBadges, achievementBadges, earnedCount, totalCount } = useBadges();

  const allIdentity = IDENTITY_BADGES.map(ib => {
    const earned = identityBadges.find(b => b.id === ib.id);
    return earned || { ...ib, earned: false };
  });

  const allBreed = BREED_BADGES.map(bb => {
    const earned = identityBadges.find(b => b.id === bb.id);
    return earned || { ...bb, earned: false };
  });

  return (
    <View style={styles.screen}>
      <NavBar title="我的徽章" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.summaryText}>你的真实分享，正在帮助更多狗狗出门不踩雷</Text>
        <Text style={styles.summaryCount}>已获得 {earnedCount}/{totalCount} 枚徽章</Text>

        <Text style={styles.sectionLabel}>身份徽章</Text>
        <Text style={styles.sectionDesc}>根据你的狗狗档案自动获得</Text>
        <View style={[styles.badgeGrid, { width: badgeGridWidth }]}>
          {allIdentity.map(badge => (
            <IdentityBadgeItem
              key={badge.id}
              badge={badge}
              onPress={() => navigation.navigate('BadgeDetail', { badge })}
            />
          ))}
          {allBreed.map(badge => (
            <IdentityBadgeItem
              key={badge.id}
              badge={badge}
              onPress={() => navigation.navigate('BadgeDetail', { badge })}
            />
          ))}
          {identityBadges.length === 0 && (
            <Text style={styles.emptyHint}>添加狗狗后即可获得身份徽章</Text>
          )}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>贡献徽章</Text>
        <Text style={styles.sectionDesc}>通过社区贡献逐步解锁</Text>
        <View style={[styles.badgeGrid, { width: badgeGridWidth }]}>
          {contributionBadges.map(badge => (
            <ProgressBadgeItem
              key={badge.id}
              badge={badge}
              onPress={() => navigation.navigate('BadgeDetail', { badge })}
            />
          ))}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>成就徽章</Text>
        <Text style={styles.sectionDesc}>记录你在社区的成长足迹</Text>
        <View style={[styles.badgeGrid, { width: badgeGridWidth }]}>
          {achievementBadges.map(badge => (
            <ProgressBadgeItem
              key={badge.id}
              badge={badge}
              onPress={() => navigation.navigate('BadgeDetail', { badge })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 48 },
  summaryText: { ...typography.body, color: colors.textMain, marginBottom: 4 },
  summaryCount: { ...typography.captionBold, color: colors.secondary, marginBottom: spacing.lg },
  sectionLabel: { ...typography.h3, color: colors.secondary, marginBottom: 4 },
  sectionDesc: { ...typography.caption, color: colors.textLight, marginBottom: spacing.md },
  emptyHint: { ...typography.caption, color: colors.textLight, textAlign: 'center', paddingVertical: spacing.md },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  badgeItem: {
    width: '30.5%',
    minHeight: 108,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  badgeIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF0EB',
    borderWidth: 2,
    borderColor: '#D7DDD3',
  },
  badgeIconEarned: {
    backgroundColor: 'rgba(185, 207, 50, 0.32)',
    borderColor: colors.primary,
  },
  badgeIconLocked: {
    backgroundColor: '#EEF0EB',
    borderColor: '#D7DDD3',
  },
  emojiBadge: { fontSize: 24 },
  emojiBadgeSmall: { fontSize: 22 },
  badgeName: { ...typography.captionBold, color: colors.secondary, maxWidth: '100%' },
  badgeNameLocked: { color: colors.textLight },
  badgeStatus: { ...typography.captionBold, color: colors.secondary },
  badgeStatusLocked: { color: colors.textLight },
  badgeProgressTrack: {
    width: '74%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8EDE2',
    overflow: 'hidden',
  },
  badgeProgressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  badgeProgressFillLocked: {
    backgroundColor: '#B8C0B2',
  },
});