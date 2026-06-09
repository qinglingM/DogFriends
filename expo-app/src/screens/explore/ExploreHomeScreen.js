import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Chip, StatusBadge } from '../../components';
import { useExplore } from '../../contexts/ExploreContext';
import {
  CATEGORIES,
  SCENE_FILTERS,
  LOCATION_STATUS,
  getContributionLabel,
} from '../../data/exploreData';

export default function ExploreHomeScreen({ navigation }) {
  const { locations, favorites, toggleFavorite } = useExplore();
  const [category, setCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState(null);

  const filtered = useMemo(() => {
    return locations.filter(loc => {
      if (category !== 'all' && loc.category !== category) return false;
      if (activeFilter === 'multi_verified' && loc.status !== LOCATION_STATUS.MULTI_VERIFIED) return false;
      if (activeFilter === 'indoor' && loc.entryArea !== 'indoor') return false;
      if (activeFilter === 'outdoor' && !['outdoor', 'terrace_only'].includes(loc.entryArea)) return false;
      if (activeFilter === 'large_dog' && !(loc.dogSize?.includes('large') || loc.dogSize?.includes('all'))) return false;
      return true;
    });
  }, [locations, category, activeFilter]);

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
    <View style={styles.screen}>
      <NavBar title="去玩" bgColor={colors.bg} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.searchRow}>
          <TouchableOpacity style={styles.citySelector}>
            <Text style={styles.cityText}>上海</Text>
            <Ionicons name="chevron-down" size={12} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.textLight} />
            <Text style={styles.searchPlaceholder}>搜索地点或咖啡店...</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addIconBtn}
            onPress={() => navigation.navigate('AddLocation')}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="add" size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.heroSub}>带上狗，一起探索城市</Text>

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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {SCENE_FILTERS.map((f) => (
            <Chip
              key={f.key}
              active={activeFilter === f.key}
              onPress={() => setActiveFilter(activeFilter === f.key ? null : f.key)}
            >
              {f.label}
            </Chip>
          ))}
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
  citySelector: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cityText: { ...typography.bodyBold, fontSize: 16, color: colors.secondary, fontWeight: '800' },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, borderRadius: spacing.radiusPill,
    paddingVertical: 10, paddingHorizontal: 16,
  },
  searchPlaceholder: { ...typography.body, color: colors.textLight, fontSize: 14 },
  addIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: colors.secondary,
  },
  heroSub: {
    ...typography.body,
    color: colors.textLight,
    paddingHorizontal: spacing.screenMargin,
    marginBottom: spacing.md,
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
  filterRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: spacing.screenMargin, marginBottom: spacing.cardGap,
  },
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
