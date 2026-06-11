import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';
import { useBadges } from '../../contexts/BadgeContext';

export default function EarnedBadgesScreen({ navigation }) {
  const { earnedBadges } = useBadges();

  return (
    <View style={styles.screen}>
      <NavBar title="已获得徽章" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {earnedBadges.length === 0 ? (
          <Text style={styles.emptyText}>还没有获得徽章，继续探索吧！</Text>
        ) : (
          <View style={styles.grid}>
            {earnedBadges.map(badge => (
              <View key={badge.id} style={styles.badgeCard}>
                <View style={[styles.badgeIcon, { backgroundColor: badge.color }]}>
                  {badge.icon.length <= 2 ? (
                    <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                  ) : (
                    <Ionicons name={badge.icon} size={24} color={colors.white} />
                  )}
                </View>
                <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 48 },
  emptyText: { ...typography.body, color: colors.textLight, textAlign: 'center', marginTop: 48 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
  },
  badgeCard: {
    width: '30.5%',
    minHeight: 108,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  badgeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  badgeEmoji: { fontSize: 24 },
  badgeName: {
    ...typography.captionBold,
    color: colors.secondary,
    textAlign: 'center',
    maxWidth: '100%',
  },
});