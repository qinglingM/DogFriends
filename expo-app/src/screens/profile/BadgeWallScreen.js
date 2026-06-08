import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';
import { PROFILE_BADGES, getBadgeProgress, getBadgeProgressLabel } from '../../data/profileData';

export default function BadgeWallScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const badgeGridWidth = Math.max(280, width - spacing.screenMargin * 2);

  return (
    <View style={styles.screen}>
      <NavBar title="我的徽章" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.badgeGrid, { width: badgeGridWidth }]}>
          {PROFILE_BADGES.map(badge => {
            const progress = getBadgeProgress(badge);
            return (
              <TouchableOpacity
                key={badge.id}
                activeOpacity={0.75}
                style={styles.badgeItem}
                onPress={() => navigation.navigate('BadgeDetail', { badge })}
              >
                <View style={[styles.badgeIconWrap, !badge.earned && styles.badgeIconLocked]}>
                  <Ionicons
                    name={badge.icon}
                    size={24}
                    color={badge.earned ? colors.secondary : colors.textLight}
                  />
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
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 48 },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
  },
  badgeStatus: { ...typography.captionBold, color: colors.secondary },
  badgeStatusLocked: { color: colors.textLight },
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
    backgroundColor: 'rgba(185, 207, 50, 0.32)',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  badgeIconLocked: {
    backgroundColor: '#EEF0EB',
    borderColor: '#D7DDD3',
  },
  badgeName: { ...typography.captionBold, color: colors.secondary, maxWidth: '100%' },
  badgeNameLocked: { color: colors.textLight },
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
