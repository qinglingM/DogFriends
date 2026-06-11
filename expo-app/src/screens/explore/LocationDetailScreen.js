import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
  ImageViewer,
} from '../../components';
import { useExplore } from '../../contexts/ExploreContext';
import {
  getStatusBanner,
  ENTRY_AREAS,
  DOG_SIZES,
  BEHAVIOR_ICONS,
  FACILITY_ICONS,
} from '../../data/exploreData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const banner = getStatusBanner(location.status);
  const isFav = !!favorites[location.id];

  // 收集所有图片（用户上传的照片 + 缩略图）
  const allImages = [
    ...(location.photos || []),
    ...(location.thumbnailUrl && !location.photos?.includes(location.thumbnailUrl) ? [location.thumbnailUrl] : []),
  ];

  const matchedEntryArea = ENTRY_AREAS.find(e => e.key === location.entryArea);
  const matchedDogSizes = DOG_SIZES.filter(s => (location.dogSize || []).includes(s.key));
  const matchedFacilityItems = [
    ...(location.behaviors || []).map(t => ({ label: t, icon: BEHAVIOR_ICONS[t] || 'help-circle' })),
    ...(location.facilities || []).map(t => ({ label: t, icon: FACILITY_ICONS[t] || 'help-circle' })),
  ];
  const displayedFacilityItems = showAllFacilities ? matchedFacilityItems : matchedFacilityItems.slice(0, 4);
  const hasMoreFacilities = matchedFacilityItems.length > 4;

  const visible = validations.slice(0, 3);
  const hasMore = validations.length > 3;

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => {
        parent?.setOptions({
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: spacing.bottomTabHeight,
            paddingBottom: 8,
            paddingTop: 8,
          },
        });
      };
    }, [navigation])
  );

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={() => toggleFavorite(location.id)}
        >
          <Ionicons name={isFav ? 'bookmark' : 'bookmark-outline'} size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          {allImages.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                  if (index !== currentImageIndex) {
                    setCurrentImageIndex(index);
                  }
                }}
                scrollEventThrottle={100}
                style={styles.imageCarousel}
              >
                {allImages.map((uri, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.9}
                    onPress={() => {
                      setViewerIndex(index);
                      setViewerVisible(true);
                    }}
                  >
                    <Image source={{ uri }} style={styles.heroImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {allImages.length > 1 && (
                <View style={styles.pagination}>
                  {allImages.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        index === currentImageIndex && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <MapPlaceholder height={200} label="地点照片" style={{ borderRadius: 0 }} />
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{location.name}</Text>
            <StatusBadge status={location.status} size="sm" />
          </View>

          <TouchableOpacity style={styles.addressRow}>
            <Ionicons name="location" size={14} color={colors.textLight} />
            <Text style={styles.address}>{location.categoryLabel} · {location.address}</Text>
            <TouchableOpacity>
              <Ionicons name="call" size={16} color={colors.secondary} />
            </TouchableOpacity>
          </TouchableOpacity>

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

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>宠物规则</Text>
          <View style={styles.rulesGrid}>
            {matchedEntryArea && (
              <View style={styles.ruleItem}>
                <Ionicons name={matchedEntryArea.icon} size={14} color={colors.secondary} />
                <Text style={styles.ruleTextActive}>{matchedEntryArea.label}</Text>
              </View>
            )}
            {matchedDogSizes.map(size => (
              <View key={size.key} style={styles.ruleItem}>
                <Ionicons name={size.icon} size={14} color={colors.secondary} />
                <Text style={styles.ruleTextActive}>{size.label}</Text>
              </View>
            ))}
          </View>

          {matchedFacilityItems.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>设施与要求</Text>
              <View style={styles.facilityTags}>
                {showAllFacilities ? (
                  matchedFacilityItems.map((item, i) => (
                    <View key={`f-${i}`} style={[styles.tagChip, styles.tagChipActive]}>
                      <Ionicons name={item.icon} size={12} color={colors.secondary} style={{ marginRight: 4 }} />
                      <Text style={styles.tagTextActive}>{item.label}</Text>
                    </View>
                  ))
                ) : (
                  <>
                    {matchedFacilityItems.slice(0, 4).map((item, i) => (
                      <View key={`f-${i}`} style={[styles.tagChip, styles.tagChipActive]}>
                        <Ionicons name={item.icon} size={12} color={colors.secondary} style={{ marginRight: 4 }} />
                        <Text style={styles.tagTextActive}>{item.label}</Text>
                      </View>
                    ))}
                    {matchedFacilityItems.length > 4 && (
                      <TouchableOpacity style={styles.tagChip} onPress={() => setShowAllFacilities(true)}>
                        <Text style={styles.expandChipText}>查看全部</Text>
                        <Ionicons name="chevron-forward" size={12} color={colors.secondary} />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
              {showAllFacilities && matchedFacilityItems.length > 4 && (
                <TouchableOpacity style={styles.collapseBtn} onPress={() => setShowAllFacilities(false)}>
                  <Text style={styles.expandText}>收起</Text>
                  <Ionicons name="chevron-up" size={12} color={colors.secondary} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={styles.validationSection}>
          <Text style={styles.sectionTitle}>
            狗主人验证{validations.length > 0 ? `（${validations.length}）` : ''}
          </Text>

          {validations.length === 0 ? (
            <View style={styles.emptyValidation}>
              <Text style={styles.emptyTitle}>还没有狗主人验证过这个地点</Text>
              <Text style={styles.emptyText}>如果你去过，可以帮大家补充信息</Text>
              <Button
                variant="secondary"
                onPress={() => navigation.navigate('UpdateInfo', { id: location.id })}
                style={{ marginTop: 16 }}
              >
                我来反馈
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

      <View style={styles.bottomBar}>
        <Button
          icon={<Ionicons name="create-outline" size={18} color={colors.secondary} />}
          onPress={() => navigation.navigate('UpdateInfo', { id: location.id })}
        >
          我来反馈
        </Button>
      </View>

      <InaccuracySheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSubmit={(reason) => {
          if (targetValidationId) {
            reportInaccuracy(location.id, targetValidationId, reason);
          }
        }}
      />

      <ImageViewer
        visible={viewerVisible}
        images={allImages}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
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
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  hero: { position: 'relative' },
  imageCarousel: {
    width: SCREEN_WIDTH,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 200,
  },
  pagination: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: colors.white,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  backBtn: {
    position: 'absolute', top: 48, left: 16,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 16, elevation: 4,
  },
  bookmarkBtn: {
    position: 'absolute', top: 48, right: 16,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 16, elevation: 4,
  },
  content: {
    paddingBottom: 100,
    backgroundColor: colors.bg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: { ...typography.h2, color: colors.secondary, flex: 1, marginRight: spacing.sm },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  address: { ...typography.body, color: colors.textLight, flex: 1 },
  infoSection: {
    padding: spacing.screenMargin,
  },
  warnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: 12,
    borderRadius: spacing.radiusMd,
    marginBottom: spacing.md,
  },
  warnText: { ...typography.captionBold, flex: 1 },
  sectionTitle: { ...typography.h3, color: colors.secondary, marginBottom: spacing.md },
  rulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sectionGap },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.chipDefault,
    padding: spacing.sm,
    borderRadius: spacing.radiusSm,
  },
  ruleItemActive: {
    backgroundColor: colors.statusPassed,
  },
  ruleText: { ...typography.captionBold, color: colors.textLight },
  ruleTextActive: { color: colors.secondary },
  facilityTags: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  expandText: { ...typography.captionBold, color: colors.secondary },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  tagChipActive: {
    backgroundColor: colors.statusPassed,
  },
  tagText: { ...typography.captionBold, color: colors.textMain },
  tagTextActive: { color: colors.secondary },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  validationSection: {
    backgroundColor: colors.bgLight,
    padding: spacing.screenMargin,
    marginTop: spacing.sectionGap,
  },
  emptyValidation: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: { ...typography.bodyBold, color: colors.textMain },
  emptyText: { ...typography.caption, color: colors.textLight, marginTop: spacing.xs },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 12,
  },
  moreText: { ...typography.bodyBold, color: colors.secondary },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
