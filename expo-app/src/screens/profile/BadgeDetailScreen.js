import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Card, Button } from '../../components';
import {
  getBadgeProgress,
  getBadgeProgressLabel,
  getBadgeRemainingLabel,
  formatEarnedDate,
} from '../../data/profileData';

export default function BadgeDetailScreen({ route, navigation }) {
  const badge = route?.params?.badge || {};
  const progress = getBadgeProgress(badge);
  const progressLabel = getBadgeProgressLabel(badge);
  const remainingLabel = getBadgeRemainingLabel(badge);

  const handleAction = () => {
    if (badge.actionRoute === 'contributions') {
      navigation.navigate('ContributionHistory');
      return;
    }

    if (badge.actionRoute === 'add_location') {
      navigation.getParent()?.navigate('Explore', { screen: 'AddLocation' });
      return;
    }

    if (badge.actionRoute === 'walk') {
      navigation.getParent()?.navigate('Walk');
      return;
    }

    if (badge.actionRoute === 'square') {
      navigation.getParent()?.navigate('Square');
      return;
    }

    if (badge.actionRoute === 'BadgeWall') {
      navigation.goBack();
      return;
    }

    navigation.getParent()?.navigate('Explore');
  };

  const isEmoji = badge.icon && badge.icon.length <= 2;

  return (
    <View style={styles.screen}>
      <NavBar title="徽章详情" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <Card style={styles.heroCard}>
          <View style={[styles.badgeIconWrap, !badge.earned && styles.badgeIconLocked]}>
            {isEmoji ? (
              <Text style={styles.emojiIcon}>{badge.icon}</Text>
            ) : (
              <Ionicons
                name={badge.icon || 'ribbon'}
                size={40}
                color={badge.earned ? colors.secondary : colors.textLight}
              />
            )}
          </View>
          <Text style={styles.badgeName}>{badge.name || '徽章'}</Text>
          <Text style={styles.badgeState}>{badge.earned ? '已获得' : '继续追逐中'}</Text>
        </Card>

        <Card>
          <Text style={styles.label}>徽章说明</Text>
          <Text style={styles.body}>{badge.description || '记录你对宠物友好地点共建的真实贡献。'}</Text>

          <Text style={styles.label}>获得条件</Text>
          <Text style={styles.body}>{badge.condition || '完成指定贡献任务'}</Text>

          {badge.earned ? (
            <>
              <Text style={styles.label}>获得时间</Text>
              <Text style={styles.body}>{formatEarnedDate(badge.earnedAt) || '已达成'}</Text>
              <Text style={styles.label}>当前状态</Text>
              <Text style={styles.body}>已获得</Text>
            </>
          ) : (
            <>
              {badge.target ? (
                <>
                  <View style={styles.progressHeader}>
                    <Text style={styles.label}>当前进度</Text>
                    <Text style={styles.progressLabel}>{progressLabel}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                  </View>
                  <Text style={styles.nextHint}>{remainingLabel}</Text>
                </>
              ) : (
                <Text style={styles.body}>条件尚未满足，继续加油！</Text>
              )}
            </>
          )}
        </Card>

        {(badge.actionRoute || !badge.earned) && (
          <Button fullWidth onPress={handleAction}>
            {badge.earned ? '继续贡献' : badge.actionLabel || '去贡献'}
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 48 },
  heroCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  badgeIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(185, 207, 50, 0.32)',
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: 16,
  },
  badgeIconLocked: {
    backgroundColor: '#EEF0EB',
    borderColor: '#D7DDD3',
  },
  emojiIcon: { fontSize: 40 },
  badgeName: { ...typography.h2, color: colors.secondary, marginBottom: 4 },
  badgeState: { ...typography.captionBold, color: colors.textLight },
  label: { ...typography.captionBold, color: colors.secondary, marginBottom: 6, marginTop: 8 },
  body: { ...typography.body, color: colors.textMain, marginBottom: 12 },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: { ...typography.captionBold, color: colors.textLight },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8EDE2',
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  nextHint: {
    ...typography.captionBold,
    color: colors.textLight,
    marginTop: 8,
  },
});