import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { StatusBadge } from '../../components';
import { useExplore } from '../../contexts/ExploreContext';
import {
  CATEGORIES,
  SCENE_FILTERS,
  LOCATION_STATUS,
  CITY_OPTIONS,
  getContributionLabel,
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
          <Ionicons name="image-outline" size={48} color={colors.secondary} style={{ opacity: 0.3 }} />
        </View>
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={(e) => { e.stopPropagation(); toggleFavorite(loc.id); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name={isFav ? 'bookmark' : 'bookmark-outline'} size={24} color={colors.secondary} />
        </TouchableOpacity>

        <View style={styles.locInfo}>
          <Text style={styles.locName}>{loc.name}</Text>
          <Text style={styles.locType}>
            {loc.categoryLabel} · {loc.district} · {loc.distanceKm}km
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 6, gap: 8 }}>
            <StatusBadge status={loc.status} />
          </View>

          <Text style={styles.locVerified}>
            {getContributionLabel(loc.verifierCount)} · {loc.lastUpdatedLabel}
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
        <Ionicons name="location" size={20} color={colors.secondary} />
        <Text style={styles.fabLabel}>新增地点</Text>
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
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 26,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    borderBottomWidth: 3,
    borderBottomColor: colors.secondary,
  },
  fabLabel: {
    ...typography.bodyBold,
    color: colors.secondary,
    fontSize: 15,
  },
  categories: {
    flexDirection: 'row', gap: 16,
    paddingHorizontal: spacing.screenMargin, marginBottom: spacing.cardGap,
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
    padding: spacing.md, marginBottom: spacing.cardGap, position: 'relative',
  },
  locImage: {
    height: 160, borderRadius: spacing.radiusSm,
    backgroundColor: '#D3E0C8', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  locInfo: { gap: 0 },
  locName: { ...typography.h3, color: colors.secondary, marginBottom: 4 },
  locType: { ...typography.caption, color: colors.textLight, marginBottom: 4 },
  locVerified: { ...typography.caption, color: colors.textLight, marginBottom: 8 },
  locTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  miniChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  miniChipText: { ...typography.captionBold, color: colors.textMain },
  bookmarkBtn: {
    position: 'absolute', top: spacing.md + 8, right: spacing.md + 8,
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
