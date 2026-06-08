import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function ValidationCard({ validation, helpful, onToggleHelpful, onReportInaccuracy }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>{validation.userAvatar || '🐶'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{validation.userName}</Text>
          <Text style={styles.time}>{validation.time}</Text>
        </View>
      </View>

      <View style={styles.outcomeRow}>
        <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
        <Text style={styles.outcomeText}>{validation.outcomeLabel}</Text>
        {validation.dogSize && (
          <View style={styles.dogTag}>
            <Text style={styles.dogTagText}>{validation.dogSize}</Text>
          </View>
        )}
      </View>

      {validation.tags?.length > 0 && (
        <View style={styles.tagRow}>
          {validation.tags.map((t, i) => (
            <View key={i} style={styles.tagChip}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      )}

      {validation.note ? <Text style={styles.note}>{validation.note}</Text> : null}

      {validation.photos > 0 && (
        <View style={styles.photoRow}>
          {Array.from({ length: validation.photos }).map((_, i) => (
            <View key={i} style={styles.photoPlaceholder}>
              <Ionicons name="image-outline" size={20} color={colors.secondary} style={{ opacity: 0.4 }} />
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtn} onPress={onToggleHelpful} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name={helpful ? 'thumbs-up' : 'thumbs-up-outline'}
            size={16}
            color={helpful ? colors.secondary : colors.textLight}
          />
          <Text style={[styles.footerText, helpful && { color: colors.secondary, fontWeight: '700' }]}>
            有用 {validation.helpfulCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerBtn} onPress={onReportInaccuracy} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.textLight} />
          <Text style={styles.footerText}>信息不准</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: spacing.cardGap,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarEmoji: { fontSize: 20 },
  userName: { ...typography.bodyBold, color: colors.textMain },
  time: { ...typography.caption, color: colors.textLight, marginTop: 2 },
  outcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  outcomeText: { ...typography.bodyBold, color: colors.secondary, marginLeft: 4 },
  dogTag: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  dogTagText: { ...typography.captionBold, color: colors.textMain },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  tagText: { ...typography.captionBold, color: colors.textMain },
  note: { ...typography.body, color: colors.textMain, marginBottom: 8 },
  photoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: spacing.radiusSm,
    backgroundColor: '#D3E0C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: { ...typography.caption, color: colors.textLight, marginLeft: 4 },
});
