import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';
import { useExplore } from '../../contexts/ExploreContext';

export default function SearchLocationScreen({ route, navigation }) {
  const { locations } = useExplore();
  const { query: initialQuery, city: initialCity, mode } = route.params || {};
  const isAddMode = mode === 'add';

  const [searchText, setSearchText] = useState(initialQuery || '');
  const [searchCity, setSearchCity] = useState(initialCity || null);
  const [searched, setSearched] = useState(!!initialQuery);

  const results = useMemo(() => {
    const q = searched ? searchText.toLowerCase() : '';
    if (!q) return [];
    let filtered = locations.filter(loc =>
      loc.name.toLowerCase().includes(q) || loc.city?.toLowerCase().includes(q)
    );
    if (searchCity) {
      filtered = filtered.filter(loc => loc.city === searchCity);
    }
    return filtered;
  }, [locations, searchText, searchCity, searched]);

  const doSearch = () => {
    if (!searchText.trim()) return;
    setSearched(true);
  };

  const addNewLocation = () => {
    navigation.navigate('AddLocation', {
      selectedName: searchText,
      selectedCity: searchCity || null,
    });
  };

  const selectLocation = (loc) => {
    if (isAddMode) {
      navigation.replace('UpdateInfo', { id: loc.id });
    } else {
      navigation.replace('LocationDetail', { id: loc.id });
    }
  };

  return (
    <View style={styles.screen}>
      <NavBar title={isAddMode ? '新增地点' : '搜索结果'} onBack={() => navigation.goBack()} />

      <View style={styles.searchBarWrap}>
        <View style={styles.searchBar}>
          <View style={styles.searchInputWrap}>
            <TextInput
              style={styles.searchInput}
              placeholder="搜店铺/地点名称"
              placeholderTextColor={colors.textLight}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              onSubmitEditing={doSearch}
            />
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={doSearch} activeOpacity={0.7}>
            <Ionicons name="search" size={18} color={colors.white} />
            <Text style={styles.searchBtnText}>搜索</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {searched && (
          <TouchableOpacity style={styles.addNewCard} onPress={addNewLocation} activeOpacity={0.7}>
            <View style={styles.addNewIconBox}>
              <Ionicons name="add-circle" size={28} color={colors.accent} />
            </View>
            <View style={styles.addNewInfo}>
              <Text style={styles.addNewName}>新增地点：{searchText}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        )}

        {results.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>已有收录</Text>
            {results.map(loc => (
              <TouchableOpacity
                key={loc.id}
                style={styles.resultItem}
                onPress={() => selectLocation(loc)}
                activeOpacity={0.7}
              >
                <View style={styles.resultIconBox}>
                  <Ionicons name="checkmark-circle" size={22} color={colors.secondary} />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{loc.name}</Text>
                  <Text style={styles.resultMeta}>{loc.categoryLabel} · {loc.city}</Text>
                </View>
                <View style={styles.resultBadge}>
                  <Text style={styles.resultBadgeText}>已收录</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : searched ? (
          <Text style={styles.emptyText}>未找到已收录的地点，请点击上方新增</Text>
        ) : (
          <Text style={styles.emptyText}>输入地点名称搜索，或从已收录的地点中选择</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.lg },

  searchBarWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchInputWrap: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusPill,
    paddingHorizontal: 12,
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    ...typography.body,
    color: colors.textMain,
    fontSize: 14,
    lineHeight: undefined,
    height: 38,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.accent,
  },
  searchBtnText: { ...typography.captionBold, color: colors.white, fontSize: 13 },

  addNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  addNewIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(146, 102, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewInfo: { flex: 1 },
  addNewName: { ...typography.bodyBold, color: colors.accent, fontSize: 15 },
  addNewMeta: { ...typography.caption, color: colors.textLight, marginTop: 2 },

  sectionLabel: {
    ...typography.captionBold,
    color: colors.secondary,
    marginBottom: 10,
    fontSize: 13,
  },

  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: { flex: 1 },
  resultName: { ...typography.bodyBold, color: colors.textMain },
  resultMeta: { ...typography.caption, color: colors.textLight, marginTop: 2 },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.primary,
  },
  resultBadgeText: {
    ...typography.captionBold,
    color: colors.secondary,
    fontSize: 12,
  },

  emptyText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 40,
  },
});
