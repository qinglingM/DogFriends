import React, { useState, useMemo, useRef } from 'react';
import { View, Text, Animated, Image, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card, DogAvatar } from '../../components';
import { useSquare } from '../../contexts/SquareContext';

const PROFILE = {
  name: '小明',
  level: 'Lv.6',
  area: '上海 · 徐汇区',
  signature: '每天和旺财、小白一起散步，记录生活的小确幸。',
  habit: '晚上常去徐汇滨江遛狗',
  following: 32,
  followers: 128,
  likes: 890,
  cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
  avatar: 'https://images.unsplash.com/photo-1601758177266-bc599de87707?auto=format&fit=crop&w=300&q=80',
};

const DOGS = [
  {
    id: '1', name: '旺财', breed: '金毛寻回犬', gender: '♂ 公',
    birthday: '2023-03-15', weight: 32, neutered: true,
    walkStats: { walks: 128, distance: 320, duration: 45 },
    vaccine: { done: 3, pending: 1, daysUntilReminder: 92, nextName: '狂犬疫苗加强针', nextDate: '2026-09-15' },
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2', name: '小白', breed: '萨摩耶', gender: '♂ 公',
    birthday: '2024-01-20', weight: 28, neutered: false,
    walkStats: { walks: 86, distance: 210, duration: 32 },
    vaccine: { done: 2, pending: 2, daysUntilReminder: 45, nextName: '六联疫苗第二针', nextDate: '2026-07-25' },
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
  },
];

const BADGES = [
  { id: 'real_owner', name: '真实狗主', icon: 'paw', color: colors.primary },
  { id: 'walk_7', name: '连续遛狗7天', icon: 'calendar', color: colors.secondary },
  { id: 'explorer', name: '地点探索家', icon: 'location', color: colors.accent },
  { id: 'family', name: '金毛家长', icon: 'shield-checkmark', color: colors.primary },
];

const PROFILE_FEED = [
  {
    id: 'feed_plain_1', type: '普通图文动态', title: '旺财今天认识了新朋友',
    meta: '上海 徐汇区 · 日常分享',
    text: '傍晚在小区附近散步，旺财遇到一只很温柔的边牧，两个小朋友闻了半天，最后一起走了一小段。',
    createdAt: '今天 18:40', location: '上海 徐汇区',
    likes: 54, comments: 7, favorites: 12, liked: false,
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=500&q=80',
    ],
  },
  {
    id: 'feed_walk_1', type: '公开遛狗动态', title: '和旺财完成了一次傍晚遛狗',
    meta: '徐汇滨江 · 42分钟 · 2.3km · 傍晚',
    text: '今天风很舒服，路线只展示大致区域，不展示起终点。旺财一路闻闻停停，状态很好。',
    createdAt: '今天 19:20', location: '上海 徐汇滨江',
    walkRecord: { distance: '2.3', duration: '42:18', pace: "18'20\"", area: '徐汇滨江' },
    likes: 128, comments: 16, favorites: 32, liked: true,
    images: [
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=500&q=80',
    ],
  },
];

const MENU_ITEMS = [
  { label: '我的收藏', icon: 'bookmark-outline', bg: 'rgba(185, 207, 50, 0.2)', route: 'FavoriteLocations' },
  { label: '我分享过', icon: 'clipboard-outline', bg: 'rgba(185, 207, 50, 0.2)', route: 'ContributionHistory' },
];

function StatBlock({ value, label }) {
  return (
    <View style={s.statBlock}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, action, onPress }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {!!action && (
        <TouchableOpacity style={s.sectionAction} activeOpacity={0.75} onPress={onPress}>
          <Text style={s.sectionActionText}>{action}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function FeedCard({ item, profile, onPress }) {
  return (
    <TouchableOpacity style={s.feedCard} activeOpacity={0.82} onPress={onPress}>
      <View style={s.feedAuthor}>
        <Image source={{ uri: profile.avatar }} style={s.feedAvatar} />
        <View style={s.feedAuthorText}>
          <Text style={s.feedName}>{profile.name}</Text>
          <Text style={s.feedTime}>{item.createdAt} · {item.location}</Text>
        </View>
      </View>
      <Text style={s.feedTitle}>{item.title}</Text>
      <View style={s.feedMetaRow}>
        <Ionicons name="location-outline" size={16} color={colors.textLight} />
        <Text style={s.feedMeta}>{item.meta}</Text>
      </View>
      <Text style={s.feedText}>{item.text}</Text>
      {item.walkRecord ? (
        <WalkRecordPreview record={item.walkRecord} />
      ) : (
        <View style={s.photoRow}>
          {item.images.slice(0, 3).map((image, index) => (
            <Image key={`${item.id}_${index}`} source={{ uri: image }} style={s.feedPhoto} />
          ))}
        </View>
      )}
      <View style={s.feedActions}>
        <View style={s.feedAction}>
          <Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={22} color={item.liked ? colors.danger : colors.textLight} />
          <Text style={s.feedActionText}>{item.likes}</Text>
        </View>
        <View style={s.feedAction}>
          <Ionicons name="chatbubble-outline" size={22} color={colors.textLight} />
          <Text style={s.feedActionText}>{item.comments}</Text>
        </View>
        <View style={s.feedAction}>
          <Ionicons name="star-outline" size={22} color={colors.textLight} />
          <Text style={s.feedActionText}>{item.favorites}</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={22} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

function WalkRecordPreview({ record }) {
  return (
    <View style={s.walkRecordCard}>
      <View style={s.walkMapCanvas}>
        <View style={[s.mapPatch, s.mapPatchOne]} />
        <View style={[s.mapPatch, s.mapPatchTwo]} />
        <View style={s.routeLine} />
        <View style={[s.routePoint, s.routeStart]} />
        <View style={[s.routePoint, s.routeEnd]} />
        <Text style={s.mapArea}>{record.area}</Text>
      </View>
      <View style={s.walkRecordStats}>
        <WalkMetric value={record.distance} unit="km" label="距离" />
        <View style={s.walkMetricDivider} />
        <WalkMetric value={record.duration} label="时长" />
        <View style={s.walkMetricDivider} />
        <WalkMetric value={record.pace} label="配速" />
      </View>
    </View>
  );
}

function WalkMetric({ value, unit, label }) {
  return (
    <View style={s.walkMetric}>
      <Text style={s.walkMetricValue}>
        {value}{!!unit && <Text style={s.walkMetricUnit}> {unit}</Text>}
      </Text>
      <Text style={s.walkMetricLabel}>{label}</Text>
    </View>
  );
}

function OwnerContent({ navigation, feed, profile }) {
  return (
    <View style={s.ownerContent}>
      {/* Profile header */}
      <View style={s.profileHeader}>
        <Image source={{ uri: profile.avatar }} style={s.avatar} />
        <View style={s.nameBlock}>
          <View style={s.nameRow}>
            <Text style={s.name}>{profile.name}</Text>
            <Ionicons name="female" size={16} color={colors.accent} />
            <View style={s.levelPill}>
              <Text style={s.levelText}>{profile.level}</Text>
            </View>
          </View>
          <View style={s.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.textLight} />
            <Text style={s.locationText}>{profile.area}</Text>
          </View>
        </View>
      </View>
      <Text style={s.signature}>{profile.signature}</Text>
      <View style={s.habitPill}>
        <Ionicons name="paw" size={16} color={colors.secondary} />
        <Text style={s.habitText}>{profile.habit}</Text>
      </View>
      <View style={s.socialRow}>
        <StatBlock value={profile.following} label="关注" />
        <View style={s.statDivider} />
        <StatBlock value={profile.followers} label="粉丝" />
        <View style={s.statDivider} />
        <StatBlock value={profile.likes} label="获赞" />
        <TouchableOpacity style={s.editBtn} activeOpacity={0.75}>
          <Text style={s.editBtnText}>编辑资料</Text>
          <Ionicons name="chevron-down" size={16} color={colors.secondary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={s.badgeStrip}
        activeOpacity={0.75}
        onPress={() => navigation.navigate('BadgeWall')}
      >
        {BADGES.slice(0, 5).map(badge => (
          <View key={badge.id} style={s.badgeItem}>
            <View style={[s.badgeIcon, { backgroundColor: badge.color }]}>
              <Ionicons name={badge.icon} size={18} color={colors.white} />
            </View>
          </View>
        ))}
        {BADGES.length > 5 && (
          <View style={s.moreBadge}>
            <Text style={s.moreBadgeText}>+{BADGES.length - 5}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Feed */}
      <View style={s.feedList}>
        {feed.map(item => (
          <FeedCard
            key={item.id}
            item={item}
            profile={profile}
            onPress={() => navigation.navigate('ProfileFeedDetail', { item, profile })}
          />
        ))}
      </View>

      {/* Menu */}
      <View style={s.menuSection}>
        {MENU_ITEMS.map((entry, index) => (
          <TouchableOpacity
            key={entry.route}
            style={[s.menuItem, index === MENU_ITEMS.length - 1 && s.menuItemLast]}
            onPress={() => navigation.navigate(entry.route)}
            activeOpacity={0.75}
          >
            <View style={[s.menuIcon, { backgroundColor: entry.bg }]}>
              <Ionicons name={entry.icon} size={20} color={colors.secondary} />
            </View>
            <Text style={s.menuText}>{entry.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={s.settingsItem}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.75}
      >
        <View style={[s.menuIcon, { backgroundColor: 'rgba(106, 128, 108, 0.1)' }]}>
          <Ionicons name="settings-outline" size={20} color={colors.textLight} />
        </View>
        <Text style={s.menuText}>设置</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
      </TouchableOpacity>
    </View>
  );
}

function DogContent({ dog, navigation }) {
  const ws = dog.walkStats;
  const vc = dog.vaccine;
  return (
    <View style={s.dogContent}>
      {/* Dog header */}
      <View style={s.dogHeader}>
        <Image source={{ uri: dog.image }} style={s.dogAvatar} />
        <View style={s.dogNameBlock}>
          <Text style={s.dogName}>{dog.name}</Text>
          <Text style={s.dogBreed}>{dog.breed} · {dog.gender}</Text>
        </View>
      </View>

      <Card>
        {[
          { icon: 'paw', label: '品种', value: dog.breed },
          { icon: 'male', label: '性别', value: dog.gender },
          { icon: 'calendar', label: '生日', value: dog.birthday },
          { icon: 'scale', label: '体重', value: `${dog.weight} kg` },
          { icon: 'cut', label: '绝育', value: dog.neutered ? '已绝育' : '未绝育' },
        ].map((row, i) => (
          <View key={i} style={[s.infoRow, i < 4 && s.infoRowBorder]}>
            <View style={s.infoLabel}>
              <Ionicons name={row.icon} size={16} color={colors.primary} />
              <Text style={s.infoLabelText}>{row.label}</Text>
            </View>
            <Text style={s.infoValue}>{row.value}</Text>
          </View>
        ))}
      </Card>

      <SectionHeader title="遛狗统计" action="查看全部 →" onPress={() => navigation.navigate('WalkHistory')} />
      <Card>
        <View style={s.walkStatsRow}>
          <View style={s.walkStat}>
            <Ionicons name="paw" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={s.walkStatValue}>{ws.walks} <Text style={s.walkStatUnit}>次</Text></Text>
            <Text style={s.walkStatLabel}>累计遛狗</Text>
          </View>
          <View style={s.walkStat}>
            <Ionicons name="trending-up" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={s.walkStatValue}>{ws.distance} <Text style={s.walkStatUnit}>km</Text></Text>
            <Text style={s.walkStatLabel}>累计距离</Text>
          </View>
          <View style={s.walkStat}>
            <Ionicons name="time-outline" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={s.walkStatValue}>{ws.duration} <Text style={s.walkStatUnit}>h</Text></Text>
            <Text style={s.walkStatLabel}>累计时长</Text>
          </View>
        </View>
      </Card>

      <SectionHeader title="疫苗记录" action="查看全部 →" onPress={() => navigation.navigate('Vaccine')} />
      <Card>
        <View style={s.vaccineSummary}>
          <View style={s.vaccineStat}>
            <Text style={s.vaccineStatValue}>{vc.done}</Text>
            <Text style={s.vaccineStatLabel}>已接种</Text>
          </View>
          <View style={s.vaccineStat}>
            <Text style={s.vaccineStatValue}>{vc.pending}</Text>
            <Text style={s.vaccineStatLabel}>待接种</Text>
          </View>
          <View style={s.vaccineStat}>
            <Text style={s.vaccineStatValue}>{vc.daysUntilReminder}</Text>
            <Text style={s.vaccineStatLabel}>天后提醒</Text>
          </View>
        </View>
        <View style={s.vaccineReminder}>
          <Ionicons name="notifications" size={16} color={colors.accent} />
          <Text style={s.vaccineReminderText}>
            下次: {vc.nextName} · {vc.nextDate}
          </Text>
        </View>
      </Card>
    </View>
  );
}

export default function ProfileTabScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { posts } = useSquare();
  const [activeTab, setActiveTab] = useState('owner');
  const scrollY = useRef(new Animated.Value(0)).current;

  const navBarHeight = insets.top;
  const tabBarStopScroll = 288 - navBarHeight;

  const navBgOpacity = scrollY.interpolate({
    inputRange: [tabBarStopScroll - 120, tabBarStopScroll],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const fixedTabOpacity = scrollY.interpolate({
    inputRange: [tabBarStopScroll - 1, tabBarStopScroll],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const publicPosts = useMemo(() => {
    return posts
      .filter(post => post.authorName === PROFILE.name && post.visibility === 'public')
      .map(post => ({
        id: post.id,
        type: '普通图文动态',
        title: post.tag ? `#${post.tag}` : '我的分享',
        meta: `${post.location || PROFILE.area} · ${post.createdAt}`,
        text: post.text,
        createdAt: post.createdAt,
        location: post.location || PROFILE.area,
        likes: post.likes,
        comments: post.comments.length,
        favorites: post.favorites,
        liked: post.liked,
        images: [post.mediaUrl],
        sourcePostId: post.id,
      }));
  }, [posts]);
  const feed = [...publicPosts, ...PROFILE_FEED];

  const subTabs = [
    { key: 'owner', label: '主人' },
    ...DOGS.map(dog => ({ key: dog.id, label: dog.name })),
  ];

  const listData = [
    { type: 'hero' },
    { type: 'tabs' },
    { type: 'content' },
  ];

  return (
    <View style={s.screen}>
      <Animated.FlatList
        data={listData}
        keyExtractor={item => item.type}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          if (item.type === 'hero') {
            return (
              <ImageBackground
                source={{ uri: PROFILE.cover }}
                style={[s.hero, { paddingTop: insets.top + 12 }]}
              />
            );
          }
          if (item.type === 'tabs') {
            return (
              <View style={s.subTabRow}>
                <View style={s.subTabContent}>
                  {subTabs.map(tab => {
                    const isActive = tab.key === activeTab;
                    return (
                      <TouchableOpacity
                        key={tab.key}
                        style={s.subTab}
                        activeOpacity={0.7}
                        onPress={() => setActiveTab(tab.key)}
                      >
                        <Text style={[s.subTabText, isActive && s.subTabTextActive]}>
                          {tab.label}
                        </Text>
                        {isActive && <View style={s.subTabIndicator} />}
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity style={s.subTabAdd} activeOpacity={0.7} onPress={() => navigation.navigate('DogEdit')}>
                    <Ionicons name="add" size={20} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
          return activeTab === 'owner' ? (
            <OwnerContent navigation={navigation} feed={feed} profile={PROFILE} />
          ) : (
            <DogContent dog={DOGS.find(d => d.id === activeTab)} navigation={navigation} />
          );
        }}
      />

      {/* Fixed nav bar: covers safe area only */}
      <View style={[s.navBar, { height: navBarHeight }]}>
        <Animated.View style={[s.navBarBg, { opacity: navBgOpacity }]} />
      </View>

      {/* Fixed tab bar: appears when in-list tab reaches nav bar bottom */}
      <Animated.View style={[s.fixedTabBar, { top: navBarHeight, opacity: fixedTabOpacity }]}>
        <View style={s.fixedTabBarBg} />
        <View style={s.fixedTabBarContent}>
          {subTabs.map(tab => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                style={s.subTab}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[s.subTabText, isActive && s.subTabTextActive]}>
                  {tab.label}
                </Text>
                {isActive && <View style={s.subTabIndicator} />}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={s.subTabAdd} activeOpacity={0.7} onPress={() => navigation.navigate('DogEdit')}>
            <Ionicons name="add" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: spacing.xxl },

  /* Hero */
  hero: { height: 288, justifyContent: 'flex-start' },

  /* Sub-tabs row */
  subTabRow: {
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  subTabContent: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md,
  },

  /* Fixed nav bar */
  navBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
  },
  navBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
  },

  /* Fixed tab bar */
  fixedTabBar: {
    position: 'absolute', left: 0, right: 0,
    height: 48,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  fixedTabBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
  },
  fixedTabBarContent: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md,
  },

  subTab: { paddingVertical: 14, marginRight: 24, position: 'relative' },
  subTabAdd: { paddingVertical: 14, marginLeft: 'auto' },
  subTabText: { ...typography.bodyBold, color: colors.textLight },
  subTabTextActive: { color: colors.secondary },
  subTabIndicator: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2.5, backgroundColor: colors.primary, borderRadius: 1.25,
  },

  /* Owner content */
  ownerContent: { paddingTop: spacing.md },
  profileHeader: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md,
    paddingHorizontal: spacing.md, marginBottom: spacing.sm,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: colors.white, backgroundColor: colors.chipDefault,
  },
  nameBlock: { flex: 1, paddingBottom: spacing.xs },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  name: { ...typography.h2, color: colors.textMain },
  levelPill: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: spacing.radiusPill, backgroundColor: colors.accent,
  },
  levelText: { ...typography.captionBold, color: colors.white },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  locationText: { ...typography.caption, color: colors.textLight },
  signature: { ...typography.body, color: colors.textMain, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  habitPill: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: spacing.radiusPill, backgroundColor: colors.chipDefault,
    marginHorizontal: spacing.md, marginBottom: spacing.md,
  },
  habitText: { ...typography.caption, color: colors.textLight },
  socialRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, marginBottom: spacing.md },
  statBlock: { width: 64, alignItems: 'center' },
  statValue: { ...typography.h2, color: colors.secondary },
  statLabel: { ...typography.caption, color: colors.textLight },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },
  editBtn: {
    marginLeft: 'auto', minWidth: 128, height: spacing.touchTarget,
    borderRadius: spacing.radiusPill, borderWidth: 2, borderColor: colors.secondary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.white,
  },
  editBtnText: { ...typography.bodyBold, color: colors.secondary },
  badgeStrip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    alignSelf: 'flex-start', marginHorizontal: spacing.md, marginBottom: spacing.lg,
    padding: spacing.sm, borderRadius: spacing.radiusMd, backgroundColor: colors.chipDefault,
  },
  badgeItem: { width: 40, height: 40, borderRadius: spacing.radiusMd, alignItems: 'center', justifyContent: 'center' },
  badgeIcon: {
    width: 40, height: 40, borderRadius: spacing.radiusMd,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.secondary,
  },
  moreBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.chipDefault, alignItems: 'center', justifyContent: 'center',
  },
  moreBadgeText: { ...typography.captionBold, color: colors.secondary },

  /* Feed & menu */
  feedList: { paddingHorizontal: spacing.md, gap: spacing.md },
  menuSection: {
    marginTop: spacing.lg, marginHorizontal: spacing.md,
    backgroundColor: colors.white, borderRadius: spacing.radiusMd, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: 56,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1, ...typography.bodyBold, color: colors.textMain },
  settingsItem: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.lg,
    padding: spacing.md, backgroundColor: colors.white, borderRadius: spacing.radiusMd, minHeight: 56,
  },

  /* Dog content */
  dogContent: { padding: spacing.screenMargin, gap: spacing.cardGap },
  dogHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginBottom: spacing.sm,
  },
  dogAvatar: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: colors.white, backgroundColor: colors.chipDefault,
  },
  dogNameBlock: { flex: 1 },
  dogName: { ...typography.h2, color: colors.secondary, marginBottom: 2 },
  dogBreed: { ...typography.body, color: colors.textLight },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabelText: { ...typography.body, color: colors.textLight },
  infoValue: { ...typography.bodyBold, color: colors.secondary },
  walkStatsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  walkStat: { alignItems: 'center' },
  walkStatValue: { ...typography.statValue, color: colors.secondary },
  walkStatUnit: { ...typography.captionBold, color: colors.secondary },
  walkStatLabel: { ...typography.caption, color: colors.textLight, marginTop: 4 },
  vaccineSummary: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, marginBottom: 12 },
  vaccineStat: { alignItems: 'center' },
  vaccineStatValue: { ...typography.statValue, color: colors.secondary },
  vaccineStatLabel: { ...typography.caption, color: colors.textLight, marginTop: 4 },
  vaccineReminder: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12,
    backgroundColor: 'rgba(146, 102, 153, 0.08)', borderRadius: spacing.radiusSm,
  },
  vaccineReminderText: { ...typography.caption, color: colors.accent, flex: 1 },

  /* Feed card */
  sectionHeader: {
    minHeight: spacing.xxl, paddingHorizontal: spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionTitle: { ...typography.h3, color: colors.secondary },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sectionActionText: { ...typography.caption, color: colors.textLight },
  feedCard: {
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  feedAuthor: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  feedAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.chipDefault },
  feedAuthorText: { flex: 1 },
  feedName: { ...typography.bodyBold, color: colors.textMain },
  feedTime: { ...typography.caption, color: colors.textLight },
  feedTitle: { ...typography.bodyBold, fontSize: 16, color: colors.textMain, marginBottom: spacing.sm },
  feedMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  feedMeta: { ...typography.caption, color: colors.textLight },
  feedText: { ...typography.body, color: colors.textMain, marginBottom: spacing.md },
  photoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  feedPhoto: { flex: 1, aspectRatio: 1, borderRadius: spacing.radiusSm, backgroundColor: colors.chipDefault },
  walkRecordCard: {
    borderRadius: spacing.radiusMd, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, backgroundColor: colors.white,
  },
  walkMapCanvas: { height: 128, backgroundColor: '#DDEBD3', overflow: 'hidden', position: 'relative' },
  mapPatch: { position: 'absolute', borderRadius: spacing.radiusPill, backgroundColor: 'rgba(255,255,255,0.55)' },
  mapPatchOne: { width: 160, height: 72, left: -24, top: 18, transform: [{ rotate: '-18deg' }] },
  mapPatchTwo: { width: 190, height: 86, right: -32, bottom: -8, transform: [{ rotate: '16deg' }] },
  routeLine: {
    position: 'absolute', left: '18%', right: '16%', top: '48%',
    height: 8, borderRadius: spacing.radiusPill, backgroundColor: colors.secondary, transform: [{ rotate: '-10deg' }],
  },
  routePoint: {
    position: 'absolute', width: 18, height: 18, borderRadius: 9,
    borderWidth: 3, borderColor: colors.white, backgroundColor: colors.primary,
  },
  routeStart: { left: '16%', top: '51%' },
  routeEnd: { right: '14%', top: '36%' },
  mapArea: {
    position: 'absolute', left: spacing.md, top: spacing.md,
    ...typography.captionBold, color: colors.secondary,
    backgroundColor: 'rgba(255,255,255,0.72)', paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs, borderRadius: spacing.radiusPill,
  },
  walkRecordStats: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, backgroundColor: colors.white },
  walkMetric: { flex: 1, alignItems: 'center' },
  walkMetricValue: { ...typography.h3, color: colors.textMain },
  walkMetricUnit: { ...typography.captionBold, color: colors.textMain },
  walkMetricLabel: { ...typography.caption, color: colors.textLight, marginTop: spacing.xs },
  walkMetricDivider: { width: 1, height: 32, backgroundColor: colors.border },
  feedActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  feedAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minWidth: 64 },
  feedActionText: { ...typography.body, color: colors.textLight },
});
