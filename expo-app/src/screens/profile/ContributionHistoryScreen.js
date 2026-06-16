import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';
import { useExplore } from '../../contexts/ExploreContext';
import { getCategoryIcon } from '../../data/profileData';

function LocationThumbnail({ location }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = location?.thumbnailUrl && !imageFailed;

  return (
    <View style={styles.thumbnail}>
      {showImage ? (
        <Image
          source={{ uri: location.thumbnailUrl }}
          style={styles.thumbnailImage}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Ionicons name={getCategoryIcon(location?.category)} size={22} color={colors.secondary} />
      )}
    </View>
  );
}

function getContributionSummary(types) {
  const unique = Array.from(new Set(types));
  if (unique.includes('新增地点')) return '你新增了这个地点';
  if (unique.includes('更新信息')) return '你验证过这个地点';
  return '你补充过信息';
}

export default function ContributionHistoryScreen({ navigation }) {
  const { contributions, getLocation, getValidations } = useExplore();

  const sharedLocations = useMemo(() => {
    const grouped = new Map();

    contributions.forEach(item => {
      const location = getLocation(item.locationId);
      if (!location) return;

      const current = grouped.get(item.locationId) || {
        location,
        types: [],
        latestTime: item.time,
      };

      current.types.push(item.type);
      if (item.time > current.latestTime) current.latestTime = item.time;
      grouped.set(item.locationId, current);
    });

    return Array.from(grouped.values())
      .map(entry => {
        const validations = getValidations(entry.location.id);
        const helpfulCount = validations.reduce((sum, validation) => sum + (validation.helpfulCount || 0), 0);
        return {
          ...entry,
          helpfulCount,
          tags: (entry.location.tags || []).slice(0, 3),
        };
      })
      .sort((a, b) => b.latestTime.localeCompare(a.latestTime));
  }, [contributions, getLocation, getValidations]);

  return (
    <View style={styles.screen}>
      <NavBar title="我分享过" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        {sharedLocations.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Ionicons name="clipboard-outline" size={32} color={colors.textLight} />
            <Text style={styles.emptyTitle}>还没有分享记录</Text>
            <Text style={styles.emptyText}>去探索宠物友好地点，分享你的体验吧！</Text>
          </View>
        ) : (
          sharedLocations.map(item => (
            <TouchableOpacity
              key={item.location.id}
              style={styles.shareCard}
              activeOpacity={0.78}
              onPress={() => navigation.navigate('LocationDetail', { id: item.location.id })}
            >
              <View style={styles.cardTop}>
                <LocationThumbnail location={item.location} />
                <View style={styles.titleBlock}>
                  <Text style={styles.locationName} numberOfLines={1}>{item.location.name}</Text>
                  <Text style={styles.locationMeta} numberOfLines={1}>
                    {item.location.categoryLabel} · {item.location.city}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.supplementLink}
                  activeOpacity={0.75}
                  onPress={(event) => {
                    event.stopPropagation();
                    navigation.navigate('UpdateInfo', { id: item.location.id });
                  }}
                >
                  <Text style={styles.supplementText}>补充</Text>
                  <Ionicons name="add-circle-outline" size={16} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.summaryText}>{getContributionSummary(item.types)}</Text>

              <View style={styles.tagRow}>
                {item.tags.map(tag => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.helpfulText}>{item.helpfulCount} 人觉得有用</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 48 },
  shareCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: spacing.cardGap,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(185, 207, 50, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  titleBlock: { flex: 1, minWidth: 0 },
  locationName: { ...typography.h3, color: colors.secondary, marginBottom: 4 },
  locationMeta: { ...typography.caption, color: colors.textLight },
  supplementLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    minHeight: 32,
    borderRadius: spacing.radiusPill,
    backgroundColor: 'rgba(185, 207, 50, 0.18)',
  },
  supplementText: { ...typography.captionBold, color: colors.secondary },
  summaryText: { ...typography.bodyBold, color: colors.textMain },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  tagText: { ...typography.captionBold, color: colors.textMain },
  helpfulText: { ...typography.captionBold, color: colors.secondary },
  emptyBlock: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: 8,
  },
  emptyTitle: { ...typography.bodyBold, color: colors.textMain },
  emptyText: { ...typography.caption, color: colors.textLight, textAlign: 'center' },
});
