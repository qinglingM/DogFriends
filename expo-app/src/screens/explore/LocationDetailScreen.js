import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import {
  Button,
  MapPlaceholder,
  StatusBadge,
  ValidationCard,
  InaccuracySheet,
} from '../../components';
import { useExplore } from '../../contexts/ExploreContext';
import {
  getStatusBanner,
  ENTRY_AREAS,
  DOG_SIZES,
  getContributionLabel,
} from '../../data/exploreData';

export default function LocationDetailScreen({ route, navigation }) {
  const id = route?.params?.id;
  const {
    getLocation,
    getValidations,
    helpful,
    favorites,
    toggleFavorite,
    toggleHelpful,
    reportInaccuracy,
  } = useExplore();

  const location = getLocation(id) || getLocation('loc_bloom');
  const validations = getValidations(location.id);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [targetValidationId, setTargetValidationId] = useState(null);
  const banner = getStatusBanner(location.status);
  const isFav = !!favorites[location.id];

  const entryAreaLabel = ENTRY_AREAS.find(e => e.key === location.entryArea)?.label || '—';
  const dogSizeLabels = (location.dogSize || [])
    .map(k => DOG_SIZES.find(s => s.key === k)?.label)
    .filter(Boolean);

  const visible = validations.slice(0, 3);
  const hasMore = validations.length > 3;

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <MapPlaceholder height={240} label="地点照片" style={{ borderRadius: 0 }} />
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{location.name}</Text>
          <TouchableOpacity onPress={() => toggleFavorite(location.id)}>
            <Ionicons name={isFav ? 'bookmark' : 'bookmark-outline'} size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.addressRow}>
          <Ionicons name="location" size={14} color={colors.textLight} />
          <Text style={styles.address}>{location.categoryLabel} · {location.address}</Text>
        </View>

        <View style={styles.quickActions}>
          <Button
            size="sm"
            variant="secondary"
            style={{ flex: 1 }}
            icon={<Ionicons name="call" size={14} color={colors.secondary} />}
          >
            电话
          </Button>
          <Button
            size="sm"
            style={{ flex: 1 }}
            icon={<Ionicons name="navigate" size={14} color={colors.secondary} />}
          >
            导航
          </Button>
          <Button
            size="sm"
            variant="secondary"
            style={{ flex: 1 }}
            icon={<Ionicons name="checkmark-circle-outline" size={14} color={colors.secondary} />}
            onPress={() => navigation.navigate('UpdateInfo', { id: location.id })}
          >
            我去过
          </Button>
        </View>

        <View style={styles.statusBanner}>
          <StatusBadge status={location.status} size="lg" />
          <Text style={styles.statusSub}>
            {getContributionLabel(location.verifierCount)} · {location.lastUpdatedLabel}
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          信息由狗主人共同更新，可能随时间变化，出发前建议电话确认。
        </Text>

        {banner && (
          <View style={[styles.warnBanner, bannerToneStyle(banner.tone)]}>
            <Ionicons
              name={banner.tone === 'danger' ? 'alert-circle' : banner.tone === 'warning' ? 'warning' : 'information-circle'}
              size={16}
              color={bannerToneIconColor(banner.tone)}
            />
            <Text style={[styles.warnText, { color: bannerToneIconColor(banner.tone) }]}>
              {banner.text}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>宠物规则</Text>
        <View style={styles.rulesGrid}>
          <View style={styles.ruleItem}>
            <Ionicons name="home-outline" size={16} color={colors.secondary} />
            <Text style={styles.ruleText}>{entryAreaLabel}</Text>
          </View>
          {dogSizeLabels.length > 0 && (
            <View style={styles.ruleItem}>
              <Ionicons name="paw-outline" size={16} color={colors.secondary} />
              <Text style={styles.ruleText}>{dogSizeLabels[0]}</Text>
            </View>
          )}
        </View>

        {(location.facilities?.length > 0 || location.behaviors?.length > 0) && (
          <>
            <Text style={styles.sectionTitle}>设施与要求</Text>
            <View style={styles.facilityTags}>
              {[...(location.behaviors || []), ...(location.facilities || [])].map((t, i) => (
                <View key={i} style={styles.tagChip}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.validationSection}>
          <View style={styles.validationHeader}>
            <Text style={styles.sectionTitle}>狗主人验证</Text>
            {validations.length > 0 && (
              <Text style={styles.validationCount}>{validations.length} 条</Text>
            )}
          </View>

          {validations.length === 0 ? (
            <View style={styles.emptyValidation}>
              <Text style={styles.emptyTitle}>还没有狗主人验证过这个地点</Text>
              <Text style={styles.emptyText}>如果你去过，可以帮大家补充信息</Text>
              <Button
                variant="secondary"
                onPress={() => navigation.navigate('UpdateInfo', { id: location.id })}
                style={{ marginTop: 16 }}
              >
                我去过，更新信息
              </Button>
            </View>
          ) : (
            <>
              {visible.map(v => (
                <ValidationCard
                  key={v.id}
                  validation={v}
                  helpful={!!helpful[v.id]}
                  onToggleHelpful={() => toggleHelpful(location.id, v.id)}
                  onReportInaccuracy={() => {
                    setTargetValidationId(v.id);
                    setSheetVisible(true);
                  }}
                />
              ))}
              {hasMore && (
                <TouchableOpacity style={styles.moreBtn}>
                  <Text style={styles.moreText}>查看全部 {validations.length} 条验证</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.secondary} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <InaccuracySheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSubmit={(reason) => {
          if (targetValidationId) {
            reportInaccuracy(location.id, targetValidationId, reason);
          }
        }}
      />
    </View>
  );
}

function bannerToneStyle(tone) {
  switch (tone) {
    case 'danger':
      return { backgroundColor: 'rgba(231, 76, 60, 0.1)' };
    case 'warning':
      return { backgroundColor: 'rgba(230, 160, 60, 0.12)' };
    default:
      return { backgroundColor: 'rgba(52, 112, 72, 0.08)' };
  }
}

function bannerToneIconColor(tone) {
  switch (tone) {
    case 'danger':
      return '#A02E22';
    case 'warning':
      return '#8B5A1E';
    default:
      return colors.secondary;
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { position: 'relative' },
  backBtn: {
    position: 'absolute', top: 48, left: 16,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 16, elevation: 4,
  },
  content: {
    padding: spacing.screenMargin, paddingTop: 24, paddingBottom: 48,
    backgroundColor: colors.bg,
    borderTopLeftRadius: spacing.radiusLg,
    borderTopRightRadius: spacing.radiusLg,
    marginTop: -24, position: 'relative', zIndex: 5,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { ...typography.h1, color: colors.secondary, flex: 1, paddingRight: 12 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  address: { ...typography.body, color: colors.textLight, flex: 1 },
  statusBanner: {
    flexDirection: 'column',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: spacing.radiusMd,
    marginBottom: 8,
    borderBottomWidth: 4, borderBottomColor: colors.secondary,
    gap: 6,
  },
  statusSub: { ...typography.caption, color: colors.secondary, opacity: 0.85 },
  disclaimer: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  warnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: spacing.radiusMd,
    marginBottom: 16,
  },
  warnText: { ...typography.captionBold, flex: 1 },
  sectionTitle: { ...typography.h3, color: colors.secondary, marginTop: 16, marginBottom: 12 },
  rulesGrid: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  ruleItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, padding: spacing.md,
    borderRadius: spacing.radiusMd,
  },
  ruleText: { ...typography.bodyBold, color: colors.secondary },
  facilityTags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  tagText: { ...typography.captionBold, color: colors.textMain },
  validationSection: {
    marginTop: 8,
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  validationCount: {
    ...typography.caption,
    color: colors.textLight,
  },
  emptyValidation: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: { ...typography.bodyBold, color: colors.textMain },
  emptyText: { ...typography.caption, color: colors.textLight, marginTop: 4 },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  moreText: { ...typography.bodyBold, color: colors.secondary },
});
