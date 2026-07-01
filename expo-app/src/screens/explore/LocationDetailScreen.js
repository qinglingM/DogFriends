import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import {
  MapPlaceholder,
  StatusBadge,
  ValidationCard,
  InaccuracySheet,
  ImageViewer,
} from '../../components';
import { useExplore } from '../../contexts/ExploreContext';
import { useAuth } from '../../contexts/AuthContext';
import ErrorState from '../../components/ErrorState';
import {
  getStatusBanner,
  ENTRY_AREAS,
  DOG_SIZES,
  FACILITIES,
} from '../../data/exploreData';
import { imageUrl } from '../../utils/imageUrl';

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

  const { user } = useAuth();
  const location = getLocation(id);
  if (!location) {
    return (
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>
        <ErrorState message="地点不存在" onBack={() => navigation.goBack()} />
      </View>
    );
  }
  const validations = getValidations(location.id);
  const isPoster = user && location.submittedBy && user.id === location.submittedBy;

  const facilityPercentages = useMemo(() => {
    if (validations.length === 0) return null;
    const counts = {};
    validations.forEach(v => {
      (v.tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    });
    const result = {};
    FACILITIES.forEach(f => {
      if (counts[f]) result[f] = Math.round((counts[f] / validations.length) * 100);
    });
    return result;
  }, [validations]);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [targetValidationId, setTargetValidationId] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [showAllValidations, setShowAllValidations] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const banner = getStatusBanner(location.status);
  const isFav = !!favorites[location.id];

  const showActionBar = scrollY > SCREEN_WIDTH * 0.45;
  // 收集所有图片（用户上传的照片 + 缩略图）
  const allImages = [
    ...(location.photos || []),
    ...(location.thumbnailUrl && !location.photos?.includes(location.thumbnailUrl) ? [location.thumbnailUrl] : []),
  ];

  const matchedEntryArea = ENTRY_AREAS.find(e => e.key === location.entryArea);
  const matchedDogSizes = DOG_SIZES.filter(s => (location.dogSize || []).includes(s.key));

  const visible = showAllValidations ? validations : validations.slice(0, 3);
  const hasMore = validations.length > 3;

  const handleScroll = useCallback((e) => {
    setScrollY(e.nativeEvent.contentOffset.y);
  }, []);

  const handleAction = useCallback(() => {
    if (isPoster) {
      navigation.navigate('AddLocation', { editLocation: location });
    } else {
      navigation.navigate('UpdateInfo', { id: location.id });
    }
  }, [isPoster, navigation, location]);

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

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={100}
        contentContainerStyle={styles.content}>
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
                    <Image source={{ uri: imageUrl(uri) }} style={styles.heroImage} />
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
            <MapPlaceholder height={SCREEN_WIDTH * 3 / 4} label="地点照片" style={{ borderRadius: 0 }} />
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{location.name}</Text>
            <StatusBadge status={location.status} size="sm" />
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="location" size={14} color={colors.textLight} />
            <Text style={styles.address}>{location.city} · {location.categoryLabel}</Text>
          </View>

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

          <Text style={styles.sectionTitle}>可进入区域</Text>
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

          {facilityPercentages && Object.keys(facilityPercentages).length > 0 && (
            <>
              <Text style={styles.sectionTitle}>配套设施</Text>
              <View style={styles.facilityGrid}>
                {Object.entries(facilityPercentages).map(([name, pct], i) => (
                  <View key={`f-${i}`} style={[styles.facilityItem, pct >= 50 && styles.facilityItemKnown]}>
                    <Ionicons name="checkbox" size={16} color={pct >= 50 ? colors.secondary : colors.textLight} />
                    <Text style={[styles.facilityLabel, pct >= 50 && styles.facilityLabelKnown]}>{name}</Text>
                    <Text style={[styles.facilityPct, pct >= 50 && styles.facilityPctKnown]}>{pct}%</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.validationSection}>
          <Text style={styles.sectionTitle}>
            用户验证{validations.length > 0 ? `（${validations.length}）` : ''}
          </Text>

          {validations.length === 0 ? (
            <View style={styles.emptyValidation}>
              <Text style={styles.emptyTitle}>还没有用户验证过这个地点</Text>
              {!isPoster && <Text style={styles.emptyText}>如果你去过，可以帮大家补充信息</Text>}
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
                  onPressUser={(validation) => navigation.navigate('Profile', { screen: 'PersonalProfile', params: { profileId: validation.profileId, userName: validation.userName } })}
                />
              ))}
              {hasMore && !showAllValidations && (
                <TouchableOpacity style={styles.moreBtn} onPress={() => setShowAllValidations(true)}>
                  <Text style={styles.moreText}>查看全部 {validations.length} 条验证</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.secondary} />
                </TouchableOpacity>
              )}
              {showAllValidations && (
                <TouchableOpacity style={styles.moreBtn} onPress={() => setShowAllValidations(false)}>
                  <Text style={styles.moreText}>收起</Text>
                  <Ionicons name="chevron-up" size={16} color={colors.secondary} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {showActionBar && (
        <TouchableOpacity style={styles.actionBar} onPress={handleAction} activeOpacity={0.85}>
          <Ionicons
            name={isPoster ? 'create-outline' : 'chatbubble-ellipses-outline'}
            size={18}
            color={colors.white}
          />
          <Text style={styles.actionBarText}>{isPoster ? '修改内容' : '我来反馈'}</Text>
        </TouchableOpacity>
      )}

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
    height: SCREEN_WIDTH * 3 / 4,
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
    paddingBottom: spacing.lg,
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
  sectionTitle: { ...typography.h3, color: colors.secondary, marginBottom: spacing.sm },
  rulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
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
  facilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.sm,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '48%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: spacing.radiusSm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  facilityItemKnown: { borderColor: colors.secondary },
  facilityLabel: { ...typography.body, color: colors.textLight, fontSize: 13 },
  facilityLabelKnown: { color: colors.secondary },
  facilityPct: { marginLeft: 'auto', fontSize: 12, color: colors.textLight },
  facilityPctKnown: { color: colors.secondary },
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
  actionBar: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: spacing.radiusPill,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  actionBarText: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 15,
  },
});
