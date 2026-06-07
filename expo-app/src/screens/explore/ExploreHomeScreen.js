import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Card, Chip } from '../../components';

const CATEGORIES = [
  { icon: 'paw', label: '全部', active: true },
  { icon: 'tree', label: '公园' },
  { icon: 'cafe', label: '咖啡' },
  { icon: 'restaurant', label: '餐厅' },
];

const FILTERS = ['已验证', '室内可进', '室外友好', '大型犬友好'];

const LOCATIONS = [
  { id: '1', name: 'BLOOM Coffee', type: '咖啡店 · 徐汇区 · 1.8km', status: '已验证可带狗', verified: '2 天前有用户去过', tags: ['仅户外', '小型犬友好', '有水碗'] },
  { id: '2', name: '复兴公园', type: '公园 · 黄浦区 · 3.2km', status: '大型犬友好', verified: '今天有用户去过', tags: ['室外可进', '需要牵绳'] },
];

export default function ExploreHomeScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <NavBar
        title="去玩"
        rightIcon="time-outline"
        rightAction={() => {}}
        bgColor={colors.bg}
      />

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
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.categories}>
          {CATEGORIES.map((cat, i) => (
            <TouchableOpacity key={i} style={styles.catItem}>
              <View style={[styles.catIconBox, cat.active && styles.catIconBoxActive]}>
                <Ionicons name={cat.icon} size={28} color={colors.secondary} />
              </View>
              <Text style={[styles.catLabel, cat.active && styles.catLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f, i) => (
            <Chip key={i} active={i === 0}>{f}</Chip>
          ))}
        </ScrollView>

        <View style={styles.list}>
          {LOCATIONS.map(loc => (
            <TouchableOpacity
              key={loc.id}
              style={styles.locCard}
              onPress={() => navigation.navigate('LocationDetail', { id: loc.id })}
            >
              <View style={styles.locImage}>
                <Ionicons name="image-outline" size={48} color={colors.secondary} style={{ opacity: 0.3 }} />
              </View>
              <View style={styles.locInfo}>
                <Text style={styles.locName}>{loc.name}</Text>
                <Text style={styles.locType}>{loc.type}</Text>
                <Chip variant="verified" style={{ marginBottom: 8 }}>{loc.status}</Chip>
                <Text style={styles.locVerified}>{loc.verified}</Text>
                <View style={styles.locTags}>
                  {loc.tags.map((t, i) => <Chip key={i}>{t}</Chip>)}
                </View>
              </View>
              <TouchableOpacity style={styles.bookmarkBtn}>
                <Ionicons name="bookmark-outline" size={24} color={colors.secondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 24 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: spacing.screenMargin,
  },
  citySelector: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cityText: { ...typography.bodyBold, fontSize: 16, color: colors.secondary, fontWeight: '800' },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, borderRadius: spacing.radiusPill,
    paddingVertical: 10, paddingHorizontal: 16,
  },
  searchPlaceholder: { ...typography.body, color: colors.textLight, fontSize: 14 },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  categories: {
    flexDirection: 'row', justifyContent: 'space-between',
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
    marginBottom: 8,
  },
  locInfo: { gap: 0 },
  locName: { ...typography.h3, color: colors.secondary, marginBottom: 8 },
  locType: { ...typography.caption, color: colors.textLight, marginBottom: 8 },
  locVerified: { ...typography.caption, color: colors.textLight, marginBottom: 8 },
  locTags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  bookmarkBtn: {
    position: 'absolute', top: 176, right: 16,
  },
});
