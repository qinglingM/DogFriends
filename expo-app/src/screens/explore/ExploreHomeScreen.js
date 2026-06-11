import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useExplore } from '../../contexts/ExploreContext';
import {
  CATEGORIES,
  SCENE_FILTERS,
  LOCATION_STATUS,
  CITY_OPTIONS,
} from '../../data/exploreData';

function matchFilter(key, loc) {
  switch (key) {
    case 'multi_verified':
      return loc.status === LOCATION_STATUS.MULTI_VERIFIED;
    case 'indoor':
      return loc.entryArea === 'indoor';
    case 'outdoor':
      return ['outdoor', 'terrace_only'].includes(loc.entryArea);
    case 'large_dog':
      return loc.dogSize?.includes('large') || loc.dogSize?.includes('all');
    default:
      return true;
  }
}

export default function ExploreHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { locations, favorites, toggleFavorite } = useExplore();
  const [selectedCity, setSelectedCity] = useState('上海');
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [category, setCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState(null);

  const filtered = useMemo(() => {
    return locations.filter(loc => {
      if (loc.city !== selectedCity) return false;
      if (category !== 'all' && loc.category !== category) return false;
      if (selectedFilter && !matchFilter(selectedFilter, loc)) return false;
      return true;
    });
  }, [locations, selectedCity, category, selectedFilter]);

  const renderCard = (loc) => {
    const isFav = !!favorites[loc.id];
    return (
      <TouchableOpacity
        key={loc.id}
        style={styles.locCard}
        onPress={() => navigation.navigate('LocationDetail', { id: loc.id })}
        activeOpacity={0.85}
      >
        <View style={styles.locImage}>
          {loc.photos && loc.photos.length > 0 ? (
            <Image source={{ uri: loc.photos[0] }} style={styles.locImageInner} />
          ) : loc.thumbnailUrl ? (
            <Image source={{ uri: loc.thumbnailUrl }} style={styles.locImageInner} />
          ) : (
            <Ionicons name="image-outline" size={48} color={colors.secondary} style={{ opacity: 0.3 }} />
          )}
        </View>
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={(e) => { e.stopPropagation(); toggleFavorite(loc.id); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name={isFav ? 'bookmark' : 'bookmark-outline'} size={24} color={colors.secondary} />
        </TouchableOpacity>

        <View style={styles.locInfo}>
          <View style={styles.locNameRow}>
            <Text style={styles.locName}>{loc.name}</Text>
            <View style={styles.locVisited}>
              <Ionicons name="paw" size={12} color={colors.textLight} />
              <Text style={styles.locVisitedText}>{loc.lastUpdatedLabel}</Text>
            </View>
          </View>
          <Text style={styles.locType}>
            {loc.categoryLabel} · {loc.district} · {loc.distanceKm}km
          </Text>

          <View style={styles.locTags}>
            {(loc.tags || []).slice(0, 3).map((t, i) => (
              <View key={i} style={styles.miniChip}>
                <Text style={styles.miniChipText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.searchRow}>
        <View style={styles.citySelectorWrap}>
          <TouchableOpacity
            style={styles.citySelector}
            onPress={() => setCityPickerOpen(!cityPickerOpen)}
          >
            <Text style={styles.cityText}>{selectedCity}</Text>
            <Ionicons name={cityPickerOpen ? "chevron-up" : "chevron-down"} size={12} color={colors.secondary} />
          </TouchableOpacity>
          {cityPickerOpen && (
            <View style={styles.cityPickerDropdown}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {CITY_OPTIONS.map(city => {
                  const active = city.name === selectedCity;
                  return (
                    <TouchableOpacity
                      key={city.name}
                      style={[styles.cityPickerRow, active && styles.cityPickerRowActive]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedCity(city.name);
                        setCityPickerOpen(false);
                      }}
                    >
                      <Text style={[styles.cityPickerText, active && styles.cityPickerTextActive]}>
                        {city.name}
                      </Text>
                      {active && <Ionicons name="checkmark" size={18} color={colors.secondary} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <Text style={styles.searchPlaceholder}>搜索地点或咖啡店...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.filter(c => c.key !== 'other').map((cat) => {
            const active = cat.key === category;
            return (
              <TouchableOpacity
                key={cat.key}
                style={styles.catItem}
                onPress={() => setCategory(cat.key)}
              >
                <View style={[styles.catIconBox, active && styles.catIconBoxActive]}>
                  <Ionicons name={cat.icon} size={26} color={colors.secondary} />
                </View>
                <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sceneFilters}
        >
          {SCENE_FILTERS.map(f => {
            const active = f.key === selectedFilter;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.sceneChip, active && styles.sceneChipActive]}
                activeOpacity={0.7}
                onPress={() => setSelectedFilter(active ? null : f.key)}
              >
                <Text style={[styles.sceneChipText, active && styles.sceneChipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="paw-outline" size={48} color={colors.secondary} style={{ opacity: 0.4 }} />
              <Text style={styles.emptyTitle}>这个分类下还没有地点</Text>
              <Text style={styles.emptyText}>成为第一个发现者吧</Text>
            </View>
          ) : (
            filtered.map(renderCard)
          )}
        </View>

      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AddLocation')}
      >
        <Ionicons name="map-pin" size={24} color={colors.secondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 96 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: spacing.screenMargin,
    paddingBottom: 4,
    position: 'relative',
    zIndex: 1000,
  },
  citySelectorWrap: { position: 'relative', zIndex: 10 },
  citySelector: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cityText: { ...typography.bodyBold, fontSize: 16, color: colors.secondary, fontWeight: '800' },
  cityPickerDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 140,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingVertical: 4,
    zIndex: 100,
  },
  cityPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cityPickerRowActive: {
    backgroundColor: 'rgba(185, 207, 50, 0.15)',
  },
  cityPickerText: { ...typography.body, color: colors.textMain, fontSize: 15 },
  cityPickerTextActive: { color: colors.secondary, fontWeight: '700' },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, borderRadius: spacing.radiusPill,
    paddingVertical: 10, paddingHorizontal: 16,
  },
  searchPlaceholder: { ...typography.body, color: colors.textLight, fontSize: 14 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    borderBottomWidth: 3,
    borderBottomColor: colors.secondary,
  },
  categories: {
    flexDirection: 'row', gap: 16,
    paddingHorizontal: spacing.screenMargin, marginBottom: spacing.cardGap, marginTop: spacing.md,
  },
  catItem: { alignItems: 'center', gap: 8 },
  catIconBox: {
    width: 56, height: 56, borderRadius: spacing.radiusMd,
    borderWidth: 2, borderColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  catIconBoxActive: { backgroundColor: colors.primary },
  catLabel: { ...typography.caption, color: colors.textLight },
  catLabelActive: { color: colors.secondary, fontWeight: '800' },
  sceneFilters: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: spacing.screenMargin, marginBottom: spacing.cardGap,
  },
  sceneChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sceneChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sceneChipText: { ...typography.captionBold, color: colors.textMain, fontSize: 13 },
  sceneChipTextActive: { color: colors.secondary },
  list: { paddingHorizontal: spacing.screenMargin },
  locCard: {
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    marginBottom: spacing.cardGap, position: 'relative', overflow: 'hidden',
  },
  locImage: {
    height: 160,
    backgroundColor: '#D3E0C8', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, overflow: 'hidden',
  },
  locImageInner: {
    width: '100%',
    height: '100%',
  },
  locInfo: { gap: 0, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  locNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  locName: { ...typography.h3, color: colors.secondary, flex: 1, marginRight: 8 },
  locVisited: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locVisitedText: { ...typography.caption, color: colors.textLight },
  locType: { ...typography.caption, color: colors.textLight, marginBottom: 8 },
  locTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  miniChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  miniChipText: { ...typography.captionBold, color: colors.textMain },
  bookmarkBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.secondary,
    marginTop: 12,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: 4,
  },
});
