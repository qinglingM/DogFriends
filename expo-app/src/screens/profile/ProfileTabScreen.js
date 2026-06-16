import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Image, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useSquare } from '../../contexts/SquareContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useDogs } from '../../contexts/DogContext';
import FeedCard from '../../components/FeedCard';
import { OWNER_PROFILE, USER_PROFILES, OWNER_NAME_CONST } from '../../data/userProfiles';

function calcAge(birthday) {
  if (!birthday) return '';
  const birth = new Date(birthday + 'T00:00:00');
  const now = new Date();
  const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  const years = totalMonths / 12;
  const rounded = Math.round(years * 2) / 2;
  if (rounded <= 0) return '不到半岁';
  return rounded % 1 === 0 ? `${rounded}岁` : `${rounded}岁`;
}

const PROFILE_FEED = [
  {
    id: 'feed_plain_1', type: '普通图文动态', title: '旺财今天认识了新朋友',
    meta: '上海 · 日常分享',
    text: '傍晚在小区附近散步，旺财遇到一只很温柔的边牧，两个小朋友闻了半天，最后一起走了一小段。',
    createdAt: '今天 18:40', location: '上海',
    likes: 54, comments: 7, favorites: 12, liked: false,
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=500&q=80',
    ],
  },
  {
    id: 'feed_walk_1', type: '公开遛狗动态', title: '和旺财完成了一次傍晚遛狗',
    meta: '上海 · 42分钟 · 2.3km · 傍晚',
    text: '今天风很舒服，路线只展示大致区域，不展示起终点。旺财一路闻闻停停，状态很好。',
    createdAt: '今天 19:20', location: '上海',
    walkRecord: { distance: '2.3', duration: '42:18', pace: "18'20\"", area: '滨江步道' },
    likes: 128, comments: 16, favorites: 32, liked: true,
    images: [
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=500&q=80',
    ],
  },
];

const PERSONAL_FEED = [
  {
    id: 'feed_plain_1', type: '普通图文动态', title: '旺财今天认识了新朋友',
    meta: '上海 · 日常分享',
    text: '傍晚在小区附近散步，旺财遇到一只很温柔的边牧，两个小朋友闻了半天，最后一起走了一小段。',
    createdAt: '今天 18:40', location: '上海',
    likes: 54, comments: 7, favorites: 12, liked: false,
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80',
    ],
  },
  {
    id: 'feed_walk_1', type: '公开遛狗动态', title: '和旺财完成了一次傍晚遛狗',
    meta: '上海 · 42分钟 · 2.3km · 傍晚',
    text: '今天风很舒服，路线只展示大致区域，不展示起终点。旺财一路闻闻停停，状态很好。',
    createdAt: '今天 19:20', location: '上海',
    walkRecord: { distance: '2.3', duration: '42:18', pace: "18'20\"", area: '滨江步道' },
    likes: 128, comments: 16, favorites: 32, liked: true,
    images: [
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=500&q=80',
    ],
  },
  {
    id: 'feed_place_1', type: '地点体验动态', title: '这家咖啡店户外对狗狗很友好',
    meta: 'BLOOM Coffee · 咖啡店',
    text: '户外座位宽，店员会主动给水碗。大型犬建议避开周末高峰，平日下午更舒服。',
    createdAt: '昨天 15:30', location: '上海',
    likes: 96, comments: 8, favorites: 24, liked: false,
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1601758177266-bc599de87707?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=500&q=80',
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

function DogCard({ dog, navigation, isSelf, isExpanded, onToggleExpand, totalCount }) {
  if (!dog) return null;
  const ws = dog.walkStats;
  const genderBorderColor = dog.gender === 'male' ? '#4A90D9' : '#E88BA4';

  if (dog.publicProfile === false) {
    return (
      <View style={s.dogCard}>
        <View style={s.dogCardHeader}>
          <View style={[s.dogCardAvatar, { borderColor: genderBorderColor }]}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.textLight} />
          </View>
          <View style={s.dogCardInfoRow}>
            <Text style={s.dogCardName}>狗狗</Text>
            <View style={{ width: 22 }} />
            <Text style={s.dogCardBreed}>未公开档案</Text>
            <View style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={s.dogCard}
      activeOpacity={0.85}
      onPress={onToggleExpand}
    >
      <View style={s.dogCardHeader}>
        <Image source={{ uri: dog.image }} style={[s.dogCardAvatar, { borderColor: genderBorderColor }]} />
        <View style={s.dogCardInfoRow}>
          <Text style={s.dogCardName}>{dog.name}</Text>
          <Ionicons name={dog.gender === 'male' ? 'male' : 'female'} size={14} color={colors.textLight} />
          {dog.traits && dog.traits.length > 0 && (
            <View style={s.dogCardTagsInline}>
              {dog.traits.slice(0, 2).map((t, i) => (
                <View key={i} style={s.dogCardTag}>
                  <Text style={s.dogCardTagText}>{t}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ flex: 1 }} />
          <Text style={s.dogCardBreed}>{dog.breed}</Text>
        </View>
        <TouchableOpacity
          style={s.dogCardChevron}
          activeOpacity={0.7}
          onPress={onToggleExpand}
        >
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={s.dogCardBody}>
          <View style={s.dogCardDivider} />
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
            minHeight: spacing.touchTarget,
            paddingLeft: spacing.touchTarget + spacing.sm,
          }}>
            {dog.size ? (
              <Text style={s.dogCardDetailText}>
                {dog.size === 'small' ? '小型犬' : dog.size === 'medium' ? '中型犬' : '大型犬'}
              </Text>
            ) : null}
            {dog.size ? <View style={{ width: 14 }} /> : null}
            <Text style={s.dogCardDetailText}>{dog.birthday || ''}</Text>
            <View style={{ flex: 1 }} />
            <Text style={s.dogCardDetailText}>{dog.birthday ? calcAge(dog.birthday) : ''}</Text>
            {isSelf && (
              <TouchableOpacity
                style={s.dogCardEditBtn}
                activeOpacity={0.7}
                onPress={(e) => { e.stopPropagation(); navigation.navigate('DogEdit', { dogId: dog.id }); }}
              >
                <Ionicons name="create-outline" size={16} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileTabScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { posts } = useSquare();
  const { profile: userProfile, updateProfile } = useProfile();
  const { dogs, removeDog } = useDogs();

  const userName = route?.params?.userName;
  const isSelf = !userName || userName === OWNER_NAME_CONST;

  const otherProfile = !isSelf ? USER_PROFILES[userName] : null;
  const displayProfile = isSelf
    ? { ...OWNER_PROFILE, ...userProfile }
    : otherProfile || OWNER_PROFILE;
  const dogsList = isSelf ? dogs : (otherProfile?.dogs || []);

  const [expandedDogId, setExpandedDogId] = useState(null);

  const publicPosts = useMemo(() => {
    return posts
      .filter(post => post.authorName === displayProfile.name && post.visibility === 'public')
      .map(post => ({
        id: post.id,
        type: '普通图文动态',
        title: post.tag ? `#${post.tag}` : '我的分享',
        meta: `${post.location || displayProfile.area} · ${post.createdAt}`,
        text: post.text,
        createdAt: post.createdAt,
        location: post.location || displayProfile.area,
        likes: post.likes,
        comments: post.comments.length,
        favorites: post.favorites,
        liked: post.liked,
        images: [post.mediaUrl],
        sourcePostId: post.id,
      }));
  }, [posts]);
  const feed = [...publicPosts, ...(isSelf ? PROFILE_FEED : PERSONAL_FEED)];

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [2, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      updateProfile({ cover: result.assets[0].uri });
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!isSelf) {
        const parent = navigation.getParent();
        parent?.setOptions({ tabBarStyle: { display: 'none' } });
        return () => {
          parent?.setOptions({
            tabBarStyle: {
              backgroundColor: colors.white,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              height: spacing.bottomTabHeight,
              paddingBottom: spacing.md,
              paddingTop: spacing.xs,
            },
          });
        };
      }
    }, [navigation, isSelf])
  );

  const genderIcon = displayProfile.gender === 'male' ? 'male' : displayProfile.gender === 'female' ? 'female' : null;

  return (
    <View style={s.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Hero: Cover image + owner profile overlay */}
        {isSelf ? (
          <TouchableOpacity activeOpacity={0.85} onPress={pickCover}>
            <ImageBackground
              source={{ uri: displayProfile.cover }}
              style={[s.hero, { paddingTop: insets.top }]}
            >

              <View style={s.heroOverlay}>
                <View style={s.ownerProfileRow}>
                  <Image source={{ uri: displayProfile.avatar }} style={s.heroAvatar} />
                  <View style={s.heroNameBlock}>
                    <View style={s.heroNameRow}>
                      <Text style={s.heroName}>{displayProfile.name}</Text>
                      {genderIcon && <Ionicons name={genderIcon} size={16} color={colors.white} />}
                      <TouchableOpacity
                        style={s.heroEditBtn}
                        activeOpacity={0.75}
                        onPress={() => navigation.navigate('EditProfile')}
                      >
                        <Ionicons name="create-outline" size={16} color={colors.white} />
                        <Text style={s.heroEditBtnText}>编辑资料</Text>
                      </TouchableOpacity>
                    </View>
                    {displayProfile.signature ? (
                      <Text style={s.heroSignature} numberOfLines={2}>{displayProfile.signature}</Text>
                    ) : null}

                    <View style={s.heroSocialRow}>
                      <StatBlock value={displayProfile.following} label="关注" />
                      <View style={s.heroStatDivider} />
                      <StatBlock value={displayProfile.followers} label="粉丝" />
                      <View style={s.heroStatDivider} />
                      <StatBlock value={displayProfile.likes} label="获赞" />
                    </View>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ) : (
          <ImageBackground
            source={{ uri: displayProfile.cover }}
            style={[s.hero, { paddingTop: insets.top }]}
          >

            <View style={s.heroOverlay}>
              <View style={s.ownerProfileRow}>
                <Image source={{ uri: displayProfile.avatar }} style={s.heroAvatar} />
                <View style={s.heroNameBlock}>
                  <View style={s.heroNameRow}>
                    <Text style={s.heroName}>{displayProfile.name}</Text>
                    {genderIcon && <Ionicons name={genderIcon} size={16} color={colors.white} />}
                    <TouchableOpacity style={s.heroFollowBtn} activeOpacity={0.75}>
                      <Text style={s.heroFollowBtnText}>关注</Text>
                    </TouchableOpacity>
                  </View>
                  {displayProfile.signature ? (
                    <Text style={s.heroSignature} numberOfLines={2}>{displayProfile.signature}</Text>
                  ) : null}

                  <View style={s.heroSocialRow}>
                    <StatBlock value={displayProfile.following} label="关注" />
                    <View style={s.heroStatDivider} />
                    <StatBlock value={displayProfile.followers} label="粉丝" />
                    <View style={s.heroStatDivider} />
                    <StatBlock value={displayProfile.likes} label="获赞" />
                  </View>
                </View>
              </View>
            </View>
          </ImageBackground>
        )}

        {/* Dog cards section */}
        {dogsList.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>{isSelf ? '我的狗狗' : 'TA的狗狗'} {dogsList.length}只</Text>
              {isSelf && (
                <TouchableOpacity
                  style={s.sectionAction}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('DogEdit')}
                >
                  <Ionicons name="add-circle" size={28} color={colors.secondary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={s.dogCardGrid}>
              {dogsList.map(dog => (
                <DogCard
                  key={dog.id}
                  dog={dog}
                  navigation={navigation}
                  isSelf={isSelf}
                  isExpanded={expandedDogId === dog.id}
                  onToggleExpand={() => setExpandedDogId(expandedDogId === dog.id ? null : dog.id)}
                  totalCount={dogsList.length}
                />
              ))}
            </View>
          </View>
        )}

        {/* Feed section */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>动态</Text>
          </View>
          <View style={s.feedList}>
            {feed.map(item => (
              <FeedCard
                key={item.id}
                item={item}
                profile={displayProfile}
                onPress={() => navigation.navigate('ProfileFeedDetail', { item, profile: displayProfile })}
              />
            ))}
          </View>
        </View>

        {/* Menu section (self only) */}
        {isSelf && (
          <View style={s.section}>
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
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: spacing.xxl },

  /* Hero */
  hero: { height: 360, justifyContent: 'flex-end' },
  heroOverlay: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  ownerProfileRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  heroAvatar: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: colors.white, backgroundColor: colors.chipDefault,
  },
  heroNameBlock: { flex: 1 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  heroName: { ...typography.h2, color: colors.white, fontSize: 24 },
  heroSignature: { ...typography.caption, color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 22 },
  heroSocialRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: spacing.xs, gap: spacing.md,
  },
  statBlock: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  statValue: { ...typography.captionBold, color: colors.white, fontSize: 14 },
  statLabel: { ...typography.caption, color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  heroStatDivider: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.3)' },
  heroEditBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    height: 24, paddingHorizontal: spacing.sm,
    borderRadius: spacing.radiusPill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)',
  },
  heroEditBtnText: { ...typography.captionBold, color: colors.white, fontSize: 14 },
  heroFollowBtn: {
    height: 24, paddingHorizontal: spacing.sm,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  heroFollowBtnText: { ...typography.caption, color: colors.white, fontWeight: 600, fontSize: 14 },

  /* Section */
  section: { marginTop: 12 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.h3, color: colors.secondary },
  sectionAction: { flexDirection: 'row', alignItems: 'center', minHeight: spacing.touchTarget },

  /* Dog card list */
  dogCardGrid: {
    paddingHorizontal: spacing.md, gap: spacing.sm,
  },
  dogCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingVertical: spacing.xs, paddingHorizontal: spacing.sm,
  },
  dogCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  dogCardAvatar: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, backgroundColor: colors.chipDefault,
    alignItems: 'center', justifyContent: 'center',
  },
  dogCardInfoRow: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
  },
  dogCardName: { ...typography.bodyBold, fontSize: 14, color: colors.secondary },
  dogCardBreed: { ...typography.caption, color: colors.textLight, fontSize: 12 },
  dogCardEditBtn: {
    width: spacing.touchTarget, height: spacing.touchTarget,
    alignItems: 'center', justifyContent: 'center',
  },
  dogCardEditText: { ...typography.caption, color: colors.textLight },
  dogCardTags: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.tightGap, marginTop: 2,
  },
  dogCardTagsInline: {
    flexDirection: 'row', flexWrap: 'nowrap', gap: spacing.tightGap,
  },
  dogCardTag: {
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: spacing.radiusPill, backgroundColor: colors.chipDefault,
  },
  dogCardTagText: { ...typography.caption, color: colors.secondary, fontSize: 10 },
  dogCardBody: { marginTop: spacing.sm },
  dogCardDivider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.xs },
  dogCardWalkStats: {
    flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.sm,
  },
  dogCardWalkStat: { alignItems: 'center' },
  dogCardWalkValue: { ...typography.bodyBold, fontSize: 16, color: colors.secondary },
  dogCardWalkLabel: { ...typography.caption, color: colors.textLight },
  dogCardDetailText: { ...typography.caption, color: colors.textLight, fontSize: 13 },
  dogCardChevron: {
    width: spacing.touchTarget, height: spacing.touchTarget,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Feed */
  feedList: { paddingHorizontal: spacing.md, gap: spacing.md },

  /* Menu */
  menuSection: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.white, borderRadius: spacing.radiusMd, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: 56,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1, ...typography.bodyBold, color: colors.textMain },
  settingsItem: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginHorizontal: spacing.md, marginTop: spacing.md,
    padding: spacing.md, backgroundColor: colors.white, borderRadius: spacing.radiusMd, minHeight: 56,
  },
});
