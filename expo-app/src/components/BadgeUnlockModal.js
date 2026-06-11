import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function BadgeUnlockModal({ visible, badge, onViewDetail, onDismiss }) {
  if (!badge) return null;

  const isEmoji = badge.icon.length <= 2;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>获得新徽章</Text>

          <View style={styles.iconWrap}>
            {isEmoji ? (
              <Text style={styles.emoji}>{badge.icon}</Text>
            ) : (
              <Ionicons name={badge.icon} size={48} color={colors.primary} />
            )}
          </View>

          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.badgeDesc}>{badge.description}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.75} onPress={onViewDetail}>
              <Text style={styles.primaryBtnText}>查看徽章</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.75} onPress={onDismiss}>
              <Text style={styles.secondaryBtnText}>知道了</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  title: {
    ...typography.h3,
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(185, 207, 50, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 40,
  },
  badgeName: {
    ...typography.h2,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  badgeDesc: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  primaryBtn: {
    flex: 1,
    height: spacing.touchTarget,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  secondaryBtn: {
    flex: 1,
    height: spacing.touchTarget,
    borderRadius: spacing.radiusPill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    ...typography.bodyBold,
    color: colors.textLight,
  },
});