import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, TextInput, Pressable, InteractionManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { HOT_BREEDS, BREED_GROUPS, ALL_BREEDS, getBreedAbbreviation } from '../data/breedData';

export default function BreedPickerModal({ visible, breed, onConfirm, onCancel }) {
  const [search, setSearch] = useState('');
  const [pendingBreed, setPendingBreed] = useState(breed || '');
  const [activeTab, setActiveTab] = useState(0);

  const hasSearch = search.trim().length > 0;

  const filteredBreeds = useMemo(() => {
    if (!hasSearch) return ALL_BREEDS;
    const q = search.trim().toLowerCase();
    return ALL_BREEDS.filter(b => b.toLowerCase().includes(q));
  }, [search, hasSearch]);

  const tabBreeds = useMemo(() => {
    if (hasSearch) return filteredBreeds;
    const breeds = [...BREED_GROUPS[activeTab].breeds];
    breeds.sort((a, b) => {
      const i = HOT_BREEDS.indexOf(a);
      const j = HOT_BREEDS.indexOf(b);
      if (i !== -1 && j !== -1) return i - j;
      if (i !== -1) return -1;
      if (j !== -1) return 1;
      return a.localeCompare(b, 'zh-CN');
    });
    return breeds;
  }, [activeTab, hasSearch, filteredBreeds]);

  const longestName = useMemo(() => {
    let max = '';
    for (const b of ALL_BREEDS) {
      if (b.length > max.length) max = b;
    }
    return max;
  }, []);

  const [nameMaxWidth, setNameMaxWidth] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    if (!pendingBreed || hasSearch) return;
    const idx = tabBreeds.indexOf(pendingBreed);
    if (idx !== -1) {
      InteractionManager.runAfterInteractions(() => {
        listRef.current?.scrollToIndex({
          index: idx,
          viewPosition: 0.1,
          animated: true,
        });
      });
    }
  }, [pendingBreed, tabBreeds, hasSearch]);

  const getGroupIndex = (b) => {
    for (let i = 0; i < BREED_GROUPS.length; i++) {
      if (BREED_GROUPS[i].breeds.includes(b)) return i;
    }
    return -1;
  };

  const handleConfirm = () => {
    onConfirm(pendingBreed);
  };

  const breedList = (
    <FlatList
      ref={listRef}
      style={{ flex: 1 }}
      data={tabBreeds}
      keyExtractor={b => b}
      contentContainerStyle={styles.listContent}
      onScrollToIndexFailed={() => {}}
      renderItem={({ item: b }) => (
        <TouchableOpacity
          style={[styles.breedItem, pendingBreed === b && styles.breedItemActive]}
          activeOpacity={0.7}
          onPress={() => setPendingBreed(b)}
        >
          <View style={styles.breedLeft}>
            <Text style={[styles.breedText, pendingBreed === b && styles.breedTextActive, nameMaxWidth > 0 && { minWidth: nameMaxWidth }]}>
              {b}
            </Text>
            <Text style={styles.breedAbbr}>{getBreedAbbreviation(b)}</Text>
          </View>
          <View style={[styles.confirmWrap, { opacity: pendingBreed === b ? 1 : 0 }]} pointerEvents={pendingBreed === b ? 'auto' : 'none'}>
            <TouchableOpacity
              style={styles.confirmChip}
              activeOpacity={0.7}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmChipText}>确定</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    />
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestCancel={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>选择品种</Text>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.textMain} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={colors.textLight} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="搜索品种"
              placeholderTextColor={colors.textLight}
              returnKeyType="search"
              blurOnSubmit
            />
            {hasSearch && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>

          {hasSearch ? null : (
            <>
              <View style={styles.hotSection}>
                <Text style={styles.sectionLabel}>热门品种</Text>
                <View style={styles.hotRow}>
                  {HOT_BREEDS.map(b => (
                    <TouchableOpacity
                      key={b}
                      style={[styles.hotChip, pendingBreed === b && styles.hotChipActive]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setPendingBreed(b);
                        const idx = getGroupIndex(b);
                        if (idx !== -1) setActiveTab(idx);
                      }}
                    >
                      <Text style={[styles.hotChipText, pendingBreed === b && styles.hotChipTextActive]}>
                        {getBreedAbbreviation(b)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.tabRow}>
                {BREED_GROUPS.map((g, i) => (
                  <TouchableOpacity
                    key={g.label}
                    style={[styles.tab, activeTab === i && styles.tabActive]}
                    activeOpacity={0.7}
                    onPress={() => setActiveTab(i)}
                  >
                    <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
                      {g.label}
                    </Text>
                    <View style={[styles.tabBadge, activeTab === i && styles.tabBadgeActive]}>
                      <Text style={[styles.tabBadgeText, activeTab === i && styles.tabBadgeTextActive]}>
                        {g.breeds.length}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

            <Text
            style={[styles.breedText, { position: 'absolute', left: 0, top: 0, opacity: 0 }]}
            onLayout={e => setNameMaxWidth(e.nativeEvent.layout.width)}
          >
            {longestName}
          </Text>
          {breedList}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: spacing.radiusLg,
    borderTopRightRadius: spacing.radiusLg,
    maxHeight: '90%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, color: colors.textMain },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: 0,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textMain,
    padding: 0,
  },

  hotSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.captionBold,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  hotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hotChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  hotChipActive: {
    backgroundColor: 'rgba(185, 207, 50, 0.1)',
    borderColor: colors.primary,
  },
  hotChipText: {
    ...typography.caption,
    color: colors.textLight,
  },
  hotChipTextActive: {
    color: colors.secondary,
    fontWeight: '700',
  },

  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.white,
  },
  tabActive: {
    backgroundColor: colors.secondary,
  },
  tabText: {
    ...typography.captionBold,
    color: colors.textLight,
  },
  tabTextActive: {
    color: colors.white,
  },
  tabBadge: {
    backgroundColor: colors.chipDefault,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textLight,
  },
  tabBadgeTextActive: {
    color: colors.white,
  },

  listContent: {
    padding: spacing.md,
    paddingBottom: 0,
  },
  breedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  breedItemActive: {
    backgroundColor: 'rgba(185, 207, 50, 0.1)',
    borderColor: colors.primary,
  },
  breedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  breedText: { ...typography.body, color: colors.textMain },
  breedTextActive: { color: colors.secondary, fontWeight: '700' },
  breedAbbr: {
    ...typography.caption,
    color: colors.textLight,
  },
  confirmChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.secondary,
    marginLeft: spacing.sm,
  },
  confirmChipText: {
    ...typography.captionBold,
    color: colors.white,
  },
});
