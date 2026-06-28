import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Image, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useExplore } from '../../contexts/ExploreContext';
import { useProfile } from '../../contexts/ProfileContext';
import CityPickerModal from '../../components/CityPickerModal';
import {
  CATEGORIES,
  LOCATION_STATUS,
  CITY_OPTIONS,
  ENTRY_AREAS,
  FACILITIES,
} from '../../data/exploreData';
import { imageUrl } from '../../utils/imageUrl';

const EXPLORE_CATEGORIES = CATEGORIES.filter(c => c.key !== 'all' && c.key !== 'other');

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
  const { locations, 加载完成, refresh, favorites, toggleFavorite } = useExplore();
  const { profile } = useProfile();
  const initialCity = profile?.city && profile.city !== '不展示' ? profile.city : null;
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const addresses = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (addresses.length > 0 && addresses[0].region) {
        const city = addresses[0].region.replace(/[省市区县]$/, '');
        setSelectedCity(city);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    return locations.filter(loc => {
      if (selectedCity && loc.city !== selectedCity) return false;
      if (category && loc.category !== category) return false;
      if (q && !loc.name.toLowerCase().includes(q) && !loc.city?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [locations, selectedCity, category, searchText]);

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
            <Image source={{ uri: imageUrl(loc.photos[0]) }} style={styles.locImageInner} />
          ) : loc.thumbnailUrl ? (
            <Image source={{ uri: imageUrl(loc.thumbnailUrl) }} style={styles.locImageInner} />
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
            {loc.city} · {loc.categoryLabel}
          </Text>

          <View style={styles.locTags}>
            <View style={styles.ruleChip}>
              <Ionicons name="paw" size={12} color={colors.textLight} />
              <Text style={styles.ruleChipText}>
                {ENTRY_AREAS.find(e => e.key === loc.entryArea)?.label || '部分可进'}
              </Text>
            </View>
            {(loc.facilities || []).slice(0, 3).map((f, i) => {
              const isInDb = FACILITIES.includes(f);
              return (
                <View key={i} style={[styles.facilityChip, isInDb && styles.facilityChipKnown]}>
                  <Ionicons
                    name="checkbox"
                    size={14}
                    color={isInDb ? colors.secondary : colors.textLight}
                  />
                  <Text style={[styles.facilityChipText, isInDb && styles.facilityChipTextKnown]}>{f}</Text>
                </View>
              );
            })}
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
            onPress={() => setCityPickerOpen(true)}
          >
            <Text style={styles.cityText}>{selectedCity || '全部'}</Text>
            <Ionicons name="chevron-down" size={12} color={colors.secondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索地点或咖啡..."
            placeholderTextColor={colors.textLight}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={!加载完成} onRefresh={refresh} />}>
        <View style={styles.categories}>
          <View style={styles.catRow}>
            {EXPLORE_CATEGORIES.map((cat) => {
              const active = cat.key === category;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={styles.catItem}
                  onPress={() => setCategory(prev => prev === cat.key ? null : cat.key)}
                >
                  <View style={[styles.catIconBox, active && styles.catIconBoxActive]}>
                    <Ionicons name={cat.icon} size={18} color={colors.secondary} />
                  </View>
                  <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="paw-outline" size={48} color={colors.secondary} style={{ opacity: 0.4 }} />
              {searchText.trim() ? (
                <>
                  <Text style={styles.emptyTitle}>没找到「{searchText.trim()}」</Text>
                  <Text style={styles.emptyText}>换一个关键词试试，或新增这个地点</Text>
                  <TouchableOpacity
                    style={styles.emptyAddBtn}
                    onPress={() => navigation.navigate('SearchLocation', { mode: 'add', city: selectedCity })}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={colors.secondary} />
                    <Text style={styles.emptyAddText}>新增地点</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.emptyTitle}>
                    {locations.length === 0 ? '还没有收录的地点' : '这个分类下还没有地点'}
                  </Text>
                  <Text style={styles.emptyText}>成为第一个发现者吧</Text>
                </>
              )}
            </View>
          ) : (
            filtered.map(renderCard)
          )}
        </View>

      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('SearchLocation', { mode: 'add' })}
      >
        <Ionicons name="pencil" size={24} color={colors.secondary} />
      </TouchableOpacity>

      <CityPickerModal
        visible={cityPickerOpen}
        mode="explore"
        province={null}
        city={selectedCity}
        onConfirm={({ city }) => {
          setSelectedCity(city || null);
          setCityPickerOpen(false);
        }}
        onCancel={() => setCityPickerOpen(false)}
      />
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
    paddingVertical: 4, paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.secondary,
    fontSize: 14,
    lineHeight: undefined,
    height: 30,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
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
  },
  categories: {
    paddingHorizontal: spacing.screenMargin, marginBottom: spacing.cardGap, marginTop: spacing.md,
    gap: 12,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  catItem: { alignItems: 'center', gap: 4, width: '15%' },
  catIconBox: {
    width: 38, height: 38, borderRadius: spacing.radiusSm,
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
  locTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  ruleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  ruleChipText: { ...typography.caption, color: colors.textLight, fontSize: 11 },
  facilityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 4, paddingHorizontal: 8,
    borderRadius: spacing.radiusSm,
    backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border,
  },
  facilityChipKnown: { borderColor: colors.secondary },
  facilityChipText: { ...typography.caption, color: colors.textLight, fontSize: 11 },
  facilityChipTextKnown: { color: colors.secondary },
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
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.primary,
  },
  emptyAddText: {
    ...typography.bodyBold,
    color: colors.secondary,
    fontSize: 15,
  },
});
