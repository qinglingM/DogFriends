import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, StatusBadge } from '../../components';
import { useExplore } from '../../contexts/ExploreContext';

const TABS = [
  { key: 'created', label: '我新增的' },
  { key: 'verified', label: '我验证的' },
  { key: 'reported', label: '被反馈的' },
];

export default function MyContributionsScreen({ navigation }) {
  const { contributions, inaccuracyReports, validations } = useExplore();
  const [tab, setTab] = useState('created');

  const filtered = useMemo(() => {
    if (tab === 'reported') {
      // 找到 contributions 中：自己提交过的验证，被别人标“信息不准”的
      const reportedIds = new Set(Object.keys(inaccuracyReports));
      return contributions.filter(c => {
        // 简化：演示用 - 任何我验证过且被标记的
        const list = validations[c.locationId] || [];
        return list.some(v => reportedIds.has(v.id) && c.bucket === 'verified');
      });
    }
    return contributions.filter(c => c.bucket === tab);
  }, [tab, contributions, inaccuracyReports, validations]);

  return (
    <View style={styles.screen}>
      <NavBar title="提交记录" onBack={() => navigation.goBack()} />

      <View style={styles.tabBar}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="paw-outline" size={48} color={colors.secondary} style={{ opacity: 0.4 }} />
            <Text style={styles.emptyTitle}>这里还没有内容</Text>
            <Text style={styles.emptyText}>
              {tab === 'created' && '你还没有新增过地点'}
              {tab === 'verified' && '你还没有验证过任何地点'}
              {tab === 'reported' && '暂无被反馈的内容'}
            </Text>
          </View>
        ) : (
          filtered.map(c => (
            <TouchableOpacity
              key={c.id}
              style={styles.card}
              onPress={() => navigation.navigate('LocationDetail', { id: c.locationId })}
            >
              <View style={styles.cardThumb}>
                <Ionicons name="image-outline" size={28} color={colors.secondary} style={{ opacity: 0.4 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>{c.locationName}</Text>
                <Text style={styles.cardMeta}>{c.locationLabel}</Text>
                <Text style={styles.cardMeta}>{c.type} · {c.time}</Text>
                <View style={{ marginTop: 8 }}>
                  <StatusBadge status={c.status} />
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: colors.secondary },
  tabText: { ...typography.body, color: colors.textLight },
  tabTextActive: { color: colors.secondary, fontWeight: '800' },
  content: { padding: spacing.md, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: 12,
    marginBottom: 12,
  },
  cardThumb: {
    width: 64, height: 64,
    backgroundColor: '#D3E0C8',
    borderRadius: spacing.radiusSm,
    alignItems: 'center', justifyContent: 'center',
  },
  cardName: { ...typography.bodyBold, color: colors.textMain },
  cardMeta: { ...typography.caption, color: colors.textLight, marginTop: 2 },
  emptyWrap: { alignItems: 'center', paddingVertical: 64 },
  emptyTitle: { ...typography.h3, color: colors.secondary, marginTop: 12 },
  emptyText: { ...typography.body, color: colors.textLight, marginTop: 4 },
});
