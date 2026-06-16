import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Card, DogAvatar } from '../../components';
import { useDogs } from '../../contexts/DogContext';

const PROFILE_ENTRIES = [
  {
    label: '我的收藏',
    icon: 'bookmark-outline',
    bg: 'rgba(185, 207, 50, 0.2)',
    color: colors.secondary,
    route: 'FavoriteLocations',
  },
  {
    label: '我分享过',
    icon: 'clipboard-outline',
    bg: 'rgba(185, 207, 50, 0.2)',
    color: colors.secondary,
    route: 'ContributionHistory',
  },
];

export default function ProfileScreen({ navigation }) {
  const { dogs } = useDogs();
  const openPersonalProfile = () => navigation.navigate('PersonalProfile');

  return (
    <View style={styles.screen}>
      <NavBar
        title="我的"
        rightIcon="settings-outline"
        rightAction={() => navigation.navigate('Settings')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.userHeader}
          activeOpacity={0.78}
          onPress={openPersonalProfile}
        >
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={32} color={colors.secondary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>小明</Text>
            <Text style={styles.userId}>ID: 10086 · 上海</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>我的狗狗</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DogSwitch')}>
            <Text style={styles.sectionLink}>管理 →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dogScroll}>
          {dogs.map(dog => (
            <TouchableOpacity
              key={dog.id}
              style={styles.dogCard}
              onPress={() => navigation.navigate('DogProfile', { dogId: dog.id })}
            >
              <DogAvatar size={64} />
              <Text style={styles.dogCardName}>{dog.name}</Text>
              <Text style={styles.dogCardBreed}>{dog.breed}</Text>
              {dog.size && <Text style={styles.dogCardSize}>{dog.size === 'small' ? '小型犬' : dog.size === 'medium' ? '中型犬' : '大型犬'}</Text>}
              <View style={styles.dogCardStats}>
                <View style={styles.dogCardStat}>
                  <Ionicons name="paw" size={14} color={colors.primary} />
                  <Text style={styles.dogCardStatText}>{dog.walks}次</Text>
                </View>
                <View style={styles.dogCardStat}>
                  <Ionicons name="trending-up" size={14} color={colors.primary} />
                  <Text style={styles.dogCardStatText}>{dog.distance}km</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addDogCard}
            onPress={() => navigation.navigate('DogEdit')}
          >
            <Ionicons name="add-circle-outline" size={32} color={colors.border} />
            <Text style={styles.addDogText}>添加狗狗</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>遛狗统计</Text>
          <TouchableOpacity onPress={() => navigation.navigate('WalkHistory')}>
            <Text style={styles.sectionLink}>查看全部 →</Text>
          </TouchableOpacity>
        </View>

        <Card>
          <View style={styles.walkStatsRow}>
            <View style={styles.walkStat}>
              <Ionicons name="paw" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.walkStatValue}>214 <Text style={styles.walkStatUnit}>次</Text></Text>
              <Text style={styles.walkStatLabel}>累计遛狗</Text>
            </View>
            <View style={styles.walkStat}>
              <Ionicons name="trending-up" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.walkStatValue}>530 <Text style={styles.walkStatUnit}>km</Text></Text>
              <Text style={styles.walkStatLabel}>累计距离</Text>
            </View>
            <View style={styles.walkStat}>
              <Ionicons name="trophy" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.walkStatValue}>8.6 <Text style={styles.walkStatUnit}>km</Text></Text>
              <Text style={styles.walkStatLabel}>最远一次</Text>
            </View>
          </View>
        </Card>

        <Card noPadding>
          {PROFILE_ENTRIES.map((entry, index) => (
            <TouchableOpacity
              key={entry.route}
              style={[styles.menuItem, index === PROFILE_ENTRIES.length - 1 && styles.menuItemLast]}
              onPress={() => navigation.navigate(entry.route)}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIcon, { backgroundColor: entry.bg }]}>
                <Ionicons name={entry.icon} size={20} color={entry.color} />
              </View>
              <Text style={styles.menuText}>{entry.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 48 },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 24,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  userInfo: { flex: 1 },
  userName: { ...typography.h2, color: colors.secondary, marginBottom: 4 },
  userId: { ...typography.caption, color: colors.textLight },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { ...typography.h3, color: colors.secondary },
  sectionLink: { ...typography.bodyBold, color: colors.textLight },
  dogScroll: { flexDirection: 'row', gap: 16, paddingBottom: 4, marginBottom: 24 },
  dogCard: {
    width: 200,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dogCardName: { ...typography.h3, fontSize: 16, color: colors.secondary },
  dogCardBreed: { ...typography.caption, color: colors.textLight },
  dogCardSize: { ...typography.caption, color: colors.primary, marginTop: 2 },
  dogCardStats: { flexDirection: 'row', gap: 16, marginTop: 8 },
  dogCardStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dogCardStatText: { ...typography.caption, color: colors.textLight },
  addDogCard: {
    width: 120,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    minHeight: 168,
  },
  addDogText: { ...typography.captionBold, color: colors.textLight },
  walkStatsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  walkStat: { alignItems: 'center' },
  walkStatValue: { ...typography.statValue, color: colors.secondary },
  walkStatUnit: { ...typography.captionBold, color: colors.secondary },
  walkStatLabel: { ...typography.caption, color: colors.textLight, marginTop: 4 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 72,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1, ...typography.bodyBold, color: colors.textMain },
});
